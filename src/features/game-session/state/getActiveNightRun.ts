import type { GameSessionState, NightRunState } from '../types'

/** 只接受本局可浏览的夜序，缺失或损坏时保留原存档供恢复。 */
export function getActiveNightRun(session: GameSessionState): NightRunState | null {
  const id = session.activeNightRunId
  const run = id ? session.nightRuns[id] : undefined
  if (!run || run.id !== id || run.scriptId !== session.scriptId || run.playerCount !== session.playerCount ||
    !Array.isArray(run.queue) || !run.queue.length || !run.drafts || !run.aiAdviceLog) return null
  const ids = new Set(run.queue.map((item) => item?.id))
  if (ids.size !== run.queue.length || !ids.has(run.activeCursorId) || !ids.has(run.previewEntryId) ||
    run.queue.some((item) => !item || typeof item.id !== 'string' || !item.id || !session.seats[item.seatId])) return null
  if (run.phaseSegmentId && !session.phaseSegments.some((segment) => segment.id === run.phaseSegmentId && segment.kind === 'night')) return null
  return run
}
