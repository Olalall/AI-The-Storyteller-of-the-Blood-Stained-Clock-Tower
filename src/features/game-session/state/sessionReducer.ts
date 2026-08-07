import type { GameSessionState } from '../types'
import { createCatfishingSetupSession, createEmptyGameSession, createSmartScriptSetupSession, isSupportedScriptSetupPlayerCount, isSupportedSetupPlayerCount } from '../data/createPrototypeSession'
import { reduceDaySession } from './daySessionReducer'
import { assertGrimoireOpInvariant } from './grimoireOpInvariant'
import { reduceNightSession } from './nightSessionReducer'
import { reducePhaseSession } from './phaseSessionReducer'
import { confirmPlayerStateChange } from './playerStateReducer'
import { reduceSetupSession } from './setupSessionReducer'
import { reduceTimelineSession } from './timelineSessionReducer'
import type { GameSessionAction } from './sessionActions'

export type { GameSessionAction } from './sessionActions'

export function gameSessionReducer(state: GameSessionState, action: GameSessionAction): GameSessionState {
  switch (action.type) {
    case 'set-setup-draft':
    case 'confirm-setup':
    case 'update-seat-nickname':
    case 'append-setup-change':
      return reduceSetupSession(state, action)
    case 'set-day-vote-draft':
    case 'clear-day-vote-draft':
    case 'set-day-action-draft':
    case 'clear-day-action-draft':
    case 'confirm-day-execution':
    case 'confirm-day-no-execution':
      return reduceDaySession(state, action)
    case 'append-phase-entry':
    case 'append-correction':
      return reduceTimelineSession(state, action)
    case 'confirm-player-state-change': {
      const next = confirmPlayerStateChange(state, action)
      // 只在写入真的落盘后校验。被守卫拒绝的 action 没有产生任何审计记录，
      // 对它报越界只会把真实漂移淹没在噪音里。落盘时 expectedBefore 已被守卫确认
      // 与投影出的 before 深等，所以它就是这条记录的「改动前」。
      if (next !== state) {
        assertGrimoireOpInvariant({
          seatId: action.seatId,
          before: action.expectedBefore,
          after: action.after,
          ops: action.ops,
        })
      }
      return next
    }
    case 'commit-night-workbench':
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
      if (state.playerCount > 0 || state.timeline.length > 0 || state.phaseSegments.length > 0) return state
      if (action.playerCount !== undefined && !isSupportedScriptSetupPlayerCount(action.scriptId, action.playerCount)) return state
      return createSmartScriptSetupSession(action.scriptId, action.createdAt, {
        playerCount: action.playerCount,
        seats: action.seats,
      })
    case 'set-hosting-mode': {
      // arch-allow: hosting-mode-not-behavioural 唯一写入点上的幂等判断：比较旧值只为避免写重复的 history 条目，不改变任何对局行为
      if (state.hostingMode === action.mode) return state
      return {
        ...state,
        hostingMode: action.mode,
        hostingModeHistory: [
          ...(state.hostingModeHistory ?? []),
          { mode: action.mode, changedAt: action.changedAt, phaseLabel: action.phaseLabel },
        ],
      }
    }
    case 'reset-session':
      return createEmptyGameSession()
    case 'replace-session':
      return action.session
  }
}
