import { test, expect } from './helpers/pwa-production-site'
import type { Page } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { createPrototypeGameSession, gameSessionStorageKey } from '../../src/features/game-session/data/createPrototypeSession'
import { enterDashboardPhase } from './helpers/dashboard-tools'

async function rawSession(page: Page) { return page.evaluate(key => localStorage.getItem(key)!, gameSessionStorageKey) }
async function ready(page: Page) {
  await expect(page.getByRole('main', { name: '本局', exact: true })).toBeVisible()
  await expect.poll(() => page.evaluate(async () => (await navigator.locks.query()).held.some(lock => lock.name === 'botc-session-editor-v1'))).toBe(true)
  await expect(page.getByRole('dialog', { name: '编辑保护', exact: true })).toHaveCount(0)
  await expect.poll(() => rawSession(page)).not.toBeNull()
}
async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1)
}

test('十五人从新局配板到身份交接，转屏与缩短视口不丢输入且领取后遮蔽', async ({ page, site }, info) => {
  await page.goto(site.url)
  await ready(page)
  await page.getByRole('button', { name: '智能配板与调整', exact: true }).tap()
  await page.getByRole('searchbox').fill('暗流涌动')
  await page.getByRole('combobox', { name: '开局板子', exact: true }).selectOption('trouble-brewing')
  await page.getByRole('button', { name: '15人', exact: true }).tap()
  await page.getByRole('textbox', { name: '15号昵称', exact: true }).fill('平板测试十五号')
  // Reduced layout height exercises scroll reachability, not a physical iPad software keyboard.
  await page.setViewportSize({ width: 507, height: 410 })
  await expect(page.getByRole('textbox', { name: '15号昵称', exact: true })).toHaveValue('平板测试十五号')
  await noOverflow(page)
  await page.getByRole('button', { name: '开始配板', exact: true }).tap()
  await page.getByRole('button', { name: '选择这套配板', exact: true }).first().tap()
  await page.setViewportSize({ width: 1180, height: 820 })
  await page.getByRole('button', { name: '确认配板', exact: true }).tap()
  await page.getByRole('button', { name: '发身份', exact: true }).tap()
  await page.getByRole('button', { name: '打开单人展示', exact: true }).tap()
  const display = page.getByRole('dialog', { name: '1号单人身份展示', exact: true })
  await expect(display.getByText('身份已遮住', { exact: true })).toBeVisible()
  await display.getByRole('button', { name: '显示身份', exact: true }).tap()
  await page.setViewportSize({ width: 768, height: 1024 })
  await display.getByRole('button', { name: '已领取', exact: true }).tap()
  const handback = page.getByRole('dialog', { name: '请交还设备给说书人', exact: true })
  await expect(handback.getByText('身份已遮住', { exact: true })).toBeVisible()
  await page.screenshot({ path: info.outputPath('ipad-private-handoff.png') })
  await handback.getByRole('button', { name: '说书人继续发身份', exact: true }).tap()
  await page.getByRole('button', { name: '关闭发身份', exact: true }).tap()
  await page.reload()
  await ready(page)
  const saved = JSON.parse(await rawSession(page))
  expect(saved.playerCount).toBe(15)
  expect(saved.seats[15].nickname).toBe('平板测试十五号')
  await page.getByRole('button', { name: '进入夜晚', exact: true }).tap()
  await expect(page.getByRole('heading', { name: '第1夜', exact: true })).toBeVisible()
  await noOverflow(page)
  await page.screenshot({ path: info.outputPath('ipad-first-night.png') })
})

