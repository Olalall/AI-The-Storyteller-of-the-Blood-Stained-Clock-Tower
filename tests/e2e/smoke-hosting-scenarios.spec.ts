import { expect, test, type Page } from '@playwright/test'

const sessionStorageKey = 'botc-copilot-session-v1'


/** 主持台是默认视图；首页入口现在在轨道右端「本局」打开的档案层里。 */


async function openArchive(page: Page) {
  const enter = page.getByRole('button', { name: '本局', exact: true })
  if (await enter.isVisible().catch(() => false)) await enter.click()
}

async function openBlankSetup(page: Page, runId: string) {
  await page.goto('/')
  await page.evaluate(({ storageKey, id }) => {
    window.localStorage.clear()
    window.localStorage.setItem(storageKey, JSON.stringify({
      schemaVersion: 1,
      id,
      scriptId: 'catfishing',
      playerCount: 0,
      knowledgeVersion: 'e2e/hosting-scenarios',
      scriptRoles: [],
      seats: {},
      initialPlayerStates: {},
      phaseSegments: [],
      timeline: [],
      dayVoteDraft: null,
      dayActionDraft: null,
      setupDraft: null,
      nightRuns: {},
      activeNightRunId: null,
    }))
  }, { storageKey: sessionStorageKey, id: `session-${runId}` })
  await page.reload()
  await openArchive(page)
  const setupHeading = page.getByRole('heading', { name: 'AI配板与调整' })
  if (!(await setupHeading.isVisible().catch(() => false))) {
    await openArchive(page)
    await page.getByRole('button', { name: 'AI配板与调整' }).click()
  }
  await expect(setupHeading).toBeVisible()
}

async function createConfirmedSetup(page: Page, input: { scriptId: string; playerCount: number }) {
  await page.getByLabel('开局板子').selectOption(input.scriptId)
  await page.getByRole('button', { name: `${input.playerCount}人` }).click()
  await page.getByRole('button', { name: '开始配板' }).click()
  await expect(page.locator('.setup-candidate')).toHaveCount(3)
  const firstCandidate = page.locator('.setup-candidate').first()
  await expect(firstCandidate.locator('.setup-candidate__roles li')).toHaveCount(input.playerCount)
  await firstCandidate.getByRole('button', { name: '采用为草稿' }).click()
  await expect(page.locator('.setup-seat-grid button')).toHaveCount(input.playerCount)
  await page.locator('.setup-panel__footer .ui-button--primary').click()
  await expect(page.locator('.setup-panel')).toBeHidden()

  const session = await readSession(page)
  expect(session.scriptId).toBe(input.scriptId)
  expect(session.playerCount).toBe(input.playerCount)
  expect(Object.keys(session.seats)).toHaveLength(input.playerCount)
  expect(Object.keys(session.initialPlayerStates)).toHaveLength(input.playerCount)
  expect(session.timeline.some((entry: { kind: string }) => entry.kind === 'setup_confirmed')).toBe(true)
}

async function readSession(page: Page) {
  return page.evaluate((storageKey) => JSON.parse(window.localStorage.getItem(storageKey) ?? '{}'), sessionStorageKey)
}

async function returnDashboard(page: Page) {
  const back = page.getByRole('button', { name: '返回本局', exact: true })
  if (await back.isVisible().catch(() => false)) await back.click()
  await expect(page.locator('.dashboard')).toBeVisible()
}

test('hosting scenario B: 7人开局后夜序只投影在场角色，状态由确认写入', async ({ page }) => {
  await page.setViewportSize({ width: 760, height: 900 })
  await openBlankSetup(page, 'scenario-b-7')
  await createConfirmedSetup(page, { scriptId: 'trouble-brewing', playerCount: 7 })

  await page.getByRole('button', { name: '发身份' }).click()
  await expect(page.locator('.identity-deal__seat-grid button')).toHaveCount(7)
  await page.locator('.sheet-content--identity-deal .sheet-close').click()

  await openArchive(page)
  await page.getByRole('button', { name: '进入夜晚' }).click()
  await expect(page.locator('.night-workbench')).toBeVisible()
  await expect(page.getByRole('button', { name: /AI推荐|重新推荐|推荐中/ })).toBeVisible()

  const nightSession = await readSession(page)
  const run = nightSession.nightRuns[nightSession.activeNightRunId]
  const setupEntry = nightSession.timeline.find((entry: { kind: string }) => entry.kind === 'setup_confirmed')
  const inPlayRoleBySeat = new Map(setupEntry.setup.draft.assignments.map((assignment: { seatId: number; role: { id: string } }) => [assignment.seatId, assignment.role.id]))
  expect(run.queue.length).toBeGreaterThan(0)
  expect(run.queue.every((item: { seatId: number; roleId: string }) => inPlayRoleBySeat.get(item.seatId) === item.roleId)).toBe(true)
  expect(run.queue.every((item: { seatId: number }) => item.seatId >= 1 && item.seatId <= 7)).toBe(true)

  await returnDashboard(page)
  await page.getByRole('button', { name: /查看1号/ }).click()
  await expect(page.getByRole('dialog', { name: '1号玩家' })).toBeVisible()
  await page.getByRole('button', { name: '中毒' }).click()
  await page.getByRole('button', { name: '确认状态' }).click()

  const finalSession = await readSession(page)
  expect(finalSession.timeline.some((entry: { kind: string; seatId?: number }) => entry.kind === 'player_state_changed' && entry.seatId === 1)).toBe(true)
})

