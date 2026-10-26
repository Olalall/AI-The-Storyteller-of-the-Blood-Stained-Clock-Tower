import type { GameSessionState } from '../types'
import { assertNever } from '../../../shared/assertNever'
import { clearRecordedDayActionDraft } from './dayActionDraft'
import { appendCorrection, appendPhaseEntry, entryCanUsePhase } from './timeline'
import type { GameSessionAction } from './sessionActions'
import { canAppendHistoryCorrection, canAppendNightActionEntry, hasDayResolution } from './sessionReducerGuards'
import { canCompleteVoteRound } from '../../day-workbench/state/voteRound'
import { findOpenSegment } from './phaseSegments'
import { canRecordGhostVotes, normalizeDeadVotes } from '../../day-workbench/state/ghostVotes'
import { nominationIssues } from '../../day-workbench/state/nominationRules'

type TimelineSessionActionType = 'append-phase-entry' | 'append-correction'

type TimelineSessionAction = Extract<GameSessionAction, { type: TimelineSessionActionType }>

export function reduceTimelineSession(state: GameSessionState, action: TimelineSessionAction): GameSessionState {
  switch (action.type) {
    case 'append-phase-entry': {
      if (!entryCanUsePhase(action.entry, action.phaseKind)) return state
      const entry = action.entry
      if (entry.kind === 'vote_round') {
        const day = findOpenSegment(state, 'day')
        if (entry.correctionOf || entry.voided || !canCompleteVoteRound({ ...entry, segmentId: day?.id ?? 'day-pending' }) ||
          !state.seats[entry.nominatorSeatId] || !state.seats[entry.nomineeSeatId] ||
          entry.raisedSeatIds.some((id) => !state.seats[id]) || entry.ghostVoteSeatIds.some((id) => !state.seats[id]) ||
          !canRecordGhostVotes(state, entry) ||
          nominationIssues(state, { ...entry, segmentId: day?.id ?? 'day-pending' }).length > 0 ||
          (day && hasDayResolution(state, day.id))) return state
      }
      switch (entry.kind) {
        // 日终结果与玩家状态必须走显式领域命令，不能由通用记录入口绕过。
        case 'execution':
        case 'no_execution':
        case 'player_state_changed':
          return state
        case 'night_action':
          if (!canAppendNightActionEntry(state, entry)) return state
          break
        case 'day_action':
        case 'vote_round':
          break
        default:
          // 未知 kind 仍按普通记录写入，与穷尽检查加入前一致。
          assertNever(entry)
      }
      const appended = appendPhaseEntry(state, action.phaseKind, entry.kind === 'vote_round'
        ? { ...entry, ...(entry.nominationExceptionReason ? { nominationExceptionReason: entry.nominationExceptionReason.trim() } : {}), ghostVoteSeatIds: normalizeDeadVotes(state, { ...entry, segmentId: 'day-pending' }).ghostVoteSeatIds } : entry, action.input)
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
