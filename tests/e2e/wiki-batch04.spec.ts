import { expect, test, type Page } from '@playwright/test'
import { createEmptyGameSession } from '../../src/features/game-session/data/createPrototypeSession'
import type { GameSessionState } from '../../src/features/game-session/types'
import { loadSmartScriptPack, roleTeamByIdForScript } from '../../src/domain/scripts'
import { projectCurrentAssignments } from '../../src/features/game-session/state/projectors'
import { cardinalitySession } from '../../src/features/night-workbench/state/nightCardinality.test-support'

const key = 'botc-copilot-session-v1'
const cases = [
  ['jiu-ri-chong-xian', 7], ['bu-zhi-zhi-zheng', 9], ['wang-ling-tong-hao-hui', 12],
  ['yi-cun-duan-yi-cun-xian', 15], ['jia-fang-fu-chou-ji', 7], ['you-tou-lai-guo', 9],
  ['fu-shou-cheng-chen', 12], ['wen-run-liang-ye', 15], ['shen-bu-you-ji', 9], ['quan-qiu-jing-song', 12],
] as const
const stored = (page: Page): Promise<GameSessionState> => page.evaluate((storageKey) => JSON.parse(localStorage.getItem(storageKey)!), key)

for (const [scriptId, count] of cases) {
  test(`第四批 ${scriptId} 搜索开局、确认夜序和刷新保留`, async ({ page }, info) => {
    const session = createEmptyGameSession('2026-10-21T04:00:00.000Z')
    await page.addInitScript(({ key, session }) => {
      if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(session))
    }, { key, session })
    await page.route('**/api/ai/**', (route) => route.abort())
    await page.goto('/')
    await expect(page.getByRole('main', { name: '本局', exact: true })).toBeVisible()
    await page.getByRole('button', { name: '智能配板与调整', exact: true }).click()
    const setup = page.getByRole('dialog', { name: '智能配板与调整', exact: true })
    await setup.getByRole('searchbox', { name: '搜索板子', exact: true }).fill(scriptId)
    await setup.getByRole('combobox', { name: '开局板子', exact: true }).selectOption(scriptId)
    await setup.getByRole('button', { name: `${count}人`, exact: true }).click()
    await setup.getByRole('button', { name: '开始配板', exact: true }).click()
    await setup.getByRole('button', { name: '选择这套配板', exact: true }).first().click()
    await expect(setup.getByRole('button', { name: '确认配板', exact: true })).toBeEnabled()
    await setup.getByRole('button', { name: '确认配板', exact: true }).click()
    await expect.poll(async () => (await stored(page)).scriptId).toBe(scriptId)
    await page.getByRole('button', { name: /^进入夜晚/ }).click()
    await expect(page.getByLabel('夜间角色预览', { exact: true })).toBeVisible()
    await expect.poll(async () => Boolean((await stored(page)).activeNightRunId)).toBe(true)
    const before = await stored(page), run = before.nightRuns[before.activeNightRunId!]!
    expect(before.timeline.filter((entry) => entry.kind === 'setup_confirmed')).toHaveLength(1)
    const confirmed = before.timeline.find((entry) => entry.kind === 'setup_confirmed')!
    expect(confirmed.setup.draft.assignments).toHaveLength(count)
    expect(run.queue.length).toBeGreaterThan(0)
    expect(new Set(run.queue.map((item) => item.id)).size).toBe(run.queue.length)
    await page.screenshot({ path: info.outputPath(`${scriptId}-first-night.png`), animations: 'disabled' })
    await page.reload()
    await expect(page.getByRole('main', { name: '本局', exact: true })).toBeVisible()
    await expect(page.getByRole('dialog', { name: '编辑保护', exact: true })).toHaveCount(0)
    const after = await stored(page)
    expect(after.id).toBe(before.id)
    expect(after.scriptId).toBe(scriptId)
    expect(after.timeline).toEqual(before.timeline)
    expect(after.activeNightRunId).toBe(before.activeNightRunId)
    expect(after.nightRuns[after.activeNightRunId!]!.queue).toEqual(run.queue)
  })
}

