import type { GameSessionState } from '../types'
import type { GameSessionAction } from './sessionActions'
import { identityRoleChoices } from '../../identity-deal/identityProjection'
import { projectCurrentAssignments } from './projectors'
import { confirmOpeningPreparation, openingAssignmentKey, openingPreparationIssues } from './openingPreparation'
import { nightContextKey } from '../../night-workbench/state/gameSessionAdapter'

type SetupSessionActionType =
  | 'set-setup-draft'
  | 'confirm-opening-preparation'
  | 'confirm-setup'
  | 'confirm-identity-presentation'
  | 'update-seat-nickname'
  | 'append-setup-change'

type SetupSessionAction = Extract<GameSessionAction, { type: SetupSessionActionType }>

export function reduceSetupSession(state: GameSessionState, action: SetupSessionAction): GameSessionState {
  switch (action.type) {
    case 'confirm-opening-preparation':
      return action.expectedContextKey === nightContextKey(state) ? confirmOpeningPreparation(state, action.preparation) : state
    case 'set-setup-draft':
      return { ...state, setupDraft: action.draft }
    case 'confirm-identity-presentation': {
      const assignments = projectCurrentAssignments(state)
      if (!state.seats[action.seatId] || assignments.find((item) => item.seatId === action.seatId)?.role.id !== action.actualRoleId || !Number.isFinite(Date.parse(action.confirmedAt))) return state
      const role = identityRoleChoices(state.scriptId, action.actualRoleId, assignments).find((item) => item.id === action.shownRoleId)
      if (!role) return state
      return { ...state, identityPresentations: { ...state.identityPresentations, [action.seatId]: { actualRoleId: action.actualRoleId, shownRole: { ...role }, confirmedAt: action.confirmedAt } } }
    }
    case 'confirm-setup': {
      if (!state.setupDraft) return state
      if (state.timeline.some(e => e.id === `${action.id}-entry`) || !Number.isFinite(Date.parse(action.confirmedAt))) return state
      if (state.setupDraft.openingChoices && openingPreparationIssues(state.scriptId, state.setupDraft.assignments, state.setupDraft.openingChoices).length) return state
      const setup = {
        id: action.id,
        draft: structuredClone(state.setupDraft),
        confirmedAt: action.confirmedAt,
      }
      const next: GameSessionState = {
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
      if (!setup.draft.openingChoices) return next
      const prepared = confirmOpeningPreparation(next, { id: `${action.id}-opening`, setupId: setup.id,
        assignmentKey: openingAssignmentKey(setup.draft.assignments), choices: setup.draft.openingChoices, confirmedAt: action.confirmedAt })
      return prepared === next ? state : prepared
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
