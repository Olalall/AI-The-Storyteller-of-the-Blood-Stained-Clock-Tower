import { expect, test } from '@playwright/test'


/** 主持台是默认视图；首页（配板/发身份/玩家状态等）现在是轨道右端「本局」打开的档案层。 */
async function openArchive(page: import('@playwright/test').Page) {
  const back = page.getByRole('button', { name: '本局', exact: true })
  if (await back.isVisible().catch(() => false)) await back.click()
  await expect(page.getByRole('heading', { name: /瓦釜雷鸣/ })).toBeVisible()
}

async function resetToDashboard(page: import('@playwright/test').Page) {
  await page.setViewportSize({ width: 720, height: 900 })
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()
  await openArchive(page)
}

async function swapFirstTwoDraftSeats(page: import('@playwright/test').Page) {
  const seatButtons = page.locator('.setup-seat-grid button')
  await expect(seatButtons).toHaveCount(12)

  const before = await seatButtons.evaluateAll((buttons) => buttons.slice(0, 2).map((button) => ({
    role: button.querySelector('strong')?.textContent ?? '',
  })))

  await seatButtons.nth(0).click()
  await seatButtons.nth(1).click()
  await expect(page.locator('.setup-panel__swap-summary')).toBeVisible()
  await expect(seatButtons.nth(0)).toContainText(before[1].role)
  await expect(seatButtons.nth(1)).toContainText(before[0].role)
}

async function dragThirdSeatToFourth(page: import('@playwright/test').Page) {
  const seatButtons = page.locator('.setup-seat-grid button')
  await expect(seatButtons).toHaveCount(12)

  const before = await seatButtons.evaluateAll((buttons) => buttons.slice(2, 4).map((button) => ({
    role: button.querySelector('strong')?.textContent ?? '',
  })))

  await seatButtons.nth(2).dragTo(seatButtons.nth(3))
  await expect(seatButtons.nth(2)).toContainText(before[1].role)
  await expect(seatButtons.nth(3)).toContainText(before[0].role)
}

