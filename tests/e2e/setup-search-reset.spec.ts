import { expect, test, type Page } from '@playwright/test'
import { createArchiveHandlers } from '../../server/archive/handlers'
import { createArchiveHttpRoutes } from '../../server/archive/httpArchiveRoutes'
import { createEmptyGameSession, createPrototypeGameSession } from '../../src/features/game-session/data/createPrototypeSession'
import type { GameArchiveRecord } from '../../src/services/archive/types'

const sessionKey = 'botc-copilot-session-v1'
const archiveKey = 'botc-game-archives-v1'
const beforeResetKey = 'botc-session-before-restore-v1'
const successMessage = '本局已重置，记录已归档。请选择人数，开始新局。'

async function seed(page: Page, empty = false, http = false) {
  const session = empty ? createEmptyGameSession('2026-10-19T00:00:00.000Z') : createPrototypeGameSession()
  await page.addInitScript(({ sessionKey, session, http }) => {
    if (!localStorage.getItem(sessionKey)) localStorage.setItem(sessionKey, JSON.stringify(session))
    localStorage.setItem('botc-copilot-archive-runtime-settings-v1', JSON.stringify({ mode: http ? 'http' : 'local', baseUrl: location.origin, timeoutMs: 8000 }))
  }, { sessionKey, session, http })
  await page.route('**/api/ai/**', (route) => route.abort())
  await page.route('**/api/ai-settings/live-test', (route) => route.abort())
  await page.goto('/')
  await expect(page.locator('.dashboard')).toBeVisible()
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), sessionKey)).not.toBeNull()
}

async function snapshot(page: Page) { return page.evaluate((key) => localStorage.getItem(key)!, sessionKey) }
async function archives(page: Page): Promise<GameArchiveRecord[]> { return page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '[]'), archiveKey) }
async function openReset(page: Page) {
  await page.getByRole('button', { name: '重置游戏', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: '重置游戏', exact: true })
  await expect(dialog).toBeVisible()
  return dialog
}

