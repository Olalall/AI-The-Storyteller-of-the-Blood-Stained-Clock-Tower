import type { DayVoteDraft, VoteRoundEntry } from '../../game-session/types'

export type VoteRoundDraft = DayVoteDraft

export interface CompleteVoteRoundInput {
  id: string
  roundId: string
  createdAt: string
}

function uniqueSeatIds(seatIds: readonly number[]) {
  return [...new Set(seatIds)].sort((left, right) => left - right)
}

function hasSeat(seatIds: readonly number[], seatId: number) {
  return seatIds.includes(seatId)
}

/**
 * 处决门槛：票数达到或超过存活玩家人数的一半即成功（向上取整）。
 * 依据钟楼百科《规则概要》：「他的票数等于或超过了存活玩家人数的一半」——
 * 六名存活时三票即成功。门槛随白天中的死亡变化，说书人仍可手动改写。
 */
export function executionThresholdForAliveCount(aliveCount: number) {
  return Math.max(1, Math.ceil(aliveCount / 2))
}

export function createVoteRoundDraft(segmentId: string, threshold: number): VoteRoundDraft {
  return {
    segmentId,
    nominatorSeatId: null,
    nomineeSeatId: null,
    threshold,
    raisedSeatIds: [],
    ghostVoteSeatIds: [],
  }
}

export function setVoteNominator(draft: VoteRoundDraft, seatId: number): VoteRoundDraft {
  return { ...draft, nominatorSeatId: seatId }
}

export function setVoteNominee(draft: VoteRoundDraft, seatId: number): VoteRoundDraft {
  return { ...draft, nomineeSeatId: seatId }
}

export function toggleRaisedVote(draft: VoteRoundDraft, seatId: number): VoteRoundDraft {
  const raisedSeatIds = hasSeat(draft.raisedSeatIds, seatId)
    ? draft.raisedSeatIds.filter((candidate) => candidate !== seatId)
    : uniqueSeatIds([...draft.raisedSeatIds, seatId])
  const ghostVoteSeatIds = draft.ghostVoteSeatIds.filter((candidate) => raisedSeatIds.includes(candidate))

  return { ...draft, raisedSeatIds, ghostVoteSeatIds }
}

export function toggleGhostVote(draft: VoteRoundDraft, seatId: number): VoteRoundDraft {
  if (!hasSeat(draft.raisedSeatIds, seatId)) return draft

  const ghostVoteSeatIds = hasSeat(draft.ghostVoteSeatIds, seatId)
    ? draft.ghostVoteSeatIds.filter((candidate) => candidate !== seatId)
    : uniqueSeatIds([...draft.ghostVoteSeatIds, seatId])

  return { ...draft, ghostVoteSeatIds }
}

export function canCompleteVoteRound(draft: VoteRoundDraft) {
  return Number.isInteger(draft.threshold) &&
    draft.threshold > 0 &&
    draft.nominatorSeatId !== null &&
    draft.nomineeSeatId !== null
}

export function hasVoteRoundDraftContent(draft: VoteRoundDraft) {
  return draft.nominatorSeatId !== null ||
    draft.nomineeSeatId !== null ||
    draft.raisedSeatIds.length > 0 ||
    draft.ghostVoteSeatIds.length > 0
}

export function completeVoteRound(
  draft: VoteRoundDraft,
  input: CompleteVoteRoundInput,
): VoteRoundEntry | null {
  const { nominatorSeatId, nomineeSeatId } = draft
  if (!canCompleteVoteRound(draft) || nominatorSeatId === null || nomineeSeatId === null) return null

  const raisedSeatIds = uniqueSeatIds(draft.raisedSeatIds)
  const ghostVoteSeatIds = uniqueSeatIds(draft.ghostVoteSeatIds)
    .filter((seatId) => raisedSeatIds.includes(seatId))

  return {
    id: input.id,
    kind: 'vote_round',
    roundId: input.roundId,
    segmentId: draft.segmentId,
    nominatorSeatId,
    nomineeSeatId,
    threshold: draft.threshold,
    raisedSeatIds,
    ghostVoteSeatIds,
    createdAt: input.createdAt,
    confirmedBy: 'storyteller',
  }
}
