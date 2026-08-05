import { expect, test, type Page } from '@playwright/test'

const layouts = [
  { name: 'split-720', width: 720, height: 900, rail: false },
  { name: 'pad-1024', width: 1024, height: 768, rail: true },
  { name: 'pc-1440', width: 1440, height: 900, rail: true },
]


/** 主持台是默认视图；首页（配板/发身份/玩家状态等）现在是轨道右端「本局」打开的档案层。 */
async function openArchive(page: import('@playwright/test').Page) {
  const back = page.getByRole('button', { name: '本局', exact: true })
  if (await back.isVisible().catch(() => false)) await back.click()
  await expect(page.getByRole('heading', { name: /瓦釜雷鸣/ })).toBeVisible()
}

async function reset(page: Page) {
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()
}

async function expectNoOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(1)
}

test('three responsive shells keep the dashboard and workbenches inside the viewport', async ({ page }) => {
  for (const layout of layouts) {
    await page.setViewportSize({ width: layout.width, height: layout.height })
    await reset(page)
    await openArchive(page)
    await expectNoOverflow(page)
    await page.screenshot({ path: `artifacts/screenshots/${layout.name}-dashboard-shell.png` })

    await openArchive(page)
    await page.getByRole('button', { name: '进入夜晚' }).click()
    await expect(page.getByRole('heading', { name: /第3夜/ })).toBeVisible()
    if (layout.rail) await expect(page.getByLabel('本局速览')).toBeVisible()
    else await expect(page.getByLabel('本局速览')).toBeHidden()
    await expectNoOverflow(page)
    await page.screenshot({ path: `artifacts/screenshots/${layout.name}-night-shell.png` })
  }
})

test('Pad rail appears automatically without product navigation controls', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 })
  await reset(page)
  await openArchive(page)
  await page.getByRole('button', { name: '进入白天' }).click()
  await expect(page.getByLabel('本局速览')).toBeVisible()
  await expect(page.getByLabel('原型页面')).toHaveCount(0)
  await expect(page.getByText('前端原型')).toHaveCount(0)
  await expectNoOverflow(page)
  await page.screenshot({ path: 'artifacts/screenshots/pad-1024-day-rail.png' })
})

test('Pad rail opens the shared player status page without writing until confirmation', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 })
  await reset(page)
  await openArchive(page)
  await page.getByRole('button', { name: '进入夜晚' }).click()
  const before = await page.evaluate(() => JSON.parse(window.localStorage.getItem('botc-copilot-session-v1') ?? '{}').timeline.length)

  const railSeat = page.getByRole('button', { name: /查看1号/ })
  await expect(railSeat).toBeVisible()
  await railSeat.click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toHaveAttribute('data-presentation', 'page')
  await expect(page.getByRole('heading', { name: '1号玩家' })).toBeVisible()
  const opened = await page.evaluate(() => JSON.parse(window.localStorage.getItem('botc-copilot-session-v1') ?? '{}').timeline.length)
  expect(opened).toBe(before)

  await page.getByRole('button', { name: '中毒' }).click()
  await page.getByRole('button', { name: '确认状态' }).click()
  await expect.poll(async () => page.evaluate(() => JSON.parse(window.localStorage.getItem('botc-copilot-session-v1') ?? '{}').timeline.length)).toBe(before + 1)
  await page.getByRole('button', { name: '关闭1号玩家' }).click()
  await expect(railSeat).toHaveAccessibleName(/中毒/)
  await page.screenshot({ path: 'artifacts/screenshots/pad-1024-rail-player-status.png' })
})

