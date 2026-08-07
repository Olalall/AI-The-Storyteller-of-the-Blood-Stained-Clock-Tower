import type { GameSessionState, PlayerState } from '../types'
import { projectCurrentPlayerStates } from './projectors'

export interface DawnLifeChange {
  seatId: number
  nickname: string
  kind: 'died' | 'revived'
}

export interface DawnReport {
  /** 黄昏那一刻到现在，说书人手动改过的生死变化。 */
  changes: readonly DawnLifeChange[]
  /**
   * 本夜有多少条已确认记录写了死亡类结果，却没有对应的状态更新。
   * 只用来提示说书人去核对，绝不据此推断谁死了。
   */
  unappliedDeathHints: number
}

function statesAsOf(session: GameSessionState, iso: string): Record<number, PlayerState> {
  const projected = Object.fromEntries(Object.entries(session.initialPlayerStates).map(([seatId, state]) => [
    Number(seatId),
    { ...state, markers: state.markers.map((marker) => ({ ...marker })) },
  ])) as Record<number, PlayerState>

  const changes = session.timeline
    .filter((entry) => entry.kind === 'player_state_changed' && entry.createdAt <= iso)
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt) || left.id.localeCompare(right.id))

  for (const change of changes) {
    if (change.kind !== 'player_state_changed') continue
    projected[change.seatId] = { ...change.after, markers: change.after.markers.map((marker) => ({ ...marker })) }
  }
  return projected
}

const DEATH_WORDS = ['死亡', '处决', '死去']

/**
 * 黎明播报只做「黄昏快照 vs 当前状态」的差分展示。
 *
 * 它绝不由夜间确认记录反推谁应该死：那是自动结算，是产品明确排除的。
 * 夜间记录里出现的死亡类结果只折算成一个待核对计数，由说书人自己去更新状态。
 */
export function projectDawnReport(session: GameSessionState, nightSegmentId: string): DawnReport {
  const segment = session.phaseSegments.find((item) => item.id === nightSegmentId)
  if (!segment) return { changes: [], unappliedDeathHints: 0 }

  const before = statesAsOf(session, segment.createdAt)
  const after = projectCurrentPlayerStates(session)

  const changes: DawnLifeChange[] = []
  for (const [key, current] of Object.entries(after)) {
    const seatId = Number(key)
    const previous = before[seatId]
    if (!previous || previous.life === current.life) continue
    changes.push({
      seatId,
      nickname: session.seats[seatId]?.nickname ?? '',
      kind: current.life === 'dead' ? 'died' : 'revived',
    })
  }
  changes.sort((left, right) => left.seatId - right.seatId)

  const appliedSeats = new Set(changes.filter((change) => change.kind === 'died').map((change) => change.seatId))
  const unappliedDeathHints = session.timeline.filter((entry) => {
    if (entry.kind !== 'night_action' || entry.segmentId !== nightSegmentId) return false
    const text = `${entry.summary} ${entry.record.snapshot.storytellerResult}`
    if (!DEATH_WORDS.some((word) => text.includes(word))) return false
    return !entry.record.snapshot.targets.some((seatId) => appliedSeats.has(seatId))
  }).length

  return { changes, unappliedDeathHints }
}