for (const width of [390, 905, 1440]) {
  test(`开局搜索支持中文英文和ID，空结果清除不改当前局 ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 1082 })
    await seed(page, true)
    const before = await snapshot(page)
    await page.getByRole('button', { name: '智能配板与调整', exact: true }).click()
    const dialog = page.getByRole('dialog', { name: '智能配板与调整', exact: true })
    const search = dialog.getByRole('searchbox', { name: '搜索板子', exact: true })
    const select = dialog.getByRole('combobox', { name: '开局板子', exact: true })
    await expect(select.locator('option')).toHaveCount(138)
    await dialog.getByRole('button', { name: '15人', exact: true }).click()
    await dialog.getByRole('textbox', { name: '1号昵称', exact: true }).fill('搜索后保留')
    await dialog.getByRole('combobox', { name: '1号经验', exact: true }).selectOption('new')
    await search.fill('疯帽')
    await expect(select.getByRole('option', { name: '疯帽之宴', exact: true })).toHaveAttribute('value', 'feng-mao-zhi-yan')
    await expect(select).toHaveValue('catfishing')
    await search.fill('  cAtFiShInG  ')
    await expect(select.locator('option')).toHaveCount(1)
    await expect(select).toHaveValue('catfishing')
    await search.fill('YAN-BU-YOU-ZHONG')
    await select.selectOption('yan-bu-you-zhong')
    await expect(select).toHaveValue('yan-bu-you-zhong')
    await search.fill('完全不存在XYZ')
    await expect(dialog.getByRole('status')).toContainText('没有匹配的板子，请换个关键词或清除搜索。')
    await expect(select).toBeDisabled()
    await expect(select).toHaveValue('yan-bu-you-zhong')
    const clear = dialog.getByRole('button', { name: '清除搜索', exact: true })
    const clearBounds = await clear.boundingBox()
    expect(clearBounds!.height).toBeGreaterThanOrEqual(44)
    expect(await dialog.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(false)
    await page.screenshot({ path: info.outputPath('search-no-results.png'), animations: 'disabled' })
    await clear.click()
    await expect(search).toHaveValue('')
    await expect(search).toBeFocused()
    await expect(select).toBeEnabled()
    await expect(select.locator('option')).toHaveCount(138)
    await expect(select).toHaveValue('yan-bu-you-zhong')
    await expect(dialog.getByRole('textbox', { name: '1号昵称', exact: true })).toHaveValue('搜索后保留')
    await expect(dialog.getByRole('combobox', { name: '1号经验', exact: true })).toHaveValue('new')
    await expect(dialog.getByRole('button', { name: '15人', exact: true })).toHaveAttribute('aria-pressed', 'true')
    expect(await snapshot(page)).toBe(before)
    await page.screenshot({ path: info.outputPath('search-cleared.png'), animations: 'disabled' })
    await dialog.getByRole('button', { name: '关闭智能配板与调整', exact: true }).click()
    expect(await snapshot(page)).toBe(before)
    expect(await archives(page)).toEqual([])
  })

  test(`保存独立于重置，取消不丢局，确认后自动留档并明确反馈 ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 1082 })
    await seed(page)
    const before = await snapshot(page)
    const oldSession = JSON.parse(before)
    await page.getByRole('button', { name: '保存本局', exact: true }).click()
    const saveDialog = page.getByRole('dialog', { name: '保存本局', exact: true })
    await expect(saveDialog.getByRole('button', { name: /重置/ })).toHaveCount(0)
    await saveDialog.getByRole('radio', { name: /善良获胜/ }).click()
    await saveDialog.getByRole('button', { name: '保存本局', exact: true }).click()
    await expect(saveDialog.getByRole('status')).toContainText('本局已保存到本机浏览器')
    expect(await snapshot(page)).toBe(before)
    expect(await archives(page)).toEqual([expect.objectContaining({ winner: 'good', session: oldSession })])
    await page.screenshot({ path: info.outputPath('save-separate.png'), animations: 'disabled' })
    await saveDialog.getByRole('button', { name: '关闭保存本局', exact: true }).click()
    let reset = await openReset(page)
    await expect(reset.getByRole('tablist')).toHaveCount(0)
    await expect(reset.getByRole('radio')).toHaveCount(0)
    await expect(reset.getByRole('checkbox')).toHaveCount(0)
    await expect(reset.getByRole('button', { name: '保存本局', exact: true })).toHaveCount(0)
    await expect(reset.getByRole('button', { name: '导出备份', exact: true })).toHaveCount(0)
    await expect(reset).toContainText('自动留档成功后，才会清空当前局')
    await expect(reset).toContainText('备份恢复')
    expect(await reset.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(false)
    await page.screenshot({ path: info.outputPath('reset-confirmation.png'), animations: 'disabled' })
    await reset.getByRole('button', { name: '暂不重置', exact: true }).click()
    expect(await snapshot(page)).toBe(before)
    reset = await openReset(page)
    await reset.getByRole('button', { name: '关闭重置游戏', exact: true }).click()
    expect(await snapshot(page)).toBe(before)
    reset = await openReset(page)
    expect(await archives(page)).toHaveLength(1)
    await expect(reset.getByRole('button', { name: '确认重置并开新局', exact: true })).toBeEnabled()
    await reset.getByRole('button', { name: '确认重置并开新局', exact: true }).click()
    const setup = page.getByRole('dialog', { name: '智能配板与调整', exact: true })
    await expect(setup).toBeVisible()
    await expect(setup.getByRole('status').filter({ hasText: successMessage })).toBeVisible()
    const next = JSON.parse(await snapshot(page))
    expect(next.id).not.toBe(oldSession.id)
    expect(next).toMatchObject({ playerCount: 0, seats: {}, initialPlayerStates: {}, phaseSegments: [], timeline: [], setupDraft: null, nightRuns: {}, activeNightRunId: null, dayVoteDraft: null, dayActionDraft: null })
    expect(await page.evaluate((key) => localStorage.getItem(key), beforeResetKey)).toBe(before)
    expect((await archives(page)).every((record) => JSON.stringify(record.session) === before)).toBe(true)
    expect((await archives(page)).some((record) => record.winner === 'good')).toBe(true)
    await page.screenshot({ path: info.outputPath('reset-success.png'), animations: 'disabled' })
  })
}

