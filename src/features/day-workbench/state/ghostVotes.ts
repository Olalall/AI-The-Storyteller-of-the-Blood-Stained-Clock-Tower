import type { GameSessionState, PlayerState, TimelineEntry, VoteRoundEntry } from '../../game-session/types'
import type { VoteRoundDraft } from './voteRound'

type VoteInput = Pick<VoteRoundEntry, 'raisedSeatIds' | 'ghostVoteSeatIds'>

/** 更正在原投票发生的位置生效，不用补录时间重新消耗死亡票。 */
export function orderedEntries(session: GameSessionState) {
  const changes = new Map(session.timeline.filter((entry) => entry.correctionOf).map((entry) => [entry.correctionOf!, entry]))
  return session.timeline.filter((entry) => !entry.correctionOf)
    // 旧时间可有不同毫秒精度；稳定排序保留同毫秒的真实追加顺序。
    .sort((left, right) => Date.parse(left.createdAt) - Date.parse(right.createdAt))
    .map((original) => {
      let latest = original
      const seen = new Set<string>()
      while (changes.has(latest.id) && !seen.has(latest.id)) {
        seen.add(latest.id)
        latest = changes.get(latest.id)!
      }
      return { original, latest }
    })
}

function replay(session: GameSessionState, replacement?: { id: string; vote: VoteInput }, stopBeforeId?: string) {
  const states: Record<number, PlayerState> = { ...session.initialPlayerStates }
  const used = new Set<number>()
  const conflicts = new Map<string, number>()
  for (const { original, latest } of orderedEntries(session)) {
    if (latest.id === stopBeforeId) break
    const entry: TimelineEntry = latest.kind === 'vote_round' && latest.id === replacement?.id
      ? { ...latest, ...replacement.vote, voided: false } : latest
    if (entry.kind === 'player_state_changed') {
      if (states[entry.seatId]?.life === 'dead' && entry.after.life === 'alive') used.delete(entry.seatId)
      states[entry.seatId] = entry.after
    } else if (entry.kind === 'vote_round' && !entry.voided) {
      for (const seatId of new Set(entry.raisedSeatIds)) {
        if (states[seatId]?.life !== 'dead' && !entry.ghostVoteSeatIds.includes(seatId)) continue
        if (used.has(seatId)) conflicts.set(`${original.id}:${seatId}`, seatId)
        used.add(seatId)
      }
    }
  }
  return { states, used, conflicts }
}

export function votePlayerStates(session: GameSessionState, originalEntryId?: string) {
  return replay(session, undefined, originalEntryId).states
}

export function invalidGhostVoteSeats(session: GameSessionState, draft: VoteInput, originalEntryId?: string) {
  if (!originalEntryId) {
    const { states, used } = replay(session)
    return draft.raisedSeatIds.filter((seatId) => used.has(seatId) &&
      (states[seatId]?.life === 'dead' || draft.ghostVoteSeatIds.includes(seatId)))
  }
  const before = replay(session).conflicts
  const after = replay(session, { id: originalEntryId, vote: draft }).conflicts
  return [...new Set([...after].filter(([key]) => !before.has(key)).map(([, seatId]) => seatId))]
}

export function canRecordGhostVotes(session: GameSessionState, draft: VoteInput, originalEntryId?: string) {
  return draft.ghostVoteSeatIds.every((seatId) => draft.raisedSeatIds.includes(seatId)) &&
    invalidGhostVoteSeats(session, draft, originalEntryId).length === 0
}

export function normalizeDeadVotes(session: GameSessionState, draft: VoteRoundDraft, originalEntryId?: string) {
  const states = votePlayerStates(session, originalEntryId)
  return { ...draft, ghostVoteSeatIds: [...new Set([...draft.ghostVoteSeatIds, ...draft.raisedSeatIds.filter((seatId) => states[seatId]?.life === 'dead')])] }
}
