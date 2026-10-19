import { expect, test, type BrowserContext, type Locator, type Page, type TestInfo } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { createPrototypeGameSession } from '../../src/features/game-session/data/createPrototypeSession'

const sessionKey = 'botc-copilot-session-v1'
const backupKey = 'botc-session-before-restore-v1'
const settingsKey = 'botc-copilot-archive-runtime-settings-v1'
const historyKey = 'cross-browser-lifecycle-history-test'
const writesKey = 'cross-browser-lifecycle-writes-test'
const readyTimeout = 8_000
type HistoryEvent = { type: string; persisted: boolean; documentId: string; url: string; navigationType: string | null; notRestoredReasons: unknown }

async function prepare(context: BrowserContext, baseURL: string) {
  const original = createPrototypeGameSession()
  const raw = JSON.stringify(original)
  const backup = JSON.stringify({ ...original, id: 'cross-browser-existing-recovery-copy' })
  const settings = JSON.stringify({ mode: 'local', baseUrl: baseURL, timeoutMs: 8000 })
  await context.addCookies([{ name: 'botc-ai-local', value: 'synthetic-cross-browser-device-cookie', url: baseURL, httpOnly: true, sameSite: 'Strict' }])
  const cookies = await context.cookies()
  await context.addInitScript(({ raw, backup, settings, sessionKey, backupKey, settingsKey, historyKey, writesKey }) => {
    if (!localStorage.getItem(sessionKey)) {
      localStorage.setItem(sessionKey, raw)
      localStorage.setItem(backupKey, backup)
      localStorage.setItem(settingsKey, settings)
    }
    Object.assign(window, { lifecycleEditorWritesForTest: 0, lifecycleTouchStartsForTest: 0 })
    window.addEventListener('touchstart', () => { (window as unknown as { lifecycleTouchStartsForTest: number }).lifecycleTouchStartsForTest++ }, { capture: true, passive: true })
    const documentId = `${Date.now()}-${Math.random()}`
    const record = (type: string, persisted: boolean) => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming & { notRestoredReasons?: unknown }
      const events = JSON.parse(sessionStorage.getItem(historyKey) ?? '[]')
      events.push({ type, persisted, documentId, url: location.href, navigationType: navigation?.type ?? null, notRestoredReasons: navigation?.notRestoredReasons ?? null })
      sessionStorage.setItem(historyKey, JSON.stringify(events))
    }
    // Capture real browser events before the product's persisted-pageshow reload handler.
    window.addEventListener('pageshow', (event) => record('pageshow', event.persisted), { capture: true })
    window.addEventListener('pagehide', (event) => record('pagehide', event.persisted), { capture: true })
    const setItem = Storage.prototype.setItem
    Storage.prototype.setItem = function (key, value) {
      setItem.call(this, key, value)
      if (this === localStorage && key === sessionKey) {
        const observed = window as unknown as { lifecycleEditorWritesForTest: number }
        observed.lifecycleEditorWritesForTest++
        const entries = JSON.parse(sessionStorage.getItem(writesKey) ?? '[]')
        entries.push({ documentId, raw: value })
        sessionStorage.setItem(writesKey, JSON.stringify(entries))
      }
    }
  }, { raw, backup, settings, sessionKey, backupKey, settingsKey, historyKey, writesKey })
  // The server is the static production preview with no API backend or credentials.
  // Avoid request interception here: it would alter the browser's caching behavior.
  let paidRequests = 0
  context.on('request', (request) => {
    const path = new URL(request.url()).pathname
    if (path.startsWith('/api/ai/') || path.endsWith('/live-test')) paidRequests++
  })
  return { raw, backup, settings, cookies, paidRequests: () => paidRequests }
}

