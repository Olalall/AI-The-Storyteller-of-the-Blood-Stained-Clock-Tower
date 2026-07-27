import { expect, test } from '@playwright/test'

async function enterNight(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: /\u8fdb\u5165\u591c\u665a/ }).click()
  await expect(page.getByRole('heading', { name: /\u7b2c\d+\u591c/ })).toBeVisible()
}

const viewports = [
  { name: 'phone-390', width: 390, height: 844 },
  { name: 'split-480', width: 480, height: 800 },
  { name: 'split-720', width: 720, height: 900 },
  { name: 'split-828', width: 828, height: 900 },
  { name: 'pad-1280', width: 1280, height: 800 },
]

for (const viewport of viewports) {
  test(`${viewport.name} keeps the night workflow usable`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/')
    await page.evaluate(() => window.localStorage.clear())
    await page.reload()
    await enterNight(page)

    await expect(page.getByRole('region', { name: '\u591c\u95f4\u89d2\u8272\u9884\u89c8' })).toBeVisible()
    await expect(page.getByRole('heading', { name: '\u672c\u9879\u8bb0\u5f55' })).toBeVisible()
    await expect(page.getByRole('button', { name: /\u786e\u8ba4\u672c\u9879|\u8ffd\u52a0\u66f4\u6b63|\u8fdb\u5165\u4e0b\u4e00\u4f4d/ })).toBeVisible()
    await expect(page.locator('body')).not.toHaveCSS('overflow-x', 'scroll')
  })
}

test('selected outcome can be toggled off before confirmation', async ({ page }) => {
  await page.setViewportSize({ width: 487, height: 912 })
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()
  await enterNight(page)

  await page.getByRole('button', { name: '\u9009\u62e93\u53f7\u73a9\u5bb6' }).click()
  await page.getByRole('button', { name: '\u8c03\u67e5\u5458' }).click()
  const hold = page.getByRole('button', { name: '\u672a\u53d7\u5f71\u54cd' })
  await expect(hold).toBeVisible()
  await hold.click()
  await expect(hold).toHaveAttribute('aria-pressed', 'true')
  await hold.click()
  await expect(hold).toHaveAttribute('aria-pressed', 'false')
})

test('AI result suggestion is available for a generic role', async ({ page }) => {
  await page.setViewportSize({ width: 487, height: 912 })
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()
  await enterNight(page)

  await page.getByRole('button', { name: '\u9009\u62e93\u53f7\u73a9\u5bb6' }).click()
  await page.getByRole('button', { name: '\u8c03\u67e5\u5458' }).click()
  await expect(page.getByRole('button', { name: '\u0041\u0049\u63a8\u8350' })).toBeVisible()
})