test('dashboard keeps day and night as peer entries and only records day facts after counting', async ({ page }) => {
  await resetToDashboard(page)

  await expect(page.getByRole('button', { name: '进入夜晚' })).toBeVisible()
  await expect(page.getByRole('button', { name: '进入白天' })).toBeVisible()
  await expect(page.getByText('暂列处决', { exact: true })).toHaveCount(0)
  // 「当前阶段」卡已被常驻阶段轨道取代；轨道的 open 节点带该段标签。
  await expect(page.getByRole('navigation', { name: '主持阶段' }).locator('.ui-phase-node--open')).toContainText('第3夜')
  await expect(page.getByText('继续记录 · 第3夜')).toBeVisible()
  await expect(page.getByText('首次确认后建立记录')).toBeVisible()
  await expect(page.getByRole('button', { name: /倒计时/ })).toBeVisible()
  await page.screenshot({ path: 'artifacts/screenshots/split-720-dashboard.png', fullPage: true })

  await openArchive(page)
  await page.getByRole('button', { name: '进入白天' }).click()
  await expect(page.getByRole('heading', { name: '第3天' })).toBeVisible()
  await expect(page.getByRole('timer', { name: '白天节奏计时' })).toBeVisible()
  await page.getByRole('button', { name: '开始私聊倒计时' }).click()
  await expect(page.getByRole('button', { name: '暂停私聊倒计时' })).toBeVisible()
  await page.getByRole('button', { name: '返回本局', exact: true }).click()
  const afterTimerStart = await page.evaluate(() => JSON.parse(window.localStorage.getItem('botc-copilot-session-v1') ?? '{}'))
  expect(afterTimerStart.phaseSegments).toHaveLength(2)
  expect(afterTimerStart.phaseSegments.some((segment: { id: string; closedAt?: string }) => segment.id === 'day-3' && !segment.closedAt)).toBe(true)
  expect(afterTimerStart.timeline.some((entry: { kind: string }) => entry.kind === 'day_action')).toBe(false)
  await openArchive(page)
  await page.getByRole('button', { name: '进入白天' }).click()
  await expect(page.getByRole('button', { name: '暂停私聊倒计时' })).toBeVisible()
  await page.reload()
  await openArchive(page)
  await page.getByRole('button', { name: '进入白天' }).click()
  await expect(page.getByRole('button', { name: '暂停私聊倒计时' })).toBeVisible()
  await page.screenshot({ path: 'artifacts/screenshots/split-720-day-timer.png', fullPage: true })

  await page.getByRole('button', { name: '选择1号为提名人' }).click()
  await page.getByRole('tab', { name: '被提名人 · 未选' }).click()
  await page.getByRole('button', { name: '选择4号为被提名人' }).click()
  for (const seatId of [1, 2, 3, 4, 5, 6]) {
    await page.getByRole('button', { name: `记录${seatId}号举手` }).click()
  }
  await page.getByRole('button', { name: '记录本轮票型' }).click()

  await expect(page.getByRole('heading', { name: '第3天' })).toBeVisible()
  await expect(page.getByText('4号暂列')).toBeVisible()
  await expect(page.getByText('6票 · 门槛6')).toBeVisible()
  await page.screenshot({ path: 'artifacts/screenshots/split-720-day-vote.png', fullPage: true })
  const afterVote = await page.evaluate(() => JSON.parse(window.localStorage.getItem('botc-copilot-session-v1') ?? '{}'))
  expect(afterVote.timeline.some((entry: { kind: string }) => entry.kind === 'vote_round')).toBe(true)
  expect(afterVote.timeline.some((entry: { kind: string }) => entry.kind === 'player_state_changed')).toBe(false)

  await page.getByRole('button', { name: '记录处决4号' }).click()
  await expect(page.getByText('将追加死亡状态与日终记录；不会进入夜晚。')).toBeVisible()
  await page.getByRole('button', { name: '确认记录' }).click()
  await expect.poll(async () => page.evaluate(() => {
    const state = JSON.parse(window.localStorage.getItem('botc-copilot-session-v1') ?? '{}')
    return state.timeline.filter((entry: { kind: string }) => entry.kind === 'player_state_changed').length
  })).toBe(1)

  await page.getByRole('button', { name: '返回本局', exact: true }).click()
  await expect(page.getByText(/存活11 · 死亡1/)).toBeVisible()
  await expect(page.getByText('继续记录 · 第3夜')).toBeVisible()
  await expect(page.getByText('继续记录 · 第3天')).toBeVisible()
})

test('opening script stays local to the host and does not create a game record', async ({ page }) => {
  await resetToDashboard(page)
  const before = await page.evaluate(() => JSON.parse(window.localStorage.getItem('botc-copilot-session-v1') ?? '{}').timeline.length)

  await page.getByRole('button', { name: '开场白', exact: true }).click()
  await expect(page.getByRole('heading', { name: '开场白' })).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveAttribute('data-presentation', 'page')
  await page.getByRole('button', { name: '编辑文案' }).click()
  await page.getByLabel('开场白文案').fill('请确认座位，准备开始。')
  await page.getByRole('button', { name: '保存文案' }).click()
  await page.getByRole('button', { name: '大字展示' }).click()
  await expect(page.getByLabel('开场白大字展示')).toContainText('请确认座位，准备开始。')
  await page.screenshot({ path: 'artifacts/screenshots/split-720-opening-script.png', fullPage: true })
  await page.getByRole('button', { name: '退出展示' }).click()
  await page.getByRole('button', { name: '关闭开场白' }).click()

  const after = await page.evaluate(() => JSON.parse(window.localStorage.getItem('botc-copilot-session-v1') ?? '{}').timeline.length)
  expect(after).toBe(before)
  await expect(page.getByText('请确认座位，准备开始。')).toHaveCount(0)
})

