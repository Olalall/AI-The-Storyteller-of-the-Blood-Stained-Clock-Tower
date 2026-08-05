import { expect, test } from '@playwright/test'


/** 主持台是默认视图；首页（配板/发身份/玩家状态等）现在是轨道右端「本局」打开的档案层。 */
async function openArchive(page: import('@playwright/test').Page) {
  const back = page.getByRole('button', { name: '本局', exact: true })
  if (await back.isVisible().catch(() => false)) await back.click()
  await expect(page.getByRole('heading', { name: /瓦釜雷鸣/ })).toBeVisible()
}

async function reset(page: import('@playwright/test').Page) {
  await page.setViewportSize({ width: 720, height: 900 })
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()
  await openArchive(page)
}

async function timeline(page: import('@playwright/test').Page) {
  return page.evaluate(() => JSON.parse(window.localStorage.getItem('botc-copilot-session-v1') ?? '{}').timeline)
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

test('manual click smoke: host can run setup, night, day, execution, status and journal paths', async ({ page }) => {
  await reset(page)
  await page.screenshot({ path: 'artifacts/screenshots/manual-click-smoke-2026-07-16/01-dashboard-start.png', fullPage: false })

  const beforeOpening = (await timeline(page)).length
  await page.getByRole('button', { name: '打开AI API设置' }).click()
  await expect(page.getByRole('heading', { name: 'AI API 设置' })).toBeVisible()
  await page.getByLabel('调用方式').selectOption('openai-compatible')
  await page.getByLabel('接入地址').fill('/api/ai')
  await page.getByLabel('模型名字').fill('gpt-4.1-mini')
  await page.getByLabel('API KEY').fill('sk-test-not-saved')
  await page.getByRole('button', { name: '校验配置' }).click()
  await expect(page.getByText('本页配置完整；API KEY 不会保存。')).toBeVisible()
  await page.getByRole('button', { name: '保存设置' }).click()
  await expect(page.getByText('已保存设置')).toBeVisible()
  const storageAfterAISettings = await page.evaluate(() => Object.values(window.localStorage).join('\n'))
  expect(storageAfterAISettings).not.toContain('sk-test-not-saved')
  await page.getByRole('button', { name: '关闭AI API 设置' }).click()
  expect((await timeline(page)).length).toBe(beforeOpening)

  await page.getByRole('button', { name: '开场白', exact: true }).click()
  await expect(page.getByRole('heading', { name: '开场白' })).toBeVisible()
  await page.getByRole('button', { name: '编辑文案' }).click()
  await page.getByLabel('开场白文案').fill('请确认座位，准备开始。')
  await page.getByRole('button', { name: '保存文案' }).click()
  await page.getByRole('button', { name: '大字展示' }).click()
  await expect(page.getByLabel('开场白大字展示')).toContainText('请确认座位，准备开始。')
  await page.screenshot({ path: 'artifacts/screenshots/manual-click-smoke-2026-07-16/02-opening-display.png', fullPage: false })
  await page.getByRole('button', { name: '退出展示' }).click()
  await page.getByRole('button', { name: '关闭开场白' }).click()
  expect((await timeline(page)).length).toBe(beforeOpening)

  const beforeSetup = (await timeline(page)).filter((entry: { kind: string }) => entry.kind === 'setup_changed').length
  await openArchive(page)
  await page.getByRole('button', { name: 'AI配板与调整' }).click()
  await expect(page.getByRole('heading', { name: 'AI配板与调整' })).toBeVisible()
  await page.locator('.setup-panel__advice-entry').click()
  await expect(page.getByText('角色组合')).toBeVisible()
  await page.screenshot({ path: 'artifacts/screenshots/manual-click-smoke-2026-07-16/03-setup-advice.png', fullPage: false })
  await page.locator('.setup-candidate').filter({ hasText: '全员参与' }).getByRole('button', { name: '采用为草稿' }).click()
  await swapFirstTwoDraftSeats(page)
  await page.getByRole('button', { name: '确认调整' }).click()
  await expect.poll(async () => (await timeline(page)).filter((entry: { kind: string }) => entry.kind === 'setup_changed').length).toBeGreaterThan(beforeSetup)
  await page.screenshot({ path: 'artifacts/screenshots/manual-click-smoke-2026-07-16/04-setup-confirmed.png', fullPage: false })
  const closeSetup = page.getByRole('button', { name: '关闭AI配板与调整' })
  if (await closeSetup.isVisible().catch(() => false)) await closeSetup.click()
  await expect(page.getByRole('button', { name: '进入夜晚' })).toBeVisible()

  const beforeNight = (await timeline(page)).filter((entry: { kind: string }) => entry.kind === 'night_action').length
  await openArchive(page)
  await page.getByRole('button', { name: '进入夜晚' }).click()
  await expect(page.getByRole('heading', { name: /第3夜/ })).toBeVisible()
  await page.getByRole('button', { name: '选择3号玩家' }).click()
  await page.getByRole('button', { name: '调查员' }).click()
  const affectedOutcome = page.getByRole('button', { name: '受到影响', exact: true })
  if (await affectedOutcome.getAttribute('aria-pressed') !== 'true') await affectedOutcome.click()
  await page.screenshot({ path: 'artifacts/screenshots/manual-click-smoke-2026-07-16/05-night-before-confirm.png', fullPage: false })
  await page.getByRole('button', { name: '确认本项' }).click()
  await expect.poll(async () => (await timeline(page)).filter((entry: { kind: string }) => entry.kind === 'night_action').length).toBe(beforeNight + 1)
  await page.getByRole('button', { name: '返回本局', exact: true }).click()
  await expect(page.getByText('10号洗脑师选择3号成为调查员，目标受到影响。')).toBeVisible()
  await page.screenshot({ path: 'artifacts/screenshots/manual-click-smoke-2026-07-16/06-dashboard-after-night.png', fullPage: false })

  await openArchive(page)
  await page.getByRole('button', { name: '进入白天' }).click()
  await expect(page.getByRole('heading', { name: '第3天' })).toBeVisible()
  await page.getByRole('button', { name: '开始私聊倒计时' }).click()
  await expect(page.getByRole('button', { name: '暂停私聊倒计时' })).toBeVisible()

  const beforeDayAction = (await timeline(page)).filter((entry: { kind: string }) => entry.kind === 'day_action').length
  await page.getByRole('button', { name: '记技能/事件' }).click()
  await page.getByRole('button', { name: '选择6号为发动者' }).click()
  await page.getByRole('button', { name: '选择5号为目标' }).click()
  await page.getByLabel('公开声称').selectOption('investigator')
  await page.getByRole('button', { name: '无事发生' }).click()
  await page.screenshot({ path: 'artifacts/screenshots/manual-click-smoke-2026-07-16/07-day-skill-before-record.png', fullPage: false })
  await page.getByRole('button', { name: '记录技能' }).click()
  await expect.poll(async () => (await timeline(page)).filter((entry: { kind: string }) => entry.kind === 'day_action').length).toBe(beforeDayAction + 1)

  const beforeVote = (await timeline(page)).filter((entry: { kind: string }) => entry.kind === 'vote_round').length
  await page.getByRole('button', { name: '选择1号为提名人' }).click()
  await page.getByRole('tab', { name: '被提名人 · 未选' }).click()
  await page.getByRole('button', { name: '选择4号为被提名人' }).click()
  for (const seatId of [1, 2, 3, 4, 5, 6]) {
    await page.getByRole('button', { name: `记录${seatId}号举手` }).click()
  }
  await page.screenshot({ path: 'artifacts/screenshots/manual-click-smoke-2026-07-16/08-day-vote-before-record.png', fullPage: false })
  await page.getByRole('button', { name: '记录本轮票型' }).click()
  await expect.poll(async () => (await timeline(page)).filter((entry: { kind: string }) => entry.kind === 'vote_round').length).toBe(beforeVote + 1)
  await expect(page.getByText('4号暂列')).toBeVisible()

  const beforeStateChange = (await timeline(page)).filter((entry: { kind: string }) => entry.kind === 'player_state_changed').length
  await page.getByRole('button', { name: '记录处决4号' }).click()
  await expect(page.getByText('将追加死亡状态与日终记录；不会进入夜晚。')).toBeVisible()
  await page.getByRole('button', { name: '确认记录' }).click()
  await expect.poll(async () => (await timeline(page)).filter((entry: { kind: string }) => entry.kind === 'player_state_changed').length).toBe(beforeStateChange + 1)
  await page.getByRole('button', { name: '返回本局', exact: true }).click()
  await expect(page.getByText(/存活11 · 死亡1/)).toBeVisible()
  await page.screenshot({ path: 'artifacts/screenshots/manual-click-smoke-2026-07-16/09-dashboard-after-execution.png', fullPage: false })

  const beforeOpenSeat = (await timeline(page)).length
  await page.getByRole('button', { name: /查看4号/ }).click()
  await expect(page.getByRole('dialog', { name: '4号玩家' })).toBeVisible()
  await page.screenshot({ path: 'artifacts/screenshots/manual-click-smoke-2026-07-16/10-player-4-detail.png', fullPage: false })
  await page.getByRole('button', { name: '关闭4号玩家' }).click()
  expect((await timeline(page)).length).toBe(beforeOpenSeat)

  await page.getByRole('button', { name: '日记' }).click()
  await expect(page.getByRole('dialog', { name: '日记' })).toBeVisible()
  await page.screenshot({ path: 'artifacts/screenshots/manual-click-smoke-2026-07-16/11-journal-open.png', fullPage: false })
  await page.getByRole('button', { name: /查看投票记录/ }).first().click()
  await expect(page.getByText('票型影响暂列结果；从白天工作台重新记录。')).toBeVisible()
  await page.screenshot({ path: 'artifacts/screenshots/manual-click-smoke-2026-07-16/12-journal-vote-detail.png', fullPage: false })
})
