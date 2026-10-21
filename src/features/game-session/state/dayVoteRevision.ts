import { completeVoteRound } from '../../day-workbench/state/voteRound'
import type { GameSessionState } from '../types'
import type { GameSessionAction } from './sessionActions'
import { appendCorrection } from './timeline'
import { canRecordGhostVotes, normalizeDeadVotes } from '../../day-workbench/state/ghostVotes'

export function reviseVoteRound(state: GameSessionState, action: Extract<GameSessionAction, { type: 'revise-vote-round' }>) {
  const original = state.timeline.find((entry) => entry.id === action.originalEntryId)
  const reason = action.reason.trim()
  if (original?.kind !== 'vote_round' || !original.segmentId || !reason || reason.length > 500) return state
  const revised = action.voided ? { ...original, voided: true } : action.draft
    ? completeVoteRound(normalizeDeadVotes(state, action.draft, original.id), { ...action.input, roundId: original.roundId }) : null
  if (!revised || !state.seats[revised.nominatorSeatId] || !state.seats[revised.nomineeSeatId] ||
    revised.raisedSeatIds.some((seatId) => !state.seats[seatId]) || revised.ghostVoteSeatIds.some((seatId) => !state.seats[seatId])) return state
  if (!action.voided && !canRecordGhostVotes(state, revised, original.id)) return state
  const result = appendCorrection(state, original.id, {
    ...revised, voided: action.voided, correctionReason: reason,
  }, action.input)
  return result?.state ?? state
}
