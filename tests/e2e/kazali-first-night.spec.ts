import { expect, test, type Page } from '@playwright/test'
import { getSmartScriptPack, loadSmartScriptPack, roleSnapshotsForScript } from '../../src/domain/scripts'
import { createSmartScriptSetupSession } from '../../src/features/game-session/data/createPrototypeSession'
import { gameSessionReducer } from '../../src/features/game-session/state/sessionReducer'

const key = 'botc-copilot-session-v1'
async function saved(page: Page) { return page.evaluate(key => JSON.parse(localStorage.getItem(key)!), key) }
async function prepare(page: Page, count: number, scriptId = 'one-in-one-out', firstGood?: string) {
  await loadSmartScriptPack(scriptId)
  let session = createSmartScriptSetupSession(scriptId, '2026-10-18T00:00:00.000Z', { playerCount: count })
  const pack = getSmartScriptPack(session.scriptId), snapshots = roleSnapshotsForScript(session.scriptId)
  const good = pack.roles.filter((role) => role.team === 'townsfolk' || role.team === 'outsider')
  const ordered = firstGood ? [...good.filter((role) => role.id === firstGood), ...good.filter((role) => role.id !== firstGood)] : good
  const ids = [...ordered.slice(0, count - 1).map((role) => role.id), 'kazali']
  session = gameSessionReducer(session, { type: 'set-setup-draft', draft: {
    candidateId: 'kazali-browser', revision: 1, updatedAt: '2026-10-18T00:00:00.000Z',
    assignments: ids.map((id, index) => ({ seatId: index + 1, role: snapshots.find((role) => role.id === id)! })), demonBluffs: [],
  } })
  session = gameSessionReducer(session, { type: 'confirm-setup', id: 'kazali-browser-setup', confirmedAt: '2026-10-18T00:00:00.000Z' })
  session = gameSessionReducer(session, { type: 'start-next-night-run' })
  await page.route('**/api/ai/**', route => route.abort())
  await page.addInitScript(({ key, session }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(session)) }, { key, session })
  await page.goto('/')
  await page.getByRole('button', { name: /^进入夜晚/ }).click()
  await expect(page.getByRole('group', { name: /^首夜爪牙分配/ })).toBeVisible()
  return session
}

for (const width of [390, 1440]) test(`木偶保留假装女祭司流程，真实原技能停用 ${width}px`, async ({ page }, info) => {
  await page.setViewportSize({ width, height: 900 })
  await prepare(page, 7, 'devout-theists', 'highpriestess')
  await page.getByRole('combobox', { name: '第1组玩家', exact: true }).selectOption('1')
  await page.getByRole('combobox', { name: '第1组爪牙', exact: true }).selectOption('marionette')
  await page.getByRole('button', { name: '记录结果', exact: true }).click()
  await page.getByRole('button', { name: '确认本项', exact: true }).click()
  await expect.poll(async () => (await saved(page)).timeline.filter((entry: { kind: string }) => entry.kind === 'night_action').at(-1)?.record.snapshot.targetRoleChoices?.length).toBe(1)
  await page.getByRole('button', { name: '核对并应用首夜分配', exact: true }).click()
  await page.getByRole('button', { name: '确认应用身份并更新本夜夜序', exact: true }).click()
  await expect(page.getByRole('region', { name: '本步骤名单', exact: true })).toContainText('恶魔')
  await expect.poll(async () => { const state = await saved(page); return state.nightRuns[state.activeNightRunId].queue.some((item: { systemStep?: { kind: string } }) => item.systemStep?.kind === 'demon_info') }).toBe(true)
  const allocated = await saved(page), information = allocated.nightRuns[allocated.activeNightRunId].queue.filter((item: { systemStep?: unknown }) => item.systemStep)
  expect(information.some((item: { systemStep: { kind: string } }) => item.systemStep.kind === 'minion_info')).toBe(false)
  expect(information.find((item: { systemStep: { kind: string } }) => item.systemStep.kind === 'demon_info').systemStep.minionLabels).toEqual([])
  await expect(page.getByRole('button', { name: 'AI推荐', exact: true })).toHaveCount(0)
  await page.getByRole('button', { name: '夜间顺序', exact: true }).click()
  await page.getByRole('button', { name: /预览夜序.*提线木偶（假装女祭司）/ }).click()
  await page.getByRole('button', { name: /^将夜间处理位置切换到/ }).click()
  await expect(page.getByRole('button', { name: '已完成假装流程', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: '展示信息', exact: true })).toHaveCount(0)
  const before = await saved(page)
  await page.getByRole('button', { name: '已完成假装流程', exact: true }).click()
  await page.getByRole('button', { name: '确认本项', exact: true }).click()
  await expect.poll(async () => (await saved(page)).timeline.filter((entry: { kind: string }) => entry.kind === 'night_action').at(-1)?.record.snapshot.storytellerResult).toContain('假装')
  const final = await saved(page), run = final.nightRuns[final.activeNightRunId]
  expect(run.queue.find((item: { roleId: string; seatId: number }) => item.roleId === 'highpriestess' && item.seatId === 1)?.progress).toBe('not_applicable')
  expect(final.timeline.at(-1).record.snapshot.informationGiven).toBe('')
  expect(final.initialPlayerStates).toEqual(before.initialPlayerStates)
  expect(final.timeline.filter((e: { kind: string }) => e.kind === 'player_state_changed')).toEqual(before.timeline.filter((e: { kind: string }) => e.kind === 'player_state_changed'))
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
  await page.screenshot({ path: info.outputPath('marionette-pretend.png'), animations: 'disabled' })
})

