import type { DayVoteDraft, GameSessionState, PlayerState } from '../../game-session/types'
import { orderedEntries } from './ghostVotes'

type Nomination = Pick<DayVoteDraft, 'segmentId' | 'nominatorSeatId' | 'nomineeSeatId' | 'nominationExceptionReason'>
type Uses = { nominators: Set<number>; nominees: Set<number> }

export function validNominationException(value: unknown) {
  return value === undefined || (typeof value === 'string' && value.trim().length > 0 && value.length <= 500)
}

function issues(session: GameSessionState, nomination: Omit<Nomination, 'segmentId'>, states: Record<number, PlayerState>, used?: Uses) {
  const result = new Map<string, string>()
  const { nominatorSeatId: actor, nomineeSeatId: target } = nomination
  for (const seat of [actor, target]) if (seat !== null && !session.seats[seat]) result.set('seat:' + seat, '座位不存在，请重新选择')
  if (!validNominationException(nomination.nominationExceptionReason)) {
    result.set('exception', '请填写特殊提名依据（1—500字）')
    return result
  }
  if (nomination.nominationExceptionReason?.trim()) return result
  if (actor !== null && states[actor]?.life === 'dead') result.set('dead:' + actor, actor + '号已死亡，不能发起常规提名')
  if (actor !== null && used?.nominators.has(actor)) result.set('actor:' + actor, actor + '号今天已提名过')
  if (target !== null && used?.nominees.has(target)) result.set('target:' + target, target + '号今天已被提名过')
  return result
}

function replay(session: GameSessionState, replacement?: { id: string; draft: Nomination }) {
  const states = { ...session.initialPlayerStates }
  const byDay = new Map<string, Uses>()
  const conflicts = new Map<string, string>()
  for (const { original, latest } of orderedEntries(session)) {
    if (latest.kind === 'player_state_changed') states[latest.seatId] = latest.after
    if (latest.kind !== 'vote_round') continue
    const entry = latest.id === replacement?.id ? { ...latest, ...replacement.draft, voided: false } : latest
    if (entry.voided) continue
    const day = original.segmentId ?? entry.segmentId ?? 'day-pending'
    const used = byDay.get(day) ?? { nominators: new Set<number>(), nominees: new Set<number>() }
    for (const [key, message] of issues(session, entry, states, used)) conflicts.set(original.id + ':' + key, message)
    if (entry.nominatorSeatId !== null) used.nominators.add(entry.nominatorSeatId)
    if (entry.nomineeSeatId !== null) used.nominees.add(entry.nomineeSeatId)
    byDay.set(day, used)
  }
  return { states, byDay, conflicts }
}

/** 更正按原记录的位置核对；不重写旧局，也不把后来死亡误算到过去。 */
export function nominationIssues(session: GameSessionState, draft: Nomination, originalEntryId?: string) {
  if (!validNominationException(draft.nominationExceptionReason)) return ['请填写特殊提名依据（1—500字）']
  const before = replay(session)
  if (!originalEntryId) return [...issues(session, draft, before.states, before.byDay.get(draft.segmentId)).values()]
  const after = replay(session, { id: originalEntryId, draft })
  return [...after.conflicts].filter(([key]) => !before.conflicts.has(key)).map(([, message]) => message)
}
