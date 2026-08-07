import type { GameSessionState } from '../game-session/types'

/** 主持台当前展示哪一段。夜与白天是真实记录段，黄昏与黎明是两段之间的交接卡。 */
export type DeckNode = 'dusk' | 'night' | 'dawn' | 'day'

/**
 * 从会话推导进入主持台时该落在哪一节。
 *
 * 只做「恢复上次位置」，不创建也不关闭任何记录段——刷新页面不应该改变对局事实。
 * 夜与白天同时开放时优先落在较晚开放的那一段（说书人多半刚切过去）。
 */
export function deckNodeForSession(session: GameSessionState): DeckNode {
  const openNight = session.phaseSegments.find((segment) => segment.kind === 'night' && !segment.closedAt)
  const openDay = session.phaseSegments.find((segment) => segment.kind === 'day' && !segment.closedAt)

  if (openNight && openDay) {
    return openNight.createdAt.localeCompare(openDay.createdAt) >= 0 ? 'night' : 'day'
  }
  if (openNight) return 'night'
  if (openDay) return 'day'
  return 'dusk'
}

/** 最近一个夜晚段；黎明播报要拿它做黄昏快照差分。 */
export function latestNightSegmentId(session: GameSessionState): string | null {
  return [...session.phaseSegments]
    .filter((segment) => segment.kind === 'night')
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
    .at(-1)?.id ?? null
}

/**
 * 预告下一段的编号。必须与 phaseSegments 的编号规则一致——那里保证编号不倒退
 * （已在第3夜时首次记录白天落在第3天，而不是第1天），交接卡若自己数一遍就会说谎。
 */
function nextSequence(session: GameSessionState, kind: 'night' | 'day'): number {
  const highest = (target: 'night' | 'day') => Math.max(0, ...session.phaseSegments
    .filter((segment) => segment.kind === target)
    .map((segment) => segment.sequence))
  return kind === 'day'
    ? Math.max(highest('day') + 1, highest('night'))
    : Math.max(highest('night') + 1, highest('day') + 1)
}

export function nextNightLabel(session: GameSessionState): string {
  const open = session.phaseSegments.find((segment) => segment.kind === 'night' && !segment.closedAt)
  return open?.label ?? `第${nextSequence(session, 'night')}夜`
}

export function nextDayLabel(session: GameSessionState): string {
  const open = session.phaseSegments.find((segment) => segment.kind === 'day' && !segment.closedAt)
  return open?.label ?? `第${nextSequence(session, 'day')}天`
}

export function isFirstNight(session: GameSessionState): boolean {
  return !session.phaseSegments.some((segment) => segment.kind === 'night')
}
