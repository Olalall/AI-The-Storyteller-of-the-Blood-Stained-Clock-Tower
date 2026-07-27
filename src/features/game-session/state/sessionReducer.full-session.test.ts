import { describe, expect, it } from 'vitest'
import { emptyWakeDraft } from '../../night-workbench/state/projectWakeDraft'
import { createPrototypeGameSession } from '../data/createPrototypeSession'
import { projectCurrentPlayerStates } from './projectors'
import { gameSessionReducer } from './sessionReducer'
import type { GameSessionState, PlayerState } from '../types'

function cleanTwelveSeatSession(): GameSessionState {
  const prototype = createPrototypeGameSession()
  const originalRun = prototype.nightRuns[prototype.activeNightRunId!]
  const run = {
    ...originalRun,
    id: 'clean-night-run-1',
    phaseSegmentId: null,
    activeCursorId: originalRun.queue.find((item) => item.roleId === 'fortuneteller')!.id,
    previewEntryId: originalRun.queue.find((item) => item.roleId === 'fortuneteller')!.id,
    queue: originalRun.queue.map((item) => ({ ...item, progress: 'pending' as const, history: undefined })),
    drafts: {},
    aiAdviceLog: {},
    correctionItemId: null,
  }
  return {
    ...prototype,
    phaseSegments: [],
    timeline: prototype.timeline.filter((entry) => entry.kind === 'setup_confirmed'),
    initialPlayerStates: Object.fromEntries(Array.from({ length: 12 }, (_value, index) => [index + 1, {
      life: 'alive' as const,
      poisoned: false,
      drunk: false,
      markers: [],
    }])),
    nightRuns: { [run.id]: run },
    activeNightRunId: run.id,
  }
}

function appendStatus(session: GameSessionState, seatId: number, update: (state: PlayerState) => PlayerState, id: string) {
  const before = projectCurrentPlayerStates(session)[seatId]
  return gameSessionReducer(session, {
    type: 'confirm-player-state-change',
    seatId,
    expectedBefore: before,
    after: update(before),
    segmentId: 'night-1',
    entryId: id,
    confirmedAt: `2026-07-14T00:0${seatId}:00.000Z`,
    reason: '12人回归样例状态变更',
  })
}

function appendVote(session: GameSessionState, round: number, nomineeSeatId: number, raisedSeatIds: number[], ghostVoteSeatIds: number[] = []) {
  return gameSessionReducer(session, {
    type: 'append-phase-entry',
    phaseKind: 'day',
    entry: {
      kind: 'vote_round',
      roundId: `round-${round}`,
      nominatorSeatId: round,
      nomineeSeatId,
      threshold: 6,
      raisedSeatIds,
      ghostVoteSeatIds,
    },
    input: { id: `vote-${round}`, createdAt: `2026-07-14T01:0${round}:00.000Z` },
  })
}

