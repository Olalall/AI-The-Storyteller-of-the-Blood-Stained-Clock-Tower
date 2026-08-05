import { expect, test, type Page } from '@playwright/test'

const sessionStorageKey = 'botc-copilot-session-v1'
const archiveRuntimeSettingsStorageKey = 'botc-copilot-archive-runtime-settings-v1'



async function openBlankSetup(page: Page) {
  await page.goto('/')
  await page.evaluate(({ sessionKey, runtimeKey }) => {
    window.localStorage.setItem(runtimeKey, JSON.stringify({
      mode: 'http',
      baseUrl: 'http://127.0.0.1:8787',
      timeoutMs: 180000,
    }))
    window.localStorage.setItem(sessionKey, JSON.stringify({
      schemaVersion: 1,
      id: 'session-real-ai-smoke',
      scriptId: 'catfishing',
      playerCount: 0,
      knowledgeVersion: 'e2e/real-ai',
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
  }, { sessionKey: sessionStorageKey, runtimeKey: archiveRuntimeSettingsStorageKey })
  await page.reload()
  await page.getByRole('button', { name: 'AI配板与调整' }).click()
  await expect(page.getByRole('heading', { name: 'AI配板与调整' })).toBeVisible()
}

test.skip(process.env.BOTC_RUN_REAL_AI_SMOKE !== '1', 'requires a running backend with a real AI key')

test('real AI provider is used by setup advice and night settlement from visible UI', async ({ page }) => {
  test.setTimeout(300_000)
  const failedRequests: string[] = []
  page.on('requestfailed', (request) => {
    const failure = request.failure()
    if (request.url().includes('/api/ai/')) failedRequests.push(`${request.url()} ${failure?.errorText ?? 'request failed'}`)
  })
  await page.setViewportSize({ width: 900, height: 900 })
  await openBlankSetup(page)

  await page.locator('.setup-start__script-row select').selectOption('catfishing')
  await page.locator('.setup-start__counts button').filter({ hasText: '12' }).click()
  await page.locator('.setup-start__footer button').click()
  await expect(page.locator('.setup-candidate').first()).toBeVisible()

  const setupResponsePromise = page.waitForResponse((response) => response.url().includes('/api/ai/setup-advice'), { timeout: 180_000 })
  await page.locator('.setup-panel__candidates button').filter({ hasText: 'AI推荐' }).click()
  const setupResponse = await setupResponsePromise
  expect(failedRequests).toEqual([])
  expect(setupResponse.ok()).toBe(true)
  const setupBody = await setupResponse.json() as { accepted?: boolean; data?: { draft?: { provider?: string } } }
  console.log(`setup advice response: ${setupResponse.status()} ${setupResponse.url()} provider=${setupBody.data?.draft?.provider ?? 'missing'}`)
  expect(setupBody.accepted).toBe(true)
  expect(setupBody.data?.draft?.provider).toBe('openai-compatible')

  await page.locator('.setup-candidate').first().getByRole('button', { name: '采用为草稿' }).click()
  await expect(page.locator('.setup-panel__draft')).toBeVisible()
  await page.locator('.setup-panel__footer .ui-button--primary').click()
  await expect(page.locator('.setup-panel')).toBeHidden()

  await page.getByRole('button', { name: '进入夜晚' }).click()
  await expect(page.getByRole('heading', { name: '本项记录' })).toBeVisible()

  const targetButtons = page.locator('.wake-recorder .seat-grid button')
  if (await targetButtons.count()) await targetButtons.first().click()
  const choiceChips = page.locator('.wake-recorder .choice-chip')
  if (await choiceChips.count()) await choiceChips.first().click()

  const nightResponsePromise = page.waitForResponse((response) => response.url().includes('/api/ai/night-settlement-advice'), { timeout: 180_000 })
  await page.getByRole('button', { name: 'AI推荐' }).click()
  const nightResponse = await nightResponsePromise
  expect(failedRequests).toEqual([])
  expect(nightResponse.ok()).toBe(true)
  const nightBody = await nightResponse.json() as { accepted?: boolean; data?: { draft?: { provider?: string; status?: string } } }
  expect(nightBody.accepted).toBe(true)
  expect(nightBody.data?.draft?.provider).toBe('openai-compatible')
  expect(['answer', 'needs_input']).toContain(nightBody.data?.draft?.status)
})
