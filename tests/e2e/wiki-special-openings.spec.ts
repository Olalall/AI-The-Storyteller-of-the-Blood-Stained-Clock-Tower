import { expect, test, type Page } from '@playwright/test'
import { loadSmartScriptPack } from '../../src/domain/scripts'
import { createSmartScriptSetupSession } from '../../src/features/game-session/data/createPrototypeSession'
import { gameSessionReducer } from '../../src/features/game-session/state/sessionReducer'
import { projectCurrentAssignments, projectCurrentPlayerStates } from '../../src/features/game-session/state/projectors'
import type { GameSessionState } from '../../src/features/game-session/types'
import { createSmartScriptSetupCandidates } from '../../src/features/setup/smartScriptSetupCandidates'
import { createSetupDraftFromCandidate } from '../../src/features/setup/setupDraft'
import { actNight, projected } from '../../src/features/night-workbench/state/nightInformation.test-support'

const key = 'botc-copilot-session-v1', at = '2026-10-21T12:00:00.000Z'
const saved = (page: Page): Promise<GameSessionState> => page.evaluate(key => JSON.parse(localStorage.getItem(key)!), key)
async function prepare(page: Page, scriptId: string, roleId: string, count: number, later = false) {
  await loadSmartScriptPack(scriptId)
  let s = createSmartScriptSetupSession(scriptId, at, { playerCount: count })
  const candidate = createSmartScriptSetupCandidates(scriptId, Object.values(s.seats), { seed: `batch07-reviewed-${scriptId}`, count: 100 })
    .find(c => c.assignments.some(a => a.role.id === roleId) && (roleId !== 'empath' || !c.assignments.some(a => a.role.id === 'lilmonsta')))
  expect(candidate).toBeTruthy()
  s = gameSessionReducer(s, { type: 'set-setup-draft', draft: createSetupDraftFromCandidate(candidate!, at) })
  s = gameSessionReducer(s, { type: 'confirm-setup', id: 'batch07-ui-setup', confirmedAt: at })
  s = gameSessionReducer(s, { type: 'start-next-night-run' })
  if (later) {
    s = gameSessionReducer(s, { type: 'open-phase-segment', phaseKind: 'night', createdAt: at })
    for (const item of projected(s).queue) s = actNight(s, { type: 'skip-item', id: item.id, reason: '隔离浏览器局部检查，跳过无关首夜步骤。' })
    s = gameSessionReducer(s, { type: 'close-active-night-run', nightRunId: s.activeNightRunId!, closedAt: at })
    s = gameSessionReducer(s, { type: 'open-phase-segment', phaseKind: 'day', createdAt: at })
    s = gameSessionReducer(s, { type: 'confirm-day-no-execution', daySegmentId: s.phaseSegments.at(-1)!.id, entryId: 'batch07-ui-no-execution', confirmedAt: at })
    s = gameSessionReducer(s, { type: 'close-open-segment', phaseKind: 'day', closedAt: at })
    s = gameSessionReducer(s, { type: 'start-next-night-run' })
  }
  await page.route('**/api/ai/**', route => route.abort())
  await page.addInitScript(({ key, s }) => {
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(s))
    Object.assign(window, { specialOpeningWrites: 0 })
    const setItem = Storage.prototype.setItem
    Storage.prototype.setItem = function (name, value) {
      setItem.call(this, name, value)
      if (this === localStorage && name === key) (window as unknown as { specialOpeningWrites: number }).specialOpeningWrites++
    }
  }, { key, s })
  await page.goto('/')
  await expect.poll(() => page.evaluate(() => (window as unknown as { specialOpeningWrites: number }).specialOpeningWrites), { timeout: 15000 }).toBeGreaterThan(0)
  await page.getByRole('button', { name: /^进入夜晚/ }).click()
  return s
}
async function focus(page: Page, name: RegExp) {
  await page.getByRole('button', { name: '夜间顺序', exact: true }).click()
  await expect(page.getByRole('button', { name: /预览夜序.*0号/ })).toHaveCount(0)
  await page.getByRole('button', { name }).click()
  const activate = page.getByRole('button', { name: /^将夜间处理位置切换到/ })
  if (await activate.count()) await activate.click()
  await expect(page.locator('body')).not.toContainText(/(?:^|\D)0号/)
}
async function confirmAndRefresh(page: Page, before: GameSessionState) {
  await page.getByRole('button', { name: '确认本项', exact: true }).click()
  await expect.poll(async () => (await saved(page)).timeline.filter(e => e.kind === 'night_action').length)
    .toBe(before.timeline.filter(e => e.kind === 'night_action').length + 1)
  const after = await saved(page)
  await expect(page.locator('body')).not.toContainText(/(?:^|\D)0号/)
  expect(projectCurrentAssignments(after)).toEqual(projectCurrentAssignments(before))
  expect(projectCurrentPlayerStates(after)).toEqual(projectCurrentPlayerStates(before))
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.reload()
  await expect(page.getByRole('main', { name: '本局', exact: true })).toBeVisible()
  expect((await saved(page)).timeline).toEqual(after.timeline)
}

