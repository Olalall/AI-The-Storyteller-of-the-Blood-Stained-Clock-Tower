import { expect, test, type Page } from '@playwright/test'
import { loadSmartScriptPack, roleSnapshotsForScript } from '../../src/domain/scripts'
import { createPrototypeGameSession, createSmartScriptSetupSession } from '../../src/features/game-session/data/createPrototypeSession'
import { createNextNightRun } from '../../src/features/game-session/state/createNextNightRun'
import { gameSessionReducer } from '../../src/features/game-session/state/sessionReducer'
import type { GameSessionState } from '../../src/features/game-session/types'

// Isolated browser fixtures only. The separate Ego run opens every game through the UI.
const key = 'botc-copilot-session-v1', at = '2026-10-21T00:00:00.000Z'
async function saved(page: Page): Promise<GameSessionState> {
  return page.evaluate((storageKey) => JSON.parse(localStorage.getItem(storageKey)!), key)
}
async function ready(page: Page) {
  // The first real persistence confirms the editor lease is ready, including dev StrictMode remounts.
  await expect.poll(() => page.evaluate(() => (window as unknown as { sharedCoreWritesForTest: number }).sharedCoreWritesForTest), { timeout: 15000 }).toBeGreaterThan(0)
  await expect(page.getByRole('main', { name: '本局' })).toBeVisible()
  await expect(page.getByRole('dialog', { name: '编辑保护', exact: true })).toHaveCount(0)
}
async function seed(page: Page, session: GameSessionState) {
  await page.route('**/api/ai/**', (route) => route.abort())
  await page.addInitScript(({ key, session }) => {
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(session))
    Object.assign(window, { sharedCoreWritesForTest: 0 })
    const setItem = Storage.prototype.setItem
    Storage.prototype.setItem = function (storageKey, value) {
      setItem.call(this, storageKey, value)
      if (this === localStorage && storageKey === key) (window as unknown as { sharedCoreWritesForTest: number }).sharedCoreWritesForTest++
    }
  }, { key, session })
  await page.goto('/')
  await ready(page)
}
async function night(page: Page, roleId: 'librarian' | 'empath') {
  await loadSmartScriptPack('trouble-brewing')
  const roles = roleSnapshotsForScript('trouble-brewing')
  let session = createSmartScriptSetupSession('trouble-brewing', at, { playerCount: 7 })
  session = gameSessionReducer(session, { type: 'set-setup-draft', draft: {
    candidateId: 'shared-core-browser', revision: 1, updatedAt: at,
    assignments: ['chef', 'empath', 'washerwoman', 'librarian', 'slayer', 'poisoner', 'imp']
      .map((id, index) => ({ seatId: index + 1, role: roles.find((role) => role.id === id)! })), demonBluffs: [],
  } })
  session = gameSessionReducer(session, { type: 'confirm-setup', id: 'shared-core-setup', confirmedAt: at })
  const run = createNextNightRun(session)!, item = run.queue.find((entry) => entry.roleId === roleId)!
  run.activeCursorId = run.previewEntryId = item.id
  session.nightRuns = { [run.id]: run }; session.activeNightRunId = run.id
  await seed(page, session)
  await page.getByRole('button', { name: /^进入夜晚/ }).click()
  await expect(page.locator('.wake-workspace')).toBeVisible()
  return session
}
function actions(session: GameSessionState) { return session.timeline.filter((entry) => entry.kind === 'night_action') }

