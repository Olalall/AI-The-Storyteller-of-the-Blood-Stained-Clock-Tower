import { describe, expect, it } from 'vitest'
import { createPrototypeGameSession } from '../data/createPrototypeSession'
import { gameSessionReducer } from './sessionReducer'
import type { GameSessionState, VoteRoundEntry } from '../types'

function fixture() {
  const state = createPrototypeGameSession()
  state.timeline = []
  state.phaseSegments = [{ id: 'day', kind: 'day', sequence: 1, label: '第1天', createdAt: '2026-10-21T01:00:00Z' }]
  state.initialPlayerStates[1] = { ...state.initialPlayerStates[1], life: 'dead' }
  return state
}
function addVote(state: GameSessionState, id: string, raisedSeatIds = [1, 2]) {
  const pair = id === 'first' ? [2, 3] : id === 'ordinary' ? [6, 7] : [4, 5]
  return gameSessionReducer(state, { type: 'append-phase-entry', phaseKind: 'day',
    entry: { kind: 'vote_round', roundId: id, nominatorSeatId: pair[0], nomineeSeatId: pair[1], threshold: 3, raisedSeatIds, ghostVoteSeatIds: raisedSeatIds.includes(1) ? [1] : [] },
    input: { id, createdAt: `2026-10-21T01:0${id === 'first' ? 1 : 2}:00Z` } })
}
function revise(state: GameSessionState, original: VoteRoundEntry, raisedSeatIds: number[], id: string, voided = false) {
  return gameSessionReducer(state, { type: 'revise-vote-round', originalEntryId: original.id, voided, reason: '核对原举手',
    draft: { ...original, segmentId: 'day', raisedSeatIds, ghostVoteSeatIds: raisedSeatIds.includes(1) ? [1] : [] },
    input: { id, createdAt: '2026-10-21T02:00:00Z' } })
}

describe('dead vote history boundary', () => {
  it.each([
    ['2026-10-21T01:00:00Z', '2026-10-21T01:00:00.001Z'],
    ['2026-10-21T01:00:00.000Z', '2026-10-21T01:00:00.000Z'],
  ])('orders legacy death %s before its appended vote %s despite mixed precision or reverse lexical IDs', (deathAt, voteAt) => {
    const state = fixture()
    state.initialPlayerStates[1].life = 'alive'
    const before = { ...state.initialPlayerStates[1] }
    state.timeline.push({ id: 'z-death-first', kind: 'player_state_changed', segmentId: 'day', createdAt: deathAt, confirmedBy: 'storyteller',
      seatId: 1, before, after: { ...before, life: 'dead' }, reason: '旧局死亡记录' })
    state.timeline.push({ id: 'a-unmarked-vote-after', kind: 'vote_round', segmentId: 'day', createdAt: voteAt, confirmedBy: 'storyteller',
      roundId: 'legacy', nominatorSeatId: 2, nomineeSeatId: 3, threshold: 3, raisedSeatIds: [1, 2], ghostVoteSeatIds: [] })
    const beforeText = JSON.stringify(state)
    expect(addVote(state, 'second')).toBe(state)
    expect(JSON.stringify(state)).toBe(beforeText)
  })
  it('rejects a second dead vote, including an unmarked dead raised hand through the direct command', () => {
    const once = addVote(fixture(), 'first')
    expect(addVote(once, 'second')).toBe(once)
    const first = once.timeline[0] as VoteRoundEntry
    const unmarked = gameSessionReducer(once, { type: 'append-phase-entry', phaseKind: 'day',
      entry: { ...first, roundId: 'unmarked', ghostVoteSeatIds: [] }, input: { id: 'unmarked', createdAt: '2026-10-21T01:03:00Z' } })
    expect(unmarked).toBe(once)
  })
  it('returns the vote after withdrawal or a correction removing that raised hand', () => {
    const once = addVote(fixture(), 'first')
    const first = once.timeline[0] as VoteRoundEntry
    expect(addVote(revise(once, first, [], 'withdraw', true), 'second').timeline).toHaveLength(3)
    expect(addVote(revise(once, first, [2], 'correct'), 'second').timeline).toHaveLength(3)
  })
  it('keeps a correction at the original vote position and rejects stealing a later consumed vote', () => {
    let state = addVote(fixture(), 'first', [2])
    state = addVote(state, 'second')
    expect(revise(state, state.timeline[0] as VoteRoundEntry, [1, 2], 'invalid-correction')).toBe(state)
    const second = state.timeline[1] as VoteRoundEntry
    expect(revise(state, second, [1, 2, 3], 'valid-correction').timeline).toHaveLength(3)
  })
  it('restores a new death vote after actual resurrection and permits justified manual extra votes', () => {
    const once = addVote(fixture(), 'first')
    const before = { ...once.initialPlayerStates[1] }
    once.timeline.push({ id: 'revive', kind: 'player_state_changed', segmentId: 'day', createdAt: '2026-10-21T01:01:10Z', confirmedBy: 'storyteller', seatId: 1, before, after: { ...before, life: 'alive' }, reason: '教授复活' })
    once.timeline.push({ id: 'redie', kind: 'player_state_changed', segmentId: 'day', createdAt: '2026-10-21T01:01:20Z', confirmedBy: 'storyteller', seatId: 1, before: { ...before, life: 'alive' }, after: before, reason: '再次死亡' })
    expect(addVote(once, 'second').timeline).toHaveLength(4)
    const original = once.timeline[0] as VoteRoundEntry
    const special = gameSessionReducer(once, { type: 'append-phase-entry', phaseKind: 'day',
      entry: { ...original, nominatorSeatId: 4, nomineeSeatId: 5, raisedSeatIds: [2], ghostVoteSeatIds: [], voteAdjustment: { count: 1, reason: '主持确认特殊能力的1号额外票' } },
      input: { id: 'special', createdAt: '2026-10-21T01:03:00Z' } })
    expect(special.timeline.at(-1)).toMatchObject({ id: 'special', voteAdjustment: { count: 1 } })
  })
  it('preserves imported legacy conflicts while preventing a new duplicate and accepts corrections unrelated to them', () => {
    const once = addVote(fixture(), 'first')
    const first = once.timeline[0] as VoteRoundEntry
    const oldDuplicate = { ...first, id: 'old-invalid', createdAt: '2026-10-21T01:02:00Z' }
    once.timeline.push(oldDuplicate)
    const restored = JSON.parse(JSON.stringify(once)) as GameSessionState
    expect(addVote(restored, 'new-invalid')).toBe(restored)
    const revised = revise(restored, oldDuplicate, [1, 2, 3], 'legacy-note')
    expect(revised.timeline.slice(0, 2)).toEqual(once.timeline)
    expect(revised.timeline.at(-1)?.id).toBe('legacy-note')
    expect(addVote(revised, 'ordinary', [2, 3]).timeline).toHaveLength(4)
  })
  it('uses the latest correction in a withdrawal and restoration chain, without rewriting the original', () => {
    const once = addVote(fixture(), 'first')
    const first = once.timeline[0] as VoteRoundEntry
    const withdrawn = revise(once, first, [], 'withdraw', true)
    const restored = revise(withdrawn, withdrawn.timeline.at(-1) as VoteRoundEntry, [1, 2], 'restore')
    expect(restored.timeline[0]).toEqual(first)
    expect(restored.timeline.at(-1)).toMatchObject({ correctionOf: 'withdraw', voided: false })
    expect(addVote(restored, 'second')).toBe(restored)
  })
})