test('compact dashboard cards project role, nickname and status without changing the session', async ({ page }) => {
  await page.setViewportSize({ width: 498, height: 974 })
  await reset(page)
  // 「当前阶段」卡已被常驻阶段轨道取代。
  await expect(page.getByRole('navigation', { name: '主持阶段' }).locator('.ui-phase-node--open')).toContainText('第3夜')
  await openArchive(page)
  await expect(page.getByText('12人 · 存活12 · 死亡0')).toBeVisible()
  await expect(page.getByRole('button', { name: /倒计时/ })).toBeVisible()
  await expect(page.getByText('私聊 15分 → 公聊 10分')).not.toBeVisible()
  await expect(page.getByRole('button', { name: '开场白', exact: true })).toBeVisible()
  await expect(page.getByText('中毒', { exact: true })).toBeVisible()
  const cards = page.locator('.dashboard-player-seat')
  await expect(cards).toHaveCount(12)
  await expect(cards.first()).toContainText('1号')
  await expect(cards.first()).toContainText('酒鬼')
  await expect(cards.first()).toContainText('玩家1')
  await expect(cards.first()).toHaveAccessibleName(/查看1号.*玩家1.*酒鬼.*存活/)
  const cardWidths = await cards.evaluateAll((items) => items.map((item) => ({ width: item.clientWidth, scrollWidth: item.scrollWidth })))
  expect(cardWidths.every(({ width, scrollWidth }) => scrollWidth <= width)).toBe(true)
  await expectNoOverflow(page)
  await page.screenshot({ path: 'artifacts/screenshots/phone-498-dashboard-player-cards.png', fullPage: true })

  const before = await page.evaluate(() => JSON.parse(window.localStorage.getItem('botc-copilot-session-v1') ?? '{}').timeline.length)
  await page.getByRole('button', { name: '切换板子' }).click()
  await expect(page.getByRole('heading', { name: '切换板子' })).toBeVisible()
  await expect(page.getByText('当前对局')).toBeVisible()
  await expect(page.getByText('JSON、夜序与规则知识包需要一起核对；未核对的板子不能开局或用于智能配板。')).toBeVisible()
  await page.getByRole('button', { name: '关闭切换板子' }).click()
  const after = await page.evaluate(() => JSON.parse(window.localStorage.getItem('botc-copilot-session-v1') ?? '{}').timeline.length)
  expect(after).toBe(before)
})

test('setup distinguishes replacement, nickname editing, and seat swapping', async ({ page }) => {
  await page.setViewportSize({ width: 720, height: 900 })
  await reset(page)
  await openArchive(page)
  await page.getByRole('button', { name: 'AI配板与调整' }).click()
  const setupPage = page.getByRole('dialog')
  await expect(setupPage).toHaveAttribute('data-presentation', 'page')
  await expect(setupPage).toHaveCSS('background-color', 'rgb(9, 13, 18)')
  await setupPage.locator('.sheet-body').evaluate((element) => element.scrollTo({ top: 0 }))
  await page.screenshot({ path: 'artifacts/screenshots/split-720-setup-viewport.png' })

  await page.getByRole('button', { name: '更换角色' }).click()
  await page.getByRole('button', { name: '1号 酒鬼' }).click()
  await expect(page.getByRole('heading', { name: '更换1号角色' })).toBeVisible()
  await page.getByRole('button', { name: '祖母' }).click()
  await expect(page.getByLabel('角色替换预览').getByText('酒鬼')).toBeVisible()
  await expect(page.getByLabel('角色替换预览').getByText('将替换为')).toBeVisible()
  await page.getByRole('button', { name: '应用替换' }).click()
  await expect(page.getByRole('button', { name: '1号 祖母' })).toBeVisible()

  await page.getByRole('button', { name: '修改昵称' }).click()
  await page.getByRole('button', { name: '1号 祖母' }).click()
  await page.locator('input[aria-label="1号昵称"]').fill('阿杰')
  await page.getByRole('button', { name: '保存昵称' }).click()
  await expect.poll(async () => page.evaluate(() => JSON.parse(window.localStorage.getItem('botc-copilot-session-v1') ?? '{}').seats['1'].nickname)).toBe('阿杰')

  await page.getByRole('button', { name: '交换角色' }).click()
  await page.getByRole('button', { name: '1号 祖母' }).click()
  await page.getByRole('button', { name: '2号 气球驾驶员' }).click()
  await expect(page.getByText('已交换 1号与2号角色')).toBeVisible()
})

