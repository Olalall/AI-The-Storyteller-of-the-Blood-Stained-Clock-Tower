import { expect, type Page } from '@playwright/test'
import { createPrototypeGameSession, gameSessionStorageKey } from '../../../src/features/game-session/data/createPrototypeSession'

/** The shipped app opens the live dashboard, without the alternative main-branch StartGate. */
export async function completeEntryOnboarding(page: Page) {
  await expect(page.getByRole('main', { name: '本局', exact: true })).toBeVisible()
  await expect(page.getByRole('dialog', { name: '编辑保护', exact: true })).toHaveCount(0)
}

/** Install a synthetic mid-game in this test's isolated browser context, then verify the actual UI read it. */
export async function loadDemoSessionFromEntry(page: Page, mode: 'record' | 'grimoire' = 'record') {
  const session = { ...createPrototypeGameSession(), id: `e2e-isolated-prototype-${mode}`, hostingMode: mode }
  await page.evaluate(({ key, value }) => localStorage.setItem(key, value), {
    key: gameSessionStorageKey, value: JSON.stringify(session),
  })
  await page.reload()
  await completeEntryOnboarding(page)
  await expect.poll(() => page.evaluate(key => JSON.parse(localStorage.getItem(key) ?? '{}').id, gameSessionStorageKey)).toBe(session.id)
  await expect(page.getByRole('heading', { name: /瓦釜雷鸣/ })).toBeVisible()
}

export async function openSetupFromEntry(page: Page) {
  await completeEntryOnboarding(page)
  await page.getByRole('button', { name: '智能配板与调整', exact: true }).click()
  await expect(page.getByRole('dialog', { name: '智能配板与调整', exact: true })).toBeVisible()
}