test('setup candidates stay drafts until the storyteller confirms a future-only adjustment', async ({ page }) => {
  await resetToDashboard(page)
  await openArchive(page)
  await page.getByRole('button', { name: 'AI配板与调整' }).click()

  await expect(page.getByRole('heading', { name: 'AI配板与调整' })).toBeVisible()
  await expect(page.getByText('AI配板建议')).toBeVisible()
  await page.locator('.setup-panel__advice-entry').click()
  await expect(page.getByText('AI建议')).toBeVisible()
  await expect(page.getByText('角色组合')).toBeVisible()
  await page.screenshot({ path: 'artifacts/screenshots/split-720-setup.png' })
  await expect(page.getByText('候选、草稿与确认配板分开。')).toHaveCount(0)
  await page.locator('.setup-candidate').filter({ hasText: '全员参与' }).getByRole('button', { name: '采用为草稿' }).click()
  await swapFirstTwoDraftSeats(page)
  await dragThirdSeatToFourth(page)
  await page.screenshot({ path: 'artifacts/screenshots/split-720-setup-card-swap.png', fullPage: true })
  await expect(page.getByRole('dialog')).toHaveAttribute('data-presentation', 'page')
  await page.getByRole('heading', { name: '人数修正' }).scrollIntoViewIfNeeded()
  const bluffSelects = page.locator('.setup-panel__bluff-grid select')
  await expect(bluffSelects).toHaveCount(3)
  expect(await bluffSelects.first().locator('option').allTextContents()).not.toContain('赌徒')
  await page.getByRole('heading', { name: '伪装建议' }).scrollIntoViewIfNeeded()
  await page.screenshot({ path: 'artifacts/screenshots/split-720-setup-bluff-grid.png' })
  await page.screenshot({ path: 'artifacts/screenshots/split-720-setup-draft-rules.png', fullPage: true })
  await expect(page.getByRole('button', { name: '确认调整' })).toBeEnabled()
  await page.getByRole('button', { name: '确认调整' }).click()

  await expect.poll(async () => page.evaluate(() => {
    const state = JSON.parse(window.localStorage.getItem('botc-copilot-session-v1') ?? '{}')
    return state.timeline.filter((entry: { kind: string }) => entry.kind === 'setup_changed').length
  })).toBeGreaterThan(0)
  await openArchive(page)
  await page.getByRole('button', { name: '进入夜晚' }).click()
  await expect(page.getByText('本夜仍按洗脑师')).toBeVisible()
})

test('a confirmed night result reaches the dashboard timeline without changing phase', async ({ page }) => {
  await resetToDashboard(page)
  await openArchive(page)
  await page.getByRole('button', { name: '进入夜晚' }).click()
  await page.getByRole('button', { name: '选择3号玩家' }).click()
  await page.getByRole('button', { name: '调查员' }).click()
  // 选完目标与角色后工具会自动预选「受到影响」；再点一次是取消选择，所以这里只在未选中时点。
  const appliedOutcome = page.getByRole('button', { name: '受到影响', exact: true })
  if ((await appliedOutcome.getAttribute('aria-pressed')) !== 'true') await appliedOutcome.click()
  await page.getByRole('button', { name: '确认本项' }).click()
  await expect.poll(async () => page.evaluate(() => {
    const state = JSON.parse(window.localStorage.getItem('botc-copilot-session-v1') ?? '{}')
    return state.timeline.some((entry: { kind: string; wakeItemId: string }) => entry.kind === 'night_action' && entry.wakeItemId === 'night-3-cerenovus')
  })).toBe(true)

  await page.getByRole('button', { name: '返回本局', exact: true }).click()
  await expect(page.getByText('10号洗脑师选择3号成为调查员，目标受到影响。')).toBeVisible()
  await expect(page.getByText('继续记录 · 第3夜')).toBeVisible()
})

