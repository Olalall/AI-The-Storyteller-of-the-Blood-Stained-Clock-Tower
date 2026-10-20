import { expect, test, type Page } from '@playwright/test'
import { loadSmartScriptPack } from '../../src/domain/scripts'
import { createSmartScriptSetupSession } from '../../src/features/game-session/data/createPrototypeSession'
import { gameSessionReducer } from '../../src/features/game-session/state/sessionReducer'
import type { GameSessionState } from '../../src/features/game-session/types'
import { createSetupDraftFromCandidate, createSmartScriptSetupCandidates } from '../../src/features/setup'

const key = 'botc-copilot-session-v1'
async function read(page: Page): Promise<GameSessionState> {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), key)
}

async function firstNightGame() {
  await loadSmartScriptPack('trouble-brewing')
  let session = createSmartScriptSetupSession('trouble-brewing', '2026-10-20T00:00:00Z', { playerCount: 7 })
  const profiles = Object.values(session.seats).map((seat) => ({ seatId: seat.seatId, experience: seat.experience ?? 'regular' }))
  const candidate = createSmartScriptSetupCandidates(session.scriptId, profiles, { seed: 'human-click-phase-handoff' })[0]
  session = gameSessionReducer(session, { type: 'set-setup-draft', draft: createSetupDraftFromCandidate(candidate, '2026-10-20T00:00:00Z') })
  return gameSessionReducer(session, { type: 'confirm-setup', id: 'human-phase-setup', confirmedAt: '2026-10-20T00:01:00Z' })
}

async function prepare(page: Page, holdEditor = false) {
  const session = await firstNightGame()
  await page.addInitScript(({ key, session, holdEditor }) => {
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(session))
    Object.assign(window, { phaseSessionWritesForTest: 0 })
    const setItem = Storage.prototype.setItem
    Storage.prototype.setItem = function (storageKey, value) {
      setItem.call(this, storageKey, value)
      if (this === localStorage && storageKey === key) {
        const observed = window as unknown as { phaseSessionWritesForTest: number }
        observed.phaseSessionWritesForTest++
      }
    }
    if (holdEditor) {
      const locks = navigator.locks, request = locks.request.bind(locks)
      const gate = new Promise<void>((resolve) => Object.assign(window, { releasePhaseEditorForTest: resolve }))
      Object.defineProperty(navigator, 'locks', { configurable: true, value: { request: (...args: unknown[]) => gate.then(() => Reflect.apply(request, locks, args)) } })
    }
  }, { key, session, holdEditor })
  await page.goto('/')
  await expect(page.getByRole('main', { name: '本局' })).toBeVisible()
  return session
}

async function ready(page: Page) {
  await expect.poll(() => page.evaluate(() => (window as unknown as { phaseSessionWritesForTest: number }).phaseSessionWritesForTest)).toBeGreaterThan(0)
  await expect(page.getByRole('dialog', { name: '编辑保护', exact: true })).toHaveCount(0)
}

