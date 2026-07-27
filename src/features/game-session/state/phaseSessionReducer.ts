import type { GameSessionState } from '../types'
import { createNextNightRun } from './createNextNightRun'
import { closeOpenSegment } from './timeline'
import { closePhaseSegment, getOrCreateOpenSegment } from './phaseSegments'
import type { GameSessionAction } from './sessionActions'

type PhaseSessionActionType =
  | 'open-phase-segment'
  | 'close-active-night-run'
  | 'start-next-night-run'
  | 'close-open-segment'

type PhaseSessionAction = Extract<GameSessionAction, { type: PhaseSessionActionType }>

export function reducePhaseSession(state: GameSessionState, action: PhaseSessionAction): GameSessionState {
  switch (action.type) {
    case 'open-phase-segment':
      return openPhaseSegment(state, action)
    case 'close-active-night-run':
      return closeActiveNightRun(state, action)
    case 'start-next-night-run':
      return startNextNightRun(state)
    case 'close-open-segment': {
      const closed = closeOpenSegment(state, action.phaseKind, action.closedAt)
      return action.phaseKind === 'day' && closed !== state
        ? { ...closed, dayVoteDraft: null, dayActionDraft: null }
        : closed
    }
  }
}

function closeActiveNightRun(
  state: GameSessionState,
  action: Extract<GameSessionAction, { type: 'close-active-night-run' }>,
) {
  const run = state.nightRuns[action.nightRunId]
  if (!run || state.activeNightRunId !== run.id || !run.phaseSegmentId) return state
  const segment = state.phaseSegments.find((item) => item.id === run.phaseSegmentId)
  if (!segment || segment.kind !== 'night' || segment.closedAt) return state
  return closePhaseSegment(state, segment.id, action.closedAt)
}


function openPhaseSegment(
  state: GameSessionState,
  action: Extract<GameSessionAction, { type: 'open-phase-segment' }>,
) {
  const opened = getOrCreateOpenSegment(state, action.phaseKind, action.createdAt)
  if (action.phaseKind !== 'night') return opened.state

  const runId = opened.state.activeNightRunId
  const run = runId ? opened.state.nightRuns[runId] : undefined
  if (!run) return opened.state

  const boundSegment = run.phaseSegmentId
    ? opened.state.phaseSegments.find((segment) => segment.id === run.phaseSegmentId)
    : undefined
  if (boundSegment && !boundSegment.closedAt) return opened.state

  return {
    ...opened.state,
    nightRuns: {
      ...opened.state.nightRuns,
      [run.id]: { ...run, phaseSegmentId: opened.segment.id },
    },
  }
}


function startNextNightRun(state: GameSessionState) {
  const activeRun = state.activeNightRunId ? state.nightRuns[state.activeNightRunId] : undefined
  if (activeRun) {
    if (!activeRun.phaseSegmentId) return state
    const segment = state.phaseSegments.find((item) => item.id === activeRun.phaseSegmentId)
    if (!segment?.closedAt) return state
  }

  const nextRun = createNextNightRun(state)
  if (!nextRun) return state
  return {
    ...state,
    nightRuns: { ...state.nightRuns, [nextRun.id]: nextRun },
    activeNightRunId: nextRun.id,
  }
}


