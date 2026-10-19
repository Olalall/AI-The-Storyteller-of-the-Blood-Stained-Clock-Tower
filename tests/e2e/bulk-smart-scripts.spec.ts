import { expect, test, type Page } from '@playwright/test'
import { smartScriptPacks } from '../../src/domain/scripts/allPacks'

const sessionStorageKey = 'botc-copilot-session-v1'
const archiveRuntimeSettingsStorageKey = 'botc-copilot-archive-runtime-settings-v1'

const allScriptIds = smartScriptPacks.map((pack) => pack.scriptId)

function envNumber(name: string, fallback: number) {
  const raw = process.env[name]
  if (!raw) return fallback
  const value = Number(raw)
  return Number.isFinite(value) && value >= 0 ? Math.floor(value) : fallback
}

function selectedScriptIds() {
  const explicit = process.env.BOTC_BULK_SCRIPT_IDS?.split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  if (explicit?.length) return explicit

  const offset = envNumber('BOTC_BULK_SCRIPT_OFFSET', 0)
  const limitRaw = process.env.BOTC_BULK_SCRIPT_LIMIT
  const limit = limitRaw === 'all' ? allScriptIds.length : envNumber('BOTC_BULK_SCRIPT_LIMIT', 90)
  return allScriptIds.slice(offset, offset + limit)
}

async function openBlankSetup(page: Page, runId: string) {
  await page.addInitScript(({ storageKey, id }) => {
    if (window.localStorage.getItem(storageKey)) return
    window.localStorage.setItem(storageKey, JSON.stringify({
      schemaVersion: 1,
      id,
      scriptId: 'catfishing',
      playerCount: 0,
      knowledgeVersion: 'e2e/bulk-smart-script',
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
  }, { storageKey: sessionStorageKey, id: `session-${runId}` })
  await page.goto('/')
  await page.getByRole('button', { name: '智能配板与调整' }).click()
  await expect(page.getByRole('heading', { name: '智能配板与调整' })).toBeVisible()
}

async function setHttpRuntimeIfRequested(page: Page) {
  if (process.env.BOTC_BULK_USE_HTTP_AI !== '1') return
  const baseUrl = process.env.BOTC_BULK_BACKEND_URL ?? 'http://127.0.0.1:8787'
  const timeoutMs = envNumber('BOTC_BULK_HTTP_TIMEOUT_MS', 30000)
  await page.evaluate(({ storageKey, settings }) => {
    window.localStorage.setItem(storageKey, JSON.stringify(settings))
  }, {
    storageKey: archiveRuntimeSettingsStorageKey,
    settings: { mode: 'http', baseUrl, timeoutMs },
  })
}

test.skip(process.env.BOTC_RUN_BULK_SCRIPT_SMOKE !== '1', '按需运行：npm run smoke:smart-scripts:browser')

test('bulk smart scripts can be selected, drafted, confirmed and sampled in night workflow', async ({ browser }) => {
  const scriptIds = selectedScriptIds()
  const nightSampleLimit = envNumber('BOTC_BULK_NIGHT_SAMPLE_LIMIT', 12)
  test.setTimeout(Math.max(120_000, scriptIds.length * 12_000))
  const errors: string[] = []

  for (const [index, scriptId] of scriptIds.entries()) {
    await test.step(`${index + 1}/${scriptIds.length} ${scriptId}`, async () => {
      const context = await browser.newContext({ viewport: { width: 900, height: 900 } })
      try {
        const page = await context.newPage()
        page.on('pageerror', (error) => errors.push(error.message))
        if (process.env.BOTC_BULK_USE_HTTP_AI !== '1') {
          await page.route('**/api/ai/**', (route) => route.abort())
          await page.route('**/api/ai-settings/live-test', (route) => route.abort())
        }
        await openBlankSetup(page, `bulk-${index}-${scriptId}`)
        await setHttpRuntimeIfRequested(page)

        const scriptSelect = page.getByLabel('开局板子')
        await expect(scriptSelect.locator('option')).toHaveCount(allScriptIds.length)
        await scriptSelect.selectOption(scriptId)
        await expect(scriptSelect).toHaveValue(scriptId)

        await page.getByRole('button', { name: '12人' }).click()
        await page.getByRole('button', { name: '开始配板' }).click()

        await expect(page.locator('.setup-panel__candidates')).toBeVisible()
        await expect(page.locator('.setup-candidate').first()).toBeVisible()
        expect(await page.locator('.setup-candidate').count()).toBeGreaterThan(0)

        const firstCandidate = page.locator('.setup-candidate').first()
        await expect(firstCandidate.locator('.setup-candidate__roles li')).toHaveCount(12)
        await firstCandidate.getByRole('button', { name: '选择组合', exact: true }).click()
        await expect(page.locator('.setup-panel__draft')).toBeVisible()
        await expect(page.locator('.setup-seat-grid button')).toHaveCount(12)

        const sessionAfterDraft = await page.evaluate((storageKey) => JSON.parse(window.localStorage.getItem(storageKey) ?? '{}'), sessionStorageKey)
        expect(sessionAfterDraft.scriptId).toBe(scriptId)
        expect(sessionAfterDraft.playerCount).toBe(12)
        expect(Object.keys(sessionAfterDraft.seats)).toHaveLength(12)

        await page.locator('.setup-panel__footer .ui-button--primary').click()
        await expect(page.locator('.setup-panel')).toBeHidden()
        await expect(page.getByRole('button', { name: '进入夜晚' })).toBeVisible()

        if (index < nightSampleLimit) {
          await page.getByRole('button', { name: '进入夜晚' }).click()
          await expect(page.getByRole('region', { name: '夜间角色预览' })).toBeVisible()
          await expect(page.getByRole('heading', { name: '本项记录' })).toBeVisible()
          await expect(page.getByRole('button', { name: /AI推荐|重新推荐|推荐中/ })).toBeVisible()
          await page.screenshot({ path: test.info().outputPath(`night-${scriptId}.png`), animations: 'disabled' })
        }
      } finally {
        await context.close()
      }
    })
  }
  expect(errors).toEqual([])
})