test('轮转与分屏保留夜晚草稿，离线记录与投票可确认，备份能在新设备环境恢复', async ({ page, context, browser, site }, info) => {
  test.setTimeout(90_000)
  const initial = createPrototypeGameSession()
  await context.addInitScript(({ key, raw }) => {
    if (!localStorage.getItem(key)) localStorage.setItem(key, raw)
  }, { key: gameSessionStorageKey, raw: JSON.stringify(initial) })
  await page.goto(site.url)
  await ready(page)
  await page.evaluate(async () => { await navigator.serviceWorker.ready })
  await page.reload()
  await ready(page)
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true)
  await enterDashboardPhase(page, '夜晚')
  await page.getByRole('button', { name: '选择3号玩家', exact: true }).tap()
  await page.getByRole('button', { name: '调查员', exact: true }).tap()
  await page.getByRole('button', { name: '未受影响', exact: true }).tap()
  await expect.poll(async () => Object.values(JSON.parse(await rawSession(page)).nightRuns as Record<string, { drafts: Record<string, { outcomeId: string }> }>).some(run => Object.values(run.drafts).some(draft => draft.outcomeId === 'no-effect'))).toBe(true)
  const draft = await rawSession(page)
  for (const size of [{ width: 1180, height: 820 }, { width: 768, height: 1024 }, { width: 507, height: 410 }]) {
    await page.setViewportSize(size)
    await expect(page.getByRole('button', { name: '未受影响', exact: true })).toHaveAttribute('aria-pressed', 'true')
    expect(await rawSession(page)).toBe(draft)
    await noOverflow(page)
  }
  await page.setViewportSize(info.project.use.viewport!)
  await page.locator('.night-workbench').getByRole('button', { name: /^返回(?:本局)?$/ }).tap()
  await page.locator('.leave-workbench-notice').getByRole('button', { name: '返回本局', exact: true }).tap()
  await enterDashboardPhase(page, '白天')
  await page.getByRole('button', { name: '返回本局', exact: true }).tap()
  await expect.poll(() => page.evaluate(async () => {
    const urls = (await (await caches.open('botc-static-v1')).keys()).map(request => request.url)
    return urls.some(url => /\/NightWorkbench-[^/]+\.js$/.test(url)) && urls.some(url => /\/DayWorkbench-[^/]+\.js$/.test(url))
  })).toBe(true)
  await page.evaluate(async () => { await navigator.serviceWorker.ready })
  await page.reload()
  await ready(page)
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true)
  await site.disconnectOrigin()
  await page.reload()
  await ready(page)
  await enterDashboardPhase(page, '夜晚')
  const beforeNight = JSON.parse(await rawSession(page)).timeline.length
  await page.getByRole('button', { name: '确认本项', exact: true }).tap()
  await expect.poll(async () => JSON.parse(await rawSession(page)).timeline.length).toBe(beforeNight + 1)
  await page.locator('.night-workbench').getByRole('button', { name: /^返回(?:本局)?$/ }).tap()
  await enterDashboardPhase(page, '白天')
  await page.getByRole('button', { name: '选择1号为提名人', exact: true }).tap()
  await page.getByRole('tab', { name: '被提名人 · 未选', exact: true }).tap()
  await page.getByRole('button', { name: '选择4号为被提名人', exact: true }).tap()
  await page.getByRole('button', { name: '下一步：记录举手', exact: true }).tap()
  for (const seat of [1, 2, 3, 4, 5, 6]) await page.getByRole('button', { name: `记录${seat}号举手`, exact: true }).tap()
  const beforeVote = JSON.parse(await rawSession(page)).timeline.length
  await page.getByRole('button', { name: '记录本轮票型', exact: true }).tap()
  await expect.poll(async () => JSON.parse(await rawSession(page)).timeline.length).toBe(beforeVote + 1)
  await expect(page.getByText('4号暂列', { exact: true })).toBeVisible()
  expect(JSON.parse(await rawSession(page)).timeline.filter((entry: { kind: string }) => entry.kind === 'player_state_changed')).toEqual(initial.timeline.filter(entry => entry.kind === 'player_state_changed'))
  await page.screenshot({ path: info.outputPath('ipad-offline-vote.png') })
  await page.getByRole('button', { name: '备份恢复', exact: true }).tap()
  const exported = page.waitForEvent('download')
  await page.getByRole('button', { name: '导出当前对局', exact: true }).tap()
  const file = await (await exported).path()
  const backup = await readFile(file!, 'utf8')
  expect(JSON.parse(backup)).toEqual(JSON.parse(await rawSession(page)))
  const newDevice = await browser.newContext({ viewport: info.project.use.viewport, hasTouch: true, isMobile: true })
  try {
    const target = await newDevice.newPage()
    await target.goto(info.project.use.baseURL!)
    await ready(target)
    const beforeRestore = await rawSession(target)
    await target.getByRole('button', { name: '备份恢复', exact: true }).tap()
    await target.getByLabel('选择备份文件', { exact: true }).setInputFiles({ name: 'tablet-transfer.json', mimeType: 'application/json', buffer: Buffer.from(backup) })
    await expect(target.getByRole('button', { name: '确认恢复', exact: true })).toBeDisabled()
    expect(await rawSession(target)).toBe(beforeRestore)
    await target.getByLabel('我确认替换当前对局，并保留恢复前备份。').check()
    await Promise.all([target.waitForEvent('load'), target.getByRole('button', { name: '确认恢复', exact: true }).tap()])
    await ready(target)
    await expect.poll(async () => JSON.parse(await rawSession(target))).toEqual(JSON.parse(backup))
    expect(await target.evaluate(() => localStorage.getItem('botc-session-before-restore-v1'))).toBe(beforeRestore)
  } finally { await newDevice.close() }
})

test('模拟前台恢复事件立即核对真实编辑锁，仍活跃的标签不能被抢占', async ({ page, context, site }, info) => {
  await context.addInitScript(() => {
    const setInterval = window.setInterval.bind(window)
    Object.assign(window, { ipadEditorHeartbeatsForTest: 0 })
    window.setInterval = ((handler: TimerHandler, timeout?: number, ...args: unknown[]) => {
      if (timeout !== 5000 || typeof handler !== 'function') return setInterval(handler, timeout, ...args)
      return setInterval(() => {
        const observed = window as unknown as { ipadEditorHeartbeatsForTest: number }
        observed.ipadEditorHeartbeatsForTest++
        handler(...args)
      }, 60_000)
    }) as typeof window.setInterval
  })
  await page.goto(site.url)
  await ready(page)
  const before = await rawSession(page)
  const second = await context.newPage()
  await second.goto(site.url)
  const protectedPage = second.getByRole('dialog', { name: '编辑保护', exact: true })
  await expect(protectedPage).toContainText('另一页面正在编辑')
  const originalOwner = await second.evaluate(async () => (await navigator.locks.query()).held.find(lock => lock.name === 'botc-session-editor-v1')!.clientId)
  // Headless WebKit has no OS tab switch; only the visibility event is synthetic.
  await second.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await expect(protectedPage).toBeVisible()
  expect(await rawSession(second)).toBe(before)
  await page.close()
  await expect.poll(() => second.evaluate(async owner => (await navigator.locks.query()).held.some(lock => lock.name === 'botc-session-editor-v1' && lock.clientId === owner), originalOwner)).toBe(false)
  const started = Date.now()
  await second.evaluate(() => document.dispatchEvent(new Event('visibilitychange')))
  await ready(second)
  expect(await second.evaluate(() => (window as unknown as { ipadEditorHeartbeatsForTest: number }).ipadEditorHeartbeatsForTest)).toBe(0)
  expect(await rawSession(second)).toBe(before)
  await info.attach('foreground-event-boundary', { contentType: 'application/json', body: Buffer.from(JSON.stringify({ syntheticVisibilityEvent: true, realWebLocks: true, heartbeatDelayedToMs: 60000, physicalIPadTested: false, readyMs: Date.now() - started })) })
})
