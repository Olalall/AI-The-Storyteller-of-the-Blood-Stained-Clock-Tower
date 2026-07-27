import { describe, expect, it } from 'vitest'
import type { TimelineEntry, VoteRoundEntry } from '../../game-session/types'
import {
  canCompleteVoteRound,
  completeVoteRound,
  createVoteRoundDraft,
  setVoteNominator,
  setVoteNominee,
  toggleGhostVote,
  toggleRaisedVote,
} from './voteRound'
import { projectStandingExecution } from './voteStanding'

function voteRound(
  roundId: string,
  nomineeSeatId: number,
  raisedSeatIds: number[],
  threshold = 5,
  createdAt = `2026-07-13T00:0${roundId}:00.000Z`,
): VoteRoundEntry {
  return {
    id: `entry-${roundId}`,
    kind: 'vote_round',
    roundId,
    segmentId: 'day-1',
    nominatorSeatId: 1,
    nomineeSeatId,
    threshold,
    raisedSeatIds,
    ghostVoteSeatIds: [],
    createdAt,
    confirmedBy: 'storyteller',
  }
}

describe('vote round draft', () => {
  it('records a zero-vote nomination without changing any player state', () => {
    let draft = createVoteRoundDraft('day-1', 5)
    draft = setVoteNominator(draft, 2)
    draft = setVoteNominee(draft, 6)

    const completed = completeVoteRound(draft, {
      id: 'vote-1',
      roundId: 'round-1',
      createdAt: '2026-07-13T00:00:00.000Z',
    })

    expect(canCompleteVoteRound(draft)).toBe(true)
    expect(completed).toMatchObject({
      kind: 'vote_round',
      nominatorSeatId: 2,
      nomineeSeatId: 6,
      raisedSeatIds: [],
      ghostVoteSeatIds: [],
    })
    expect('playerStates' in (completed ?? {})).toBe(false)
  })

  it('keeps ghost votes inside the recorded raised hands and removes them with the hand', () => {
    let draft = createVoteRoundDraft('day-1', 5)
    draft = toggleRaisedVote(draft, 8)
    draft = toggleGhostVote(draft, 8)
    draft = toggleRaisedVote(draft, 8)

    expect(draft.raisedSeatIds).toEqual([])
    expect(draft.ghostVoteSeatIds).toEqual([])
    expect(toggleGhostVote(draft, 8)).toBe(draft)
  })
})

describe('standing execution projection', () => {
  it('returns none when the day has no completed vote rounds', () => {
    expect(projectStandingExecution([], 'day-1')).toEqual({ status: 'none' })
  })

  it('returns below threshold for a recorded zero-vote round', () => {
    const result = projectStandingExecution([voteRound('1', 6, [])], 'day-1')

    expect(result).toMatchObject({
      status: 'below_threshold',
      nomineeSeatId: 6,
      voteCount: 0,
      threshold: 5,
    })
  })

  it('marks a unique qualified nominee as leading', () => {
    const result = projectStandingExecution([voteRound('1', 6, [1, 2, 3, 4, 5])], 'day-1')

    expect(result).toMatchObject({ status: 'leading', nomineeSeatId: 6, voteCount: 5 })
  })

  it('marks a higher qualified nomination as replacing the previous leader', () => {
    const result = projectStandingExecution([
      voteRound('1', 6, [1, 2, 3, 4, 5]),
      voteRound('2', 9, [1, 2, 3, 4, 5, 6]),
    ], 'day-1')

    expect(result).toMatchObject({
      status: 'replaced',
      nomineeSeatId: 9,
      previousNomineeSeatId: 6,
      voteCount: 6,
    })
  })

  it('marks equal highest qualified nominations as tied', () => {
    const result = projectStandingExecution([
      voteRound('1', 6, [1, 2, 3, 4, 5]),
      voteRound('2', 9, [1, 2, 3, 4, 5]),
    ], 'day-1')

    expect(result).toEqual({ status: 'tied', voteCount: 5, tiedSeatIds: [6, 9] })
  })

  it('uses only rounds from the requested day segment and accepts TimelineEntry arrays', () => {
    const entries: TimelineEntry[] = [
      voteRound('1', 6, [1, 2, 3, 4, 5]),
      { ...voteRound('2', 9, [1, 2, 3, 4, 5, 6]), segmentId: 'day-2' },
    ]

    expect(projectStandingExecution(entries, 'day-1')).toMatchObject({
      status: 'leading',
      nomineeSeatId: 6,
      voteCount: 5,
    })
  })

  it('uses only the latest version when an imported vote record has a correction chain', () => {
    const original = voteRound('1', 6, [1, 2, 3, 4, 5, 6])
    const correction: VoteRoundEntry = {
      ...original,
      id: 'entry-1-correction',
      createdAt: '2026-07-13T00:02:00.000Z',
      raisedSeatIds: [1, 2],
      correctionOf: original.id,
      correctionReason: '旧记录导入时票数有误',
    }

    expect(projectStandingExecution([original, correction], 'day-1')).toMatchObject({
      status: 'below_threshold',
      nomineeSeatId: 6,
      voteCount: 2,
    })
  })
})
