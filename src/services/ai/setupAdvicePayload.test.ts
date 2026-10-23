import { describe, expect, it } from 'vitest'
import { getSmartScriptPack } from '../../domain/scripts'
import { createSmartScriptSetupCandidates } from '../../features/setup/smartScriptSetupCandidates'
import { runtimeBodyLimits } from '../../../server/runtimeSecurity'
import { isSetupAdviceRequest } from '../../../server/ai/aiRequestValidators'
import { createSetupAdviceDraftAsync } from './setupAdviceHttp'

describe('expanded setup request size', () => {
  it.each(['trouble-brewing', 'shuo-shu-ren-zhi-nu', 'one-in-one-out', 'catfishing'])('%s fits the public API with all 36 visible candidates', async scriptId => {
    const pack = getSmartScriptPack(scriptId)
    const seats = Array.from({ length: 15 }, (_, i) => ({ seatId: i + 1, nickname: `测试${i + 1}`, experience: 'regular' as const }))
    const candidates = createSmartScriptSetupCandidates(scriptId, seats, { count: 36, seed: 'payload', expand: true })
    expect(candidates).toHaveLength(36)
    let body = ''
    await createSetupAdviceDraftAsync({ scriptId, scriptName: pack.displayName, knowledgeVersion: 'payload-test', playerCount: 15, seats, candidates }, {
      runtimeSettings: { mode: 'http', baseUrl: 'https://botc.example.test', timeoutMs: 1000 },
      fetcher: async (_url, init) => {
        body = String(init?.body)
        return new Response('{}', { status: 503 })
      },
    })
    const payload = JSON.parse(body)
    expect(isSetupAdviceRequest(payload)).toBe(true)
    expect(payload.candidates.map((candidate: { id: string }) => candidate.id)).toEqual(candidates.map(candidate => candidate.id))
    expect(new TextEncoder().encode(body).byteLength).toBeLessThanOrEqual(runtimeBodyLimits.ai)
  })
})