test('ending a night returns to the dashboard and the next confirmed action starts a separate night', async ({ page }) => {
  await resetToDashboard(page)
  await openArchive(page)
  await page.getByRole('button', { name: '进入夜晚' }).click()
  await page.getByRole('button', { name: '检查并关闭' }).click()
  await expect(page.getByText('关闭第3夜？')).toBeVisible()
  await page.getByRole('button', { name: '确认关闭' }).click()
  await openArchive(page)

  const afterClose = await page.evaluate(() => JSON.parse(window.localStorage.getItem('botc-copilot-session-v1') ?? '{}'))
  expect(afterClose.phaseSegments.find((segment: { id: string }) => segment.id === 'night-3').closedAt).toBeTruthy()
  expect(afterClose.phaseSegments.some((segment: { id: string }) => segment.id === 'night-4')).toBe(false)

  await openArchive(page)
  await page.getByRole('button', { name: '进入夜晚' }).click()
  await expect(page.getByRole('heading', { name: '第4夜' })).toBeVisible()
  await page.getByRole('button', { name: '气球驾驶员' }).click()
  await page.getByRole('button', { name: '发动', exact: true }).click()
  await page.getByRole('button', { name: '确认本项' }).click()
  await expect(page.getByRole('heading', { name: '第4夜' })).toBeVisible()
  await expect.poll(async () => page.evaluate(() => {
    const state = JSON.parse(window.localStorage.getItem('botc-copilot-session-v1') ?? '{}')
    return state.timeline.some((entry: { kind: string; segmentId: string; nightRunId?: string }) =>
      entry.kind === 'night_action' && entry.segmentId === 'night-4' && entry.nightRunId === 'catfishing-night-4')
  })).toBe(true)
})

test('the next night record does not include a role change confirmed in the previous night', async ({ page }) => {
  await resetToDashboard(page)
  await openArchive(page)
  await page.getByRole('button', { name: '进入夜晚' }).click()
  await page.getByRole('button', { name: '更换角色' }).click()
  await page.getByRole('button', { name: '麻脸巫婆' }).click()
  await page.getByRole('button', { name: '确认改为麻脸巫婆' }).click()
  await expect(page.getByRole('button', { name: '本局记录，共4条' })).toBeVisible()

  await page.getByRole('button', { name: '检查并关闭' }).click()
  await page.getByRole('button', { name: '确认关闭' }).click()
  // 关闭本夜后主持台落在黎明播报卡；本例只验证「下一夜是独立的一轮」，走档案层直接开下一夜。
  await openArchive(page)
  await page.getByRole('button', { name: '进入夜晚' }).click()
  await expect(page.getByRole('heading', { name: '第4夜' })).toBeVisible()

  await page.getByRole('button', { name: '本局记录，共0条' }).click()
  await expect(page.getByText('10号角色：洗脑师 → 麻脸巫婆')).toHaveCount(0)
  await page.screenshot({ path: 'artifacts/screenshots/split-720-night-4-record-scope.png', fullPage: true })
})

test('day skills and public events are recorded structurally before the vote flow', async ({ page }) => {
  await resetToDashboard(page)
  await openArchive(page)
  await page.getByRole('button', { name: '进入白天' }).click()
  await page.getByRole('button', { name: '记技能/事件' }).click()
  await page.getByRole('button', { name: '选择6号为发动者' }).click()
  await page.getByRole('button', { name: '选择5号为目标' }).click()
  await page.getByLabel('公开声称').selectOption('investigator')
  await page.getByRole('button', { name: '无事发生' }).click()
  await page.getByRole('button', { name: '记录技能' }).click()
  await expect(page.getByRole('heading', { name: '第3天' })).toBeVisible()

  await page.getByRole('button', { name: '记技能/事件' }).click()
  await page.getByRole('tab', { name: '公开事件' }).click()
  await page.getByRole('button', { name: '选择6号为涉及玩家' }).click()
  await page.getByLabel('公开内容').fill('6号公开声明')
  await page.getByRole('button', { name: '记录事件' }).click()

  await page.getByRole('button', { name: '返回本局', exact: true }).click()
  await expect(page.getByText('赌徒 · 6号（赌徒）称调查员 → 5号（舞蛇人） · 无事发生')).toBeVisible()
  await expect(page.getByText('公开事件：6号公开声明')).toBeVisible()
  await page.getByRole('button', { name: /查看3号.*中毒/ }).click()
  await expect(page.getByText('赌徒 · 6号（赌徒）称调查员 → 5号（舞蛇人） · 无事发生', { exact: true })).toBeVisible()
})

