import { expect, test, type BrowserContext, type Page, type TestInfo } from '@playwright/test'
import { createPrototypeGameSession } from '../../src/features/game-session/data/createPrototypeSession'

const sessionKey = 'botc-copilot-session-v1'
const backupKey = 'botc-session-before-restore-v1'
const editorDatabase = 'botc-session-editor-v1'
const quickReadyMs = 8_000
type BrowserFault = 'no-web-locks' | 'web-lock-rejects' | 'web-lock-throws' | 'indexeddb-unavailable' | 'baseline-changed-during-load'
type Lease = { owner: string; expires: number }

async function prepare(context: BrowserContext, fault?: BrowserFault) {
  const original = createPrototypeGameSession()
  const raw = JSON.stringify(original)
  const latestRaw = JSON.stringify({ ...original, seats: { ...original.seats, 1: { ...original.seats[1], nickname: '读取后另一页面已更新' } } })
  const backup = JSON.stringify({ ...original, id: 'refresh-editor-existing-recovery-copy' })
  await context.addInitScript(({ raw, latestRaw, backup, sessionKey, backupKey, fault }) => {
    if (!localStorage.getItem(sessionKey)) {
      localStorage.setItem(sessionKey, raw)
      localStorage.setItem(backupKey, backup)
    }
    localStorage.setItem('botc-copilot-archive-runtime-settings-v1', JSON.stringify({ mode: 'local', baseUrl: location.origin, timeoutMs: 8000 }))
    // Observe the existing save boundary: a successful automatic save proves editor readiness.
    Object.assign(window, { editorSessionWritesForTest: 0, editorIndexedDBFailuresForTest: 0 })
    const setItem = Storage.prototype.setItem
    Storage.prototype.setItem = function (key, value) {
      setItem.call(this, key, value)
      if (this === localStorage && key === sessionKey) {
        const observed = window as unknown as { editorSessionWritesForTest: number }
        observed.editorSessionWritesForTest++
      }
    }
    if (fault === 'no-web-locks') Object.defineProperty(navigator, 'locks', { value: undefined, configurable: true })
    if (fault === 'web-lock-rejects') Object.defineProperty(navigator, 'locks', {
      configurable: true,
      value: { request: () => Promise.reject(new DOMException('Injected Web Locks rejection', 'SecurityError')) },
    })
    if (fault === 'web-lock-throws') Object.defineProperty(navigator, 'locks', {
      configurable: true,
      value: { request: () => { throw new DOMException('Injected synchronous Web Locks failure', 'SecurityError') } },
    })
    if (fault === 'indexeddb-unavailable') IDBFactory.prototype.open = () => {
      ;(window as unknown as { editorIndexedDBFailuresForTest: number }).editorIndexedDBFailuresForTest++
      throw new DOMException('Injected IndexedDB rejection', 'SecurityError')
    }
    if (fault === 'baseline-changed-during-load') {
      const parse = JSON.parse
      let injected = false
      JSON.parse = function (value, reviver) {
        const parsed = parse(value, reviver)
        if (value === raw && parsed?.schemaVersion === 1) {
          const schemaVersion = parsed.schemaVersion
          // Bootstrap reads only scriptId; the full loader first validates schemaVersion.
          Object.defineProperty(parsed, 'schemaVersion', { enumerable: true, configurable: true, get() {
            if (!injected) {
              injected = true
              setItem.call(localStorage, sessionKey, latestRaw)
              Object.assign(window, { editorBaselineRaceInjectedForTest: true })
            }
            return schemaVersion
          } })
        }
        return parsed
      }
    }
  }, { raw, latestRaw, backup, sessionKey, backupKey, fault })
  let paidRequests = 0
  await context.route('**/api/ai/**', (route) => { paidRequests++; return route.abort() })
  await context.route('**/api/**/live-test', (route) => { paidRequests++; return route.abort() })
  return { raw, latestRaw, backup, paidRequests: () => paidRequests }
}