describe('12人结构化流程回归', () => {
  it('keeps night/day records separate across multi-target, correction, status, votes and execution', () => {
    const initial = cleanTwelveSeatSession()
    const run = initial.nightRuns[initial.activeNightRunId!]
    const wakeItem = run.queue.find((item) => item.roleId === 'fortuneteller')!
    const draft = {
      ...emptyWakeDraft(),
      targets: [8, 12],
      outcomeId: 'yes',
      storytellerResult: '4号占卜师选择8号、12号，结果为“是”。',
      informationGiven: '是。',
    }
    const committed = gameSessionReducer(initial, {
      type: 'commit-night-workbench',
      nightRun: {
        ...run,
        queue: run.queue.map((item) => item.id === wakeItem.id ? { ...item, progress: 'confirmed' as const } : item),
        drafts: { [wakeItem.id]: draft },
      },
      records: [{ id: 'night-1-fortune', wakeItemId: wakeItem.id, revision: 1, confirmedAt: '2026-07-14T00:00:00.000Z', snapshot: draft }],
      roleChanges: [],
    })
    const corrected = gameSessionReducer(committed, {
      type: 'append-correction',
      originalEntryId: 'night-1-fortune',
      entry: {
        kind: 'night_action',
        nightRunId: run.id,
        wakeItemId: wakeItem.id,
        summary: '4号占卜师更正信息。',
        details: [],
        record: { revision: 2, snapshot: { ...draft, storytellerResult: '4号占卜师更正信息。' } },
        correctionReason: '12人回归样例更正',
      },
      input: { id: 'night-1-fortune-correction', createdAt: '2026-07-14T00:01:00.000Z' },
    })
    const withDead = appendStatus(corrected, 2, (state) => ({ ...state, life: 'dead' }), 'state-2-dead')
    const withPoison = appendStatus(withDead, 3, (state) => ({ ...state, poisoned: true }), 'state-3-poison')
    const withDrunk = appendStatus(withPoison, 6, (state) => ({ ...state, drunk: true }), 'state-6-drunk')
    const closedNight = gameSessionReducer(withDrunk, { type: 'close-active-night-run', nightRunId: run.id, closedAt: '2026-07-14T00:10:00.000Z' })

    const withSkill = gameSessionReducer(closedNight, {
      type: 'append-phase-entry',
      phaseKind: 'day',
      entry: { kind: 'day_action', category: 'skill', actorSeatId: 3, targetSeatIds: [5], summary: '3号发动白天技能 → 5号', details: [] },
      input: { id: 'day-1-skill', createdAt: '2026-07-14T01:00:00.000Z' },
    })
    const withEvent = gameSessionReducer(withSkill, {
      type: 'append-phase-entry',
      phaseKind: 'day',
      entry: { kind: 'day_action', category: 'public_event', actorSeatId: null, targetSeatIds: [6], summary: '公开事件：6号公开声明', details: [] },
      input: { id: 'day-1-event', createdAt: '2026-07-14T01:00:30.000Z' },
    })
    const vote1 = appendVote(withEvent, 1, 4, [1, 2, 3, 4, 5, 6])
    const vote2 = appendVote(vote1, 2, 5, [1, 2, 3, 4, 5, 6, 7], [2])
    const vote3 = appendVote(vote2, 3, 6, [1, 2, 3, 4, 5, 6, 7])
    const vote4 = appendVote(vote3, 4, 8, [1, 2, 3, 4, 5, 6, 7, 8])
    const resolved = gameSessionReducer(vote4, {
      type: 'confirm-day-execution',
      daySegmentId: 'day-1',
      nomineeSeatId: 8,
      sourceRoundId: 'round-4',
      executionEntryId: 'execution-8',
      playerStateEntryId: 'state-8-dead',
      confirmedAt: '2026-07-14T01:05:00.000Z',
    })
    const closedDay = gameSessionReducer(resolved, { type: 'close-open-segment', phaseKind: 'day', closedAt: '2026-07-14T01:10:00.000Z' })

    expect(closedDay.phaseSegments).toMatchObject([
      { id: 'night-1', closedAt: '2026-07-14T00:10:00.000Z' },
      { id: 'day-1', closedAt: '2026-07-14T01:10:00.000Z' },
    ])
    expect(closedDay.timeline.find((entry) => entry.id === 'night-1-fortune-correction')).toMatchObject({ correctionOf: 'night-1-fortune', segmentId: 'night-1' })
    expect(closedDay.timeline.filter((entry) => entry.kind === 'day_action' && entry.segmentId === 'day-1')).toHaveLength(2)
    expect(closedDay.timeline.filter((entry) => entry.kind === 'vote_round' && entry.segmentId === 'day-1')).toHaveLength(4)
    expect(closedDay.timeline.find((entry) => entry.id === 'vote-2')).toMatchObject({ ghostVoteSeatIds: [2] })
    expect(projectCurrentPlayerStates(closedDay)[2].life).toBe('dead')
    expect(projectCurrentPlayerStates(closedDay)[3].poisoned).toBe(true)
    expect(projectCurrentPlayerStates(closedDay)[6].drunk).toBe(true)
    expect(projectCurrentPlayerStates(closedDay)[8].life).toBe('dead')
    expect(closedDay.phaseSegments.some((segment) => segment.id === 'night-2')).toBe(false)
  })
})