async function rawSession(page: Page) { return page.evaluate((key) => localStorage.getItem(key), sessionKey) }
async function writeCount(page: Page) { return page.evaluate(() => (window as unknown as { lifecycleEditorWritesForTest: number }).lifecycleEditorWritesForTest) }
async function writeHistory(page: Page): Promise<{ documentId: string; raw: string }[]> { return page.evaluate((key) => JSON.parse(sessionStorage.getItem(key) ?? '[]'), writesKey) }
async function historyEvents(page: Page): Promise<HistoryEvent[]> { return page.evaluate((key) => JSON.parse(sessionStorage.getItem(key) ?? '[]'), historyKey) }
async function ready(page: Page) {
  await expect(page.locator('.dashboard')).toBeVisible()
  await expect.poll(() => writeCount(page), { timeout: readyTimeout }).toBeGreaterThan(0)
  await expect(page.getByRole('dialog', { name: '编辑保护', exact: true })).toHaveCount(0)
}
async function activate(locator: Locator, info: TestInfo) {
  if (info.project.use.hasTouch) await locator.tap()
  else await locator.click()
}
async function assertData(page: Page, context: BrowserContext, checks: Awaited<ReturnType<typeof prepare>>, expected = checks.raw) {
  expect(await rawSession(page)).toBe(expected)
  expect(await page.evaluate((key) => localStorage.getItem(key), backupKey)).toBe(checks.backup)
  expect(await page.evaluate((key) => localStorage.getItem(key), settingsKey)).toBe(checks.settings)
  expect(await context.cookies()).toEqual(checks.cookies)
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('botc-game-archives-v1') ?? '[]'))).toEqual([])
  expect(checks.paidRequests()).toBe(0)
}
async function attach(info: TestInfo, name: string, value: unknown) {
  await info.attach(name, { contentType: 'application/json', body: Buffer.from(JSON.stringify(value, null, 2)) })
}
async function changeOneState(page: Page, info: TestInfo, previous: string) {
  await activate(page.getByRole('button', { name: /查看1号/ }), info)
  await activate(page.getByRole('button', { name: '中毒', exact: true }), info)
  await activate(page.getByRole('button', { name: '确认状态', exact: true }), info)
  await expect.poll(() => rawSession(page)).not.toBe(previous)
  const latest = (await rawSession(page))!
  expect(JSON.parse(latest).timeline).toHaveLength(JSON.parse(previous).timeline.length + 1)
  return latest
}

test('手机触控与桌面连续刷新保留对局、恢复副本、设备cookie和设置', async ({ page, context, baseURL }, info) => {
  const checks = await prepare(context, baseURL!)
  await page.goto('/')
  await ready(page)
  const capability = await page.evaluate(() => ({ secureContext: isSecureContext, webLocks: typeof navigator.locks?.request === 'function', maxTouchPoints: navigator.maxTouchPoints, userAgent: navigator.userAgent }))
  await activate(page.getByRole('button', { name: '备份恢复', exact: true }), info)
  await expect(page.getByRole('dialog', { name: '对局备份', exact: true })).toBeVisible()
  await activate(page.getByRole('button', { name: '关闭对局备份', exact: true }), info)
  const touchStarts = await page.evaluate(() => (window as unknown as { lifecycleTouchStartsForTest: number }).lifecycleTouchStartsForTest)
  if (info.project.use.hasTouch) expect(touchStarts).toBeGreaterThanOrEqual(2)
  const timings: number[] = []
  for (let iteration = 0; iteration < 2; iteration++) {
    const started = Date.now()
    await page.reload()
    await ready(page)
    timings.push(Date.now() - started)
    expect(timings.at(-1)).toBeLessThan(readyTimeout)
    await assertData(page, context, checks)
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width)
  await attach(info, 'reload-readiness', { project: info.project.name, capability, actualTouchStarts: touchStarts, timingsMs: timings, emulationOnly: Boolean(info.project.use.hasTouch), physicalDeviceTested: false })
  await page.screenshot({ path: info.outputPath('reload-ready.png'), animations: 'disabled' })
})

test('双页刷新仍独占，关闭主页面后旧内存不能覆盖最新记录', async ({ page, context, baseURL }, info) => {
  const checks = await prepare(context, baseURL!)
  await page.goto('/')
  await ready(page)
  const second = await context.newPage()
  await second.goto('/')
  const protection = second.getByRole('dialog', { name: '编辑保护', exact: true })
  for (let iteration = 0; iteration < 2; iteration++) {
    await expect(protection).toBeVisible()
    await expect(protection).toContainText('另一页面正在编辑')
    expect(await writeCount(second)).toBe(0)
    await assertData(second, context, checks)
    if (iteration === 0) await second.reload()
  }
  for (const name of ['导出此页副本', '重新打开最新对局']) await expect(protection.getByRole('button', { name, exact: true })).toBeInViewport()
  await second.screenshot({ path: info.outputPath('second-page-blocked.png'), animations: 'disabled' })
  const latest = await changeOneState(page, info, checks.raw)
  await page.close()
  await expect(protection).toHaveAccessibleDescription(/另一页面已更新对局/, { timeout: readyTimeout })
  expect(await writeCount(second)).toBe(0)
  await assertData(second, context, checks, latest)
  const started = Date.now()
  await Promise.all([second.waitForEvent('load'), activate(protection.getByRole('button', { name: '重新打开最新对局', exact: true }), info)])
  await ready(second)
  await assertData(second, context, checks, latest)
  await attach(info, 'explicit-reopen-readiness', { project: info.project.name, elapsedMs: Date.now() - started, originalRecords: JSON.parse(checks.raw).timeline.length, latestRecords: JSON.parse(latest).timeline.length })
})

