import type { Page } from '@playwright/test'

export async function openDashboardTools(page: Page) {
  const tools = page.locator('.dashboard__more-tools')
  if (!await tools.evaluate((element) => (element as HTMLDetailsElement).open)) {
    await tools.locator('summary').click()
  }
}

export async function enterDashboardPhase(page: Page, phase: '夜晚' | '白天') {
  await openDashboardTools(page)
  await page.getByRole('button', { name: `进入${phase}` }).click()
}