test('新板小怪宝首夜无恶魔座位，善良照看者记录与恢复', async ({ page }, info) => {
  const before = await prepare(page, 'wiki-d829da1a9b85c9cb', 'empath', 7)
  const run = before.nightRuns[before.activeNightRunId!]
  expect(run.queue.filter(i => i.lilMonstaStep)).toHaveLength(1)
  expect(run.queue.some(i => i.systemStep?.kind === 'demon_info' || i.systemStep?.kind === 'minion_info')).toBe(false)
  await focus(page, /^预览夜序.*小怪宝·照看者$/)
  await expect(page.getByRole('button', { name: '更换角色', exact: true })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'AI推荐', exact: true })).toHaveCount(0)
  const good = projectCurrentAssignments(before).find(a => a.role.id === 'empath')!
  await page.getByRole('button', { name: `选择${good.seatId}号玩家`, exact: true }).click()
  await page.getByRole('button', { name: '记录本夜照看者', exact: true }).click()
  await page.screenshot({ path: info.outputPath('lil-monsta-good-holder.png'), animations: 'disabled' })
  await confirmAndRefresh(page, before)
})

test('小怪宝后夜照看和可选死亡分开，仅追加一次无人死亡', async ({ page }, info) => {
  const before = await prepare(page, 'wiki-d829da1a9b85c9cb', 'empath', 7, true)
  expect(before.nightRuns[before.activeNightRunId!].queue.filter(i => i.lilMonstaStep).map(i => i.lilMonstaStep)).toEqual(['babysitter', 'death'])
  await focus(page, /^预览夜序.*小怪宝·死亡$/)
  await page.getByRole('button', { name: '本夜无人死亡', exact: true }).click()
  await page.screenshot({ path: info.outputPath('lil-monsta-optional-death.png'), animations: 'disabled' })
  await confirmAndRefresh(page, before)
})

test('军团首夜名单包含全体成员', async ({ page }, info) => {
  const before = await prepare(page, 'wiki-dd178a28103dbae2', 'legion', 15)
  await focus(page, /^预览夜序.*恶魔信息$/)
  const roster = page.getByRole('region', { name: '本步骤名单', exact: true })
  for (const actor of projectCurrentAssignments(before).filter(a => a.role.id === 'legion')) await expect(roster).toContainText(`${actor.seatId}号`)
  await expect(page.getByRole('checkbox', { name: '已共同唤醒全体军团并完成互认', exact: true })).toBeVisible()
  await page.screenshot({ path: info.outputPath('legion-recognition.png'), animations: 'disabled' })
})

test('军团后夜整组一项，可选择无人死亡并保留历史', async ({ page }, info) => {
  const before = await prepare(page, 'wiki-dd178a28103dbae2', 'legion', 15, true)
  expect(before.nightRuns[before.activeNightRunId!].queue.filter(i => i.roleId === 'legion')).toHaveLength(1)
  await focus(page, /^预览夜序.*军团$/)
  await expect(page.getByLabel('夜间角色预览', { exact: true })).toContainText('全体军团')
  await page.getByRole('button', { name: '本夜无人死亡', exact: true }).click()
  await page.screenshot({ path: info.outputPath('legion-one-optional-death.png'), animations: 'disabled' })
  await confirmAndRefresh(page, before)
})