for (const width of [390, 1440]) {
  test(`首夜关闭交接与日终返回本局保留记录 ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 1000 })
    const errors: string[] = []
    let paidRequests = 0
    page.on('pageerror', (error) => errors.push(error.message))
    await page.route('**/api/ai/**', (route) => { paidRequests++; return route.abort() })
    await prepare(page)
    await ready(page)
    await page.getByRole('button', { name: /进入夜晚/ }).click()
    await expect(page.getByRole('heading', { name: '第1夜', exact: true })).toBeVisible()
    await expect.poll(async () => (await read(page)).phaseSegments.some((segment) => segment.id === 'night-1')).toBe(true)
    const beforeClose = await read(page)
    await page.getByRole('button', { name: '检查并关闭' }).click()
    await page.getByRole('button', { name: '确认关闭', exact: true }).click()
    await expect(page.getByRole('main', { name: '本局' })).toBeVisible()
    const track = page.getByRole('navigation', { name: '主持阶段' })
    await expect(track.locator('li').filter({ hasText: '黎明' })).toContainText('建议下一步')
    await expect(track.locator('li').filter({ hasText: '黄昏' })).not.toContainText('建议下一步')
    await expect.poll(async () => Boolean((await read(page)).phaseSegments.find((segment) => segment.id === 'night-1')?.closedAt)).toBe(true)
    const closedNight = await read(page)
    expect(closedNight.phaseSegments).toHaveLength(1)
    expect(closedNight.phaseSegments[0]).toMatchObject({ kind: 'night', sequence: 1 })
    expect(closedNight.phaseSegments[0].closedAt).toBeTruthy()
    expect(closedNight.timeline).toEqual(beforeClose.timeline)
    expect(closedNight.initialPlayerStates).toEqual(beforeClose.initialPlayerStates)
    await page.screenshot({ path: info.outputPath('first-night-closed.png'), animations: 'disabled' })
    await page.reload()
    await expect(track.locator('li').filter({ hasText: '黎明' })).toContainText('建议下一步')
    await ready(page)
    expect(await read(page)).toEqual(closedNight)

    await page.getByRole('button', { name: /进入白天/ }).click()
    await expect(page.getByRole('heading', { name: '第1天', exact: true })).toBeVisible()
    await page.getByRole('button', { name: '选择1号为提名人' }).click()
    await page.getByRole('tab', { name: /被提名人/ }).click()
    await page.getByRole('button', { name: '选择4号为被提名人' }).click()
    await page.getByRole('button', { name: '下一步：记录举手', exact: true }).click()
    for (const seat of [1, 2, 3, 4]) await page.getByRole('button', { name: `记录${seat}号举手` }).click()
    await page.getByRole('button', { name: '记录本轮票型', exact: true }).click()
    await expect(page.getByText('4号暂列', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: '记录无处决', exact: true }).click()
    await page.getByRole('button', { name: '确认记录', exact: true }).click()
    await expect.poll(async () => (await read(page)).timeline.filter((entry) => entry.kind === 'no_execution').length).toBe(1)
    const beforeDayClose = await read(page)
    await page.getByRole('button', { name: '结束今天', exact: true }).click()
    await page.getByRole('button', { name: '取消', exact: true }).click()
    expect(await read(page)).toEqual(beforeDayClose)
    await expect(page.getByRole('heading', { name: '第1天', exact: true })).toBeVisible()
    await page.getByRole('button', { name: '结束今天', exact: true }).click()
    await page.getByRole('button', { name: '确认结束', exact: true }).click()
    await expect(page.getByRole('main', { name: '本局' })).toBeVisible()
    await expect(page.getByText('第1天已结束，记录已保留；未开始夜晚。', { exact: true })).toBeVisible()
    await expect(page.locator('.day-workbench')).toHaveCount(0)
    await expect(track.locator('li').filter({ hasText: '黄昏' })).toContainText('建议下一步')
    await expect.poll(async () => Boolean((await read(page)).phaseSegments.find((segment) => segment.id === 'day-1')?.closedAt)).toBe(true)
    const closedDay = await read(page)
    expect(closedDay.phaseSegments).toHaveLength(2)
    expect(closedDay.phaseSegments.find((segment) => segment.kind === 'day')?.closedAt).toBeTruthy()
    expect(closedDay.timeline).toEqual(beforeDayClose.timeline)
    expect(closedDay.nightRuns).toEqual(beforeDayClose.nightRuns)
    expect(closedDay.initialPlayerStates).toEqual(beforeDayClose.initialPlayerStates)
    await page.screenshot({ path: info.outputPath('day-closed-dashboard.png'), animations: 'disabled' })
    await page.reload()
    await expect(page.getByRole('main', { name: '本局' })).toBeVisible()
    await ready(page)
    expect(await read(page)).toEqual(closedDay)
    await page.getByRole('button', { name: /进入白天/ }).click()
    await expect(page.getByRole('heading', { name: '第2天', exact: true })).toBeVisible()
    await expect.poll(async () => (await read(page)).phaseSegments.some((segment) => segment.id === 'day-2')).toBe(true)
    const nextDay = await read(page)
    expect(nextDay.phaseSegments.filter((segment) => segment.kind === 'day')).toHaveLength(2)
    expect(nextDay.timeline).toEqual(closedDay.timeline)
    expect(nextDay.nightRuns).toEqual(closedDay.nightRuns)
    await page.getByText('票型记录与更正（1轮）', { exact: true }).click()
    await expect(page.getByText('第1天 · 1号提名4号 · 4票', { exact: true })).toBeVisible()
    expect(paidRequests).toBe(0)
    expect(errors).toEqual([])
  })
}

test('编辑保护准备期间点击昼夜入口会留在本局，准备好后仍须显式进入首夜', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1000 })
  await page.route('**/api/ai/**', (route) => route.abort())
  const initial = await prepare(page, true)
  for (const phase of ['夜晚', '白天']) {
    await page.getByRole('button', { name: `进入${phase}`, exact: true }).click()
    await expect(page.getByText(`本局暂时不能编辑，请稍候；如有编辑保护提示，请先处理，再进入${phase}。`, { exact: true })).toBeVisible()
    await expect(page.getByRole('main', { name: '本局' })).toBeVisible()
    await expect(page.getByRole('main', { name: '夜间工作台不可用' })).toHaveCount(0)
    await expect(page.locator('.day-workbench')).toHaveCount(0)
    expect(await read(page)).toEqual(initial)
  }
  await page.evaluate(() => (window as unknown as { releasePhaseEditorForTest: () => void }).releasePhaseEditorForTest())
  await ready(page)
  expect(await read(page)).toEqual(initial)
  await expect(page.getByRole('main', { name: '本局' })).toBeVisible()
  await page.getByRole('button', { name: '进入夜晚', exact: true }).click()
  await expect(page.getByRole('heading', { name: '第1夜', exact: true })).toBeVisible()
  await expect.poll(async () => (await read(page)).phaseSegments.map((segment) => segment.id)).toEqual(['night-1'])
})