async function readRaw(page: Page) { return page.evaluate((key) => localStorage.getItem(key), sessionKey) }
async function readBackup(page: Page) { return page.evaluate((key) => localStorage.getItem(key), backupKey) }
async function writes(page: Page) { return page.evaluate(() => (window as unknown as { editorSessionWritesForTest: number }).editorSessionWritesForTest) }
async function ready(page: Page, timeout = quickReadyMs) {
  await expect(page.locator('.dashboard')).toBeVisible({ timeout })
  await expect.poll(() => writes(page), { timeout }).toBeGreaterThan(0)
  await expect(page.getByRole('dialog', { name: '编辑保护', exact: true })).toHaveCount(0)
}
async function attachReadyTiming(info: TestInfo, scenario: string, elapsedMs: number) {
  await info.attach(`editor-ready-${scenario}`, { contentType: 'application/json', body: Buffer.from(JSON.stringify({ scenario, elapsedMs, measuredUntil: 'successful-session-save-and-edit-protection-hidden', hardUpperBoundMs: scenario === 'no-web-locks-fallback' ? 22_000 : quickReadyMs })) })
}
async function assertUnchanged(page: Page, raw: string, backup: string) {
  expect(await readRaw(page)).toBe(raw)
  expect(await readBackup(page)).toBe(backup)
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('botc-game-archives-v1') ?? '[]'))).toEqual([])
}

async function readLease(page: Page): Promise<Lease> {
  return page.evaluate((database) => new Promise<Lease>((resolve, reject) => {
    const request = indexedDB.open(database, 1)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction('leases', 'readonly')
      const current = transaction.objectStore('leases').get('current')
      current.onsuccess = () => resolve(current.result)
      current.onerror = () => reject(current.error)
      transaction.oncomplete = () => db.close()
    }
  }), editorDatabase)
}

async function suppressPagehideCleanup(page: Page) {
  await page.addInitScript(() => {
    window.addEventListener('pagehide', (event) => {
      localStorage.setItem('refresh-editor-pagehide-suppressed-test', 'yes')
      event.stopImmediatePropagation()
    }, { capture: true })
  })
  // Also arm the already loaded document; the init script covers subsequent reloads.
  await page.evaluate(() => {
    window.addEventListener('pagehide', (event) => {
      localStorage.setItem('refresh-editor-pagehide-suppressed-test', 'yes')
      event.stopImmediatePropagation()
    }, { capture: true })
  })
}

for (const width of [390, 1440]) {
  test(`连续刷新迅速恢复编辑权且原局和恢复副本全文不变 ${width}px`, async ({ page, context }, info) => {
    await page.setViewportSize({ width, height: 900 })
    const checks = await prepare(context)
    await page.goto('/')
    await ready(page)
    expect(await page.evaluate(() => isSecureContext && typeof navigator.locks?.request === 'function')).toBe(true)
    for (let iteration = 0; iteration < 3; iteration++) {
      const before = await readLease(page)
      const started = Date.now()
      await page.reload()
      await ready(page)
      const elapsedMs = Date.now() - started
      await attachReadyTiming(info, `reload-${iteration + 1}`, elapsedMs)
      expect(elapsedMs).toBeLessThan(quickReadyMs)
      expect((await readLease(page)).owner).not.toBe(before.owner)
      await assertUnchanged(page, checks.raw, checks.backup)
    }
    expect(checks.paidRequests()).toBe(0)
    await page.screenshot({ path: info.outputPath('refresh-editor-ready.png'), animations: 'disabled' })
  })
}

test('旧页pagehide清理完全未执行时，新文档也不等待未过期IDB租约', async ({ page, context }, info) => {
  const checks = await prepare(context)
  await page.goto('/')
  await ready(page)
  await suppressPagehideCleanup(page)
  const before = await readLease(page)
  expect(before.expires - await page.evaluate(() => Date.now())).toBeGreaterThan(8_000)
  const started = Date.now()
  await page.reload()
  await ready(page)
  const elapsedMs = Date.now() - started
  await attachReadyTiming(info, 'skipped-pagehide-cleanup', elapsedMs)
  expect(elapsedMs).toBeLessThan(quickReadyMs)
  expect(await page.evaluate(() => localStorage.getItem('refresh-editor-pagehide-suppressed-test'))).toBe('yes')
  expect(await page.evaluate(() => Date.now())).toBeLessThan(before.expires)
  expect((await readLease(page)).owner).not.toBe(before.owner)
  await assertUnchanged(page, checks.raw, checks.backup)
  expect(checks.paidRequests()).toBe(0)
})