test('第四批 农夫旧八人局第二夜先核对触发，适用才确认候选且不适用可刷新保留', async ({ page, browser }, info) => {
  const scriptId = 'yi-cun-duan-yi-cun-xian'
  await loadSmartScriptPack(scriptId)
  const seed = cardinalitySession(scriptId, 'farmer', 8, true)
  const run = seed.nightRuns[seed.activeNightRunId!]!
  const farmer = run.queue.find((item) => item.roleId === 'farmer')!
  // An actual legal N2, including original setup/day history, with pre-fix persisted form metadata.
  // Reopening must upgrade this unconfirmed item; no authority state or old action is fabricated.
  delete farmer.interactionVersion
  farmer.applicability = 'applicable'
  farmer.progress = 'pending'
  expect(seed.playerCount).toBe(8)
  expect(run.nightType).toBe('other')
  expect(seed.initialPlayerStates[farmer.seatId].life).toBe('alive')
  const assignments = projectCurrentAssignments(seed), teams = roleTeamByIdForScript(scriptId)
  const target = assignments.find((entry) => entry.seatId !== farmer.seatId && ['townsfolk', 'outsider'].includes(teams[entry.role.id]))!
  const records = (session: GameSessionState) => session.timeline.filter((entry) => entry.kind === 'night_action' && entry.nightRunId === run.id && entry.wakeItemId === farmer.id)
  let aiRequests = 0
  async function openNight(targetPage: Page, url = '/') {
    await targetPage.addInitScript(({ key, session }) => {
      if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(session))
    }, { key, session: seed })
    await targetPage.route('**/api/ai/**', (route) => { aiRequests++; return route.abort() })
    await targetPage.goto(url)
    await expect(targetPage.getByRole('main', { name: '本局', exact: true })).toBeVisible()
    await expect.poll(() => targetPage.evaluate(async () => (await navigator.locks.query()).held.some((lock) => lock.name === 'botc-session-editor-v1'))).toBe(true)
    await targetPage.getByRole('button', { name: /^进入夜晚/ }).click()
    const card = targetPage.locator('.wake-workspace')
    await expect(card.getByText('需要核对', { exact: true })).toBeVisible()
    await expect(card.getByRole('button', { name: '适用', exact: true })).toBeEnabled()
    await expect(card.getByRole('button', { name: '不适用', exact: true })).toBeEnabled()
    await expect(targetPage.getByRole('button', { name: '确认本项', exact: true })).toBeDisabled()
    await expect(card.getByRole('button', { name: 'AI推荐', exact: true })).toBeDisabled()
    expect(records(await stored(targetPage))).toHaveLength(0)
    expect(aiRequests).toBe(0)
    return card
  }
  const card = await openNight(page)
  await card.getByRole('button', { name: '适用', exact: true }).click()
  await card.getByRole('button', { name: `选择${target.seatId}号玩家`, exact: true }).click()
  await card.getByRole('button', { name: '记录结果', exact: true }).click()
  expect(records(await stored(page))).toHaveLength(0)
  await expect(page.getByRole('button', { name: '确认本项', exact: true })).toBeEnabled()
  await page.getByRole('button', { name: '确认本项', exact: true }).click()
  await expect.poll(async () => records(await stored(page)).length).toBe(1)
  const confirmed = await stored(page)
  expect(records(confirmed)[0]).toMatchObject({ record: { snapshot: { outcomeId: 'record', targets: [target.seatId] } } })
  expect(projectCurrentAssignments(confirmed)).toEqual(assignments)
  expect(confirmed.initialPlayerStates).toEqual(seed.initialPlayerStates)
  await page.reload()
  await expect(page.getByRole('main', { name: '本局', exact: true })).toBeVisible()
  expect((await stored(page)).timeline).toEqual(confirmed.timeline)

  const isolated = await browser.newContext({ viewport: page.viewportSize()!,
    deviceScaleFactor: info.project.use.deviceScaleFactor as number | undefined,
    hasTouch: info.project.use.hasTouch as boolean | undefined, isMobile: info.project.use.isMobile as boolean | undefined,
    userAgent: info.project.use.userAgent as string | undefined })
  try {
    const other = await isolated.newPage(), otherCard = await openNight(other, page.url())
    await otherCard.getByRole('button', { name: '不适用', exact: true }).click()
    await expect.poll(async () => (await stored(other)).nightRuns[run.id].queue.find((item) => item.id === farmer.id)?.progress).toBe('not_applicable')
    const skipped = await stored(other)
    expect(records(skipped)).toHaveLength(0)
    expect(projectCurrentAssignments(skipped)).toEqual(assignments)
    expect(skipped.initialPlayerStates).toEqual(seed.initialPlayerStates)
    await other.reload()
    await expect(other.getByRole('main', { name: '本局', exact: true })).toBeVisible()
    const restored = await stored(other)
    expect(restored.timeline).toEqual(skipped.timeline)
    expect(restored.nightRuns[run.id].queue.find((item) => item.id === farmer.id)).toMatchObject({ applicability: 'not_applicable', progress: 'not_applicable' })
    expect(aiRequests).toBe(0)
  } finally { await isolated.close() }
})