for (const failure of ['archive', 'before-reset', 'empty-session'] as const) {
  test(`重置${failure}写入超额时保留当前局和可恢复记录`, async ({ page }) => {
    await seed(page)
    const before = await snapshot(page)
    const reset = await openReset(page)
    await page.evaluate(({ failure, archiveKey, beforeResetKey, sessionKey }) => {
      const original = Storage.prototype.setItem
      Storage.prototype.setItem = function (key, value) {
        if (failure === 'archive' && key === archiveKey || failure === 'before-reset' && key === beforeResetKey || failure === 'empty-session' && key === sessionKey && JSON.parse(value).playerCount === 0) throw new DOMException('Storage full', 'QuotaExceededError')
        original.call(this, key, value)
      }
    }, { failure, archiveKey, beforeResetKey, sessionKey })
    await reset.getByRole('button', { name: '确认重置并开新局', exact: true }).click()
    if (failure !== 'archive') {
      const protection = page.getByRole('dialog', { name: '保存失败', exact: true })
      await expect(protection).toBeVisible()
      await expect(protection.getByRole('alert', { name: '对局保存失败', exact: true })).toContainText('当前对局仍在此页面中')
      await protection.getByRole('button', { name: '关闭保存失败', exact: true }).click()
    }
    await expect(reset.getByRole('status')).toContainText(/保存失败|重置未完成/)
    await expect(reset).toBeVisible()
    await expect(reset.getByRole('button', { name: '确认重置并开新局', exact: true })).toBeEnabled()
    await expect(page.getByRole('dialog', { name: '智能配板与调整', exact: true })).toHaveCount(0)
    expect(await snapshot(page)).toBe(before)
    const saved = await archives(page)
    if (failure === 'archive') expect(saved).toEqual([])
    else expect(saved).toEqual([expect.objectContaining({ session: JSON.parse(before) })])
    expect(await page.evaluate((key) => localStorage.getItem(key), beforeResetKey)).toBe(failure === 'empty-session' ? before : null)
  })
}

async function delayedArchive(page: Page, staleRead = false) {
  const records = new Map<string, GameArchiveRecord>()
  let release = () => {}
  const barrier = new Promise<void>((resolve) => { release = resolve })
  const calls: GameArchiveRecord[] = []
  const handlers = createArchiveHttpRoutes(createArchiveHandlers({
    list: async () => [...records.values()], get: async (id) => records.get(id) ?? null,
    save: async (record) => { records.set(record.id, structuredClone(record)); return [...records.values()] },
  }))
  await page.route('**/api/**', async (route) => {
    const request = route.request()
    if (request.method() === 'POST') { calls.push(request.postDataJSON().payload.archive); await barrier }
    if (staleRead && request.method() === 'GET' && new URL(request.url()).pathname.startsWith('/api/archives/')) {
      const archive = [...records.values()][0]
      await route.fulfill({ json: { archive: { ...archive, session: { ...archive.session, timeline: [] } } } })
      return
    }
    const response = await handlers(new Request(request.url(), { method: request.method(), headers: request.headers(), body: request.postData() }))
    await route.fulfill({ status: response.status, body: await response.text(), contentType: 'application/json' })
  })
  return { calls, release, records }
}

test('慢归档期间禁止关闭和重复重置，完成后只建立一个新局', async ({ page }) => {
  const http = await delayedArchive(page)
  await seed(page, false, true)
  const before = await snapshot(page)
  const reset = await openReset(page)
  await reset.getByRole('button', { name: '确认重置并开新局', exact: true }).click()
  await expect.poll(() => http.calls.length).toBe(1)
  const busy = reset.getByRole('button', { name: '正在留档并重置…', exact: true })
  await expect(busy).toBeDisabled()
  await expect(reset.getByRole('button', { name: '暂不重置', exact: true })).toBeDisabled()
  await expect(reset.getByRole('button', { name: '关闭重置游戏', exact: true })).toHaveCount(0)
  await page.keyboard.press('Escape')
  await expect(reset).toBeVisible()
  await busy.evaluate((element: HTMLButtonElement) => element.click())
  expect(http.calls).toHaveLength(1)
  expect(await snapshot(page)).toBe(before)
  http.release()
  await expect(page.getByRole('dialog', { name: '智能配板与调整', exact: true })).toBeVisible()
  expect(http.records.size).toBe(1)
  expect([...http.records.values()][0].session).toEqual(JSON.parse(before))
  expect(await page.evaluate((key) => localStorage.getItem(key), beforeResetKey)).toBe(before)
})

