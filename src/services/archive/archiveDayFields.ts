import type { GameSessionState } from '../../features/game-session/types'
import { validVoteAdjustment } from '../../features/day-workbench/state/voteRound'

export function validArchiveDayFields(session: GameSessionState) {
  const validVote = (round: Parameters<typeof validVoteAdjustment>[0]) => Array.isArray(round.raisedSeatIds) && validVoteAdjustment(round)
  return Array.isArray(session.timeline) && session.timeline.every((entry) => {
    if (!entry || typeof entry !== 'object') return false
    if (entry.kind === 'vote_round') return (entry.voided === undefined || typeof entry.voided === 'boolean') && validVote(entry)
    return entry.kind !== 'execution' || entry.exceptionReason === undefined || typeof entry.exceptionReason === 'string'
  }) && (!session.dayVoteDraft || validVote(session.dayVoteDraft))
}
