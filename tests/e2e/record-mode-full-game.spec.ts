import { expect, test, type Page } from '@playwright/test'

const sessionStorageKey = 'botc-copilot-session-v1'
const archiveStorageKey = 'botc-game-archives-v1'

// 这条 e2e 是纯记录模式主干流程的回归护栏：配板 → 首夜 → 白天投票 → 次夜 → 归档。
// 断言集中在「确认后才落记录」这条产品契约上，不追求覆盖每个分支。

interface TimelineEntryLike {
  kind: string
  segmentId: string | null
  seatId?: number
  executedSeatId?: number
  raisedSeatIds?: number[]
  after?: { life?: string }
}


/** 主持台是默认视图；首页入口现在在轨道右端「本局」打开的档案层里。 */
async function openArchive(page: Page) {
  const enter = page.getByRole('button', { name: '本局', exact: true })
  if (await enter.isVisible().catch(() => false)) await enter.click()
}

async function readSession(page: Page) {
  return page.evaluate((storageKey) => JSON.parse(window.localStorage.getItem(storageKey) ?? '{}'), sessionStorageKey)
}

async function readArchives(page: Page) {
  return page.evaluate((storageKey) => JSON.parse(window.localStorage.getItem(storageKey) ?? '[]'), archiveStorageKey)
}

async function countTimeline(page: Page, predicate: (entry: TimelineEntryLike) => boolean) {
  const session = await readSession(page)
  return (session.timeline as TimelineEntryLike[]).filter(predicate).length
}

