import { test, expect } from './helpers/pwa-production-site'
import type { BrowserContext, Page } from '@playwright/test'
import { createEmptyGameSession, createPrototypeGameSession, gameSessionStorageKey } from '../../src/features/game-session/data/createPrototypeSession'
import type { GameSessionState } from '../../src/features/game-session/types'
import { enterDashboardPhase } from './helpers/dashboard-tools'

const beforeRestoreKey = 'botc-session-before-restore-v1'
async function seed(context: BrowserContext, session: GameSessionState) {
  await context.addInitScript(({ key, raw }) => {
    if (!localStorage.getItem(key)) localStorage.setItem(key, raw)
  }, { key: gameSessionStorageKey, raw: JSON.stringify(session) })
}
async function rawSession(page: Page) { return page.evaluate(key => localStorage.getItem(key), gameSessionStorageKey) }
async function ready(page: Page) {
  await expect(page.getByRole('main', { name: '本局', exact: true })).toBeVisible()
  await expect.poll(() => page.evaluate(async () => (await navigator.locks.query()).held.some(lock => lock.name === 'botc-session-editor-v1'))).toBe(true)
  await expect(page.getByRole('dialog', { name: '编辑保护', exact: true })).toHaveCount(0)
}
async function controlled(page: Page) {
  await page.evaluate(async () => { await navigator.serviceWorker.ready })
  await page.reload()
  await ready(page)
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true)
}
async function requestWaitingUpdate(page: Page, bump: () => void) {
  bump()
  await page.evaluate(async () => { await (await navigator.serviceWorker.ready).update() })
  await expect(page.getByText('新版本已准备好', { exact: true })).toBeVisible()
  await expect.poll(() => page.evaluate(async () => Boolean((await navigator.serviceWorker.ready).waiting))).toBe(true)
}

test('PWA manifest and real first SW install expose an explicit install action in live API settings', async ({ page, site }) => {
  await page.goto(site.url)
  await ready(page)
  const manifest = await page.evaluate(async () => {
    const link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]')!
    const response = await fetch(link.href)
    return await response.json() as { display: string; start_url: string; icons: { src: string }[] }
  })
  expect(manifest.display).toBe('standalone')
  expect(manifest.start_url).toBe('/')
  expect(manifest.icons).toHaveLength(3)
  for (const icon of manifest.icons) expect((await page.request.get(new URL(icon.src, site.url).href)).status()).toBe(200)
  await controlled(page)
  await page.getByRole('button', { name: '打开AI API设置', exact: true }).click()
  await expect(page.getByText('下载安装到手机/平板', { exact: true })).toBeVisible()
  // Headless browsers do not display the OS installer. Drive its documented browser event, and record that boundary.
  await page.evaluate(() => {
    Object.assign(window, { installPromptCallsForTest: 0 })
    const event = new Event('beforeinstallprompt', { cancelable: true })
    Object.assign(event, { prompt: async () => { (window as unknown as { installPromptCallsForTest: number }).installPromptCallsForTest++ }, userChoice: Promise.resolve({ outcome: 'accepted', platform: 'web' }) })
    window.dispatchEvent(event)
  })
  expect(await page.evaluate(() => (window as unknown as { installPromptCallsForTest: number }).installPromptCallsForTest)).toBe(0)
  await page.getByRole('button', { name: '安装', exact: true }).click()
  await expect(page.getByLabel('应用安装状态')).toContainText('已安装到本机')
  expect(await page.evaluate(() => (window as unknown as { installPromptCallsForTest: number }).installPromptCallsForTest)).toBe(1)
  await page.getByRole('button', { name: '关闭AI API 设置', exact: true }).click()
  const before = await rawSession(page)
  const documentStarted = await page.evaluate(() => performance.timeOrigin)
  await requestWaitingUpdate(page, site.bumpServiceWorker)
  await page.getByRole('button', { name: '更新并重开', exact: true }).click()
  await expect.poll(() => page.evaluate(() => performance.timeOrigin).catch(() => 0)).toBeGreaterThan(documentStarted)
  await ready(page)
  expect(await rawSession(page)).toBe(before)
})

