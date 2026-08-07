import { describe, expect, it } from 'vitest'
import { createGameArchiveRecord } from '../archive'
import { createPrototypeGameSession } from '../../features/game-session/data/createPrototypeSession'
import { initialNightWorkbenchState } from '../../features/night-workbench/data/initialNightWorkbenchState'
import { emptyWakeDraft } from '../../features/night-workbench/state/projectWakeDraft'
import { buildNightSettlementRequest, buildReviewDraftRequest, buildSetupAdviceRequest, fakeAIContractAdapter } from './index'

function withoutRuntimeDates(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Record<string, unknown>
}

describe('AI draft contract', () => {
  it('builds setup advice at the context level the board actually supports', () => {
    const session = createPrototypeGameSession()
    const request = buildSetupAdviceRequest(session, {
      createdAt: '2026-07-19T00:00:00.000Z',
      candidateIds: ['catfishing-12-balanced-prototype'],
    })
    const response = fakeAIContractAdapter.request(request)
    const serialized = JSON.stringify(request)

    // 原型局身份齐全，所以是 standard；这个字段过去被三个 build 函数一起写死成 'minimal'。
    expect(request.contextLevel).toBe('standard')
    expect(request.kind).toBe('setup_advice')
    expect(request.context.seats[0]).toMatchObject({ seatId: 1, nickname: '玩家1', experience: 'new' })
    expect(serialized).not.toContain('initialPlayerStates')
    expect(serialized).not.toContain('timeline')
    expect(serialized).not.toContain('apiKey')
    expect(response).toMatchObject({
      provider: 'fake',
      draftOnly: true,
      status: 'answer',
      result: { recommendedCandidateIds: ['catfishing-12-balanced-prototype'] },
    })
  })

  it('builds night settlement advice from one wake item and does not expose the full queue', () => {
    const item = initialNightWorkbenchState.queue.find((entry) => entry.id === 'night-3-gambler')!
    const draft = { ...emptyWakeDraft(), targets: [4], roleChoice: 'balloonist', outcomeId: 'missed' }
    const request = buildNightSettlementRequest({
      state: initialNightWorkbenchState,
      item,
      draft,
      createdAt: '2026-07-19T00:01:00.000Z',
    })
    const response = fakeAIContractAdapter.request(request)
    const serialized = JSON.stringify(request)

    expect(request.contextLevel).toBe('standard')
    expect(request.context.wakeItem).toMatchObject({ id: item.id, seatId: item.seatId, roleId: 'gambler' })
    expect(request.context.draft).toMatchObject({ targets: [4], roleChoice: 'balloonist', outcomeId: 'missed' })
    expect(request.context.selectedTargets[0]).toMatchObject({ seatId: 4, roleName: expect.any(String) })
    expect(request.context.statusFacts.join(' ')).toContain('发动者：6号赌徒')
    expect(request.context.statusFacts.join(' ')).toContain('目标：4号')
    expect(request.context.roleKnowledge).toMatchObject({ roleId: 'gambler', title: '赌徒' })
    expect(request.context.roleResearch).toMatchObject({ roleId: 'gambler', name: '赌徒', knowledgeStatus: 'confirmed' })
    expect(serialized).not.toContain('confirmedRecords')
    expect(serialized).not.toContain('aiAdviceLog')
    expect(serialized).not.toContain('apiKey')
    expect(response).toMatchObject({
      provider: 'fake',
      draftOnly: true,
      status: 'answer',
      result: { recommendedOutcomeId: 'missed' },
    })
    expect(response.ruleFacts.join(' ')).toContain('猜错时赌徒死亡')
    expect(response.ruleFacts.join(' ')).toContain('Wrong guess')
    expect(response.ruleFacts.join(' ')).toContain('自动杀死赌徒')
  })

  it('passes only the confirmed previous Balloonist registration and current storyteller draft', () => {
    const base = initialNightWorkbenchState.queue[0]
    const item = {
      ...base,
      roleId: 'balloonist',
      previousRegistration: { kind: 'role_type' as const, seatId: 4, value: 'outsider' as const },
      forbiddenRegistrationValues: ['outsider' as const],
      previousTargets: [4],
      forbiddenTargetSeatIds: [4],
      previousTargetRequired: true,
      minimumTargetCount: 0,
      historicalContext: { kind: 'pukka_poison' as const, status: 'ready' as const, seatIds: [4], summary: '4号为旧毒候选。' },
    }
    const draft = {
      ...emptyWakeDraft(),
      targets: [7],
      registration: { kind: 'role_type' as const, seatId: 7, value: 'minion' as const },
    }
    const request = buildNightSettlementRequest({ state: initialNightWorkbenchState, item, draft })
    expect(request.context.wakeItem.previousRegistration).toEqual(item.previousRegistration)
    expect(request.context.wakeItem.forbiddenRegistrationValues).toEqual(['outsider'])
    expect(request.context.wakeItem.previousTargets).toEqual([4])
    expect(request.context.wakeItem.forbiddenTargetSeatIds).toEqual([4])
    expect(request.context.wakeItem.previousTargetRequired).toBe(true)
    expect(request.context.wakeItem.minimumTargetCount).toBe(0)
    expect(request.context.wakeItem.historicalContext).toEqual(item.historicalContext)
    expect(request.context.draft.registration).toEqual(draft.registration)
    expect(JSON.stringify(request.context)).not.toContain('confirmedRecords')
  })

  /*
   * 这一条盯着「假绿」：把三处 'minimal' 换成 'standard' 常量，上面几条照样绿。
   * 只有同一个 build 函数在两种局面下给出两个不同的档位，才说明它真的在推导。
   */
  it('drops back to minimal when the tool does not know every seat', () => {
    const session = createPrototypeGameSession()
    const item = initialNightWorkbenchState.queue.find((entry) => entry.id === 'night-3-gambler')!
    const partialNight = {
      ...initialNightWorkbenchState,
      seatSnapshots: {
        ...initialNightWorkbenchState.seatSnapshots,
        4: { ...initialNightWorkbenchState.seatSnapshots[4], role: null },
      },
    }

    expect(buildSetupAdviceRequest(session).contextLevel).toBe('standard')
    expect(buildSetupAdviceRequest({ ...session, playerCount: session.playerCount + 1 }).contextLevel).toBe('minimal')
    expect(buildNightSettlementRequest({ state: initialNightWorkbenchState, item, draft: emptyWakeDraft() }).contextLevel).toBe('standard')
    expect(buildNightSettlementRequest({ state: partialNight, item, draft: emptyWakeDraft() }).contextLevel).toBe('minimal')
  })

  it('builds review draft from archive summary without embedding the archived session', () => {
    const archive = createGameArchiveRecord({
      session: createPrototypeGameSession(),
      winner: 'good',
      archiveId: 'contract-review',
      archivedAt: '2026-07-19T00:02:00.000Z',
    })
    const request = buildReviewDraftRequest(archive, { createdAt: '2026-07-19T00:03:00.000Z' })
    const response = fakeAIContractAdapter.request(request)
    const serialized = JSON.stringify(request)

    expect(request.contextLevel).toBe('standard')
    expect(request.context).toMatchObject({ archiveId: archive.id, playerCount: archive.playerCount })
    expect(serialized).not.toContain('"session"')
    expect(serialized).not.toContain('apiKey')
    expect(response).toMatchObject({
      provider: 'fake',
      draftOnly: true,
      kind: 'review_draft',
      result: { playerReviewCount: archive.playerCount },
    })
    expect(JSON.stringify(response)).toContain('fake 草稿')
  })

  it('keeps AI requests and fake responses detached from authoritative session state', () => {
    const session = createPrototypeGameSession()
    const before = JSON.stringify(session)
    const item = initialNightWorkbenchState.queue[0]
    const draft = emptyWakeDraft()

    const outputs = [
      fakeAIContractAdapter.request(buildSetupAdviceRequest(session)),
      fakeAIContractAdapter.request(buildNightSettlementRequest({ state: initialNightWorkbenchState, item, draft })),
      fakeAIContractAdapter.request(buildReviewDraftRequest(createGameArchiveRecord({ session, winner: 'evil' }))),
    ].map(withoutRuntimeDates)

    expect(JSON.stringify(session)).toBe(before)
    for (const output of outputs) {
      expect(output).toMatchObject({ draftOnly: true, provider: 'fake' })
      expect(JSON.stringify(output)).not.toContain('confirmedBy')
      expect(JSON.stringify(output)).not.toContain('PlayerState')
      expect(JSON.stringify(output)).not.toContain('"session"')
    }
  })
})