test('真实后退前进与返回旧文档不覆盖接手页新内容，记录实际BFCache证据', async ({ page, context, baseURL, browserName }, info) => {
  const checks = await prepare(context, baseURL!)
  const cdpNotRestored: unknown[] = []
  if (browserName === 'chromium') {
    const cdp = await context.newCDPSession(page)
    await cdp.send('Page.enable')
    cdp.on('Page.backForwardCacheNotUsed', (event) => cdpNotRestored.push(event))
  }
  await page.goto('/')
  await ready(page)
  const originalDocumentWrites = await writeHistory(page)
  const second = await context.newPage()
  await second.goto('/')
  await expect(second.getByRole('dialog', { name: '编辑保护', exact: true })).toBeVisible()
  await page.goto('/favicon.svg?lifecycle-parked')
  await ready(second)
  const latest = await changeOneState(second, info, checks.raw)
  await page.goBack({ waitUntil: 'commit' })
  const protection = page.getByRole('dialog', { name: '编辑保护', exact: true })
  await expect(protection).toBeVisible({ timeout: readyTimeout })
  expect(await writeHistory(page)).toEqual(originalDocumentWrites)
  await assertData(page, context, checks, latest)
  const eventsAfterBack = await historyEvents(page)
  const actualRestores = eventsAfterBack.filter((event) => event.type === 'pageshow' && event.persisted && new URL(event.url).pathname === '/')
  await attach(info, 'real-bfcache-evidence', {
    project: info.project.name,
    actualPersistedRestore: actualRestores.length > 0,
    syntheticPageTransitionEvents: false,
    claim: actualRestores.length ? 'real BFCache pageshow observed before product reload' : 'real back/forward navigation passed; no persisted restore observed',
    events: eventsAfterBack,
    cdpNotRestored,
  })
  await page.screenshot({ path: info.outputPath('back-to-old-document-blocked.png'), animations: 'disabled' })
  await page.goForward({ waitUntil: 'commit' })
  await expect(page).toHaveURL(/favicon\.svg\?lifecycle-parked/)
  await second.close()
  const started = Date.now()
  await page.goBack({ waitUntil: 'commit' })
  await ready(page)
  await assertData(page, context, checks, latest)
  expect((await writeHistory(page)).slice(originalDocumentWrites.length).every((entry) => entry.raw === latest)).toBe(true)
  await attach(info, 'history-final-readiness', { project: info.project.name, elapsedMs: Date.now() - started, events: await historyEvents(page) })
})

