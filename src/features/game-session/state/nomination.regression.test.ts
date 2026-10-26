import { describe, expect, it } from 'vitest'
import { createPrototypeGameSession } from '../data/createPrototypeSession'
import type { DayVoteDraft, GameSessionState, VoteRoundEntry } from '../types'
import { gameSessionReducer } from './sessionReducer'
import { nominationIssues } from '../../day-workbench/state/nominationRules'
import { hasVoteRoundDraftContent, setVoteNominator, setVoteNominee } from '../../day-workbench/state/voteRound'

function fixture() {
  const session = createPrototypeGameSession()
  session.timeline = []
  session.phaseSegments = [{ id: 'day', kind: 'day', sequence: 1, label: '第1天', createdAt: '2026-10-21T01:00:00Z' }]
  for (const state of Object.values(session.initialPlayerStates)) state.life = 'alive'
  return session
}
function draft(actor = 2, target = 3): DayVoteDraft {
  return { segmentId: 'day', nominatorSeatId: actor, nomineeSeatId: target, threshold: 3, raisedSeatIds: [2], ghostVoteSeatIds: [] }
}
function append(session: GameSessionState, nomination = draft()) {
  return gameSessionReducer(session, { type: 'append-phase-entry', phaseKind: 'day', entry: { ...nomination, kind: 'vote_round', roundId: `round-${session.timeline.length}`, nominatorSeatId: nomination.nominatorSeatId!, nomineeSeatId: nomination.nomineeSeatId! }, input: { id: `vote-${session.timeline.length}`, createdAt: `2026-10-21T01:00:${String(session.timeline.length + 1).padStart(2, '0')}Z` } })
}
function revise(session: GameSessionState, index: number, nomination: DayVoteDraft, voided = false) {
  return gameSessionReducer(session, { type: 'revise-vote-round', originalEntryId: session.timeline[index].id, draft: nomination, voided, reason: '核对提名原记录', input: { id: `correction-${session.timeline.length}`, createdAt: '2026-10-21T02:00:00Z' } })
}

describe('nomination command boundary', () => {
  it('treats unfinished special grounds as a draft and rechecks them when either player changes', () => {
    const pending = { ...draft(), nominatorSeatId: null, nomineeSeatId: null, raisedSeatIds: [], nominationExceptionReason: '待核对特殊能力' }
    expect(hasVoteRoundDraftContent(pending)).toBe(true)
    expect(setVoteNominator(pending, 2).nominationExceptionReason).toBe('')
    expect(setVoteNominee(pending, 3).nominationExceptionReason).toBe('')
    expect(hasVoteRoundDraftContent({ ...pending, nominationExceptionReason: '' })).toBe(false)
  })
  it('rejects a dead nominator at the shared command, but allows dead nominees and self nomination', () => {
    const session = fixture()
    session.initialPlayerStates[2].life = 'dead'
    const text = JSON.stringify(session)
    expect(append(session)).toBe(session)
    expect(nominationIssues(session, draft())[0]).toContain('已死亡')
    expect(JSON.stringify(session)).toBe(text)
    expect(append(session, draft(3, 2)).timeline).toHaveLength(1)
    expect(append(session, draft(3, 3)).timeline).toHaveLength(1)
  })
  it('independently blocks an actor reuse and a nominee reuse, without blocking an unused pair', () => {
    const once = append(fixture())
    expect(append(once, draft(2, 4))).toBe(once)
    expect(append(once, draft(4, 3))).toBe(once)
    expect(append(once, draft(4, 5)).timeline).toHaveLength(2)
  })
  it('resets nomination uses on the next day and does not reset them after resurrection the same day', () => {
    const once = append(fixture())
    const before = once.initialPlayerStates[2]
    once.timeline.push({ id: 'death', kind: 'player_state_changed', segmentId: 'day', createdAt: '2026-10-21T01:01:00Z', confirmedBy: 'storyteller', seatId: 2, before, after: { ...before, life: 'dead' }, reason: '死亡' })
    once.timeline.push({ id: 'revive', kind: 'player_state_changed', segmentId: 'day', createdAt: '2026-10-21T01:02:00Z', confirmedBy: 'storyteller', seatId: 2, before: { ...before, life: 'dead' }, after: before, reason: '复活' })
    expect(append(once)).toBe(once)
    once.phaseSegments[0].closedAt = '2026-10-21T03:00:00Z'
    once.phaseSegments.push({ id: 'day-2', kind: 'day', sequence: 2, label: '第2天', createdAt: '2026-10-22T01:00:00Z' })
    expect(append(once, { ...draft(), segmentId: 'day-2' }).timeline).toHaveLength(4)
  })
  it('checks a correction at its original time and rejects conflicts introduced into a later nomination', () => {
    let session = append(fixture())
    session = append(session, draft(4, 5))
    const before = session.initialPlayerStates[2]
    session.timeline.push({ id: 'later-death', kind: 'player_state_changed', segmentId: 'day', createdAt: '2026-10-21T01:01:00Z', confirmedBy: 'storyteller', seatId: 2, before, after: { ...before, life: 'dead' }, reason: '后来死亡' })
    expect(revise(session, 0, { ...draft(), raisedSeatIds: [3] }).timeline).toHaveLength(4)
    expect(revise(session, 0, draft(4, 3))).toBe(session)
    expect(revise(session, 0, draft(2, 5))).toBe(session)
  })
  it('withdraws and restores a correction chain without losing the original or stealing reused rights', () => {
    const once = append(fixture())
    const removed = revise(once, 0, draft(), true)
    expect(append(removed).timeline).toHaveLength(3)
    expect(revise(removed, 1, draft()).timeline.at(-1)).toMatchObject({ correctionOf: removed.timeline[1].id, voided: false })
    const reused = append(removed)
    expect(revise(reused, 1, draft())).toBe(reused)
    expect(reused.timeline[0]).toEqual(once.timeline[0])
  })
  it('keeps legacy conflicts editable but refuses a newly introduced one', () => {
    const session = append(fixture())
    session.timeline.push({ ...session.timeline[0], id: 'legacy-repeat', createdAt: '2026-10-21T01:01:00Z' })
    const restored = JSON.parse(JSON.stringify(session)) as GameSessionState
    expect(revise(restored, 1, { ...draft(), raisedSeatIds: [3] }).timeline).toHaveLength(3)
    expect(append(restored)).toBe(restored)
    expect(revise(restored, 1, draft(4, 2)).timeline).toHaveLength(3)
  })
  it('requires explicit bounded grounds for special nominations and keeps the grounds in the record', () => {
    const session = fixture()
    session.initialPlayerStates[2].life = 'dead'
    for (const reason of ['', '   ', 'x'.repeat(501), 123]) {
      expect(append(session, { ...draft(), nominationExceptionReason: reason as string })).toBe(session)
    }
    const special = append(session, { ...draft(), raisedSeatIds: [3], nominationExceptionReason: '  女妖：已核实由恶魔杀死，死后两次提名之一  ' })
    expect(special.timeline[0]).toMatchObject({ nominationExceptionReason: '女妖：已核实由恶魔杀死，死后两次提名之一' })
    expect(append(special, { ...draft(), nominationExceptionReason: '屠夫：处决后核实额外提名依据' }).timeline).toHaveLength(2)
    expect(append(special, draft(4, 3))).toBe(special)
    expect((special.timeline[0] as VoteRoundEntry).raisedSeatIds).toEqual([3])
  })
})
