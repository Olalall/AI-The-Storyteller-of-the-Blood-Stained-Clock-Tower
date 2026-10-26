import { describe, expect, it } from 'vitest'
import { captureNightQualityRequest, nightQualityCases } from '../../src/services/ai/nightSettlementQualityCases.test-support'
import { createOpenAICompatibleNightSettlementProvider } from './nightSettlementProvider'
import type { NightSettlementAdviceDraft } from './types'

const shouldRunLive = process.env.BOTC_RUN_REAL_AI_NIGHT_QUALITY_SMOKE === '1'
const describeLive = shouldRunLive ? describe : describe.skip

function requiredEnv(name: string) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Missing ${name}. Live smoke never reads API keys from source files.`)
  return value
}

function timeoutSeconds() {
  const explicitSeconds = Number(process.env.BOTC_AI_TIMEOUT_SECONDS)
  if (Number.isFinite(explicitSeconds) && explicitSeconds > 0) return explicitSeconds
  const timeoutMs = Number(process.env.BOTC_AI_TIMEOUT_MS)
  return Number.isFinite(timeoutMs) && timeoutMs > 0 ? Math.ceil(timeoutMs / 1000) : 90
}

function decisionText(draft: NightSettlementAdviceDraft) {
  return [draft.summary, ...draft.missing, ...draft.journalDrafts, ...draft.playerMessageDrafts, ...draft.stateChangeDrafts].join('\n')
}

describeLive('real model complex night settlement quality regression', () => {
  it.each(nightQualityCases)('$id', async (testCase) => {
    const input = testCase.makeInput()
    const before = JSON.stringify(input)
    const request = await captureNightQualityRequest(input)
    const model = requiredEnv('BOTC_AI_MODEL')
    const provider = createOpenAICompatibleNightSettlementProvider({
      baseUrl: requiredEnv('BOTC_AI_BASE_URL'), model,
      apiKey: requiredEnv('BOTC_AI_API_KEY'), timeoutSeconds: timeoutSeconds(),
    })
    const started = performance.now()
    let draft: NightSettlementAdviceDraft | undefined
    let passed = false
    try {
      draft = (await provider.generateNightSettlementAdvice(request)).draft
      expect(draft.provider).toBe('openai-compatible')
      expect(draft.draftOnly).toBe(true)
      expect(draft.status).toBe(testCase.expectedStatus)
      expect(draft.recommendedOutcomeId).toBe(testCase.expectedOutcomeId)
      expect(request.roleResearch?.sourceUrls.length).toBeGreaterThan(0)
      expect(draft.ruleFacts.length).toBeGreaterThan(0)
      expect(draft.authorityWarnings.join(' ') + draft.disclaimer).toMatch(/草稿|说书人|确认/)
      const text = decisionText(draft)
      expect(text).not.toMatch(/已写入|已经写入|已修改状态|已经修改状态|胜负已判定/)
      if (testCase.expectedStatus === 'needs_input') expect(draft.missing.length).toBeGreaterThan(0)
      else expect(draft.journalDrafts.length + draft.stateChangeDrafts.length).toBeGreaterThan(0)
      for (const pattern of testCase.mustMention) expect(text).toMatch(pattern)
      for (const pattern of testCase.mustNotMention ?? []) expect(text).not.toMatch(pattern)
      expect(JSON.stringify(input)).toBe(before)
      passed = true
    } finally {
      // 只输出评测元数据，不把私密局面、回答或凭据写进报告。
      console.info(JSON.stringify({
        caseId: testCase.id, modelConfigured: Boolean(model), elapsedMs: Math.round(performance.now() - started),
        status: draft?.status ?? 'provider_error', outcome: draft?.recommendedOutcomeId,
        missingCount: draft?.missing.length ?? 0, ruleFactCount: draft?.ruleFacts.length ?? 0,
        sourceCount: request.roleResearch?.sourceUrls.length ?? 0, passed,
      }))
    }
  }, 180_000)
})
