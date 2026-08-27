import { expect, test } from '@playwright/test'

import { loadDemoSessionFromEntry } from './helpers/entry-onboarding'

test('mobile identity deal keeps the current handoff ahead of the seat list', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()
  await loadDemoSessionFromEntry(page)

  const archiveEntry = page.getByRole('button', { name: '本局', exact: true })
  if (await archiveEntry.isVisible().catch(() => false)) await archiveEntry.click()
  await page.locator('.dashboard__more-tools > summary').click()
  await page.getByRole('button', { name: '发身份' }).click()

  const current = page.getByLabel('当前领取')
  const seats = page.getByLabel('座位领取状态')
  const primaryAction = page.getByRole('button', { name: '打开单人展示' })
  await expect(current).toBeVisible()
  await expect(seats).toBeVisible()
  await expect(primaryAction).toBeVisible()

  const [currentBox, seatsBox, actionBox, heroBox, firstSeatBox] = await Promise.all([
    current.boundingBox(),
    seats.boundingBox(),
    primaryAction.boundingBox(),
    page.locator('.identity-deal__hero').boundingBox(),
    page.locator('.identity-deal__seat-grid button').first().boundingBox(),
  ])

  expect(currentBox).not.toBeNull()
  expect(seatsBox).not.toBeNull()
  expect(actionBox).not.toBeNull()
  expect(heroBox).not.toBeNull()
  expect(firstSeatBox).not.toBeNull()
  expect(currentBox!.y).toBeLessThan(seatsBox!.y)
  expect(actionBox!.y + actionBox!.height).toBeLessThanOrEqual(844)
  expect(heroBox!.height).toBeLessThanOrEqual(120)
  expect(firstSeatBox!.height).toBeLessThanOrEqual(96)
  expect(firstSeatBox!.height).toBeGreaterThanOrEqual(44)
  await page.screenshot({ path: 'artifacts/screenshots/identity-deal-mobile-390.png', fullPage: false })

  await page.setViewportSize({ width: 1180, height: 900 })
  const [desktopCurrentBox, desktopSeatsBox] = await Promise.all([
    current.boundingBox(),
    seats.boundingBox(),
  ])
  expect(desktopCurrentBox).not.toBeNull()
  expect(desktopSeatsBox).not.toBeNull()
  expect(desktopCurrentBox!.x).toBeGreaterThan(desktopSeatsBox!.x)
  expect(Math.abs(desktopCurrentBox!.y - desktopSeatsBox!.y)).toBeLessThanOrEqual(2)
})
