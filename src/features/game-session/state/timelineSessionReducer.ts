import type { GameSessionState } from '../types'
import { clearRecordedDayActionDraft } from './dayActionDraft'
import { appendCorrection, appendPhaseEntry, entryCanUsePhase } from './timeline'
import type { GameSessionAction } from './sessionActions'
import { canAppendHistoryCorrection } from './sessionReducerGuards'

type TimelineSessionActionType = 'append-phase-entry' | 'append-correction'

type TimelineSessionAction = Extract<GameSessionAction, { type: TimelineSessionActionType }>

export function reduceTimelineSession(state: GameSessionState, action: TimelineSessionAction): GameSessionState {
  switch (action.type) {
    case 'append-phase-entry': {
      if (!entryCanUsePhase(action.entry, action.phaseKind)) return state
      // 日终结果必须走下面两个显式领域命令，不能由通用记录入口绕过。
      if (action.entry.kind === 'execution' || action.entry.kind === 'no_execution' || action.entry.kind === 'player_state_changed') return state
      const appended = appendPhaseEntry(state, action.phaseKind, action.entry, action.input)
      if (appended.entry.kind === 'vote_round') {
        return {
          ...appended.state,
          dayVoteDraft: {
            segmentId: appended.segmentId,
            nominatorSeatId: null,
            nomineeSeatId: null,
            threshold: appended.entry.threshold,
            raisedSeatIds: [],
            ghostVoteSeatIds: [],
          },
        }
      }
      if (appended.entry.kind === 'day_action') {
        return {
          ...appended.state,
          dayActionDraft: clearRecordedDayActionDraft(state.dayActionDraft, appended.entry.category),
        }
      }
      if (appended.entry.kind !== 'night_action') return appended.state
      const run = appended.state.nightRuns[appended.entry.nightRunId]
      if (!run || run.phaseSegmentId === appended.segmentId) return appended.state
      return {
        ...appended.state,
        nightRuns: {
          ...appended.state.nightRuns,
          [run.id]: { ...run, phaseSegmentId: appended.segmentId },
        },
      }
    }
    case 'append-correction': {
      if (!canAppendHistoryCorrection(state, action)) return state
      const correction = appendCorrection(state, action.originalEntryId, action.entry, action.input)
      return correction?.state ?? state
    }
  }
}
