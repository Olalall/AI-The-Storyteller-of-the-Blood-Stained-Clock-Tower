import type {
  DayActionEntry,
  ExecutionEntry,
  GameSessionState,
  NightActionEntry,
  PhaseKind,
  PlayerStateChangedEntry,
  TimelineBase,
  TimelineEntry,
  VoteRoundEntry,
} from '../types'
import { assertNever } from '../../../shared/assertNever'
import { closePhaseSegment, findOpenSegment, getOrCreateOpenSegment } from './phaseSegments'

type PhaseTimelineEntryBody =
  | Omit<NightActionEntry, keyof TimelineBase | 'segmentId'>
  | Omit<DayActionEntry, keyof TimelineBase | 'segmentId'>
  | Omit<VoteRoundEntry, keyof TimelineBase | 'segmentId'>
  | Omit<ExecutionEntry, keyof TimelineBase | 'segmentId'>
  | Omit<PlayerStateChangedEntry, keyof TimelineBase | 'segmentId'>

export type PhaseTimelineEntryInput = PhaseTimelineEntryBody & Pick<TimelineBase, 'correctionOf' | 'correctionReason'>

export interface TimelineAppendInput {
  id: string
  createdAt: string
}

export interface TimelineAppendResult {
  state: GameSessionState
  entry: TimelineEntry
  segmentId: string
  createdSegment: boolean
}

export function entryCanUsePhase(entry: PhaseTimelineEntryInput, phaseKind: PhaseKind) {
  switch (entry.kind) {
    case 'night_action':
      return phaseKind === 'night'
    case 'day_action':
    case 'vote_round':
    case 'execution':
    case 'no_execution':
      return phaseKind === 'day'
    case 'player_state_changed':
      return true
    default:
      // 未知 kind 沿用「不限制相位」，与穷尽检查加入前一致。
      assertNever(entry)
      return true
  }
}

/**
 * 只有权威保存会经过这里：同类开放段存在时复用；不存在时才新建。
 * 进入工作台、打开记录和请求 AI 都不应调用此函数。
 */
export function appendPhaseEntry(
  state: GameSessionState,
  phaseKind: PhaseKind,
  entry: PhaseTimelineEntryInput,
  input: TimelineAppendInput,
): TimelineAppendResult {
  const segmentResult = getOrCreateOpenSegment(state, phaseKind, input.createdAt)
  const timelineEntry: TimelineEntry = {
    ...entry,
    id: input.id,
    segmentId: segmentResult.segment.id,
    createdAt: input.createdAt,
    confirmedBy: 'storyteller',
  }
  return {
    state: {
      ...segmentResult.state,
      timeline: [...segmentResult.state.timeline, timelineEntry],
    },
    entry: timelineEntry,
    segmentId: segmentResult.segment.id,
    createdSegment: segmentResult.created,
  }
}

/** 更正始终跟随原条目的记录段，绝不因为补记而新建昼夜。 */
export function appendCorrection(
  state: GameSessionState,
  originalEntryId: string,
  entry: PhaseTimelineEntryInput,
  input: TimelineAppendInput,
): TimelineAppendResult | null {
  const original = state.timeline.find((item) => item.id === originalEntryId)
  if (!original?.segmentId || original.kind !== entry.kind) return null
  if (state.timeline.some((item) => item.id === input.id)) return null
  /**
   * 更正链只能沿最后一版继续。允许 A → B → C，但拒绝以 A 再追加 D，
   * 否则当前版本会分叉，现场无法判断应以哪条为准。
   */
  if (state.timeline.some((item) => item.correctionOf === original.id)) return null

  const timelineEntry: TimelineEntry = {
    ...entry,
    id: input.id,
    segmentId: original.segmentId,
    createdAt: input.createdAt,
    correctionOf: original.id,
    confirmedBy: 'storyteller',
  }
  return {
    state: { ...state, timeline: [...state.timeline, timelineEntry] },
    entry: timelineEntry,
    segmentId: original.segmentId,
    createdSegment: false,
  }
}

export function closeOpenSegment(state: GameSessionState, kind: PhaseKind, now: string) {
  const openSegment = findOpenSegment(state, kind)
  return openSegment ? closePhaseSegment(state, openSegment.id, now) : state
}
