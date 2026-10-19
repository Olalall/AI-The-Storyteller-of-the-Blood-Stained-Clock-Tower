import { followupSource } from './followupSource'
import type { GameSessionState } from '../types'
import type { GameSessionAction } from './sessionActions'

export function reduceStateFollowup(state: GameSessionState, action: Extract<GameSessionAction, { type: 'add-state-followup' | 'dismiss-state-followup' }>): GameSessionState {
  const tasks = state.stateFollowups ?? []
  if (action.type === 'add-state-followup') {
    const source = state.timeline.find((entry) => entry.id === action.sourceEntryId && entry.kind === 'night_action')
    if (!source || followupSource(state, source.id)?.corrected || !state.seats[action.seatId] || !action.id.trim() || !action.note.trim() || tasks.some((task) => task.id === action.id)) return state
    return { ...state, stateFollowups: [...tasks, { id: action.id, sourceEntryId: source.id, seatId: action.seatId, note: action.note.trim().slice(0, 200), createdAt: action.createdAt }] }
  }
  if (!action.reason.trim() || !tasks.some((task) => task.id === action.id && !task.resolution)) return state
  return { ...state, stateFollowups: tasks.map((task) => task.id === action.id ? { ...task, resolution: { kind: 'dismissed', at: action.at, reason: action.reason.trim().slice(0, 200) } } : task) }
}
