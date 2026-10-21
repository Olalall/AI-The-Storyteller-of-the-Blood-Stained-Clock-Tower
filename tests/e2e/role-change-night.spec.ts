// Browser draft only. Copy to tests/e2e, then change ../../../../src imports to ../../src.
// Uses a Playwright-isolated localStorage seed. Never point this test at production.
import { expect, test, type Page } from '@playwright/test'
import { getSmartScriptPack, loadSmartScriptPack, roleSnapshotsForScript } from '../../src/domain/scripts'
import { createSmartScriptSetupSession } from '../../src/features/game-session/data/createPrototypeSession'
import { gameSessionReducer } from '../../src/features/game-session/state/sessionReducer'
import { projectCurrentAssignments } from '../../src/features/game-session/state/projectors'
import type { GameSessionState } from '../../src/features/game-session/types'
import { actNight, projected } from '../../src/features/night-workbench/state/nightInformation.test-support'

const key = 'botc-copilot-session-v1', at = '2026-10-18T00:00:00.000Z'
async function saved(page: Page): Promise<GameSessionState> {
  return page.evaluate((storageKey) => JSON.parse(localStorage.getItem(storageKey)!), key)
}
async function ready(page: Page) {
  // Observe the first app write rather than clicking before the editor lease is ready.
  await expect.poll(() => page.evaluate(() => (window as unknown as { roleChangeWritesForTest: number }).roleChangeWritesForTest), { timeout: 15000 }).toBeGreaterThan(0)
  await expect(page.getByRole('dialog', { name: '编辑保护', exact: true })).toHaveCount(0)
}

function nextNight(input: GameSessionState) {
  let session = gameSessionReducer(input, { type: 'open-phase-segment', phaseKind: 'night', createdAt: at })
  for (const item of projected(session).queue) session = actNight(session, { type: 'skip-item', id: item.id, reason: '隔离浏览器场景不模拟其余首夜能力。' })
  session = gameSessionReducer(session, { type: 'close-active-night-run', nightRunId: session.activeNightRunId!, closedAt: at })
  session = gameSessionReducer(session, { type: 'open-phase-segment', phaseKind: 'day', createdAt: at })
  session = gameSessionReducer(session, { type: 'confirm-day-no-execution', daySegmentId: session.phaseSegments.at(-1)!.id, entryId: 'ui-day-no-execution', confirmedAt: at })
  session = gameSessionReducer(session, { type: 'close-open-segment', phaseKind: 'day', closedAt: at })
  return gameSessionReducer(session, { type: 'start-next-night-run' })
}

async function createSession(mode: 'pit-hag' | 'fang-gu' | 'chef') {
  const scriptId = mode === 'chef' ? 'wang-bu-jian-wang' : 'sects-and-violets'
  await loadSmartScriptPack(scriptId)
  const ids = mode === 'chef'
    ? ['general', 'empath', 'dreamer', 'savant', 'investigator', 'banshee', 'librarian', 'fisherman', 'seamstress', 'drunk', 'barber', 'poisoner', 'harpy', 'spy', 'alhadikhia']
    : ['snakecharmer', 'savant', 'dreamer', 'seamstress', 'philosopher', 'flowergirl', mode === 'fang-gu' ? 'mutant' : 'oracle', 'barber', 'sweetheart', 'witch', 'pithag', mode === 'fang-gu' ? 'fanggu' : 'vortox']
  const snapshots = roleSnapshotsForScript(scriptId), pack = getSmartScriptPack(scriptId)
  let session = createSmartScriptSetupSession(scriptId, at, { playerCount: ids.length })
  session = gameSessionReducer(session, { type: 'set-setup-draft', draft: {
    candidateId: `role-change-ui-${mode}`, revision: 1, updatedAt: at,
    assignments: ids.map((id, index) => ({ seatId: index + 1, role: snapshots.find((role) => role.id === id)! })),
    demonBluffs: pack.roles.filter((role) => role.team === 'townsfolk' && !ids.includes(role.id)).slice(0, 3).map((role) => snapshots.find((snapshot) => snapshot.id === role.id)!),
  } })
  session = gameSessionReducer(session, { type: 'confirm-setup', id: `role-change-ui-${mode}-setup`, confirmedAt: at })
  expect(session.timeline.some((entry) => entry.kind === 'setup_confirmed')).toBe(true)
  session = gameSessionReducer(session, { type: 'start-next-night-run' })
  return nextNight(session)
}