test('only already visited lazy pages reopen offline and the original isolated game stays intact', async ({ page, context, site }, info) => {
  await seed(context, createPrototypeGameSession())
  await page.goto(site.url)
  await ready(page)
  const before = await rawSession(page)
  await page.getByRole('button', { name: '智能配板与调整', exact: true }).click()
  await expect(page.getByRole('dialog', { name: '智能配板与调整', exact: true })).toBeVisible()
  await page.getByRole('button', { name: '关闭智能配板与调整', exact: true }).click()
  await controlled(page)
  // Visit after control starts so the real CacheFirst rule, rather than the browser HTTP cache, holds this lazy chunk.
  await page.getByRole('button', { name: '智能配板与调整', exact: true }).click()
  await page.getByRole('button', { name: '关闭智能配板与调整', exact: true }).click()
  await expect.poll(() => page.evaluate(async () => {
    const cache = await caches.open('botc-static-v1')
    return (await cache.keys()).some(request => /SetupPanel-.*\.js$/.test(new URL(request.url).pathname))
  })).toBe(true)
  await context.setOffline(true)
  await page.reload()
  await ready(page)
  await page.getByRole('button', { name: '智能配板与调整', exact: true }).click()
  await expect(page.getByRole('dialog', { name: '智能配板与调整', exact: true })).toBeVisible()
  await expect(page.getByText('当前离线', { exact: true })).toBeVisible()
  await expect(page.getByText(/未缓存资料、AI与云端归档需要联网/)).toBeVisible()
  expect(await rawSession(page)).toBe(before)
  const uncached = await page.evaluate(async () => {
    try { await fetch('/assets/never-visited-production-fixture-AbCdEf12.js'); return false } catch { return true }
  })
  expect(uncached).toBe(true)
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1)
  await page.screenshot({ path: info.outputPath('cached-setup-offline.png'), fullPage: false })
})

test('online API GET responses never enter SW caches and cannot become offline HTML or private cached data', async ({ page, context, site }) => {
  await page.goto(site.url)
  await controlled(page)
  const online = await page.evaluate(async () => {
    const response = await fetch('/api/pwa-cache-contract')
    return { type: response.headers.get('content-type'), body: await response.json() }
  })
  expect(online.type).toContain('application/json')
  expect(online.body).toMatchObject({ fixture: true })
  const cachedApiUrls = await page.evaluate(async () => {
    const requests = (await Promise.all((await caches.keys()).map(async name => (await caches.open(name)).keys()))).flat()
    return requests.map(request => new URL(request.url).pathname).filter(path => path === '/api' || path.startsWith('/api/'))
  })
  expect(cachedApiUrls).toEqual([])
  await context.setOffline(true)
  expect(await page.evaluate(async () => { try { await fetch('/api/pwa-cache-contract'); return false } catch { return true } })).toBe(true)
})

