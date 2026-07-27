import type { GameSessionState } from '../types'
import type { GameSessionAction } from './sessionActions'

type SetupSessionActionType =
  | 'set-setup-draft'
  | 'confirm-setup'
  | 'update-seat-nickname'
  | 'append-setup-change'

type SetupSessionAction = Extract<GameSessionAction, { type: SetupSessionActionType }>

export function reduceSetupSession(state: GameSessionState, action: SetupSessionAction): GameSessionState {
  switch (action.type) {
    case 'set-setup-draft':
      return { ...state, setupDraft: action.draft }
    case 'confirm-setup': {
      if (!state.setupDraft) return state
      const setup = {
        id: action.id,
        draft: structuredClone(state.setupDraft),
        confirmedAt: action.confirmedAt,
      }
      return {
        ...state,
        setupDraft: null,
        timeline: [...state.timeline, {
          id: `${action.id}-entry`,
          kind: 'setup_confirmed',
          segmentId: null,
          createdAt: action.confirmedAt,
          confirmedBy: 'storyteller',
          setup,
        }],
      }
    }
    case 'update-seat-nickname': {
      const seat = state.seats[action.seatId]
      const nickname = action.nickname.trim()
      if (!seat || seat.nickname === nickname) return state
      return {
        ...state,
        seats: { ...state.seats, [action.seatId]: { ...seat, nickname } },
      }
    }
    case 'append-setup-change':
      {
        const currentSetup = state.timeline.filter((entry) => entry.kind === 'setup_confirmed').at(-1)
        if (!currentSetup || currentSetup.kind !== 'setup_confirmed') return state
      return {
        ...state,
        timeline: [...state.timeline, {
          id: action.id,
          kind: 'setup_changed',
          segmentId: null,
          createdAt: action.createdAt,
          confirmedBy: 'storyteller',
          baseSetupId: currentSetup.setup.id,
          originNightRunId: null,
          seatId: action.seatId,
          fromRole: { ...action.fromRole },
          toRole: { ...action.toRole },
          reason: action.reason,
          effectiveFrom: 'future_workbenches',
        }],
      }
      }
  }
}