test('移动端未交付beforeunload且保存超额时，真实BFCache返回保留内存副本', async ({ page, context, baseURL, browserName }, info) => {
  const checks = await prepare(context, baseURL!)
  const cdpNotRestored: unknown[] = []
  if (browserName === 'chromium') {
    const cdp = await context.newCDPSession(page)
    await cdp.send('Page.enable')
    cdp.on('Page.backForwardCacheNotUsed', (event) => cdpNotRestored.push(event))
  }
  await page.goto('/')
  await ready(page)
  await page.evaluate((sessionKey) => {
    const setItem = Storage.prototype.setItem
    Storage.prototype.setItem = function (key, value) {
      if (this === localStorage && key === sessionKey) throw new DOMException('Injected quota failure', 'QuotaExceededError')
      setItem.call(this, key, value)
    }
    // Model mobile browsers omitting beforeunload; pageshow/pagehide remain native.
    window.addEventListener('beforeunload', (event) => event.stopImmediatePropagation(), { capture: true })
  }, sessionKey)
  await activate(page.getByRole('button', { name: /查看1号/ }), info)
  await activate(page.getByRole('button', { name: '中毒', exact: true }), info)
  await activate(page.getByRole('button', { name: '确认状态', exact: true }), info)
  const failed = page.getByRole('dialog', { name: '保存失败', exact: true })
  await expect(failed).toBeVisible()
  const firstDownload = page.waitForEvent('download')
  await activate(failed.getByRole('button', { name: '导出对局', exact: true }), info)
  const unsaved = JSON.parse(await readFile((await (await firstDownload).path())!, 'utf8'))
  expect(unsaved.timeline).toHaveLength(JSON.parse(checks.raw).timeline.length + 1)
  await attach(info, 'dirty-memory-before-navigation', { persistedRecordCount: JSON.parse(checks.raw).timeline.length, unsaved })
  await assertData(page, context, checks)
  const parked = new URL('/favicon.svg?dirty-lifecycle-parked', baseURL)
  parked.hostname = 'localhost'
  await page.goto(parked.href)
  await page.goBack({ waitUntil: 'commit' })
  await expect(page.locator('.dashboard')).toBeVisible()
  await page.waitForLoadState('networkidle')
  const events = await historyEvents(page)
  const actualRestore = events.some((event) => event.type === 'pageshow' && event.persisted && new URL(event.url).pathname === '/')
  await attach(info, 'dirty-real-bfcache-evidence', {
    project: info.project.name,
    actualPersistedRestore: actualRestore,
    syntheticPageTransitionEvents: false,
    faultInjection: 'quota failure plus omitted mobile beforeunload delivery',
    events,
    cdpNotRestored,
  })
  test.skip(!actualRestore, 'Real navigation did not restore BFCache; this does not verify dirty persisted recovery.')
  const protection = page.getByRole('dialog', { name: '编辑保护', exact: true })
  await expect(protection).toBeVisible()
  if (await failed.isVisible()) await activate(failed.getByRole('button', { name: '关闭保存失败', exact: true }), info)
  const exportCopy = page.waitForEvent('download')
  await activate(protection.getByRole('button', { name: '导出此页副本', exact: true }), info)
  const recovered = JSON.parse(await readFile((await (await exportCopy).path())!, 'utf8'))
  expect(recovered).toEqual(unsaved)
  await assertData(page, context, checks)
  await page.screenshot({ path: info.outputPath('dirty-persisted-copy-preserved.png'), animations: 'disabled' })
})

test('合成pagehide/pageshow注入（不是真BFCache）后暂停编辑并导出完整未存副本', async ({ page, context, baseURL }, info) => {
  const checks = await prepare(context, baseURL!)
  await page.goto('/')
  await ready(page)
  const beforeWrites = await writeCount(page)
  await page.evaluate((sessionKey) => {
    const setItem = Storage.prototype.setItem
    Storage.prototype.setItem = function (key, value) {
      if (this === localStorage && key === sessionKey) throw new DOMException('Injected quota failure', 'QuotaExceededError')
      setItem.call(this, key, value)
    }
  }, sessionKey)
  await activate(page.getByRole('button', { name: /查看1号/ }), info)
  await activate(page.getByRole('button', { name: '中毒', exact: true }), info)
  await activate(page.getByRole('button', { name: '确认状态', exact: true }), info)
  const failed = page.getByRole('dialog', { name: '保存失败', exact: true })
  await expect(failed).toBeVisible()
  const beforeDownload = page.waitForEvent('download')
  await activate(failed.getByRole('button', { name: '导出对局', exact: true }), info)
  const unsaved = JSON.parse(await readFile((await (await beforeDownload).path())!, 'utf8'))
  expect(unsaved.timeline).toHaveLength(JSON.parse(checks.raw).timeline.length + 1)
  await page.evaluate(() => {
    window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true }))
    window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }))
  })
  const protection = page.getByRole('dialog', { name: '编辑保护', exact: true })
  await expect(protection).toHaveAccessibleDescription(/此页已暂停编辑/)
  const afterDownload = page.waitForEvent('download')
  await activate(protection.getByRole('button', { name: '导出此页副本', exact: true }), info)
  expect(JSON.parse(await readFile((await (await afterDownload).path())!, 'utf8'))).toEqual(unsaved)
  const second = await context.newPage()
  await second.goto('/')
  await ready(second)
  expect(await writeCount(page)).toBe(beforeWrites)
  await assertData(page, context, checks)
  await assertData(second, context, checks)
  await attach(info, 'supplemental-synthetic-lifecycle', { project: info.project.name, realBfcache: false, syntheticPageTransitionEvents: true, realBlobDownload: true, secondPageAcquiredRealLock: true, unsaved })
  await page.screenshot({ path: info.outputPath('synthetic-recovery-copy-preserved.png'), animations: 'disabled' })
})