test('第二标签反复刷新仍受保护，不能抢走主页面或自动覆盖原局', async ({ page, context }, info) => {
  const checks = await prepare(context)
  await page.goto('/')
  await ready(page)
  const owner = (await readLease(page)).owner
  const second = await context.newPage()
  await second.goto('/')
  for (let iteration = 0; iteration < 3; iteration++) {
    const protection = second.getByRole('dialog', { name: '编辑保护', exact: true })
    await expect(protection).toBeVisible()
    await expect(protection).toContainText('另一页面正在编辑')
    expect(await writes(second)).toBe(0)
    expect((await readLease(second)).owner).toBe(owner)
    await assertUnchanged(second, checks.raw, checks.backup)
    if (iteration < 2) await second.reload()
  }
  await expect(page.getByRole('dialog', { name: '编辑保护', exact: true })).toHaveCount(0)
  for (const width of [390, 905, 1440]) {
    await second.setViewportSize({ width, height: 900 })
    const protection = second.getByRole('dialog', { name: '编辑保护', exact: true })
    await expect(protection).toBeVisible()
    for (const name of ['导出此页副本', '重新打开最新对局']) await expect(protection.getByRole('button', { name, exact: true })).toBeInViewport()
    expect(await second.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    await second.screenshot({ path: info.outputPath(`second-tab-blocked-${width}px.png`), animations: 'disabled' })
  }
  expect(checks.paidRequests()).toBe(0)
})

test('同源opener复制sessionStorage也不能复制编辑owner', async ({ page, context }) => {
  const checks = await prepare(context)
  await page.goto('/')
  await ready(page)
  const owner = (await readLease(page)).owner
  await page.evaluate(() => sessionStorage.setItem('refresh-editor-opener-copy-test', 'copied-from-main'))
  const expectedStorage = await page.evaluate(() => Object.fromEntries(Object.keys(sessionStorage).map((key) => [key, sessionStorage.getItem(key)])))
  const opened = page.waitForEvent('popup')
  await page.evaluate(() => { window.open('/', 'refresh-editor-copy') })
  const duplicate = await opened
  await duplicate.waitForLoadState('load')
  expect(await duplicate.evaluate(() => Boolean(window.opener))).toBe(true)
  expect(await duplicate.evaluate(() => Object.fromEntries(Object.keys(sessionStorage).map((key) => [key, sessionStorage.getItem(key)])))).toEqual(expectedStorage)
  await expect(duplicate.getByRole('dialog', { name: '编辑保护', exact: true })).toBeVisible()
  expect(await writes(duplicate)).toBe(0)
  expect((await readLease(duplicate)).owner).toBe(owner)
  await duplicate.reload()
  await expect(duplicate.getByRole('dialog', { name: '编辑保护', exact: true })).toBeVisible()
  expect(await writes(duplicate)).toBe(0)
  await assertUnchanged(duplicate, checks.raw, checks.backup)
  expect(checks.paidRequests()).toBe(0)
})

test('关闭主页面后旧内存不覆盖新记录，重新打开才接手最新局', async ({ page, context }, info) => {
  const checks = await prepare(context)
  await page.goto('/')
  await ready(page)
  const second = await context.newPage()
  await second.goto('/')
  const protection = second.getByRole('dialog', { name: '编辑保护', exact: true })
  await expect(protection).toBeVisible()
  await page.getByRole('button', { name: /查看1号/ }).click()
  await page.getByRole('button', { name: '中毒', exact: true }).click()
  await page.getByRole('button', { name: '确认状态', exact: true }).click()
  await expect.poll(() => readRaw(page)).not.toBe(checks.raw)
  const latest = (await readRaw(page))!
  expect(JSON.parse(latest).timeline).toHaveLength(JSON.parse(checks.raw).timeline.length + 1)
  await page.close()
  await expect(protection).toHaveAccessibleDescription(/另一页面已更新对局/, { timeout: quickReadyMs })
  expect(await writes(second)).toBe(0)
  await assertUnchanged(second, latest, checks.backup)
  const started = Date.now()
  await Promise.all([second.waitForEvent('load'), protection.getByRole('button', { name: '重新打开最新对局', exact: true }).click()])
  await ready(second)
  await attachReadyTiming(info, 'reopen-latest', Date.now() - started)
  await assertUnchanged(second, latest, checks.backup)
  expect(checks.paidRequests()).toBe(0)
})

for (const fault of ['web-lock-rejects', 'web-lock-throws', 'indexeddb-unavailable'] as const) {
  test(`${fault}时明确停止编辑，不能降级为无保护写入`, async ({ page, context }) => {
    const checks = await prepare(context, fault)
    await page.goto('/')
    await expect(page.locator('.dashboard')).toBeVisible({ timeout: 30_000 })
    const protection = page.getByRole('dialog', { name: '编辑保护', exact: true })
    await expect(protection).toBeVisible()
    await expect(protection).toContainText('浏览器暂时无法建立编辑保护')
    if (fault === 'indexeddb-unavailable') expect(await page.evaluate(() => (window as unknown as { editorIndexedDBFailuresForTest: number }).editorIndexedDBFailuresForTest)).toBeGreaterThan(0)
    expect(await writes(page)).toBe(0)
    await assertUnchanged(page, checks.raw, checks.backup)
    await page.reload()
    await expect(page.locator('.dashboard')).toBeVisible({ timeout: 30_000 })
    await expect(protection).toBeVisible()
    if (fault === 'indexeddb-unavailable') expect(await page.evaluate(() => (window as unknown as { editorIndexedDBFailuresForTest: number }).editorIndexedDBFailuresForTest)).toBeGreaterThan(0)
    expect(await writes(page)).toBe(0)
    await assertUnchanged(page, checks.raw, checks.backup)
    expect(checks.paidRequests()).toBe(0)
  })
}

test('没有WebLocks时保留15秒租约兜底，不把未完成清理当成已释放', async ({ page, context }, info) => {
  test.setTimeout(35_000)
  const checks = await prepare(context, 'no-web-locks')
  await page.goto('/')
  await ready(page)
  expect(await page.evaluate(() => navigator.locks)).toBeUndefined()
  await suppressPagehideCleanup(page)
  const lease = await readLease(page)
  const started = Date.now()
  await page.reload()
  const protection = page.getByRole('dialog', { name: '编辑保护', exact: true })
  await expect(protection).toBeVisible()
  expect(await page.evaluate(() => Date.now())).toBeLessThan(lease.expires)
  expect(await writes(page)).toBe(0)
  await assertUnchanged(page, checks.raw, checks.backup)
  await ready(page, 22_000)
  await attachReadyTiming(info, 'no-web-locks-fallback', Date.now() - started)
  expect(await page.evaluate(() => Date.now())).toBeGreaterThanOrEqual(lease.expires)
  expect((await readLease(page)).owner).not.toBe(lease.owner)
  await assertUnchanged(page, checks.raw, checks.backup)
  expect(checks.paidRequests()).toBe(0)
})

test('载入读取A后存储已更新B，旧内存不能用B的基线取得编辑权写回A', async ({ page, context }) => {
  const checks = await prepare(context, 'baseline-changed-during-load')
  await page.goto('/')
  const protection = page.getByRole('dialog', { name: '编辑保护', exact: true })
  await expect(protection).toBeVisible()
  await expect(protection).toContainText('另一页面已更新对局')
  expect(await page.evaluate(() => (window as unknown as { editorBaselineRaceInjectedForTest?: boolean }).editorBaselineRaceInjectedForTest)).toBe(true)
  expect(await writes(page)).toBe(0)
  await assertUnchanged(page, checks.latestRaw, checks.backup)
  expect(checks.paidRequests()).toBe(0)
})

test('无WebLock标记的旧版未过期租约不能被新浏览器锁接管', async ({ page, context }) => {
  test.setTimeout(35_000)
  const checks = await prepare(context)
  await page.goto('/favicon.svg')
  const expires = await page.evaluate((database) => new Promise<number>((resolve, reject) => {
    const request = indexedDB.open(database, 1)
    request.onupgradeneeded = () => request.result.createObjectStore('leases')
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction('leases', 'readwrite')
      const expires = Date.now() + 15_000
      transaction.objectStore('leases').put({ owner: 'legacy-tab-unmarked', expires }, 'current')
      transaction.oncomplete = () => { db.close(); resolve(expires) }
      transaction.onabort = () => { db.close(); reject(transaction.error) }
    }
  }), editorDatabase)
  await page.goto('/')
  const protection = page.getByRole('dialog', { name: '编辑保护', exact: true })
  await expect(protection).toBeVisible()
  expect(await page.evaluate(() => Date.now())).toBeLessThan(expires)
  expect(await writes(page)).toBe(0)
  expect((await readLease(page)).owner).toBe('legacy-tab-unmarked')
  await assertUnchanged(page, checks.raw, checks.backup)
  await ready(page, 22_000)
  expect(await page.evaluate(() => Date.now())).toBeGreaterThanOrEqual(expires)
  expect((await readLease(page)).owner).not.toBe('legacy-tab-unmarked')
  await assertUnchanged(page, checks.raw, checks.backup)
  expect(checks.paidRequests()).toBe(0)
})
