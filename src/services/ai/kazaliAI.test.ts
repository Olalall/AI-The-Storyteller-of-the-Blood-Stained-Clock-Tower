import { beforeAll, describe, expect, it } from 'vitest'
import { loadAllSmartScriptPacks, roleTeamByIdForScript } from '../../domain/scripts'
import { isNightSettlementRequest } from '../../../server/ai/aiRequestValidators'
import { createOpenAICompatibleNightSettlementProvider } from '../../../server/ai/nightSettlementProvider'
import { buildNightSettlementRequest } from './contextBuilder'
import { createNightResultAdviceAsync } from './nightSettlementHttp'
import { captureNightQualityRequest } from './nightSettlementQualityCases.test-support'
import { localAIAdapter } from './localAIAdapter'
import { fakeAIContractAdapter } from './fakeAIContractAdapter'
import { actualKazaliInput } from './kazaliAI.test-support'

beforeAll(async () => { await loadAllSmartScriptPacks() })


describe('Kazali actual session through AI request and response projection', () => {
  it.each([7, 10, 15])('retains every player-to-role pair and current actual role at %i players', async playerCount => {
    const input = actualKazaliInput(playerCount), before = structuredClone(input)
    const context = buildNightSettlementRequest(input).context
    const request = await captureNightQualityRequest(input)
    const expectedCount = playerCount <= 9 ? 1 : playerCount <= 12 ? 2 : 3
    expect(request.nightType).toBe('first')
    expect(request.wakeItem.targetRoleChoiceCount).toBe(expectedCount)
    expect(context.wakeItem.targetRoleChoiceCount).toBe(expectedCount)
    expect(request.draft.targetRoleChoices).toEqual(input.draft.targetRoleChoices)
    expect(context.draft.targetRoleChoices).toEqual(input.draft.targetRoleChoices)
    expect(request.draft.targets).toEqual(input.draft.targetRoleChoices!.map(choice => choice.seatId))
    expect(request.selectedTargets).toHaveLength(expectedCount)
    const teams = roleTeamByIdForScript(input.state.scriptId)
    expect(request.wakeItem.targetRoleChoiceRoleIds!.every(id => teams[id] === 'minion')).toBe(true)
    for (const target of request.selectedTargets!) {
      expect(target.roleId).toBe(input.state.seatSnapshots[target.seatId].role!.id)
      expect(['townsfolk', 'outsider']).toContain(teams[target.roleId])
    }
    expect(isNightSettlementRequest(request)).toBe(true)
    expect(input).toEqual(before)
  })

  it('projects a real backend answer without applying identities or exposing its assignment table to players', async () => {
    const input = actualKazaliInput(15), before = structuredClone(input)
    const advice = await createNightResultAdviceAsync(input, { runtimeSettings: { mode: 'http', baseUrl: 'https://backend.example.test', timeoutMs: 1000 },
      fetcher: async (_url, init) => {
        const request = JSON.parse(String(init?.body))
        expect(isNightSettlementRequest(request)).toBe(true)
        const provider = createOpenAICompatibleNightSettlementProvider({ baseUrl: 'https://offline.example.test/v1', model: 'offline-only', apiKey: 'offline-only', timeoutSeconds: 1,
          fetcher: async () => new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ status: 'answer', confidence: 'high', recommendedOutcomeId: 'record', missing: [],
            summary: '三组选择已录入，待主持独立确认应用。', journalDrafts: [request.draft.playerChoice], playerMessageDrafts: ['完整配对表不能作为一个玩家的告知'], stateChangeDrafts: ['待主持确认所选玩家变成所选邪恶爪牙。'] }) } }] })) })
        const { draft } = await provider.generateNightSettlementAdvice(request)
        return new Response(JSON.stringify({ accepted: true, data: { draft } }))
      } })
    expect(advice).toMatchObject({ status: 'answer', recommendedOutcomeId: 'record', playerMessageDrafts: [], sourceDraftRevision: input.draft.draftRevision })
    expect(advice?.authorityWarnings.join(' ')).toMatch(/另行应用.*新爪牙夜序/)
    expect(advice?.journalDrafts[0]).toBe(input.draft.playerChoice)
    expect(input).toEqual(before)
  })

  it('requires missing or invalid pairs even from a ready-looking remote answer or the local fallback', async () => {
    for (const pairs of [[{ seatId: 0, roleId: '' }], [{ seatId: 1, roleId: 'chef' }], [{ seatId: 11, roleId: 'harpy' }, { seatId: 2, roleId: 'poisoner' }]]) {
      const input = actualKazaliInput(10)
      input.draft.targetRoleChoices = pairs; input.draft.targets = pairs.filter(pair => pair.seatId > 0).map(pair => pair.seatId)
      const local = localAIAdapter.createNightResultAdvice(input)
      expect(local).toMatchObject({ status: 'needs_input', recommendedOutcomeId: undefined, playerMessageDrafts: [] })
      const advice = await createNightResultAdviceAsync(input, { runtimeSettings: { mode: 'http', baseUrl: 'https://backend.example.test', timeoutMs: 1000 },
        fetcher: async () => new Response(JSON.stringify({ accepted: true, data: { draft: { status: 'answer', recommendedOutcomeId: 'record', missing: [], playerMessageDrafts: ['不应出现'] } } })) })
      expect(advice).toMatchObject({ status: 'needs_input', recommendedOutcomeId: undefined, playerMessageDrafts: [] })
    }
    const input = actualKazaliInput(10); input.draft.targetRoleChoices = [{ seatId: 0, roleId: '' }]; input.draft.targets = []
    const response = await fakeAIContractAdapter.request(buildNightSettlementRequest(input))
    expect(response.status).toBe('needs_input')
  })

  it('keeps a later-night attack distinct and does not resend first-night assignments', async () => {
    const input = actualKazaliInput(10, true)
    const request = await captureNightQualityRequest(input)
    expect(request).toMatchObject({ nightType: 'other', wakeItem: { roleId: 'kazali', targetCount: 1 }, draft: { targets: [input.draft.targets[0]] } })
    expect(request.wakeItem.targetRoleChoiceCount).toBeUndefined()
    expect(request.draft.targetRoleChoices).toBeUndefined()
    expect(isNightSettlementRequest(request)).toBe(true)
  })
})
