import { expect, test } from '@playwright/test'

test('a second tab is visibly and functionally read-only', async ({ page, context }) => {
  await page.goto('/')
  await expect(page.getByText(/另一个窗口正在主持这局/)).toHaveCount(0)

  const secondTab = await context.newPage()
  await secondTab.goto('/')

  await expect(secondTab.getByText(/另一个窗口正在主持这局/)).toBeVisible()
  await expect(secondTab.locator('.app-frame__interactive')).toHaveAttribute('inert', '')
  await expect(secondTab.locator('.app-frame__interactive')).toHaveCSS('pointer-events', 'none')
  await expect(secondTab.getByRole('button', { name: '本局' })).toHaveCount(0)
})