test('an unrecorded vote survives returning to the dashboard and must be explicitly cleared before ending the day', async ({ page }) => {
  await resetToDashboard(page)
  await openArchive(page)
  await page.getByRole('button', { name: '进入白天' }).click()
  await page.getByRole('button', { name: '记技能/事件' }).click()
  await page.getByRole('button', { name: '选择6号为发动者' }).click()
  await page.getByRole('button', { name: '选择5号为目标' }).click()
  await page.getByRole('button', { name: '无事发生' }).click()
  await page.getByRole('button', { name: '记录技能' }).click()
  await page.getByRole('button', { name: '选择1号为提名人' }).click()
  await page.getByRole('tab', { name: '被提名人 · 未选' }).click()
  await page.getByRole('button', { name: '选择4号为被提名人' }).click()
  await page.getByRole('button', { name: '记录1号举手' }).click()

  await page.getByRole('button', { name: '返回本局', exact: true }).click()
  await expect(page.getByText('本轮票型已暂存')).toBeVisible()
  await page.getByRole('button', { name: '返回本局', exact: true }).last().click()
  await page.reload()
  await openArchive(page)
  await page.getByRole('button', { name: '进入白天' }).click()
  await expect(page.getByRole('tab', { name: '提名人 · 1号' })).toBeVisible()
  await expect(page.getByRole('tab', { name: '被提名人 · 4号' })).toBeVisible()

  await page.getByRole('button', { name: '结束今天' }).click()
  await expect(page.getByText('本轮票型已暂存')).toBeVisible()
  await page.getByRole('button', { name: '清空并结束' }).click()

  const state = await page.evaluate(() => JSON.parse(window.localStorage.getItem('botc-copilot-session-v1') ?? '{}'))
  expect(state.dayVoteDraft).toBeNull()
  expect(state.timeline.some((entry: { kind: string }) => entry.kind === 'vote_round')).toBe(false)
  expect(state.phaseSegments.find((segment: { id: string }) => segment.id === 'day-3')?.closedAt).toBeTruthy()
})

test('an unconfirmed day skill survives returning to the dashboard without creating a day action record', async ({ page }) => {
  await resetToDashboard(page)
  await openArchive(page)
  await page.getByRole('button', { name: '进入白天' }).click()
  await page.getByRole('button', { name: '记技能/事件' }).click()
  await page.getByRole('button', { name: '选择6号为发动者' }).click()
  await page.getByRole('button', { name: '选择5号为目标' }).click()
  await page.getByLabel('公开声称').selectOption('investigator')
  await page.getByRole('button', { name: '无事发生' }).click()
  await page.getByRole('button', { name: '关闭白天记录' }).click()

  const beforeExit = await page.evaluate(() => JSON.parse(window.localStorage.getItem('botc-copilot-session-v1') ?? '{}'))
  expect(beforeExit.timeline.some((entry: { kind: string }) => entry.kind === 'day_action')).toBe(false)

  await page.getByRole('button', { name: '返回本局', exact: true }).click()
  await expect(page.getByText('技能记录已暂存')).toBeVisible()
  await page.getByRole('button', { name: '继续处理' }).click()
  await expect(page.getByRole('heading', { name: '第3天' })).toBeVisible()

  await page.getByRole('button', { name: '返回本局', exact: true }).click()
  await page.getByRole('button', { name: '返回本局', exact: true }).last().click()
  await openArchive(page)

  await page.reload()
  await openArchive(page)
  await page.getByRole('button', { name: '进入白天' }).click()
  await page.getByRole('button', { name: '记技能/事件' }).click()
  await expect(page.getByRole('button', { name: '选择6号为发动者' })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('button', { name: '选择5号为目标' })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByLabel('公开声称')).toHaveValue('investigator')
  await expect(page.getByRole('button', { name: '无事发生' })).toHaveAttribute('aria-pressed', 'true')
  await page.screenshot({ path: 'artifacts/screenshots/split-720-day-action-resume.png', fullPage: true })
})

