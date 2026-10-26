import { expect, test, type Page } from '@playwright/test'
import { createPrototypeGameSession } from '../../src/features/game-session/data/createPrototypeSession'
const key = 'botc-copilot-session-v1'
async function read(page: Page) { return page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), key) }

test('ordinary nomination limits, explicit exceptions and refresh persistence', async ({ page }, testInfo) => {
  const session = { ...createPrototypeGameSession(), hostingMode: 'record' as const }
  session.timeline = session.timeline.filter((entry) => entry.kind === 'setup_confirmed')
  session.phaseSegments = [{ id: 'day-1', kind: 'day', sequence: 1, label: '第1天', createdAt: '2026-10-21T01:00:00Z' }]
  session.activeNightRunId = null
  session.nightRuns = {}
  session.dayVoteDraft = null
  for (const state of Object.values(session.initialPlayerStates)) state.life = 'alive'
  session.initialPlayerStates[1].life = 'dead'
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await page.evaluate(({ key, session }) => localStorage.setItem(key, JSON.stringify(session)), { key, session })
  await page.reload()
  await page.getByRole('button', { name: /^进入白天/ }).click()
  await expect(page.getByRole('button', { name: '选择1号为提名人' })).toBeDisabled()
  await expect(page.getByRole('button', { name: '选择1号为提名人' })).toHaveAttribute('title', /已死亡/)
  await page.getByRole('button', { name: '选择2号为提名人' }).click()
  await expect(page.getByRole('tab', { name: '被提名人 · 未选' })).toHaveAttribute('aria-selected', 'true')
  await page.getByRole('button', { name: '选择3号为被提名人' }).click()
  await page.getByRole('button', { name: '下一步：记录举手', exact: true }).click()
  await page.getByRole('button', { name: '记录4号举手' }).click()
  await page.getByRole('button', { name: '记录本轮票型', exact: true }).click()
  await expect.poll(async () => (await read(page)).timeline.filter((entry) => entry.kind === 'vote_round').length).toBe(1)
  await page.getByRole('button', { name: '开始下一轮提名', exact: true }).click()
  await expect(page.getByRole('button', { name: '选择2号为提名人' })).toBeDisabled()
  await page.getByRole('tab', { name: '被提名人 · 未选' }).click()
  await expect(page.getByRole('button', { name: '选择3号为被提名人' })).toBeDisabled()
  await page.getByLabel('特殊能力提名', { exact: true }).check()
  await page.getByRole('tab', { name: '提名人 · 未选', exact: true }).click()
  await page.getByRole('button', { name: '选择1号为提名人' }).click()
  await page.getByRole('button', { name: '选择3号为被提名人' }).click()
  await expect(page.getByRole('button', { name: '下一步：记录举手', exact: true })).toBeDisabled()
  await page.getByRole('textbox', { name: /^特殊提名依据/ }).fill('说书人已核实特殊能力允许本次死亡及重复提名')
  await page.screenshot({ path: testInfo.outputPath('special-nomination.png') })
  await page.getByRole('button', { name: '下一步：记录举手', exact: true }).click()
  await page.getByRole('button', { name: '记录本轮票型', exact: true }).click()
  await expect.poll(async () => (await read(page)).timeline.filter((entry) => entry.kind === 'vote_round').length).toBe(2)
  const before = await read(page)
  expect(before.timeline.filter((entry) => entry.kind === 'vote_round')).toHaveLength(2)
  expect(before.timeline.at(-1).nominationExceptionReason).toBe('说书人已核实特殊能力允许本次死亡及重复提名')
  await page.reload()
  expect((await read(page)).timeline).toEqual(before.timeline)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect(errors).toEqual([])
})

test('confirmed followup returns to the same night cursor without changing the phase', async ({ page }) => {
  const session = { ...createPrototypeGameSession(), hostingMode: 'record' as const }
  const runId = session.activeNightRunId!
  session.nightRuns[runId].privacyShielded = false
  session.stateFollowups = [{ id: 'task', seatId: 1, note: '核对中毒', sourceEntryId: session.timeline.find((entry) => entry.kind === 'night_action')!.id, createdAt: '2026-10-21T01:00:00Z' }]
  await page.goto('/')
  await page.evaluate(({ key, session }) => localStorage.setItem(key, JSON.stringify(session)), { key, session })
  await page.reload()
  await page.getByRole('button', { name: /^进入夜晚/ }).click()
  await page.getByRole('button', { name: '状态待办 1' }).click()
  await page.getByRole('button', { name: '处理状态', exact: true }).click()
  await page.getByRole('button', { name: '中毒', exact: true }).click()
  await page.getByRole('button', { name: '确认状态', exact: true }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect.poll(async () => (await read(page)).stateFollowups[0].resolution?.kind).toBe('applied')
  const after = await read(page)
  expect(after.stateFollowups[0].resolution.kind).toBe('applied')
  expect(after.timeline).toHaveLength(session.timeline.length + 1)
  expect(after.activeNightRunId).toBe(runId)
  expect(after.nightRuns[runId].activeCursorId).toBe(session.nightRuns[runId].activeCursorId)
  expect(after.phaseSegments).toEqual(session.phaseSegments)
})