test('hosting scenario C: 15人大局可确认配板、进入夜晚并记录两轮白天投票', async ({ page }) => {
  await page.setViewportSize({ width: 1180, height: 900 })
  await openBlankSetup(page, 'scenario-c-15')
  await createConfirmedSetup(page, { scriptId: 'quick-maths', playerCount: 15 })

  await openArchive(page)
  await page.getByRole('button', { name: '进入夜晚' }).click()
  await expect(page.locator('.night-workbench')).toBeVisible()
  await expect(page.locator('.carousel-current')).toBeVisible()
  await expect(page.getByRole('button', { name: /AI推荐|重新推荐|推荐中/ })).toBeVisible()
  const nightSession = await readSession(page)
  const run = nightSession.nightRuns[nightSession.activeNightRunId]
  expect(run.queue.length).toBeGreaterThan(0)
  expect(run.queue.every((item: { seatId: number }) => item.seatId >= 1 && item.seatId <= 15)).toBe(true)

  await returnDashboard(page)
  await openArchive(page)
  await page.getByRole('button', { name: '进入白天' }).click()
  await expect(page.locator('.day-workbench')).toBeVisible()
  await expect(page.locator('.day-seat-grid button')).toHaveCount(15)

  await page.getByRole('button', { name: '选择1号为提名人' }).click()
  await page.getByRole('tab', { name: /被提名人/ }).click()
  await page.getByRole('button', { name: '选择4号为被提名人' }).click()
  await page.getByRole('button', { name: '下一步：记录举手' }).click()
  for (const seatId of [1, 2, 3, 4, 5, 6, 7, 8]) {
    await page.getByRole('button', { name: `记录${seatId}号举手` }).click()
  }
  await page.getByRole('button', { name: '记录本轮票型' }).click()
  await expect(page.locator('.day-card--standing').getByText('4号暂列')).toBeVisible()

  await page.getByRole('button', { name: '选择2号为提名人' }).click()
  await page.getByRole('tab', { name: /被提名人/ }).click()
  await page.getByRole('button', { name: '选择5号为被提名人' }).click()
  await page.getByRole('button', { name: '下一步：记录举手' }).click()
  for (const seatId of [1, 2, 3, 4]) {
    await page.getByRole('button', { name: `记录${seatId}号举手` }).click()
  }
  await page.getByRole('button', { name: '记录本轮票型' }).click()

  const session = await readSession(page)
  expect(session.timeline.filter((entry: { kind: string }) => entry.kind === 'vote_round')).toHaveLength(2)
  expect(session.dayVoteDraft.raisedSeatIds).toHaveLength(0)

  await returnDashboard(page)
  await expect(page.getByRole('button', { name: /查看15号/ })).toBeVisible()
  await page.getByRole('button', { name: /本局记录 \d+/ }).click()
  await expect(page.getByRole('dialog', { name: '日记' })).toBeVisible()
  await expect(page.getByRole('button', { name: /查看投票记录/ })).toHaveCount(2)
})

test('hosting scenario D: 缺少角色图标时仍可开局并进入夜序', async ({ page }) => {
  await page.route('**/assets/characters/**', async (route) => {
    await route.fulfill({ status: 404, contentType: 'text/plain', body: 'missing in e2e' })
  })
  await page.setViewportSize({ width: 900, height: 900 })
  await openBlankSetup(page, 'scenario-d-missing-assets')
  await createConfirmedSetup(page, { scriptId: 'catfishing', playerCount: 12 })
  await openArchive(page)
  await page.getByRole('button', { name: '进入夜晚' }).click()
  await expect(page.locator('.night-workbench')).toBeVisible()
  await expect(page.getByRole('button', { name: /AI推荐|重新推荐|推荐中/ })).toBeVisible()
})
