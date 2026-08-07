import { expect, test, type Page } from '@playwright/test'
import { smartScriptPacks } from '../../src/domain/scripts/catalog'

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




/** 首夜前两张是系统步骤卡（爪牙信息 / 恶魔信息）：勾满清单、选满伪装后确认，才轮到角色卡。 */
async function settleFirstNightSystemSteps(page: Page) {
  for (let card = 0; card < 2; card += 1) {
    const recorder = page.locator('.wake-recorder')
    if (!(await recorder.locator('.system-step-check').count().catch(() => 0))) return

    const checks = recorder.locator('.system-step-check input[type="checkbox"]')
    for (let i = 0; i < await checks.count(); i += 1) {
      const box = checks.nth(i)
      if (!(await box.isChecked().catch(() => true))) await box.check()
    }

    // 恶魔信息卡要选满三张伪装；爪牙信息卡没有 chip，循环自然空转。
    for (let guard = 0; guard < 6; guard += 1) {
      const legend = (await recorder.locator('.choice-legend').first().textContent().catch(() => '')) ?? ''
      const counts = /(\d+)\s*\/\s*(\d+)/.exec(legend)
      if (counts && Number(counts[1]) >= Number(counts[2])) break
      const free = recorder.locator('.choice-chips button:not([disabled])[aria-pressed="false"]')
      if (!(await free.count().catch(() => 0))) break
      await free.first().click()
    }

    const chosen = await recorder.locator('.outcome-grid button[aria-pressed="true"]').count().catch(() => 0)
    const outcome = recorder.locator('.outcome-grid button:not([disabled])')
    if (!chosen && await outcome.count().catch(() => 0)) await outcome.first().click()

    const next = page.getByRole('button', { name: '确认并下一位' })
    if (await next.isEnabled().catch(() => false)) await next.click()
    await page.waitForTimeout(150)
  }
}

async function openBlankSetup(page: Page, runId: string) {
  await page.goto('/')
  await page.evaluate(({ storageKey, id }) => {
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
  await page.reload()
  await page.getByRole('button', { name: 'AI配板与调整' }).click()
  await expect(page.getByRole('heading', { name: 'AI配板与调整' })).toBeVisible()
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

test('bulk smart scripts can be selected, drafted, confirmed and sampled in night workflow', async ({ page }) => {
  const scriptIds = selectedScriptIds()
  const nightSampleLimit = envNumber('BOTC_BULK_NIGHT_SAMPLE_LIMIT', 12)
  test.setTimeout(Math.max(120_000, scriptIds.length * 12_000))
  await page.setViewportSize({ width: 900, height: 900 })

  for (const [index, scriptId] of scriptIds.entries()) {
    await test.step(`${index + 1}/${scriptIds.length} ${scriptId}`, async () => {
      await openBlankSetup(page, `bulk-${index}-${scriptId}`)
      await setHttpRuntimeIfRequested(page)

      const scriptSelect = page.getByLabel('开局板子')
      await scriptSelect.selectOption(scriptId)
      await expect(scriptSelect).toHaveValue(scriptId)

      await page.getByRole('button', { name: '12人' }).click()
      await page.getByRole('button', { name: '开始配板' }).click()

      await expect(page.locator('.setup-panel__candidates')).toBeVisible()
      await expect(page.locator('.setup-candidate').first()).toBeVisible()
      expect(await page.locator('.setup-candidate').count()).toBeGreaterThan(0)

      const firstCandidate = page.locator('.setup-candidate').first()
      await expect(firstCandidate.locator('.setup-candidate__roles li')).toHaveCount(12)
      await firstCandidate.getByRole('button', { name: '采用为草稿' }).click()
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
        await settleFirstNightSystemSteps(page)
  await expect(page.getByRole('button', { name: /AI推荐|重新推荐|推荐中/ })).toBeVisible()
      }
    })
  }
})
