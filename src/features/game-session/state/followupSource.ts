import type { GameSessionState, NightActionEntry } from '../types'

/** 更正沿原记录链追踪；绝不按角色名或相近时间猜测来源。 */
export function followupSource(session: GameSessionState, sourceEntryId: string) {
  const records = session.timeline.filter((entry): entry is NightActionEntry => entry.kind === 'night_action')
  const original = records.find((entry) => entry.id === sourceEntryId)
  if (!original) return null
  let latest = original
  const visited = new Set([original.id])
  for (;;) {
    const next = records.findLast((entry) => entry.correctionOf === latest.id && entry.nightRunId === original.nightRunId && entry.wakeItemId === original.wakeItemId && !visited.has(entry.id))
    if (!next) break
    latest = next
    visited.add(next.id)
  }
  return { original, latest, corrected: original.id !== latest.id }
}