test('day timer stays touchable in a narrow split view', async ({ page }) => {
  await page.setViewportSize({ width: 480, height: 800 })
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()
  await openArchive(page)
  await page.getByRole('button', { name: '进入白天' }).click()

  const timer = page.getByRole('timer', { name: '白天节奏计时' })
  await expect(timer).toBeVisible()
  for (const control of [
    page.getByRole('button', { name: '设置私聊和公聊时长' }),
    page.getByRole('button', { name: '开始私聊倒计时' }),
    page.getByRole('button', { name: '重置私聊倒计时' }),
  ]) {
    const box = await control.boundingBox()
    expect(Math.round(box?.height ?? 0)).toBeGreaterThanOrEqual(44)
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(1)
  await page.screenshot({ path: 'artifacts/screenshots/split-480-day-timer.png', fullPage: true })
})

test('dashboard records a manual player state change without creating a phase', async ({ page }) => {
  await resetToDashboard(page)

  await page.getByRole('button', { name: /查看4号.*存活/ }).click()
  await expect(page.getByRole('dialog', { name: '4号玩家' })).toBeVisible()
  await page.getByRole('button', { name: '中毒' }).click()
  await page.getByRole('button', { name: '确认状态' }).click()
  await expect(page.getByText('状态更新：存活 · 中毒')).toBeVisible()
  await page.screenshot({ path: 'artifacts/screenshots/split-720-player-status.png', fullPage: true })

  const state = await page.evaluate(() => JSON.parse(window.localStorage.getItem('botc-copilot-session-v1') ?? '{}'))
  const change = state.timeline.filter((entry: { kind: string }) => entry.kind === 'player_state_changed').at(-1)
  expect(change).toMatchObject({ seatId: 4, segmentId: null, after: { poisoned: true } })
  expect(state.phaseSegments).toHaveLength(1)
})

test('journal filters a closed day and appends a structured correction without creating another day', async ({ page }) => {
  await resetToDashboard(page)
  await openArchive(page)
  await page.getByRole('button', { name: '进入白天' }).click()
  await page.getByRole('button', { name: '记技能/事件' }).click()
  await page.getByRole('button', { name: '选择6号为发动者' }).click()
  await page.getByRole('button', { name: '选择5号为目标' }).click()
  await page.getByRole('button', { name: '无事发生' }).click()
  await page.getByRole('button', { name: '记录技能' }).click()
  await page.getByRole('button', { name: '结束今天' }).click()
  await page.getByRole('button', { name: '返回本局', exact: true }).click()

  await page.getByRole('button', { name: '日记' }).click()
  await page.getByLabel('筛选昼夜').selectOption({ label: '第3天' })
  await page.getByLabel('筛选玩家').selectOption('6')
  const actionRecord = page.getByRole('button', { name: /更正第3天的白天技能记录：赌徒 · 6号（赌徒） → 5号（舞蛇人） · 无事发生/ })
  await expect(actionRecord).toBeVisible()
  await actionRecord.click()
  await expect(page.getByRole('heading', { name: '更正记录' })).toBeVisible()
  await expect(page.getByRole('button', { name: '追加更正' })).toHaveCount(0)
  await page.getByRole('button', { name: '更正5号为目标' }).click()
  await page.getByRole('button', { name: '更正6号为目标' }).click()
  await page.getByLabel('更正原因').fill('目标座位看错')
  await page.getByRole('button', { name: '确认追加' }).click()
  await expect(page.getByRole('heading', { name: '赌徒 · 6号（赌徒） → 6号（赌徒） · 无事发生', exact: true })).toBeVisible()
  await page.screenshot({ path: 'artifacts/screenshots/split-720-journal-correction.png', fullPage: true })

  const state = await page.evaluate(() => JSON.parse(window.localStorage.getItem('botc-copilot-session-v1') ?? '{}'))
  const original = state.timeline.find((entry: { id: string }) => entry.id.startsWith('day-action-'))
  const correction = state.timeline.find((entry: { correctionOf?: string }) => entry.correctionOf === original.id)
  expect(correction).toMatchObject({
    kind: 'day_action',
    segmentId: 'day-3',
    targetSeatIds: [6],
    correctionReason: '目标座位看错',
  })
  expect(state.phaseSegments.filter((segment: { kind: string }) => segment.kind === 'day')).toHaveLength(1)
})

test('journal keeps vote records read-only and directs the storyteller back to the day workbench', async ({ page }) => {
  await resetToDashboard(page)
  await openArchive(page)
  await page.getByRole('button', { name: '进入白天' }).click()
  await page.getByRole('button', { name: '选择1号为提名人' }).click()
  await page.getByRole('tab', { name: '被提名人 · 未选' }).click()
  await page.getByRole('button', { name: '选择4号为被提名人' }).click()
  for (const seatId of [1, 2, 3, 4, 5, 6]) {
    await page.getByRole('button', { name: `记录${seatId}号举手` }).click()
  }
  await page.getByRole('button', { name: '记录本轮票型' }).click()
  await page.getByRole('button', { name: '返回本局', exact: true }).click()
  await page.getByRole('button', { name: '日记' }).click()
  await page.getByRole('button', { name: /查看投票记录：1号提名4号 · 6票/ }).click()

  await expect(page.getByText('票型影响暂列结果；从白天工作台重新记录。')).toBeVisible()
  await expect(page.getByRole('button', { name: '回白天改票型' })).toBeVisible()
  await expect(page.getByLabel('更正原因')).toHaveCount(0)
  await expect(page.getByRole('button', { name: '确认追加' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: '追加更正' })).toHaveCount(0)
  await page.getByRole('button', { name: '回白天改票型' }).click()
  await expect(page.getByRole('heading', { name: '第3天' })).toBeVisible()
})

test('journal filters stay touchable in a narrow split view', async ({ page }) => {
  await page.setViewportSize({ width: 480, height: 800 })
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()
  await openArchive(page)
  await page.getByRole('button', { name: '日记' }).click()
  await expect(page.getByRole('dialog', { name: '日记' })).toBeVisible()

  for (const control of [
    page.getByLabel('筛选昼夜'),
    page.getByLabel('筛选玩家'),
    page.getByLabel('筛选类型'),
  ]) {
    const box = await control.boundingBox()
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44)
  }
  await page.getByLabel('筛选类型').selectOption('night_action')
  const record = page.getByRole('button', { name: /更正第3夜的夜间行动记录：/ }).first()
  expect((await record.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44)
  await record.click()
  await expect(page.getByRole('heading', { name: '更正记录' })).toBeVisible()
  await expect(page.getByRole('button', { name: '追加更正' })).toHaveCount(0)
  for (const control of [
    page.getByRole('button', { name: '取消' }),
    page.getByRole('button', { name: '确认追加' }),
  ]) {
    const box = await control.boundingBox()
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44)
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(1)
  await page.screenshot({ path: 'artifacts/screenshots/split-480-journal-direct-correction.png', fullPage: true })
})



