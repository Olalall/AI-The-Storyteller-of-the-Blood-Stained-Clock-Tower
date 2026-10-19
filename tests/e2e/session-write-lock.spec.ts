import { expect, test } from '@playwright/test'
import { loadDemoSessionFromEntry } from './helpers/entry-onboarding'

test('a second tab is visibly and functionally read-only', async ({ page, context }) => {
  await page.goto('/')
  await loadDemoSessionFromEntry(page)
  await expect(page.getByRole('dialog', { name: '编辑保护', exact: true })).toHaveCount(0)
  const before = await page.evaluate(() => localStorage.getItem('botc-copilot-session-v1'))
  const secondTab = await context.newPage()
  await secondTab.goto('/')
  const protection = secondTab.getByRole('dialog', { name: '编辑保护', exact: true })
  await expect(protection).toBeVisible()
  await expect(protection).toContainText('另一页面正在编辑')
  await expect(protection.getByRole('button', { name: '导出此页副本', exact: true })).toBeVisible()
  // 真正点到底下的主持控件应被编辑保护遮罩挡住，而不是只检查某个旧CSS类。
  await expect(secondTab.locator('.dashboard__phase-button').first().click({ timeout: 500 })).rejects.toThrow()
  expect(await secondTab.evaluate(() => localStorage.getItem('botc-copilot-session-v1'))).toBe(before)
  await expect(secondTab.getByRole('main', { name: '本局', exact: true })).toHaveCount(0)
})
