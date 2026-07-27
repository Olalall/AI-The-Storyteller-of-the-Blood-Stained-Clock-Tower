import { expect, test } from '@playwright/test'

const firstBatchScriptIds = [
  'trouble-brewing',
  'bad-moon-rising',
  'sects-and-violets',
  'one-in-one-out',
  'a-grimm-chorus',
  'hide-and-seek',
  'lunar-eclipse',
  'punchy',
  'quick-maths',
  'devout-theists',
] as const

async function openBlankSetup(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.evaluate(() => {
    window.localStorage.setItem('botc-copilot-session-v1', JSON.stringify({
      schemaVersion: 1,
      id: 'session-e2e-batch-01',
      scriptId: 'catfishing',
      playerCount: 0,
      knowledgeVersion: 'e2e/blank',
      scriptRoles: [],
      seats: {},
      initialPlayerStates: {},
      phaseSegments: [],
      timeline: [],
      dayVoteDraft: null,
      dayActionDraft: null,
      setupDraft: null,
      nightRuns: {},
      activeNightRunId: null,
    }))
  })
  await page.reload()
  await page.getByRole('button', { name: 'AI配板与调整' }).click()
  await expect(page.getByRole('heading', { name: 'AI配板与调整' })).toBeVisible()
  await expect(page.getByText('选择人数')).toBeVisible()
}

test('first batch scripts can all start a 12-player setup from the visible UI', async ({ page }) => {
  test.setTimeout(60_000)
  await page.setViewportSize({ width: 900, height: 900 })

  for (const scriptId of firstBatchScriptIds) {
    await test.step(scriptId, async () => {
      await openBlankSetup(page)

      const scriptSelect = page.getByLabel('开局板子')
      await scriptSelect.selectOption(scriptId)
      await expect(scriptSelect).toHaveValue(scriptId)

      await page.getByRole('button', { name: '12人' }).click()
      await page.getByRole('button', { name: '开始配板' }).click()

      await expect.poll(async () => {
        const setupShell = JSON.parse(await page.evaluate(() => window.localStorage.getItem('botc-copilot-session-v1') ?? '{}'))
        return setupShell.playerCount
      }).toBe(12)
      await expect(page.locator('.setup-panel__candidates')).toBeVisible()
      await expect(page.locator('.setup-candidate')).toHaveCount(3)

      const setupShell = await page.evaluate(() => JSON.parse(window.localStorage.getItem('botc-copilot-session-v1') ?? '{}'))
      expect(setupShell.scriptId).toBe(scriptId)
      expect(setupShell.playerCount).toBe(12)
      expect(Object.keys(setupShell.seats)).toHaveLength(12)
      expect(setupShell.timeline).toEqual([])
      expect(setupShell.phaseSegments).toEqual([])
    })
  }
})