test('live atomic backup sheet previews before restore and retains the exact previous game for manual recovery', async ({ page, context, site }, info) => {
  await seed(context, createPrototypeGameSession())
  await page.goto(site.url)
  await ready(page)
  const before = (await rawSession(page))!
  const imported = { ...JSON.parse(before), id: 'isolated-mobile-import-proof' }
  await page.getByRole('button', { name: '备份恢复', exact: true }).click()
  const backup = page.getByRole('dialog', { name: '对局备份', exact: true })
  await backup.getByLabel('选择备份文件', { exact: true }).setInputFiles({ name: 'isolated-backup.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(imported)) })
  await expect(backup.locator('.session-backup__preview')).toContainText('12 人')
  await expect(backup.getByRole('button', { name: '确认恢复', exact: true })).toBeDisabled()
  expect(await rawSession(page)).toBe(before)
  await backup.getByRole('checkbox', { name: '我确认替换当前对局，并保留恢复前备份。', exact: true }).check()
  await page.screenshot({ path: info.outputPath('atomic-restore-preview.png'), fullPage: false })
  await backup.getByRole('button', { name: '确认恢复', exact: true }).click()
  await expect.poll(() => page.evaluate(key => JSON.parse(localStorage.getItem(key) ?? '{}').id, gameSessionStorageKey)).toBe(imported.id)
  await ready(page)
  expect(await page.evaluate(key => localStorage.getItem(key), beforeRestoreKey)).toBe(before)
  await page.getByRole('button', { name: '备份恢复', exact: true }).click()
  const recovery = page.getByRole('dialog', { name: '对局备份', exact: true })
  await recovery.getByRole('button', { name: '查看恢复前备份', exact: true }).click()
  await expect(recovery.locator('.session-backup__preview')).toContainText('恢复前的对局')
  await recovery.getByRole('checkbox', { name: '我确认替换当前对局，并保留恢复前备份。', exact: true }).check()
  await recovery.getByRole('button', { name: '确认恢复', exact: true }).click()
  await expect.poll(() => rawSession(page)).toBe(before)
})

test('an offline cached game still confirms a night record and a day vote only after the real confirmation clicks', async ({ page, context, site }) => {
  await seed(context, createPrototypeGameSession())
  await page.goto(site.url)
  await ready(page)
  // Load and runtime-cache both real workbenches before going offline.
  await controlled(page)
  await enterDashboardPhase(page, '夜晚')
  await expect(page.locator('.night-workbench')).toBeVisible()
  await page.locator('.night-workbench').getByRole('button', { name: /^返回(?:本局)?$/ }).click()
  await enterDashboardPhase(page, '白天')
  await expect(page.locator('.day-workbench')).toBeVisible()
  await page.getByRole('button', { name: '返回本局', exact: true }).click()
  await context.setOffline(true)
  await page.reload()
  await ready(page)
  await enterDashboardPhase(page, '夜晚')
  const beforeNight = JSON.parse((await rawSession(page))!).timeline.length
  await page.getByRole('button', { name: '选择3号玩家', exact: true }).click()
  await page.getByRole('button', { name: '调查员', exact: true }).click()
  await page.getByRole('button', { name: '未受影响', exact: true }).click()
  expect(JSON.parse((await rawSession(page))!).timeline.length).toBe(beforeNight)
  await page.getByRole('button', { name: '确认本项', exact: true }).click()
  await expect.poll(async () => JSON.parse((await rawSession(page))!).timeline.length).toBe(beforeNight + 1)
  await page.locator('.night-workbench').getByRole('button', { name: /^返回(?:本局)?$/ }).click()
  await enterDashboardPhase(page, '白天')
  await page.getByRole('button', { name: '选择1号为提名人', exact: true }).click()
  await page.getByRole('tab', { name: '被提名人 · 未选', exact: true }).click()
  await page.getByRole('button', { name: '选择4号为被提名人', exact: true }).click()
  await page.getByRole('button', { name: '下一步：记录举手', exact: true }).click()
  for (const seatId of [1, 2, 3, 4, 5, 6]) await page.getByRole('button', { name: `记录${seatId}号举手`, exact: true }).click()
  const beforeVote = JSON.parse((await rawSession(page))!).timeline.length
  const recordVote = page.getByRole('button', { name: '记录本轮票型', exact: true })
  const actionBox = await recordVote.boundingBox()
  expect(actionBox).not.toBeNull()
  expect(actionBox!.y).toBeGreaterThanOrEqual(0)
  expect(actionBox!.y + actionBox!.height).toBeLessThanOrEqual(page.viewportSize()!.height + 1)
  const unobscured = await recordVote.evaluate(element => {
    const box = element.getBoundingClientRect()
    return element.contains(document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2))
  })
  expect(unobscured).toBe(true)
  await recordVote.click()
  await expect.poll(async () => JSON.parse((await rawSession(page))!).timeline.length).toBe(beforeVote + 1)
  await expect(page.getByRole('button', { name: '开始下一轮提名', exact: true })).toBeVisible()
  await expect(page.getByText('4号暂列', { exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1)
  await page.screenshot({ path: test.info().outputPath('mobile-day-vote-standing-sticky-clear.png'), fullPage: false })
  await expect(page.getByText('当前离线', { exact: true })).toBeVisible()
})

test('a real waiting SW never reloads an active game and can be deferred without losing records', async ({ page, context, site }) => {
  await seed(context, createPrototypeGameSession())
  await page.goto(site.url)
  await controlled(page)
  const before = await rawSession(page)
  await requestWaitingUpdate(page, site.bumpServiceWorker)
  await expect(page.getByText('为避免打断本局，请在本局结束后更新。')).toBeVisible()
  await expect(page.getByRole('button', { name: '更新并重开', exact: true })).toHaveCount(0)
  await page.getByRole('button', { name: '本局暂不更新', exact: true }).click()
  await expect(page.getByText('新版本已准备好', { exact: true })).toHaveCount(0)
  expect(await rawSession(page)).toBe(before)
  expect(await page.evaluate(async () => Boolean((await navigator.serviceWorker.ready).waiting))).toBe(true)
})

test('pending real IDB restore and synthetic persisted-pageshow suspension both block a waiting update for an empty game', async ({ page, context, site }, info) => {
  await seed(context, createEmptyGameSession('2026-10-19T00:00:00.000Z'))
  await page.goto(site.url)
  await controlled(page)
  await requestWaitingUpdate(page, site.bumpServiceWorker)
  await expect(page.getByRole('button', { name: '更新并重开', exact: true })).toBeVisible()
  const before = (await rawSession(page))!
  const imported = { ...JSON.parse(before), id: 'empty-pending-idb-restore' }
  await page.getByRole('button', { name: '备份恢复', exact: true }).click()
  const backup = page.getByRole('dialog', { name: '对局备份', exact: true })
  await backup.getByLabel('选择备份文件', { exact: true }).setInputFiles({ name: 'pending-empty.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(imported)) })
  await backup.getByRole('checkbox', { name: '我确认替换当前对局，并保留恢复前备份。', exact: true }).check()
  await page.evaluate(() => {
    const descriptor = Object.getOwnPropertyDescriptor(IDBTransaction.prototype, 'oncomplete')!
    const instrumented = window as unknown as { idbCompletionHeldForTest: boolean; releaseIdbCompletionForTest?: () => void }
    let holding = true
    const completions: (() => void)[] = []
    Object.defineProperty(IDBTransaction.prototype, 'oncomplete', {
      configurable: true, get: descriptor.get,
      set(listener: ((event: Event) => void) | null) {
        descriptor.set!.call(this, function (this: IDBTransaction, event: Event) {
          if (holding && listener) {
            completions.push(() => listener.call(this, event))
            instrumented.idbCompletionHeldForTest = true
            instrumented.releaseIdbCompletionForTest = () => { holding = false; completions.splice(0).forEach(complete => complete()) }
          } else listener?.call(this, event)
        })
      },
    })
  })
  await backup.getByRole('button', { name: '确认恢复', exact: true }).click()
  await expect.poll(() => page.evaluate(() => (window as unknown as { idbCompletionHeldForTest: boolean }).idbCompletionHeldForTest)).toBe(true)
  await expect(page.getByText('当前内容尚未确认保存，暂不能更新。')).toBeVisible()
  await expect(page.getByRole('button', { name: '更新并重开', exact: true })).toHaveCount(0)
  expect(await rawSession(page)).toBe(before)
  await page.evaluate(() => {
    window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true }))
    window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }))
  })
  await expect(page.getByRole('dialog', { name: '编辑保护', exact: true })).toHaveAccessibleDescription(/此页已暂停编辑/)
  await expect(page.getByRole('button', { name: '更新并重开', exact: true })).toHaveCount(0)
  await page.evaluate(() => (window as unknown as { releaseIdbCompletionForTest?: () => void }).releaseIdbCompletionForTest?.())
  expect(await rawSession(page)).toBe(before)
  await info.attach('update-blocked-lifecycle-boundary', { contentType: 'application/json', body: Buffer.from(JSON.stringify({ realIdbCompletionHeld: true, realServiceWorkerWaiting: true, persistedPageEventsSynthetic: true, realBfcacheClaimed: false, storageBeforePreserved: true })) })
  await page.screenshot({ path: info.outputPath('pending-and-suspended-update-blocked.png'), fullPage: false })
})
