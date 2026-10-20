import { expect, test, type Page } from '@playwright/test'
import { createEmptyGameSession, createPrototypeGameSession } from '../../src/features/game-session/data/createPrototypeSession'
import { gameSessionReducer } from '../../src/features/game-session/state/sessionReducer'
import { identityDealReceiptsStorageKey } from '../../src/services/identity-deal'

const sessionKey = 'botc-copilot-session-v1'

async function seed(page: Page, empty = false) {
  const session = empty ? createEmptyGameSession('2026-10-20T00:00:00Z') : gameSessionReducer(createPrototypeGameSession(), {
    type: 'confirm-identity-presentation', seatId: 1, actualRoleId: 'drunk', shownRoleId: 'investigator', confirmedAt: '2026-10-20T00:00:00Z',
  })
  await page.addInitScript(({ sessionKey, session }) => {
    if (!localStorage.getItem(sessionKey)) localStorage.setItem(sessionKey, JSON.stringify(session))
  }, { sessionKey, session })
  await page.route('**/api/ai/**', (route) => route.abort())
  await page.goto('/')
  await expect(page.locator('.dashboard')).toBeVisible()
  return session
}

for (const width of [390, 1440]) {
  for (const exit of ['已领取', '返回遮蔽', '关闭', 'Escape'] as const) {
    test(`玩家身份${exit}后先遮蔽，主持显式接回才显示其他身份 ${width}px`, async ({ page }, info) => {
      await page.setViewportSize({ width, height: 900 })
      const session = await seed(page)
      const before = await page.evaluate((key) => localStorage.getItem(key), sessionKey)
      await page.getByRole('button', { name: '发身份', exact: true }).click()
      await page.getByRole('button', { name: '打开单人展示', exact: true }).click()
      const privateView = page.getByRole('dialog', { name: '1号单人身份展示', exact: true })
      await expect(page.locator('.identity-deal__seat-grid')).toHaveCount(0)
      await expect(page.getByRole('button', { name: '关闭发身份', exact: true, includeHidden: true })).toHaveCount(0)
      await privateView.getByRole('button', { name: '显示身份', exact: true }).click()
      await expect(privateView.getByText('调查员', { exact: true })).toBeVisible()
      expect(await privateView.ariaSnapshot()).not.toContain('气球驾驶员')
      expect(await privateView.ariaSnapshot()).not.toContain('酒鬼')
      await page.keyboard.press('Tab')
      expect(await privateView.evaluate((element) => element.contains(document.activeElement))).toBe(true)
      if (exit === 'Escape') await page.keyboard.press('Escape')
      else await privateView.getByRole('button', { name: exit === '关闭' ? '关闭1号单人身份展示' : exit, exact: true }).click()
      const shield = page.getByRole('dialog', { name: '请交还设备给说书人', exact: true })
      await expect(shield).toBeVisible()
      await expect(page.locator('.identity-deal__seat-grid')).toHaveCount(0)
      await expect(shield.getByText('调查员', { exact: true })).toHaveCount(0)
      await expect(page.getByRole('button', { name: '关闭发身份', exact: true, includeHidden: true })).toHaveCount(0)
      await page.keyboard.press('Escape')
      await expect(shield).toBeVisible()
      await page.keyboard.press('Tab')
      expect(await shield.evaluate((element) => element.contains(document.activeElement))).toBe(true)
      expect(await shield.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(false)
      const resume = shield.getByRole('button', { name: '说书人继续发身份', exact: true })
      expect((await resume.boundingBox())!.height).toBeGreaterThanOrEqual(44)
      await page.screenshot({ path: info.outputPath(`identity-shield-${exit}-${width}.png`), animations: 'disabled' })
      await resume.click()
      const host = page.getByRole('dialog', { name: '发身份', exact: true })
      await expect(host.getByRole('button', { name: `1号 酒鬼 ${exit === '已领取' ? '已领取' : '未领取'}`, exact: true })).toBeVisible()
      if (exit === '已领取') {
        const receiptKey = identityDealReceiptsStorageKey(session.id)
        expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '{}')[1], receiptKey)).toBeTruthy()
      }
      expect(await page.evaluate((key) => localStorage.getItem(key), sessionKey)).toBe(before)
      await host.getByRole('button', { name: '打开单人展示', exact: true }).click()
      await expect(page.getByRole('dialog', { name: '1号单人身份展示', exact: true }).getByText('身份已遮住', { exact: true })).toBeVisible()
    })
  }

  test(`人数重复选择和缩放保留当前与暂时隐藏的昵称经验 ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 })
    await seed(page, true)
    const before = await page.evaluate((key) => localStorage.getItem(key), sessionKey)
    await page.getByRole('button', { name: '智能配板与调整', exact: true }).click()
    const setup = page.getByRole('dialog', { name: '智能配板与调整', exact: true })
    await setup.getByRole('textbox', { name: '1号昵称', exact: true }).fill('一号输入保留')
    await setup.getByRole('combobox', { name: '1号经验', exact: true }).selectOption('new')
    await setup.getByRole('textbox', { name: '12号昵称', exact: true }).fill('十二号临时隐藏')
    await setup.getByRole('combobox', { name: '12号经验', exact: true }).selectOption('veteran')
    await setup.getByRole('button', { name: '12人', exact: true }).click()
    await expect(setup.getByRole('textbox', { name: '1号昵称', exact: true })).toHaveValue('一号输入保留')
    await setup.getByRole('button', { name: '7人', exact: true }).click()
    await expect(setup.getByRole('textbox', { name: '1号昵称', exact: true })).toHaveValue('一号输入保留')
    await expect(setup.getByRole('combobox', { name: '1号经验', exact: true })).toHaveValue('new')
    await expect(setup.getByRole('textbox', { name: '12号昵称', exact: true })).toHaveCount(0)
    await setup.getByRole('button', { name: '12人', exact: true }).click()
    await expect(setup.getByRole('textbox', { name: '12号昵称', exact: true })).toHaveValue('十二号临时隐藏')
    await expect(setup.getByRole('combobox', { name: '12号经验', exact: true })).toHaveValue('veteran')
    await setup.getByRole('button', { name: '15人', exact: true }).click()
    await expect(setup.getByRole('textbox', { name: '15号昵称', exact: true })).toHaveValue('玩家15')
    expect(await setup.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(false)
    await page.screenshot({ path: info.outputPath(`roster-preserved-${width}.png`), animations: 'disabled' })
    await setup.getByRole('button', { name: '关闭智能配板与调整', exact: true }).click()
    expect(await page.evaluate((key) => localStorage.getItem(key), sessionKey)).toBe(before)
  })
}
