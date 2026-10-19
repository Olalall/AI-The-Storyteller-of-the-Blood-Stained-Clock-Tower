import { expect, test } from '@playwright/test'
import { fillCurrentWakeInputs } from '../helpers/nightInputs'
import { createPrototypeGameSession } from '../../src/features/game-session/data/createPrototypeSession'

async function reset(page: import('@playwright/test').Page) {
  await page.setViewportSize({ width: 720, height: 900 })
  const session = createPrototypeGameSession()
  const opening = session.timeline.find((entry) => entry.kind === 'setup_confirmed')
  if (!opening || opening.kind !== 'setup_confirmed') throw new Error('Missing synthetic opening fixture')
  opening.setup.draft.setupRuleSelections = [
    { ruleId: 'balloonist-outsider', choiceId: 'no-extra-outsider' },
    { ruleId: 'fanggu-outsider', choiceId: 'add-outsider' },
  ]
  await page.addInitScript((fixture) => {
    if (!localStorage.getItem('botc-copilot-session-v1')) localStorage.setItem('botc-copilot-session-v1', JSON.stringify(fixture))
  }, session)
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /瓦釜雷鸣/ })).toBeVisible()
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
  await expect(page.getByText('当前页面使用本地候选，未连接真实模型。')).toBeVisible()
  await expect(page.getByLabel('模型名字')).toHaveCount(0)
  await expect(page.getByLabel('API KEY')).toHaveCount(0)
  await page.getByRole('button', { name: '检查配置（不调用模型）' }).click()
  await expect(page.getByRole('button', { name: '保存设置' })).toHaveCount(0)
  await page.getByRole('button', { name: '关闭AI API 设置' }).click()
  expect((await timeline(page)).length).toBe(beforeOpening)

  await page.getByRole('button', { name: '主持资料', exact: true }).click()
  await expect(page.getByRole('heading', { name: '主持资料' })).toBeVisible()
  await page.getByRole('button', { name: '编辑文案' }).click()
  await page.getByLabel('开场白文案').fill('请确认座位，准备开始。')
  await page.getByRole('button', { name: '保存文案' }).click()
  await page.getByRole('button', { name: '大字展示' }).click()
  await expect(page.getByLabel('开场白大字展示')).toContainText('请确认座位，准备开始。')
  await page.screenshot({ path: 'artifacts/screenshots/manual-click-smoke-2026-07-16/02-opening-display.png', fullPage: false })
  await page.getByRole('button', { name: '退出展示' }).click()
  await page.getByRole('button', { name: '关闭主持资料' }).click()
  expect((await timeline(page)).length).toBe(beforeOpening)

  const beforeSetup = (await timeline(page)).filter((entry: { kind: string }) => entry.kind === 'setup_changed').length
  await page.getByRole('button', { name: '智能配板与调整' }).click()
  await expect(page.getByRole('heading', { name: '智能配板与调整' })).toBeVisible()
  await page.locator('.setup-panel__advice-entry').click()
  await expect(page.getByRole('heading', { name: '选择配板方案' })).toBeVisible()
  await expect(page.locator('.setup-candidate')).toHaveCount(3)
  await page.screenshot({ path: 'artifacts/screenshots/manual-click-smoke-2026-07-16/03-setup-advice.png', fullPage: false })
  await page.locator('.setup-candidate').filter({ has: page.getByRole('heading', { name: '瓦釜雷鸣 · 均衡', exact: true }) }).getByRole('button', { name: '选择这套配板' }).click()
  await expect(page.getByRole('button', { name: '确认调整' })).toBeDisabled()
  expect((await timeline(page)).filter((entry: { kind: string }) => entry.kind === 'setup_changed').length).toBe(beforeSetup)
  await page.getByRole('button', { name: '关闭智能配板与调整' }).click()
  await page.reload()
  await page.getByRole('button', { name: '智能配板与调整' }).click()
  await swapFirstTwoDraftSeats(page)
  await page.getByRole('button', { name: '确认调整' }).click()
  await expect.poll(async () => (await timeline(page)).filter((entry: { kind: string }) => entry.kind === 'setup_changed').length).toBeGreaterThan(beforeSetup)
  await page.screenshot({ path: 'artifacts/screenshots/manual-click-smoke-2026-07-16/04-setup-confirmed.png', fullPage: false })
  const closeSetup = page.getByRole('button', { name: '关闭智能配板与调整' })
  if (await closeSetup.isVisible().catch(() => false)) await closeSetup.click()
  await expect(page.getByRole('button', { name: '进入夜晚' })).toBeVisible()

  const beforeNight = (await timeline(page)).filter((entry: { kind: string }) => entry.kind === 'night_action').length
  const nightBeforeEntry = await page.evaluate(() => {
    const session = JSON.parse(localStorage.getItem('botc-copilot-session-v1')!)
    const run = session.nightRuns[session.activeNightRunId]
    return { label: session.phaseSegments.find((segment: { id: string }) => segment.id === run.phaseSegmentId).label, scriptId: session.scriptId }
  })
  await page.getByRole('button', { name: '进入夜晚' }).click()
  await expect(page.getByRole('heading', { name: nightBeforeEntry.label, exact: true })).toBeVisible()
  const displayedScript = await page.evaluate(() => {
    const session = JSON.parse(localStorage.getItem('botc-copilot-session-v1')!)
    return session.nightRuns[session.activeNightRunId].scriptId
  })
  expect(displayedScript).toBe(nightBeforeEntry.scriptId)
  await fillCurrentWakeInputs(page)
  await page.screenshot({ path: 'artifacts/screenshots/manual-click-smoke-2026-07-16/05-night-before-confirm.png', fullPage: false })
  await page.getByRole('button', { name: '确认本项' }).click()
  await expect.poll(async () => (await timeline(page)).filter((entry: { kind: string }) => entry.kind === 'night_action').length).toBe(beforeNight + 1)
  const confirmedSummary = (await timeline(page)).filter((entry: { kind: string }) => entry.kind === 'night_action').at(-1).summary
  await page.getByRole('button', { name: '返回本局', exact: true }).click()
  await expect(page.getByText(confirmedSummary, { exact: true })).toBeVisible()
  await page.screenshot({ path: 'artifacts/screenshots/manual-click-smoke-2026-07-16/06-dashboard-after-night.png', fullPage: false })

  await page.getByRole('button', { name: '进入白天' }).click()
  await expect(page.getByRole('heading', { name: nightBeforeEntry.label.replace('夜', '天'), exact: true })).toBeVisible()
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
  await page.getByRole('button', { name: '下一步：记录举手', exact: true }).click()
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
  await expect(page.getByText('从白天工作台的“票型记录与更正”更正或撤销；原票型保留。')).toBeVisible()
  await page.screenshot({ path: 'artifacts/screenshots/manual-click-smoke-2026-07-16/12-journal-vote-detail.png', fullPage: false })
})
