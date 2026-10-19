import type { DayVoteDraft, GameSessionState } from '../types'
import { projectStandingExecution } from '../../day-workbench/state/voteStanding'
import { cloneDayActionDraft } from './dayActionDraft'
import { findOpenSegment, getOrCreateOpenSegment } from './phaseSegments'
import { reviseVoteRound } from './dayVoteRevision'
import { projectCurrentPlayerStates } from './projectors'
import type { GameSessionAction } from './sessionActions'
import { hasDayResolution, hasTimelineId } from './sessionReducerGuards'

type DaySessionActionType =
  | 'set-day-vote-draft'
  | 'clear-day-vote-draft'
  | 'revise-vote-round'
  | 'set-day-action-draft'
  | 'clear-day-action-draft'
  | 'confirm-day-execution'
  | 'confirm-day-no-execution'

type DaySessionAction = Extract<GameSessionAction, { type: DaySessionActionType }>

export function reduceDaySession(state: GameSessionState, action: DaySessionAction): GameSessionState {
  switch (action.type) {
    case 'set-day-vote-draft':
      return { ...state, dayVoteDraft: cloneDayVoteDraft(action.draft) }
    case 'clear-day-vote-draft':
      return state.dayVoteDraft ? { ...state, dayVoteDraft: null } : state
    case 'revise-vote-round':
      return reviseVoteRound(state, action)
    case 'set-day-action-draft':
      return { ...state, dayActionDraft: cloneDayActionDraft(action.draft) }
    case 'clear-day-action-draft':
      return state.dayActionDraft ? { ...state, dayActionDraft: null } : state
    case 'confirm-day-execution': {
      const exceptionReason = action.exceptionReason?.trim()
      if (action.exceptionReason !== undefined && (!exceptionReason || exceptionReason.length > 500)) return state
      const pendingDay = !findOpenSegment(state, 'day') && action.daySegmentId === 'day-pending' && exceptionReason
      const working = pendingDay ? getOrCreateOpenSegment(state, 'day', action.confirmedAt).state : state
      const openDay = findOpenSegment(working, 'day')
      if (!openDay || (!pendingDay && openDay.id !== action.daySegmentId)) return state
      if (hasDayResolution(state, openDay.id) || hasTimelineId(state, action.executionEntryId) || hasTimelineId(state, action.playerStateEntryId)) {
        return state
      }

      const standing = projectStandingExecution(state.timeline, openDay.id)
      if (!exceptionReason && (!['leading', 'replaced'].includes(standing.status) ||
        standing.nomineeSeatId !== action.nomineeSeatId ||
        standing.sourceRoundId !== action.sourceRoundId)) {
        return state
      }

      const before = projectCurrentPlayerStates(state)[action.nomineeSeatId]
      if (!before || !state.seats[action.nomineeSeatId]) return state
      // 处决与死亡是两件事：说书人可裁定处决未造成死亡（弄臣、魔鬼代言人、精神病患者等），
      // 已死亡玩家也可被处决——两种情况都只记录处决事实，不写入状态变更。
      const causesDeath = (action.causesDeath ?? true) && before.life === 'alive'

      const executionEntry = {
        id: action.executionEntryId,
        kind: 'execution' as const,
        segmentId: openDay.id,
        createdAt: action.confirmedAt,
        confirmedBy: 'storyteller' as const,
        executedSeatId: action.nomineeSeatId,
        causedDeath: causesDeath,
        ...(exceptionReason ? { exceptionReason } : {}),
      }
      if (!causesDeath) {
        return { ...working, dayVoteDraft: null, timeline: [...state.timeline, executionEntry] }
      }

      return {
        ...working,
        dayVoteDraft: null,
        timeline: [...state.timeline,
          executionEntry,
          {
            id: action.playerStateEntryId,
            kind: 'player_state_changed',
            segmentId: openDay.id,
            createdAt: action.confirmedAt,
            confirmedBy: 'storyteller',
            seatId: action.nomineeSeatId,
            before,
            after: { ...before, life: 'dead' as const },
            reason: exceptionReason ? `说书人确认特殊处决：${exceptionReason}` : '说书人确认处决',
          },
        ],
      }
    }
    case 'confirm-day-no-execution': {
      const openDay = findOpenSegment(state, 'day')
      if (!openDay || openDay.id !== action.daySegmentId || hasDayResolution(state, openDay.id) || hasTimelineId(state, action.entryId)) {
        return state
      }
      return {
        ...state,
        timeline: [...state.timeline, {
          id: action.entryId,
          kind: 'no_execution',
          segmentId: openDay.id,
          createdAt: action.confirmedAt,
          confirmedBy: 'storyteller',
        }],
      }
    }
  }
}

function cloneDayVoteDraft(draft: DayVoteDraft): DayVoteDraft {
  return {
    ...draft,
    raisedSeatIds: [...draft.raisedSeatIds],
    ghostVoteSeatIds: [...draft.ghostVoteSeatIds],
    ...(draft.voteAdjustment ? { voteAdjustment: { ...draft.voteAdjustment } } : {}),
  }
}

