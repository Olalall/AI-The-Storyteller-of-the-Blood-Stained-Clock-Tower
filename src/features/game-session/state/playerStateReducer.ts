import type { GameSessionState, PlayerState } from '../types'
import { projectCurrentPlayerStates } from './projectors'
import type { GameSessionAction } from './sessionActions'
import { hasTimelineId } from './sessionReducerGuards'

export function confirmPlayerStateChange(
  state: GameSessionState,
  action: Extract<GameSessionAction, { type: 'confirm-player-state-change' }>,
) {
  if (!state.seats[action.seatId] || hasTimelineId(state, action.entryId)) return state
  if (action.segmentId !== null && !state.phaseSegments.some((segment) => segment.id === action.segmentId && !segment.closedAt)) return state

  const before = projectCurrentPlayerStates(state)[action.seatId]
  if (!before || !samePlayerState(before, action.expectedBefore) || samePlayerState(before, action.after)) return state

  return {
    ...state,
    timeline: [...state.timeline, {
      id: action.entryId,
      kind: 'player_state_changed' as const,
      segmentId: action.segmentId,
      createdAt: action.confirmedAt,
      confirmedBy: 'storyteller' as const,
      seatId: action.seatId,
      before: clonePlayerState(before),
      after: clonePlayerState(action.after),
      reason: action.reason,
    }],
  }
}


function clonePlayerState(state: PlayerState): PlayerState {
  return { ...state, markers: state.markers.map((marker) => ({ ...marker })) }
}


function samePlayerState(left: PlayerState, right: PlayerState) {
  return left.life === right.life &&
    left.poisoned === right.poisoned &&
    left.drunk === right.drunk &&
    left.markers.length === right.markers.length &&
    left.markers.every((marker, index) => marker.id === right.markers[index]?.id && marker.label === right.markers[index]?.label)
}


