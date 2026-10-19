import { describe, expect, it } from 'vitest'
import { captureNightQualityRequest, nightQualityCases } from './nightSettlementQualityCases.test-support'
import { buildNightSettlementRequest } from './contextBuilder'
import { createNightResultAdviceAsync } from './nightSettlementHttp'
import { isNightSettlementRequest } from '../../../server/ai/aiRequestValidators'
import { localAIAdapter } from './localAIAdapter'

describe('live-game AI regressions', () => {
  it.each([0, 1, 3])('sends the explicit target mode, including zero, consistently through both AI adapters (%i)', async count => {
    const input = nightQualityCases[0].makeInput()
    input.item.allowedTargetCounts = [0, 1, 3]
    input.item.targetCount = 1
    input.draft.targetCountChoice = count
    input.draft.targets = [2, 4, 6].slice(0, count)
    const before = JSON.stringify(input)
    const request = await captureNightQualityRequest(input)
    expect(request.wakeItem.targetCount).toBe(count)
    expect(request.wakeItem.allowedTargetCounts).toEqual([0, 1, 3])
    expect(request.draft.targetCountChoice).toBe(count)
    expect(request.draft.targets).toHaveLength(count)
    expect(buildNightSettlementRequest(input).context).toMatchObject({ wakeItem: { targetCount: count }, draft: { targetCountChoice: count } })
    expect(localAIAdapter.createNightResultAdvice(input)?.missing.join(' ')).not.toContain('目标')
    expect(isNightSettlementRequest(request)).toBe(true)
    expect(JSON.stringify(input)).toBe(before)
  })

  it('keeps all four information roles and their readable record in the AI context', async () => {
    const input = nightQualityCases[0].makeInput()
    input.item.roleCount = 4
    input.draft.roleChoice = 'chef'
    input.draft.secondRoleChoice = 'imp'
    input.draft.additionalRoleChoices = ['librarian', 'poisoner']
    input.draft.playerChoice = '告知厨师、小恶魔、图书管理员、投毒者'
    const request = await captureNightQualityRequest(input)
    expect(request.draft).toMatchObject({ roleChoice: 'chef', secondRoleChoice: 'imp', additionalRoleChoices: ['librarian', 'poisoner'], playerChoice: input.draft.playerChoice })
    expect(buildNightSettlementRequest(input).context.draft).toMatchObject({ additionalRoleChoices: ['librarian', 'poisoner'], playerChoice: input.draft.playerChoice })
    expect(isNightSettlementRequest(request)).toBe(true)
    for (const additionalRoleChoices of [['x', 'y', 'z'], [null], ['x'.repeat(101)], {}]) {
      expect(isNightSettlementRequest({ ...request, draft: { ...request.draft, additionalRoleChoices } })).toBe(false)
    }
    for (const targetCountChoice of [-1, 16, '0', null]) {
      expect(isNightSettlementRequest({ ...request, draft: { ...request.draft, targetCountChoice } })).toBe(false)
    }
    expect(isNightSettlementRequest({ ...request, wakeItem: { ...request.wakeItem, allowedTargetCounts: [0, 16] } })).toBe(false)
  })
  it('sends saved host facts, both information roles and the current actor after a role change', async () => {
    const input = nightQualityCases[0].makeInput()
    input.draft.storytellerContext = '  上一名有效普卡毒目标4，当前阵营由主持另行核对。  '
    input.draft.secondRoleChoice = 'imp'
    input.item.roleCount = 2
    input.state.roleChangeEvents = [{
      id: 'actor-changed', seatId: input.item.seatId, revision: 1,
      changedAt: '2026-10-16T00:00:00Z', nightRunId: input.state.nightRunId,
      originNightRunId: input.state.nightRunId, phaseLabel: input.state.nightLabel,
      fromRole: input.state.seatSnapshots[input.item.seatId].role!,
      toRole: { id: 'chef', name: '厨师', initial: '厨', iconPath: '/assets/characters/chef.webp' },
      reason: 'gameplay', confirmedBy: 'storyteller',
    }]
    const before = JSON.stringify(input)
    const request = await captureNightQualityRequest(input)
    expect(request.draft.storytellerContext).toBe(input.draft.storytellerContext.trim())
    expect(request.draft.secondRoleChoice).toBe('imp')
    expect(request.wakeItem.roleCount).toBe(2)
    expect(request.currentActor?.roleId).toBe('chef')
    expect(request.wakeItem.roleId).toBe('gambler')
    expect(request.inPlayRoleIds).toHaveLength(input.state.playerCount)
    expect(request.inPlayRoleIds).toContain('chef')
    expect(request.inPlayRoleIds).not.toContain('gambler')
    expect(request.currentActor).not.toHaveProperty('alignment')
    expect(buildNightSettlementRequest(input).context).toMatchObject({
      draft: { storytellerContext: request.draft.storytellerContext, secondRoleChoice: 'imp' },
      currentActor: request.currentActor, inPlayRoleIds: request.inPlayRoleIds,
    })
    expect(isNightSettlementRequest(request)).toBe(true)
    expect(JSON.stringify(input)).toBe(before)
  })

  it('does not claim a complete in-play list when any actual role is unknown', async () => {
    const input = nightQualityCases[0].makeInput()
    input.state.seatSnapshots[1].role = null
    const request = await captureNightQualityRequest(input)
    expect(request.inPlayRoleIds).toBeUndefined()
  })

  it('includes the selected target ability so special death and voting rights are not left to model memory', async () => {
    const input = nightQualityCases[0].makeInput()
    input.state.seatSnapshots[9].role = { id: 'banshee', name: '报丧女妖', initial: '报', iconPath: '/assets/characters/banshee.webp' }
    const request = await captureNightQualityRequest(input)
    expect(request.selectedTargets?.[0].roleKnowledge).toMatchObject({ roleId: 'banshee' })
    expect(request.selectedTargets?.[0].roleKnowledge?.reminders.join(' ')).toMatch(/每天.{0,8}(?:两次|2次)/)
    expect(isNightSettlementRequest(request)).toBe(true)
    expect(isNightSettlementRequest({ ...request, selectedTargets: [{ ...request.selectedTargets![0], roleKnowledge: 'untrusted' }] })).toBe(false)
  })

  it('bounds additional facts and rejects malformed optional fields before any provider call', async () => {
    const input = nightQualityCases[0].makeInput()
    input.draft.storytellerContext = '事实'.repeat(700)
    const request = await captureNightQualityRequest(input)
    expect(request.draft.storytellerContext).toHaveLength(1000)
    expect(isNightSettlementRequest(request)).toBe(true)
    const malformed = [
      { ...request, draft: { ...request.draft, storytellerContext: {} } },
      { ...request, draft: { ...request.draft, storytellerContext: 'x'.repeat(1001) } },
      { ...request, draft: { ...request.draft, secondRoleChoice: [] } },
      { ...request, currentActor: { roleId: 'imp' } },
      { ...request, inPlayRoleIds: ['imp'] },
      { ...request, wakeItem: { ...request.wakeItem, roleCount: 3 } },
    ]
    for (const body of malformed) {
      expect(isNightSettlementRequest(body)).toBe(false)
    }
  })

  it.each([0, 1, 2])('preserves explicit empty model drafts instead of inventing death/player messages (%i)', async index => {
    const input = nightQualityCases[index].makeInput()
    const advice = await createNightResultAdviceAsync(input, {
      runtimeSettings: { mode: 'http', baseUrl: 'https://backend.example.test', timeoutMs: 1000 },
      fetcher: async () => new Response(JSON.stringify({ accepted: true, data: { draft: {
        status: 'answer', recommendedOutcomeId: index === 0 ? 'correct' : 'no-effect',
        missing: [], journalDrafts: [], playerMessageDrafts: [], stateChangeDrafts: [],
      } } }), { status: 200 }),
    })
    expect(advice?.status).toBe('answer')
    expect(advice?.stateChangeDrafts).toEqual([])
    expect(advice?.playerMessageDrafts).toEqual([])
    expect(advice?.journalDrafts).toEqual([])
  })

  it('refuses an answer when the backend still reports missing conditions', async () => {
    const input = nightQualityCases[0].makeInput()
    const advice = await createNightResultAdviceAsync(input, {
      runtimeSettings: { mode: 'http', baseUrl: 'https://backend.example.test', timeoutMs: 1000 },
      fetcher: async () => new Response(JSON.stringify({ accepted: true, data: { draft: {
        status: 'answer', recommendedOutcomeId: 'correct', missing: ['尚未核对当前阵营'],
        playerMessageDrafts: ['你现在是新角色。'],
      } } }), { status: 200 }),
    })
    expect(advice?.status).toBe('needs_input')
    expect(advice?.recommendedOutcomeId).toBeUndefined()
    expect(advice?.playerMessageDrafts).toEqual([])
  })
})
