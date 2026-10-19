import { reduceStateFollowup } from './stateFollowupReducer'
import type { GameSessionState } from '../types'
import { createCatfishingSetupSession, createEmptyGameSession, createSmartScriptSetupSession, isSupportedScriptSetupPlayerCount, isSupportedSetupPlayerCount } from '../data/createPrototypeSession'
import { reduceDaySession } from './daySessionReducer'
import { reduceNightSession } from './nightSessionReducer'
import { reducePhaseSession } from './phaseSessionReducer'
import { confirmPlayerStateChange } from './playerStateReducer'
import { reduceSetupSession } from './setupSessionReducer'
import { reduceTimelineSession } from './timelineSessionReducer'
import type { GameSessionAction } from './sessionActions'
import { applyKazaliAllocation } from './applyKazaliAllocation'
import { confirmNightRoleChange } from './confirmNightRoleChange'

export type { GameSessionAction } from './sessionActions'

export function gameSessionReducer(state: GameSessionState, action: GameSessionAction): GameSessionState {
  switch (action.type) {
    case 'confirm-night-role-change':
      return confirmNightRoleChange(state, action)
    case 'apply-kazali-allocation':
      return applyKazaliAllocation(state, action)
    case 'add-state-followup':
    case 'dismiss-state-followup':
      return reduceStateFollowup(state, action)
    case 'set-setup-draft':
    case 'confirm-setup':
    case 'confirm-identity-presentation':
    case 'update-seat-nickname':
    case 'append-setup-change':
      return reduceSetupSession(state, action)
    case 'set-day-vote-draft':
    case 'clear-day-vote-draft':
    case 'revise-vote-round':
    case 'set-day-action-draft':
    case 'clear-day-action-draft':
    case 'confirm-day-execution':
    case 'confirm-day-no-execution':
      return reduceDaySession(state, action)
    case 'append-phase-entry':
    case 'append-correction':
      return reduceTimelineSession(state, action)
    case 'confirm-player-state-change':
      return confirmPlayerStateChange(state, action)
    case 'commit-night-workbench':
    case 'night-workbench-action':
    case 'replace-night-run':
    case 'set-active-night-run':
      return reduceNightSession(state, action)
    case 'open-phase-segment':
    case 'close-active-night-run':
    case 'start-next-night-run':
    case 'close-open-segment':
      return reducePhaseSession(state, action)
    case 'start-catfishing-setup-session':
      if (state.playerCount > 0 || state.timeline.length > 0 || state.phaseSegments.length > 0) return state
      if (action.playerCount !== undefined && !isSupportedSetupPlayerCount(action.playerCount)) return state
      return createCatfishingSetupSession(action.createdAt, {
        playerCount: action.playerCount,
        seats: action.seats,
      })
    case 'start-setup-session':
      if (state.timeline.length > 0 || state.phaseSegments.length > 0) return state
      if (action.playerCount !== undefined && !isSupportedScriptSetupPlayerCount(action.scriptId, action.playerCount)) return state
      return createSmartScriptSetupSession(action.scriptId, action.createdAt, {
        playerCount: action.playerCount,
        seats: action.seats,
      })
    case 'reset-session':
      return createEmptyGameSession(action.createdAt)
  }
}