test('图书管理员零外来者清除旧目标和角色，直接确认并刷新保留', async ({ page }, info) => {
  const before = await night(page, 'librarian')
  await page.getByRole('button', { name: '选择1号玩家', exact: true }).click()
  await page.getByRole('button', { name: '选择2号玩家', exact: true }).click()
  await page.getByRole('button', { name: '酒鬼', exact: true }).click()
  await expect(page.getByRole('button', { name: '记录结果', exact: true })).toBeEnabled()
  await page.getByRole('button', { name: '没有外来者', exact: true }).click()
  await page.getByRole('button', { name: '选择1号玩家', exact: true }).click()
  await page.getByRole('button', { name: '选择2号玩家', exact: true }).click()
  await page.getByRole('button', { name: '酒鬼', exact: true }).click()
  await expect(page.getByRole('button', { name: '确认本项', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: '记录结果', exact: true })).toHaveAttribute('aria-pressed', 'false')
  await page.getByRole('button', { name: '没有外来者', exact: true }).click()
  await expect(page.getByRole('button', { name: '确认本项', exact: true })).toBeEnabled()
  await page.getByRole('button', { name: '确认本项', exact: true }).click()
  await expect.poll(async () => actions(await saved(page)).length).toBe(1)
  const original = actions(await saved(page))[0]
  expect(original.record.snapshot).toMatchObject({ outcomeId: 'no-outsiders', targets: [], roleChoice: '', informationGiven: '没有外来者。' })
  await page.getByRole('button', { name: '本局记录', exact: true }).click()
  await page.getByRole('dialog', { name: '日记', exact: true }).getByRole('button', { name: /^更正第1夜的夜间行动记录：.*没有外来者/ }).click()
  const correction = page.getByRole('dialog', { name: '更正记录', exact: true })
  await expect(correction.getByRole('button', { name: '更正目标1号', exact: true })).toBeDisabled()
  await correction.getByLabel('更正原因', { exact: true }).fill('核对零目标正式告知')
  await expect(correction.getByRole('button', { name: '确认追加', exact: true })).toBeEnabled()
  await correction.getByRole('button', { name: '确认追加', exact: true }).click()
  await expect.poll(async () => actions(await saved(page)).length).toBe(2)
  const after = await saved(page)
  expect(actions(after)[0]).toEqual(original)
  expect(actions(after)[1]).toMatchObject({ correctionOf: original.id, record: { snapshot: { targets: [], roleChoice: '', informationGiven: '没有外来者。' } } })
  expect(after.initialPlayerStates).toEqual(before.initialPlayerStates)
  await page.screenshot({ path: info.outputPath('librarian-zero.png') })
  await page.reload()
  await ready(page)
  expect((await saved(page)).timeline).toEqual(after.timeline)
})

test('正式数字拒绝越界，零值可确认，追加更正后原答案与状态保留', async ({ page }, info) => {
  const before = await night(page, 'empath')
  const input = page.getByRole('textbox', { name: '正式告知数字', exact: true })
  const outcome = page.getByRole('button', { name: /^记录正式告知/ })
  const confirm = page.getByRole('button', { name: '确认本项', exact: true })
  await expect(outcome).toBeDisabled()
  await input.fill('3')
  await expect(input).toHaveAttribute('aria-invalid', 'true')
  await expect(outcome).toBeDisabled()
  await expect(confirm).toBeDisabled()
  await input.fill('0'); await outcome.click(); await confirm.click()
  await expect.poll(async () => actions(await saved(page)).length).toBe(1)
  const original = actions(await saved(page))[0]
  expect(original.record.snapshot.informationGiven).toBe('0')
  await page.getByRole('button', { name: '追加更正', exact: true }).click()
  await input.fill('1'); await outcome.click()
  await page.getByRole('button', { name: '确认更正', exact: true }).click()
  await expect.poll(async () => actions(await saved(page)).length).toBe(2)
  const corrected = await saved(page), records = actions(corrected)
  expect(records[0]).toEqual(original)
  expect(records[1]).toMatchObject({ correctionOf: original.id, record: { snapshot: { informationGiven: '1' } } })
  expect(corrected.initialPlayerStates).toEqual(before.initialPlayerStates)
  await page.getByRole('button', { name: '本局记录', exact: true }).click()
  await page.getByRole('dialog', { name: '日记', exact: true }).getByRole('button', { name: /^继续更正第1夜的夜间行动记录：.*正式告知：1/ }).click()
  const correction = page.getByRole('dialog', { name: '更正记录', exact: true })
  await correction.getByLabel('更正原因', { exact: true }).fill('核对正式数字')
  await correction.getByRole('textbox', { name: '告知', exact: true }).fill('3')
  await expect(correction.getByRole('button', { name: '确认追加', exact: true })).toBeDisabled()
  expect(actions(await saved(page))).toEqual(records)
  await correction.getByRole('textbox', { name: '告知', exact: true }).fill('2')
  await correction.getByRole('button', { name: '确认追加', exact: true }).click()
  await expect.poll(async () => actions(await saved(page)).length).toBe(3)
  const after = await saved(page)
  expect(actions(after).slice(0, 2)).toEqual(records)
  expect(actions(after)[2]).toMatchObject({ correctionOf: records[1].id, record: { snapshot: { informationGiven: '2' } } })
  await page.screenshot({ path: info.outputPath('formal-number-correction.png') })
  await page.reload()
  await ready(page)
  expect((await saved(page)).timeline).toEqual(after.timeline)
})

