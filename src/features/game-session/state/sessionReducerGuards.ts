import type { GameSessionState } from '../types'
import type { GameSessionAction } from './sessionActions'
import type { PhaseTimelineEntryInput } from './timeline'
import { wakeTargetsStructurallyValid } from '../../night-workbench/state/projectWakeDraft'
import { refreshNightRunHistoricalContext } from './nightHistoricalContext'

export function hasDayResolution(state: GameSessionState, segmentId: string) {
  return state.timeline.some((entry) =>
    entry.segmentId === segmentId && (entry.kind === 'execution' || entry.kind === 'no_execution'))
}


export function hasTimelineId(state: GameSessionState, id: string) {
  return state.timeline.some((entry) => entry.id === id)
}

/**
 * 日记里的“微调”只开放给不直接投影局面状态的行动记录。票型、状态、
 * 处决和身份调整仍必须走各自的显式工作台，不能被通用编辑器绕过。
 */

/**
 * 日记里的“微调”只开放给不直接投影局面状态的行动记录。票型、状态、
 * 处决和身份调整仍必须走各自的显式工作台，不能被通用编辑器绕过。
 */
export function canAppendHistoryCorrection(
  state: GameSessionState,
  action: Extract<GameSessionAction, { type: 'append-correction' }>,
) {
  const original = state.timeline.find((entry) => entry.id === action.originalEntryId)
  if (!original || !action.entry.correctionReason?.trim()) return false
  if (original.kind !== 'night_action' && original.kind !== 'day_action') return false
  if (action.entry.kind !== original.kind) return false

  if (original.kind === 'night_action' && action.entry.kind === 'night_action') {
    if (original.nightRunId !== action.entry.nightRunId || original.wakeItemId !== action.entry.wakeItemId) return false
    return canAppendNightActionEntry(state, action.entry)
  }

  return original.kind === 'day_action' && action.entry.kind === 'day_action' && original.category === action.entry.category
}

export function canAppendNightActionEntry(
  state: GameSessionState,
  entry: Extract<PhaseTimelineEntryInput, { kind: 'night_action' }>,
) {
  const run = state.nightRuns[entry.nightRunId]
  const item = run
    ? refreshNightRunHistoricalContext(state, run).find((candidate) => candidate.id === entry.wakeItemId)
    : undefined
  return Boolean(item
    && wakeTargetsStructurallyValid(item, entry.record.snapshot, state.playerCount))
}


