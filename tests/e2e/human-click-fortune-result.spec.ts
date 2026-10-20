import { expect, test, type Page } from '@playwright/test'
import { loadSmartScriptPack, roleSnapshotsForScript } from '../../src/domain/scripts'
import { createSmartScriptSetupSession } from '../../src/features/game-session/data/createPrototypeSession'
import { createNextNightRun } from '../../src/features/game-session/state/createNextNightRun'
import { gameSessionReducer } from '../../src/features/game-session/state/sessionReducer'
import type { GameSessionState } from '../../src/features/game-session/types'
import { applyOutcome, emptyWakeDraft } from '../../src/features/night-workbench/state/projectWakeDraft'

const key = 'botc-copilot-session-v1', at = '2026-10-20T00:00:00.000Z'
async function saved(page: Page): Promise<GameSessionState> { return page.evaluate(key => JSON.parse(localStorage.getItem(key)!), key) }

async function prepare(page: Page, otherNight: boolean, legacy: boolean) {
  await loadSmartScriptPack('trouble-brewing')
  const roles = roleSnapshotsForScript('trouble-brewing')
  let session = createSmartScriptSetupSession('trouble-brewing', at, { playerCount: 7 })
  session = gameSessionReducer(session, { type: 'set-setup-draft', draft: {
    candidateId: 'fortune-browser', revision: 1, updatedAt: at,
    assignments: ['soldier', 'spy', 'investigator', 'fortuneteller', 'monk', 'ravenkeeper', 'imp'].map((id, index) => ({ seatId: index + 1, role: roles.find((role) => role.id === id)! })), demonBluffs: [],
  } })
  session = gameSessionReducer(session, { type: 'confirm-setup', id: 'fortune-setup', confirmedAt: at })
  if (otherNight) session.phaseSegments = [{ id: 'night-1', kind: 'night', sequence: 1, label: '第1夜', createdAt: at, closedAt: at }]
  session.initialPlayerStates[4].poisoned = true
  const run = createNextNightRun(session)!, item = run.queue.find((entry) => entry.roleId === 'fortuneteller')!
  run.activeCursorId = run.previewEntryId = item.id
  if (legacy) {
    item.outcomeOptions = [{ id: 'record', label: '记录结果', requiredInputs: ['targets'], resultTemplate: '{actor}记录：{targets}。' }]
    item.interactionVersion = 'trouble-brewing/generic-night-v1'
    run.drafts[item.id] = applyOutcome(item, { ...emptyWakeDraft(), targets: [1, 7], storytellerContext: '本夜中毒；红鲱鱼由主持核对' }, 'record')
  }
  session.nightRuns = { [run.id]: run }
  session.activeNightRunId = run.id
  await page.route('**/api/ai/**', route => route.abort())
  await page.addInitScript(({ key, session }) => {
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(session))
    Object.assign(window, { fortuneSessionWritesForTest: 0 })
    const setItem = Storage.prototype.setItem
    Storage.prototype.setItem = function (storageKey, value) {
      setItem.call(this, storageKey, value)
      if (this === localStorage && storageKey === key) {
        const observed = window as unknown as { fortuneSessionWritesForTest: number }
        observed.fortuneSessionWritesForTest++
      }
    }
  }, { key, session })
  await page.goto('/')
  await expect(page.getByRole('main', { name: '本局' })).toBeVisible()
  await expect.poll(() => page.evaluate(() => (window as unknown as { fortuneSessionWritesForTest: number }).fortuneSessionWritesForTest)).toBeGreaterThan(0)
  await expect(page.getByRole('dialog', { name: '编辑保护', exact: true })).toHaveCount(0)
  await page.getByRole('button', { name: /^进入夜晚/ }).click()
  await expect(page.locator('.carousel-current__copy')).toContainText('占卜师')
  await expect(page.locator('.wake-workspace')).toBeVisible()
  return { session, item }
}

for (const width of [390, 1440]) for (const otherNight of [false, true]) for (const legacy of [false, true]) {
  test(`占卜师${otherNight ? '后续夜' : '首夜'}${legacy ? '旧草稿' : '新局'}显式回答、告知与追加更正 ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 })
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    const { session: initial, item } = await prepare(page, otherNight, legacy)
    const confirm = page.getByRole('button', { name: '确认本项', exact: true })
    await expect(page.getByRole('button', { name: '记录结果', exact: true })).toHaveCount(0)
    await expect(confirm).toBeDisabled()
    if (!legacy) {
      await expect(page.getByRole('button', { name: '是', exact: true })).toBeDisabled()
      await page.getByRole('button', { name: '选择1号玩家', exact: true }).click()
      await expect(page.getByRole('button', { name: '是', exact: true })).toBeDisabled()
      await page.getByRole('button', { name: '选择7号玩家', exact: true }).click()
    }
    await expect(page.getByRole('button', { name: '是', exact: true })).toBeEnabled()
    await expect(confirm).toBeDisabled()
    await page.getByRole('button', { name: '否', exact: true }).click()
    await expect(page.locator('.information-preview')).toContainText('否。')
    await expect(confirm).toBeEnabled()
    await page.screenshot({ path: info.outputPath('fortune-explicit-answer.png'), animations: 'disabled' })
    await confirm.click()
    await expect.poll(async () => (await saved(page)).timeline.filter(entry => entry.kind === 'night_action').length).toBe(1)
    const confirmed = await saved(page)
    const old = confirmed.timeline.findLast(entry => entry.kind === 'night_action')!
    expect(old.record.snapshot).toMatchObject({ targets: [1, 7], outcomeId: 'no', informationGiven: '否。' })
    if (legacy) expect(old.record.snapshot.storytellerContext).toBe('本夜中毒；红鲱鱼由主持核对')
    expect(confirmed.initialPlayerStates).toEqual(initial.initialPlayerStates)
    await page.getByRole('button', { name: '追加更正', exact: true }).click()
    await page.getByRole('button', { name: '是', exact: true }).click()
    await page.getByRole('button', { name: '确认更正', exact: true }).click()
    await expect.poll(async () => (await saved(page)).timeline.filter(entry => entry.kind === 'night_action').length).toBe(2)
    const corrected = await saved(page), records = corrected.timeline.filter(entry => entry.kind === 'night_action')
    expect(records[0]).toEqual(old)
    expect(records[1]).toMatchObject({ correctionOf: old.id, wakeItemId: item.id, record: { snapshot: { outcomeId: 'yes', informationGiven: '是。' } } })
    expect(corrected.initialPlayerStates).toEqual(initial.initialPlayerStates)
    await page.reload()
    await expect(page.getByRole('main', { name: '本局' })).toBeVisible()
    expect((await saved(page)).timeline).toEqual(corrected.timeline)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    expect(errors).toEqual([])
  })
}
