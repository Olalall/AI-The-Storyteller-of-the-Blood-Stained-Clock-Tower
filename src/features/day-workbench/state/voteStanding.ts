import type { TimelineEntry, VoteRoundEntry } from '../../game-session/types'
import { projectEffectiveTimelineEntries } from '../../game-session/state/projectTimelineHistory'

export type StandingExecutionStatus = 'leading' | 'replaced' | 'tied' | 'below_threshold' | 'none'

export interface StandingExecution {
  status: StandingExecutionStatus
  nomineeSeatId?: number
  voteCount?: number
  threshold?: number
  sourceRoundId?: string
  previousNomineeSeatId?: number
  tiedSeatIds?: number[]
}

interface CandidateScore {
  nomineeSeatId: number
  voteCount: number
  threshold: number
  roundId: string
  createdAt: string
  entryId: string
}

function isVoteRoundEntry(entry: TimelineEntry): entry is VoteRoundEntry {
  return entry.kind === 'vote_round'
}

function chronological(rounds: readonly VoteRoundEntry[]) {
  return [...rounds].sort((left, right) =>
    left.createdAt.localeCompare(right.createdAt) || left.id.localeCompare(right.id))
}

function voteCount(round: VoteRoundEntry) {
  return new Set(round.raisedSeatIds).size
}

function higherScore(left: CandidateScore, right: CandidateScore) {
  return left.voteCount > right.voteCount ||
    (left.voteCount === right.voteCount && (
      left.createdAt > right.createdAt ||
      (left.createdAt === right.createdAt && left.entryId > right.entryId)
    ))
}

function buildCandidateScores(rounds: readonly VoteRoundEntry[]) {
  const scores = new Map<number, CandidateScore>()

  for (const round of rounds) {
    const count = voteCount(round)
    if (count < round.threshold) continue

    const score: CandidateScore = {
      nomineeSeatId: round.nomineeSeatId,
      voteCount: count,
      threshold: round.threshold,
      roundId: round.roundId,
      createdAt: round.createdAt,
      entryId: round.id,
    }
    const previous = scores.get(score.nomineeSeatId)
    if (!previous || higherScore(score, previous)) scores.set(score.nomineeSeatId, score)
  }

  return [...scores.values()]
}

function projectQualifiedStanding(rounds: readonly VoteRoundEntry[]): StandingExecution {
  if (rounds.length === 0) return { status: 'none' }

  const scores = buildCandidateScores(rounds)
  if (scores.length === 0) {
    const highestRound = [...rounds].sort((left, right) =>
      voteCount(right) - voteCount(left) || right.createdAt.localeCompare(left.createdAt) || right.id.localeCompare(left.id),
    )[0]
    return {
      status: 'below_threshold',
      nomineeSeatId: highestRound.nomineeSeatId,
      voteCount: voteCount(highestRound),
      threshold: highestRound.threshold,
      sourceRoundId: highestRound.roundId,
    }
  }

  const highestVoteCount = Math.max(...scores.map((score) => score.voteCount))
  const leaders = scores.filter((score) => score.voteCount === highestVoteCount)
  if (leaders.length > 1) {
    return {
      status: 'tied',
      voteCount: highestVoteCount,
      tiedSeatIds: leaders.map((score) => score.nomineeSeatId).sort((left, right) => left - right),
    }
  }

  const leader = leaders[0]
  return {
    status: 'leading',
    nomineeSeatId: leader.nomineeSeatId,
    voteCount: leader.voteCount,
    threshold: leader.threshold,
    sourceRoundId: leader.roundId,
  }
}

function previousStandingBefore(rounds: readonly VoteRoundEntry[], leader: StandingExecution) {
  if (!leader.sourceRoundId) return { status: 'none' } as StandingExecution
  const sourceIndex = rounds.findIndex((round) => round.roundId === leader.sourceRoundId)
  if (sourceIndex <= 0) return { status: 'none' } as StandingExecution
  return projectQualifiedStanding(rounds.slice(0, sourceIndex))
}

export function projectStandingExecution(
  entries: readonly TimelineEntry[],
  segmentId: string,
): StandingExecution {
  const rounds = chronological(projectEffectiveTimelineEntries(entries).filter((entry): entry is VoteRoundEntry =>
    isVoteRoundEntry(entry) && entry.segmentId === segmentId,
  ))
  const current = projectQualifiedStanding(rounds)
  if (current.status !== 'leading' || !current.nomineeSeatId) return current

  const previous = previousStandingBefore(rounds, current)
  if (previous.status === 'leading' &&
    previous.nomineeSeatId !== current.nomineeSeatId &&
    (previous.voteCount ?? 0) < (current.voteCount ?? 0)) {
    return { ...current, status: 'replaced', previousNomineeSeatId: previous.nomineeSeatId }
  }

  return current
}
