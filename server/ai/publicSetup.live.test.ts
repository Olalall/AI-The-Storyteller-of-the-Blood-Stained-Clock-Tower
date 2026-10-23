import { describe, expect, it } from 'vitest'
import { getSmartScriptPack } from '../../src/domain/scripts'
import { createSmartScriptSetupCandidates } from '../../src/features/setup/smartScriptSetupCandidates'
import { createSetupAdviceDraftAsync } from '../../src/services/ai/setupAdviceHttp'
import { createAIProxyHandlers } from './aiProxyHandlers'
import { createAIProxyRoutes } from './aiProxyRoutes'
import type { SetupAdviceProviderRequest } from './types'

describe.skipIf(process.env.BOTC_RUN_PUBLIC_SETUP_LIVE !== '1')('anonymous real AI with expanded setup combinations', () => {
  it.each([
    { scriptId: 'trouble-brewing', count: 7 },
    { scriptId: 'shuo-shu-ren-zhi-nu', count: 12 },
    { scriptId: 'one-in-one-out', count: 15 },
  ])('$scriptId / $count players', async ({ scriptId, count }) => {
    const pack = getSmartScriptPack(scriptId)
    const seats = Array.from({ length: count }, (_, i) => ({ seatId: i + 1, nickname: `测试${i + 1}`, experience: 'regular' as const }))
    const pool = createSmartScriptSetupCandidates(scriptId, seats, { count: 36, seed: 'live-public', expand: true })
    const candidates = pool.slice(3, 6)
    expect(candidates).toHaveLength(3)
    let input!: SetupAdviceProviderRequest
    await createSetupAdviceDraftAsync({ scriptId, scriptName: pack.displayName, knowledgeVersion: 'live-test', playerCount: count, seats, candidates }, {
      runtimeSettings: { mode: 'http', baseUrl: 'https://botc.example.test', timeoutMs: 1000 },
      fetcher: async (_url, init) => { input = JSON.parse(String(init?.body)); return new Response('{}', { status: 503 }) },
    })
    const before = JSON.stringify({ input, candidates })
    const env: NodeJS.ProcessEnv = { ...process.env, BOTC_AI_ENABLED: 'true', BOTC_AI_PROVIDER: 'openai-compatible', BOTC_AI_TIMEOUT_MS: '90000', BOTC_AI_PUBLIC_ACCESS: 'true', BOTC_PUBLIC_ACCESS_MODE: 'true', BOTC_AI_PUBLIC_ORIGIN: 'https://botc.example.test' }
    const route = createAIProxyRoutes(createAIProxyHandlers({ env }), { env })
    const response = await route(new Request('https://botc.example.test/api/ai/setup-advice', { method: 'POST', headers: { Origin: 'https://botc.example.test', 'Content-Type': 'application/json' }, body: JSON.stringify(input) }))
    expect(response.status).toBe(200)
    const text = await response.text()
    const draft = JSON.parse(text).data.draft
    expect(draft.provider, JSON.stringify(draft.warnings)).toBe('openai-compatible')
    expect(draft.draftOnly).toBe(true)
    expect(draft.recommendedCandidateIds.length).toBeGreaterThan(0)
    expect(draft.recommendedCandidateIds.every((id: string) => candidates.some(c => c.id === id))).toBe(true)
    for (const field of ['BOTC_AI_API_KEY', 'BOTC_AI_BASE_URL', 'BOTC_AI_MODEL']) {
      if (env[field]) expect(text).not.toContain(env[field])
    }
    expect(JSON.stringify({ input, candidates })).toBe(before)
    console.info(JSON.stringify({ scriptId, playerCount: count, combinations: pool.length, recommended: draft.recommendedCandidateIds.length, passed: true }))
  }, 120_000)
})