test('等待归档时其他页面已更新原局，过期确认不能覆盖新数据', async ({ page }) => {
  const http = await delayedArchive(page)
  await seed(page, false, true)
  const before = await snapshot(page)
  const reset = await openReset(page)
  await reset.getByRole('button', { name: '确认重置并开新局', exact: true }).click()
  await expect.poll(() => http.calls.length).toBe(1)
  const updated = JSON.stringify({ ...JSON.parse(before), id: 'other-tab-new-session' })
  await page.evaluate(({ key, updated }) => localStorage.setItem(key, updated), { key: sessionKey, updated })
  http.release()
  const protection = page.getByRole('dialog', { name: '编辑保护', exact: true })
  await expect(protection).toBeVisible()
  await expect(protection).toContainText('另一页面已更新对局。此页已停止编辑')
  // 编辑保护禁止关闭，底层重置说明仍需记录失败原因。
  await expect(page.locator('.game-end__notice')).toContainText(/重置未完成|当前局未重置/)
  expect(await snapshot(page)).toBe(updated)
  expect(await page.evaluate((key) => localStorage.getItem(key), beforeResetKey)).toBeNull()
  expect([...http.records.values()][0].session).toEqual(JSON.parse(before))
  await expect(page.getByRole('dialog', { name: '智能配板与调整', exact: true })).toHaveCount(0)
})

test('后端回读旧快照时禁止重置，原局和已保存归档保留', async ({ page }) => {
  const http = await delayedArchive(page, true)
  await seed(page, false, true)
  const before = await snapshot(page)
  const reset = await openReset(page)
  await reset.getByRole('button', { name: '确认重置并开新局', exact: true }).click()
  await expect.poll(() => http.calls.length).toBe(1)
  http.release()
  await expect(reset.getByRole('status')).toContainText('归档校验失败或当前局已有变化')
  expect(await snapshot(page)).toBe(before)
  expect([...http.records.values()][0].session).toEqual(JSON.parse(before))
  expect(await page.evaluate((key) => localStorage.getItem(key), beforeResetKey)).toBeNull()
  await expect(page.getByRole('dialog', { name: '智能配板与调整', exact: true })).toHaveCount(0)
})

test('HTTP归档故障且本机归档超额时不能清空当前局', async ({ page }) => {
  await page.route('**/api/archives', (route) => route.fulfill({ json: { archives: [] } }))
  await page.route('**/api/games/*/archive', (route) => route.fulfill({ status: 503, json: { accepted: false, error: { code: 'UNAVAILABLE' } } }))
  await seed(page, false, true)
  const before = await snapshot(page)
  const reset = await openReset(page)
  await page.evaluate((archiveKey) => {
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = function (key, value) {
      if (key === archiveKey) throw new DOMException('Storage full', 'QuotaExceededError')
      original.call(this, key, value)
    }
  }, archiveKey)
  await reset.getByRole('button', { name: '确认重置并开新局', exact: true }).click()
  await expect(reset.getByRole('status')).toContainText('保存失败，当前局未归档')
  expect(await snapshot(page)).toBe(before)
  expect(await archives(page)).toEqual([])
  expect(await page.evaluate((key) => localStorage.getItem(key), beforeResetKey)).toBeNull()
})

test('已确认配板切换板子时，先留档再进入指定板的新局', async ({ page }) => {
  await page.setViewportSize({ width: 905, height: 1082 })
  await seed(page)
  const before = await snapshot(page)
  await page.locator('.dashboard__script-switch').click()
  const target = page.locator('.script-library__script-card').filter({ has: page.getByRole('heading', { name: '暗流涌动 / Trouble Brewing', exact: true }) })
  await target.getByRole('button', { name: '切换到此板子', exact: true }).click()
  await page.getByRole('button', { name: '前往重置确认', exact: true }).click()
  const reset = page.getByRole('dialog', { name: '重置游戏', exact: true })
  await expect(reset).toContainText('完成后进入“暗流涌动 / Trouble Brewing”的新局配板。')
  expect(await snapshot(page)).toBe(before)
  await reset.getByRole('button', { name: '确认重置并开新局', exact: true }).click()
  const setup = page.getByRole('dialog', { name: '智能配板与调整', exact: true })
  await expect(setup.getByRole('status').filter({ hasText: successMessage })).toBeVisible()
  await expect(setup.getByRole('combobox', { name: '开局板子', exact: true })).toHaveValue('trouble-brewing')
  expect(await page.evaluate((key) => localStorage.getItem(key), beforeResetKey)).toBe(before)
  expect(await archives(page)).toEqual([expect.objectContaining({ session: JSON.parse(before) })])
})