async function prepare(page: Page, mode: 'pit-hag' | 'fang-gu' | 'chef') {
  const session = await createSession(mode)
  await page.route('**/api/ai/**', (route) => route.abort())
  await page.addInitScript(({ storageKey, seed }) => {
    if (!localStorage.getItem(storageKey)) localStorage.setItem(storageKey, JSON.stringify(seed))
    Object.assign(window, { roleChangeWritesForTest: 0 })
    const setItem = Storage.prototype.setItem
    Storage.prototype.setItem = function (key, value) {
      setItem.call(this, key, value)
      if (this === localStorage && key === storageKey) (window as unknown as { roleChangeWritesForTest: number }).roleChangeWritesForTest++
    }
  }, { storageKey: key, seed: session })
  await page.goto('/')
  await ready(page)
  await page.getByRole('button', { name: /^进入夜晚/ }).click()
  await expect(page.getByRole('button', { name: '更换角色', exact: true })).toBeVisible()
  return session
}

async function changeByUI(page: Page, seatId: number, name: string, timing: 'tonight' | 'later') {
  await page.getByRole('button', { name: '更换角色', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: /^更换\d+号角色$/ })
  await dialog.getByRole('combobox', { name: '变更玩家', exact: true }).selectOption(String(seatId))
  await dialog.getByRole('button', { name, exact: true }).click()
  await expect(dialog.getByRole('button', { name: `确认改为${name}`, exact: true })).toBeDisabled()
  await dialog.getByRole('radio', { name: timing === 'tonight' ? '当晚处理新能力' : '本夜不再发动新能力', exact: true }).check()
  await dialog.getByRole('button', { name: `确认改为${name}`, exact: true }).click()
  await expect(dialog).toHaveCount(0)
  await expect.poll(async () => projectCurrentAssignments(await saved(page)).find((entry) => entry.seatId === seatId)?.role.name).toBe(name)
}

async function focusByUI(page: Page, seatId: number, roleName: string) {
  await page.getByRole('button', { name: '夜间顺序', exact: true }).click()
  await page.getByRole('button', { name: new RegExp(`^预览夜序.*：${seatId}号${roleName}$`) }).click()
  await page.getByRole('button', { name: /^将夜间处理位置切换到/ }).click()
}

