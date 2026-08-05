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

export function nextNightLabel(session: GameSessionState): string {
  const nights = session.phaseSegments.filter((segment) => segment.kind === 'night')
  const open = nights.find((segment) => !segment.closedAt)
  return open?.label ?? `第${nights.length + 1}夜`
}

export function nextDayLabel(session: GameSessionState): string {
  const days = session.phaseSegments.filter((segment) => segment.kind === 'day')
  const open = days.find((segment) => !segment.closedAt)
  return open?.label ?? `第${days.length + 1}天`
}

export function isFirstNight(session: GameSessionState): boolean {
  return !session.phaseSegments.some((segment) => segment.kind === 'night')
}
