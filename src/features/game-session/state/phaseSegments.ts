import type { GameSessionState, PhaseKind, PhaseSegment } from '../types'

function segmentLabel(kind: PhaseKind, sequence: number) {
  return kind === 'night' ? `第${sequence}夜` : `第${sequence}天`
}

export function findOpenSegment(state: GameSessionState, kind: PhaseKind) {
  return state.phaseSegments.find((segment) => segment.kind === kind && !segment.closedAt)
}

export function createPhaseSegment(
  state: GameSessionState,
  kind: PhaseKind,
  now: string,
): { state: GameSessionState; segment: PhaseSegment } {
  const highestSameKind = Math.max(0, ...state.phaseSegments
    .filter((segment) => segment.kind === kind)
    .map((segment) => segment.sequence))
  const otherKind: PhaseKind = kind === 'night' ? 'day' : 'night'
  const highestOtherKind = Math.max(0, ...state.phaseSegments
    .filter((segment) => segment.kind === otherKind)
    .map((segment) => segment.sequence))

  /**
   * 昼夜仍可手动并存、关闭和补记；这里只保证编号不倒退。
   * 例如当前已在第3夜，首次记录白天时应落在第3天，而不是第1天。
   */
  const sequence = kind === 'day'
    ? Math.max(highestSameKind + 1, highestOtherKind)
    : Math.max(highestSameKind + 1, highestOtherKind + 1)
  const segment: PhaseSegment = {
    id: `${kind}-${sequence}`,
    kind,
    sequence,
    label: segmentLabel(kind, sequence),
    createdAt: now,
  }
  return { state: { ...state, phaseSegments: [...state.phaseSegments, segment] }, segment }
}

export function getOrCreateOpenSegment(
  state: GameSessionState,
  kind: PhaseKind,
  now: string,
): { state: GameSessionState; segment: PhaseSegment; created: boolean } {
  const existing = findOpenSegment(state, kind)
  if (existing) return { state, segment: existing, created: false }
  const created = createPhaseSegment(state, kind, now)
  return { ...created, created: true }
}

export function closePhaseSegment(state: GameSessionState, segmentId: string, now: string) {
  const segment = state.phaseSegments.find((item) => item.id === segmentId)
  if (!segment || segment.closedAt) return state
  return {
    ...state,
    phaseSegments: state.phaseSegments.map((item) => item.id === segmentId ? { ...item, closedAt: now } : item),
  }
}