for (const width of [390, 1440]) {
  test(`无旧夜项的博学者可从任意座位入口换数学家并加入本夜 ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 })
    const before = await prepare(page, 'pit-hag')
    expect(before.nightRuns[before.activeNightRunId!].queue.some((item) => item.seatId === 2)).toBe(false)
    await changeByUI(page, 2, '数学家', 'tonight')
    await expect(page.getByText(/2号已改为数学家；原未发动项已停用/)).toBeVisible()
    const changed = await saved(page), run = changed.nightRuns[changed.activeNightRunId!]
    const addition = run.queue.find((item) => item.seatId === 2 && item.roleId === 'mathematician')!
    expect(addition.progress).toBe('pending')
    expect(run.queue.indexOf(addition)).toBeGreaterThan(run.queue.findIndex((item) => item.roleId === 'pithag'))
    expect(projectCurrentAssignments(changed).find((entry) => entry.seatId === 2)?.role.id).toBe('mathematician')
    expect(changed.timeline.slice(0, before.timeline.length)).toEqual(before.timeline)
    expect(changed.initialPlayerStates).toEqual(before.initialPlayerStates)
    await focusByUI(page, 2, '数学家')
    await expect(page.locator('.wake-facts')).toContainText('主持已确认当晚处理新获得的能力')
    await page.getByRole('textbox', { name: '正式告知数字', exact: true }).fill('0')
    await page.getByRole('button', { name: '记录正式告知', exact: true }).click()
    await page.getByRole('button', { name: '确认本项', exact: true }).click()
    await expect.poll(async () => (await saved(page)).timeline.findLast((entry) => entry.kind === 'night_action')?.wakeItemId).toBe(addition.id)
    const final = await saved(page), record = final.timeline.findLast((entry) => entry.kind === 'night_action')
    expect(record?.kind === 'night_action' ? record.wakeItemId : '').toBe(addition.id)
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    await page.screenshot({ path: info.outputPath('savant-to-mathematician.png'), animations: 'disabled' })
    await page.reload()
    await ready(page)
    expect((await saved(page)).timeline).toEqual(final.timeline)
  })

  test(`方古已完成本步后选择本夜不再发动，停理发师且不加第二刀 ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 })
    await prepare(page, 'fang-gu')
    await focusByUI(page, 12, '方古')
    await page.getByRole('button', { name: '选择8号玩家', exact: true }).click()
    await page.getByRole('button', { name: '普通击杀候选', exact: true }).click()
    await page.getByRole('button', { name: '确认本项', exact: true }).click()
    const recorded = await saved(page)
    await changeByUI(page, 8, '方古', 'later')
    const changed = await saved(page), run = changed.nightRuns[changed.activeNightRunId!]
    expect(run.queue.find((item) => item.seatId === 8 && item.roleId === 'barber')).toMatchObject({ progress: 'not_applicable', applicability: 'not_applicable' })
    expect(run.queue.filter((item) => item.seatId === 8 && item.roleId === 'fanggu')).toHaveLength(0)
    expect(projectCurrentAssignments(changed).find((entry) => entry.seatId === 8)?.role.id).toBe('fanggu')
    expect(changed.timeline.slice(0, recorded.timeline.length)).toEqual(recorded.timeline)
    expect(changed.initialPlayerStates).toEqual(recorded.initialPlayerStates)
    expect(changed.timeline.filter((entry) => entry.kind === 'player_state_changed')).toEqual(recorded.timeline.filter((entry) => entry.kind === 'player_state_changed'))
    await expect(page.getByText(/方古跳转不能额外攻击一次/)).toHaveCount(0) // The confirmation sheet has closed.
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    await page.screenshot({ path: info.outputPath('fang-gu-later.png'), animations: 'disabled' })
    await page.reload()
    await ready(page)
    expect((await saved(page)).timeline).toEqual(changed.timeline)
  })

  test(`后续夜新获得厨师可补首夜提醒，原将军未发动项停用 ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 })
    const before = await prepare(page, 'chef')
    await changeByUI(page, 1, '厨师', 'tonight')
    const changed = await saved(page), run = changed.nightRuns[changed.activeNightRunId!]
    expect(run.nightType).toBe('other')
    expect(run.queue.find((item) => item.seatId === 1 && item.roleId === 'general')?.progress).toBe('not_applicable')
    expect(run.queue.find((item) => item.seatId === 1 && item.roleId === 'chef')).toMatchObject({ progress: 'pending', targetCount: 0 })
    const firstRunId = Object.keys(before.nightRuns)[0]
    expect(changed.nightRuns[firstRunId]).toEqual(before.nightRuns[firstRunId])
    await focusByUI(page, 1, '厨师')
    await expect(page.locator('.wake-facts')).toContainText('在你的首个夜晚，你会得知场上邻座的邪恶玩家有多少对。')
    // Supplemental reasoning and the formal number must both survive the role change.
    await page.getByText('补充已核对事实（可选）', { exact: true }).click()
    await page.getByRole('textbox', { name: '说书人已核对的事实', exact: true }).fill('主持已核对新厨师今晚的信息为1对，已私下告知本人。')
    await page.getByRole('button', { name: '保存补充事实', exact: true }).click()
    await page.getByRole('textbox', { name: '正式告知数字', exact: true }).fill('1')
    await page.getByRole('button', { name: '记录正式告知', exact: true }).click()
    await page.getByRole('button', { name: '确认本项', exact: true }).click()
    await expect.poll(async () => (await saved(page)).timeline.findLast((entry) => entry.kind === 'night_action')?.kind).toBe('night_action')
    const final = await saved(page)
    expect(final.timeline.findLast((entry) => entry.kind === 'night_action')?.kind).toBe('night_action')
    const last = final.timeline.findLast((entry) => entry.kind === 'night_action')!
    if (last.kind === 'night_action') expect(last.record.snapshot.storytellerContext).toContain('新厨师今晚的信息为1对')
    if (last.kind === 'night_action') expect(last.record.snapshot.informationGiven).toBe('1')
    expect(final.initialPlayerStates).toEqual(before.initialPlayerStates)
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    await page.screenshot({ path: info.outputPath('new-chef-on-later-night.png'), animations: 'disabled' })
  })
}
