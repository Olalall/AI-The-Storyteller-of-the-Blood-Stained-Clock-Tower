// Intended target: server/ai/lleechInitialAI.test.ts; fixture is synthetic actual-session HTTP output.
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { isNightSettlementRequest } from './aiRequestValidators'
import { buildNightSettlementProviderMessages } from './nightSettlementPromptBuilder'
import { createOpenAICompatibleNightSettlementProvider, fallbackNightSettlementAdviceDraft } from './nightSettlementProvider'
import type { NightSettlementProviderRequest } from './types'

function input(): NightSettlementProviderRequest {
  return JSON.parse(readFileSync('dev-docs/script-import-work/wiki-batch-03/ai-regression/lleech-initial-request.fixture.json', 'utf8'))
}

describe('Lleech midgame host-initialization AI boundary', () => {
  it('keeps global other-night distinct from the new ability first-use phase', () => {
    const request = input()
    expect(request).toMatchObject({ nightType: 'other', phaseLabel: '第3夜', wakeItem: { roleId: 'lleech', abilityPhase: 'initial', targetCount: 1 },
      draft: { targets: [7] }, selectedTargets: [{ seatId: 7, status: { life: 'alive' } }] })
    expect(isNightSettlementRequest(request)).toBe(true)
    const prompt = JSON.parse(buildNightSettlementProviderMessages(request)[1].content)
    expect(prompt.input.wakeItem.abilityPhase).toBe('initial')
    expect(prompt.constraints).toEqual(expect.arrayContaining([expect.stringMatching(/abilityPhase=initial.*后续夜晚.*不额外攻击.*不重做开局设置/)]))
  })

  it('rejects forged or unknown phases without rejecting old ordinary Lleech requests', () => {
    const request = input()
    for (const abilityPhase of [null, '', 'attack', 'other', 1, {}]) expect(isNightSettlementRequest({ ...request, wakeItem: { ...request.wakeItem, abilityPhase } })).toBe(false)
    for (const roleId of ['ojo', 'kazali', 'imp']) expect(isNightSettlementRequest({ ...request, wakeItem: { ...request.wakeItem, roleId } })).toBe(false)
    for (const nightType of ['first', undefined]) expect(isNightSettlementRequest({ ...request, nightType })).toBe(false)
    const ordinary = structuredClone(request); delete ordinary.wakeItem.abilityPhase
    expect(isNightSettlementRequest(ordinary)).toBe(true)
  })

  it.each([
    ['empty host', (request: NightSettlementProviderRequest) => { request.draft.targets = []; request.selectedTargets = [] }],
    ['dead host', (request: NightSettlementProviderRequest) => { request.draft.targets = [1]; request.selectedTargets = request.selectedTargets?.map(target => ({ ...target, seatId: 1, status: { ...target.status, life: 'dead' } })) }],
    ['out-of-range host', (request: NightSettlementProviderRequest) => { request.draft.targets = [13]; request.selectedTargets = request.selectedTargets?.map(target => ({ ...target, seatId: 13 })) }],
    ['drifted facts', (request: NightSettlementProviderRequest) => { request.selectedTargets = request.selectedTargets?.map(target => ({ ...target, seatId: 8 })) }],
    ['missing facts', (request: NightSettlementProviderRequest) => { delete request.selectedTargets }],
    ['two hosts', (request: NightSettlementProviderRequest) => { request.draft.targets = [7, 8]; request.selectedTargets = [...request.selectedTargets!, { ...request.selectedTargets![0], seatId: 8 }] }],
  ] as const)('does not call the model for %s even if all outcomes are forged ready', async (_name, mutate) => {
    const request = input(); mutate(request)
    request.availableOutcomes = request.availableOutcomes.map(outcome => ({ ...outcome, ready: true })); request.draft.outcomeId = 'record-initialization'
    const before = structuredClone(request)
    expect(fallbackNightSettlementAdviceDraft(request)).toMatchObject({ status: 'needs_input', recommendedOutcomeId: undefined, playerMessageDrafts: [], stateChangeDrafts: [] })
    let calls = 0
    const provider = createOpenAICompatibleNightSettlementProvider({ baseUrl: 'https://offline.invalid/v1', apiKey: 'offline-only', model: 'offline-only', timeoutSeconds: 1,
      fetcher: async () => { calls++; return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ status: 'answer', recommendedOutcomeId: 'record-initialization', missing: [], stateChangeDrafts: ['伪造宿主中毒'], playerMessageDrafts: ['你中毒了'] }) } }] })) } })
    const { draft } = await provider.generateNightSettlementAdvice(request)
    expect(draft).toMatchObject({ status: 'needs_input', recommendedOutcomeId: undefined, playerMessageDrafts: [], stateChangeDrafts: [] })
    expect(draft.missing.length).toBeGreaterThan(0); expect(calls).toBe(0); expect(request).toEqual(before)
  })
})