for (const width of [390, 1440]) for (const count of [7, 10, 13, 15]) {
  test(`卡扎力${count}人分配后当晚新爪牙入序、旧角色停用 ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 })
    const original = await prepare(page, count), groups = Math.floor((count - 7) / 3) + 1
    const roles = ['poisoner', 'harpy', 'spy'].slice(0, groups)
    await expect(page.getByRole('button', { name: '记录结果', exact: true })).toBeDisabled()
    for (const [index, roleId] of roles.entries()) {
      await page.getByRole('combobox', { name: `第${index + 1}组玩家`, exact: true }).selectOption(String(index + 1))
      await page.getByRole('combobox', { name: `第${index + 1}组爪牙`, exact: true }).selectOption(roleId)
    }
    await page.getByRole('button', { name: '记录结果', exact: true }).click()
    await page.getByRole('button', { name: '确认本项', exact: true }).click()
    await expect.poll(async () => (await saved(page)).timeline.filter((entry: { kind: string }) => entry.kind === 'night_action').at(-1)?.record.snapshot.targetRoleChoices?.length).toBe(groups)
    const recorded = await saved(page)
    expect(recorded.timeline.filter((e: { kind: string }) => e.kind === 'setup_changed')).toHaveLength(0)
    expect(recorded.timeline.at(-1).record.snapshot.targetRoleChoices).toEqual(roles.map((roleId, index) => ({ seatId: index + 1, roleId })))
    await page.getByRole('button', { name: '核对并应用首夜分配', exact: true }).click()
    await expect(page.getByRole('list', { name: '首夜身份变更预览' })).toBeVisible()
    await page.screenshot({ path: info.outputPath(`kazali-${count}-review.png`), animations: 'disabled' })
    await page.getByRole('button', { name: '确认应用身份并更新本夜夜序', exact: true }).click()
    await expect(page.getByText('卡扎力首夜分配已应用 · 新爪牙按当夜夜序处理，原角色未发动项已停用。', { exact: true })).toBeVisible()
    const applied = await saved(page), run = applied.nightRuns[applied.activeNightRunId]
    expect(applied.timeline.slice(0, recorded.timeline.length)).toEqual(recorded.timeline)
    expect(applied.initialPlayerStates).toEqual(original.initialPlayerStates)
    for (const [index, roleId] of roles.entries()) {
      expect(run.queue.find((item: { seatId: number; roleId: string }) => item.seatId === index + 1 && item.roleId === roleId)?.progress).toBe('pending')
      expect(run.queue.find((item: { seatId: number; roleId: string }) => item.seatId === index + 1 && item.roleId === original.timeline[0].setup.draft.assignments[index].role.id)?.progress).toBe('not_applicable')
    }
    expect(run.queue.find((item: { id: string }) => item.id === run.activeCursorId)?.roleId).toBe('system-minion-info')
    await page.getByRole('button', { name: '夜间顺序', exact: true }).click()
    await page.getByRole('button', { name: /^预览夜序.*：1号投毒者$/ }).click()
    await page.getByRole('button', { name: /^将夜间处理位置切换到/ }).click()
    await page.getByRole('button', { name: '选择4号玩家', exact: true }).click()
    await page.getByRole('button', { name: '记录结果', exact: true }).click()
    await page.getByRole('button', { name: '确认本项', exact: true }).click()
    await expect.poll(async () => (await saved(page)).timeline.filter((entry: { kind: string }) => entry.kind === 'night_action').at(-1)?.wakeItemId).toContain('poisoner-1')
    const final = await saved(page)
    expect(final.timeline.at(-1).wakeItemId).toContain('poisoner-1')
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    await page.screenshot({ path: info.outputPath(`kazali-${count}-new-minion.png`), animations: 'disabled' })
    await page.reload()
    expect((await saved(page)).timeline).toEqual(final.timeline)
  })
}

for (const scriptId of ['yan-bu-you-zhong', 'tan-hu-se-bian']) {
  test(`${scriptId} 15人三组分配后寡妇和洗脑师当晚可确认 390px`, async ({ page }, info) => {
    await page.setViewportSize({ width: 390, height: 900 })
    const before = await prepare(page, 15, scriptId, 'highpriestess')
    const minions = ['widow', 'cerenovus', 'scarletwoman']
    for (const [index, roleId] of minions.entries()) {
      await page.getByRole('combobox', { name: `第${index + 1}组玩家`, exact: true }).selectOption(String(index + 1))
      await page.getByRole('combobox', { name: `第${index + 1}组爪牙`, exact: true }).selectOption(roleId)
    }
    await page.getByRole('button', { name: '记录结果', exact: true }).click()
    await page.getByRole('button', { name: '确认本项', exact: true }).click()
    const recorded = await saved(page)
    await page.getByRole('button', { name: '核对并应用首夜分配', exact: true }).click()
    await page.getByRole('button', { name: '确认应用身份并更新本夜夜序', exact: true }).click()
    const applied = await saved(page), run = applied.nightRuns[applied.activeNightRunId]
    expect(applied.timeline.slice(0, recorded.timeline.length)).toEqual(recorded.timeline)
    expect(applied.initialPlayerStates).toEqual(before.initialPlayerStates)
    expect(run.queue.find((item: {id:string}) => item.id === run.activeCursorId)?.roleId).toBe(scriptId === 'yan-bu-you-zhong' ? 'magician' : 'system-minion-info')
    expect(run.queue.find((item: {seatId:number;roleId:string}) => item.seatId === 1 && item.roleId === 'highpriestess')?.progress).toBe('not_applicable')
    expect(run.queue.some((item: {seatId:number;roleId:string}) => item.seatId === 3 && item.roleId === 'scarletwoman')).toBe(false)
    for (const [index, roleName] of ['寡妇', '洗脑师'].entries()) {
      {
        await page.getByRole('button', { name: '夜间顺序', exact: true }).click()
        await page.getByRole('button', { name: new RegExp(`^预览夜序.*：${index + 1}号${roleName}$`) }).click()
        await page.getByRole('button', { name: /^将夜间处理位置切换到/ }).click()
      }
      await page.getByRole('button', { name: `选择${index + 4}号玩家`, exact: true }).click()
      if (index) await page.locator('.wake-recorder .choice-chips button').first().click()
      await page.getByRole('button', { name: '记录结果', exact: true }).click()
      await page.getByRole('button', { name: '确认本项', exact: true }).click()
      await expect.poll(async () => (await saved(page)).timeline.filter((entry: {kind:string}) => entry.kind === 'night_action').at(-1)?.wakeItemId).toContain(`${minions[index]}-${index + 1}`)
      const current = await saved(page), last = current.timeline.findLast((entry: {kind:string}) => entry.kind === 'night_action')
      expect(last.summary).toContain(`${index + 1}号${roleName}`)
    }
    const final = await saved(page)
    expect(final.timeline.filter((entry: {kind:string}) => entry.kind === 'player_state_changed')).toHaveLength(0)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
    await page.screenshot({ path: info.outputPath(`${scriptId}-minions-same-night.png`), animations: 'disabled' })
    await page.reload()
    expect((await saved(page)).timeline).toEqual(final.timeline)
  })
}
