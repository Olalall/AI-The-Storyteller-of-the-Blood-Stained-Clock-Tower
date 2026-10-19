import { describe, expect, it } from 'vitest'
import { createPrototypeGameSession } from '../data/createPrototypeSession'
import { gameSessionReducer } from './sessionReducer'
import { projectStandingExecution } from '../../day-workbench/state/voteStanding'
import { completeVoteRound, createVoteRoundDraft } from '../../day-workbench/state/voteRound'
import { projectCurrentPlayerStates } from './projectors'
import { projectTimelineHistory } from './projectTimelineHistory'
import type { GameSessionState } from '../types'

function fixture(): GameSessionState {
  const session = createPrototypeGameSession()
  session.timeline = []
  session.phaseSegments = [{ id: 'day-3', kind: 'day', sequence: 3, label: '第3天', createdAt: '2026-10-16T00:00:00Z' }]
  session.dayVoteDraft = null
  return session
}
function vote(state = fixture()) {
  return gameSessionReducer(state, { type: 'append-phase-entry', phaseKind: 'day',
    entry: { kind: 'vote_round', roundId: 'round-1', nominatorSeatId: 1, nomineeSeatId: 4, raisedSeatIds: [1, 2, 3, 4, 5, 6, 7, 8], ghostVoteSeatIds: [], threshold: 6 },
    input: { id: 'original-vote', createdAt: '2026-10-16T01:00:00Z' } })
}
const revision = { type: 'revise-vote-round' as const, originalEntryId: 'original-vote', voided: false,
  draft: { ...createVoteRoundDraft('day-3', 6), nominatorSeatId: 1, nomineeSeatId: 4, raisedSeatIds: [1, 2, 3, 4, 5, 6] },
  reason: '核对6票', input: { id: 'revised-vote', createdAt: '2026-10-16T02:00:00Z' } }

describe('explicit day correction and special execution commands', () => {
  it('replaces an erroneous high tally through an append-only linear correction, including closed-day history', () => {
    const state = vote()
    state.phaseSegments[0].closedAt = '2026-10-16T01:30:00Z'
    const before = JSON.stringify(state)
    const corrected = gameSessionReducer(state, revision)
    expect(corrected.timeline[0]).toEqual(state.timeline[0])
    expect(corrected.timeline.at(-1)).toMatchObject({ correctionOf: 'original-vote', correctionReason: '核对6票', segmentId: 'day-3' })
    expect(projectStandingExecution(corrected.timeline, 'day-3')).toMatchObject({ voteCount: 6 })
    expect(corrected.phaseSegments).toEqual(state.phaseSegments)
    expect(gameSessionReducer(corrected, { ...revision, input: { ...revision.input, id: 'fork' } })).toBe(corrected)
    expect(JSON.stringify(state)).toBe(before)
  })
  it('voids only through an explicit reason, ignores cancelled votes in standing and preserves the prior record', () => {
    const state = vote()
    expect(gameSessionReducer(state, { ...revision, reason: '' })).toBe(state)
    const cancelled = gameSessionReducer(state, { ...revision, voided: true, draft: undefined })
    expect(cancelled.timeline).toHaveLength(2)
    expect(cancelled.timeline.at(-1)).toMatchObject({ correctionOf: 'original-vote', voided: true })
    expect(projectStandingExecution(cancelled.timeline, 'day-3').status).toBe('none')
    expect(projectTimelineHistory(cancelled)[0].summary).toContain('已撤销')
    expect(projectCurrentPlayerStates(cancelled)).toEqual(projectCurrentPlayerStates(state))
  })
  it('validates manual extra votes without inventing voters or automatic role decisions', () => {
    const draft = { ...createVoteRoundDraft('day-3', 3), nominatorSeatId: 2, nomineeSeatId: 4, raisedSeatIds: [1, 2], voteAdjustment: { count: 1, reason: '主持确认双票' } }
    const entry = completeVoteRound(draft, { id: 'adjusted', roundId: 'round-1', createdAt: '2026-10-16T02:00:00Z' })!
    expect(entry.raisedSeatIds).toEqual([1, 2])
    expect(projectStandingExecution([entry], 'day-3')).toMatchObject({ status: 'leading', voteCount: 3 })
    expect(completeVoteRound({ ...draft, voteAdjustment: { count: 1, reason: '' } }, { id: 'bad', roundId: 'bad', createdAt: '' })).toBeNull()
    expect(completeVoteRound({ ...draft, voteAdjustment: { count: -3, reason: '不能出现负总票数' } }, { id: 'bad', roundId: 'bad', createdAt: '' })).toBeNull()
  })
  it('permits a justified lower-vote special execution atomically but still rejects stale ordinary commands and duplicates', () => {
    const state = vote()
    const action = { type: 'confirm-day-execution' as const, daySegmentId: 'day-3', nomineeSeatId: 5, sourceRoundId: '',
      executionEntryId: 'special', playerStateEntryId: 'special-state', confirmedAt: '2026-10-16T03:00:00Z', exceptionReason: '主持确认维齐尔强制处决' }
    expect(gameSessionReducer(state, { ...action, exceptionReason: undefined })).toBe(state)
    expect(gameSessionReducer(state, { ...action, exceptionReason: '  ' })).toBe(state)
    const result = gameSessionReducer(state, action)
    expect(result.timeline.slice(-2).map((entry) => entry.kind)).toEqual(['execution', 'player_state_changed'])
    expect(result.timeline.at(-2)).toMatchObject({ executedSeatId: 5, exceptionReason: action.exceptionReason })
    expect(projectCurrentPlayerStates(result)[5].life).toBe('dead')
    expect(gameSessionReducer(result, { ...action, executionEntryId: 'second', playerStateEntryId: 'second-state' })).toBe(result)
    const survives = gameSessionReducer(state, { ...action, causesDeath: false })
    expect(survives.timeline.at(-1)).toMatchObject({ kind: 'execution', causedDeath: false })
    expect(projectCurrentPlayerStates(survives)[5].life).toBe('alive')
  })
  it('rejects malformed or stale corrections without clearing the current unrelated draft', () => {
    const state = vote()
    state.dayVoteDraft = { ...revision.draft, nominatorSeatId: 2 }
    for (const action of [{ ...revision, draft: { ...revision.draft, nominatorSeatId: 99 } }, { ...revision, input: { ...revision.input, id: 'original-vote' } }]) expect(gameSessionReducer(state, action)).toBe(state)
    expect(gameSessionReducer(state, revision).dayVoteDraft).toEqual(state.dayVoteDraft)
  })
})