async function openBlankSession(page: Page) {
  await page.setViewportSize({ width: 1180, height: 900 })
  await page.goto('/')
  await page.evaluate(({ storageKey, archiveKey }) => {
    window.localStorage.clear()
    window.localStorage.setItem(storageKey, JSON.stringify({
      schemaVersion: 1,
      id: 'session-record-mode-full-game',
      scriptId: 'trouble-brewing',
      playerCount: 0,
      knowledgeVersion: 'e2e/record-mode-full-game',
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
    window.localStorage.removeItem(archiveKey)
  }, { storageKey: sessionStorageKey, archiveKey: archiveStorageKey })
  await page.reload()
}

/**
 * 逐项结算当前夜的全部唤醒项。刻意不依赖具体角色落在哪个座位——配板走的是
 * AI 候选（种子随机），硬编码角色名会让这条护栏在配板逻辑一变动就误报。
 * 这里只驱动「填满必需输入 → 选一个结果 → 确认」这条产品契约本身。
 */
async function fillCurrentWakeInputs(page: Page) {
  const recorder = page.locator('.wake-recorder')

  const seatGrid = recorder.locator('.seat-grid')
  if (await seatGrid.count()) {
    const counter = recorder.locator('fieldset', { has: page.locator('.seat-grid') }).locator('legend span').first()
    const [selected, required] = ((await counter.textContent()) ?? '0/0').split('/').map((part) => Number(part.trim()))
    for (let picked = selected; picked < required; picked += 1) {
      const options = seatGrid.locator('button:not([disabled])')
      const total = await options.count()
      let clicked = false
      for (let index = 0; index < total; index += 1) {
        const option = options.nth(index)
        if ((await option.getAttribute('aria-pressed')) !== 'true') {
          await option.click()
          clicked = true
          break
        }
      }
      if (!clicked) break
    }
  }

  const choiceChips = recorder.locator('.choice-chips button:not([disabled])')
  if (await choiceChips.count()) await choiceChips.first().click()

  // 工具可能已自动预选默认结果；对同一个结果再点一次等于取消，所以先确认当前没有选中项。
  const outcomes = recorder.locator('.outcome-grid button:not([disabled])')
  const alreadyChosen = recorder.locator('.outcome-grid button[aria-pressed="true"]')
  if (await outcomes.count() && !(await alreadyChosen.count())) await outcomes.first().click()
}

async function settleWholeNight(page: Page) {
  const session = await readSession(page)
  const run = session.nightRuns[session.activeNightRunId]
  const queueLength = (run?.queue ?? []).length
  expect(queueLength).toBeGreaterThan(0)

  let confirmed = 0
  for (let step = 0; step < queueLength; step += 1) {
    await fillCurrentWakeInputs(page)
    const next = page.getByRole('button', { name: '确认并下一位' })
    const stay = page.getByRole('button', { name: '确认本项' })
    if (await next.isEnabled().catch(() => false)) await next.click()
    else if (await stay.isEnabled().catch(() => false)) await stay.click()
    else continue
    confirmed += 1
  }
  expect(confirmed).toBeGreaterThan(0)
  return confirmed
}

async function returnToDashboard(page: Page) {
  const back = page.getByRole('button', { name: '返回本局', exact: true })
  if (await back.isVisible().catch(() => false)) await back.click()
  await openArchive(page)
  await expect(page.getByRole('main', { name: '本局' })).toBeVisible()
}

test('纯记录模式主干：配板 → 首夜 → 白天投票 → 次夜 → 归档', async ({ page }) => {
  await openBlankSession(page)

  // 配板
  const setupHeading = page.getByRole('heading', { name: 'AI配板与调整' })
  if (!(await setupHeading.isVisible().catch(() => false))) {
    await openArchive(page)
    await page.getByRole('button', { name: 'AI配板与调整' }).click()
  }
  await expect(setupHeading).toBeVisible()
  await page.getByLabel('开局板子').selectOption('trouble-brewing')
  await page.getByRole('button', { name: '12人' }).click()
  await page.getByRole('button', { name: '开始配板' }).click()
  await page.locator('.setup-candidate').first().getByRole('button', { name: '采用为草稿' }).click()
  await expect(page.locator('.setup-seat-grid button')).toHaveCount(12)
  await page.getByRole('button', { name: '确认配板' }).click()
  await expect(page.locator('.setup-panel')).toBeHidden()

  const afterSetup = await readSession(page)
  expect(afterSetup.playerCount).toBe(12)
  expect(afterSetup.phaseSegments).toEqual([])
  expect(afterSetup.timeline.filter((entry: TimelineEntryLike) => entry.kind === 'setup_confirmed')).toHaveLength(1)

  // 首夜
  await openArchive(page)
  await page.getByRole('button', { name: '进入夜晚' }).click()
  await expect(page.getByRole('heading', { name: '第1夜' })).toBeVisible()

  const night1Confirmed = await settleWholeNight(page)
  await expect.poll(async () => countTimeline(page, (entry) => entry.kind === 'night_action' && entry.segmentId === 'night-1')).toBe(night1Confirmed)

  await page.getByRole('button', { name: '检查并关闭' }).click()
  await page.getByRole('button', { name: '确认关闭' }).click()
  // 关闭本夜后主持台落在黎明播报卡，而不是回首页——这是新导航的主路径。
  await expect(page.getByRole('button', { name: /已宣布睁眼/ })).toBeVisible()

  const afterFirstNight = await readSession(page)
  expect(afterFirstNight.phaseSegments.find((segment: { id: string }) => segment.id === 'night-1').closedAt).toBeTruthy()
  expect(afterFirstNight.timeline.some((entry: TimelineEntryLike) => entry.kind === 'player_state_changed')).toBe(false)

  // 白天投票与处决
  await openArchive(page)
  await page.getByRole('button', { name: '进入白天' }).click()
  await expect(page.getByRole('heading', { name: '第1天' })).toBeVisible()
  await page.getByRole('button', { name: '选择1号为提名人' }).click()
  await page.getByRole('tab', { name: /被提名人/ }).click()
  await page.getByRole('button', { name: '选择4号为被提名人' }).click()
  for (const seatId of [1, 2, 3, 4, 5, 6]) {
    await page.getByRole('button', { name: `记录${seatId}号举手` }).click()
  }
  await page.getByRole('button', { name: '记录本轮票型' }).click()
  await expect(page.getByText('4号暂列')).toBeVisible()
  await expect(page.getByText('6票 · 门槛6')).toBeVisible()

  await page.getByRole('button', { name: '记录处决4号' }).click()
  await expect(page.getByText('将追加死亡状态与日终记录；不会进入夜晚。')).toBeVisible()
  await page.getByRole('button', { name: '确认记录' }).click()
  await expect.poll(async () => countTimeline(page, (entry) => entry.kind === 'execution')).toBe(1)

  await page.getByRole('button', { name: '结束今天' }).click()
  await page.getByRole('button', { name: '确认结束' }).click()
  await returnToDashboard(page)
  await expect(page.getByText(/存活11 · 死亡1/)).toBeVisible()

  const afterDay = await readSession(page)
  const voteRounds = (afterDay.timeline as TimelineEntryLike[]).filter((entry) => entry.kind === 'vote_round')
  expect(voteRounds).toHaveLength(1)
  expect(voteRounds[0].raisedSeatIds).toEqual([1, 2, 3, 4, 5, 6])
  const deaths = (afterDay.timeline as TimelineEntryLike[]).filter((entry) => entry.kind === 'player_state_changed' && entry.after?.life === 'dead')
  expect(deaths.map((entry) => entry.seatId)).toEqual([4])
  expect(afterDay.phaseSegments.find((segment: { id: string }) => segment.id === 'day-1').closedAt).toBeTruthy()

  // 次夜
  await openArchive(page)
  await page.getByRole('button', { name: '进入夜晚' }).click()
  await expect(page.getByRole('heading', { name: '第2夜' })).toBeVisible()
  const night2Confirmed = await settleWholeNight(page)
  await expect.poll(async () => countTimeline(page, (entry) => entry.kind === 'night_action' && entry.segmentId === 'night-2')).toBe(night2Confirmed)
  await page.getByRole('button', { name: '检查并关闭' }).click()
  await page.getByRole('button', { name: '确认关闭' }).click()
  // 关闭本夜后主持台落在黎明播报卡，而不是回首页——这是新导航的主路径。
  await expect(page.getByRole('button', { name: /已宣布睁眼/ })).toBeVisible()

  // 归档：收尾入口现在常驻在阶段轨道右端，不必先回首页。
  await page.getByRole('button', { name: '收尾' }).click()
  await expect(page.getByRole('heading', { name: '结束对局' })).toBeVisible()
  await page.getByRole('radio', { name: '善良获胜' }).click()
  await page.getByRole('button', { name: '保存本局' }).click()
  await expect(page.getByText('本局已保存到本机浏览器')).toBeVisible()

  const archives = await readArchives(page)
  expect(archives).toHaveLength(1)
  expect(archives[0]).toMatchObject({
    winner: 'good',
    playerCount: 12,
    summary: {
      alive: 11,
      dead: 1,
      nightActions: night1Confirmed + night2Confirmed,
      votes: 1,
      executions: 1,
      corrections: 0,
    },
  })
})