test('旧未标死亡票仍阻止重复，撤销回票且保留当前草稿，日记和归档更正计数正确', async ({ page }, info) => {
  const session = createPrototypeGameSession()
  session.id = 'shared-ghost-browser'
  session.timeline = session.timeline.filter((entry) => entry.kind === 'setup_confirmed')
  session.nightRuns = {}; session.activeNightRunId = null; session.dayVoteDraft = null; session.dayActionDraft = null
  for (const state of Object.values(session.initialPlayerStates)) state.life = 'alive'
  session.phaseSegments = [{ id: 'day-1', kind: 'day', sequence: 1, label: '第1天', createdAt: at }]
  const beforeState = { ...session.initialPlayerStates[1] }
  session.timeline.push({ id: 'z-death', kind: 'player_state_changed', segmentId: 'day-1', createdAt: '2026-10-21T00:00:00Z', confirmedBy: 'storyteller',
    seatId: 1, before: beforeState, after: { ...beforeState, life: 'dead' }, reason: '旧局已确认死亡' })
  session.timeline.push({ id: 'a-old-vote', kind: 'vote_round', segmentId: 'day-1', createdAt: '2026-10-21T00:00:00.001Z', confirmedBy: 'storyteller',
    roundId: 'round-1', nominatorSeatId: 2, nomineeSeatId: 3, threshold: 6, raisedSeatIds: [1, 2, 3, 4, 5, 6], ghostVoteSeatIds: [] })
  await seed(page, session)
  await page.getByRole('button', { name: /^进入白天/ }).click()
  await page.getByRole('button', { name: '开始下一轮提名', exact: true }).click()
  await page.getByRole('button', { name: '选择4号为提名人', exact: true }).click()
  await page.getByRole('tab', { name: '被提名人 · 未选' }).click()
  await page.getByRole('button', { name: '选择5号为被提名人', exact: true }).click()
  await page.getByRole('button', { name: '下一步：记录举手', exact: true }).click()
  const deadVote = page.getByRole('button', { name: /^记录1号举手/ })
  await expect(deadVote).toBeDisabled()
  await expect(page.getByText('死亡票已用', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: '记录2号举手', exact: true }).click()
  await page.getByText('票型记录与更正（1轮）', { exact: true }).click()
  await page.locator('.day-vote-history article').filter({ hasText: '2号提名3号' }).getByRole('button', { name: '撤销票型', exact: true }).click()
  const cancellation = page.getByRole('dialog', { name: '撤销票型', exact: true })
  await cancellation.getByLabel('撤销原因', { exact: true }).fill('核对旧轮记录无效，恢复未使用死亡票')
  await cancellation.getByRole('button', { name: '确认撤销票型', exact: true }).click()
  await expect(cancellation).toBeHidden()
  await expect(page.getByRole('button', { name: '取消2号举手', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(deadVote).toBeEnabled()
  await deadVote.click()
  await page.getByRole('button', { name: '记录本轮票型', exact: true }).click()
  await expect.poll(async () => (await saved(page)).timeline.filter((entry) => entry.kind === 'vote_round').length).toBe(3)
  const after = await saved(page)
  expect(after.timeline.slice(0, session.timeline.length)).toEqual(session.timeline)
  expect(after.timeline.findLast((entry) => entry.kind === 'vote_round')).toMatchObject({ raisedSeatIds: [1, 2], ghostVoteSeatIds: [1] })
  await page.getByRole('button', { name: '本局记录', exact: true }).click()
  const journal = page.getByRole('dialog', { name: '日记', exact: true })
  await expect(journal).toBeVisible()
  await expect(journal.getByText(/已撤销：2号提名3号/)).toBeVisible()
  await journal.getByRole('button', { name: '关闭日记', exact: true }).click()
  await page.getByRole('button', { name: '保存本局', exact: true }).click()
  const archive = page.getByRole('dialog', { name: '保存本局', exact: true })
  await archive.getByRole('button', { name: '保存本局', exact: true }).click()
  await expect(archive.getByText('本局已保存到本机浏览器', { exact: true })).toBeVisible()
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('botc-game-archives-v1') ?? '[]')[0]?.summary.corrections)).toBe(1)
  await page.screenshot({ path: info.outputPath('ghost-vote-archive-correction.png') })
  await page.reload()
  await ready(page)
  expect((await saved(page)).timeline).toEqual(after.timeline)
})
