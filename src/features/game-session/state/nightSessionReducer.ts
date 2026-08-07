import type { GameSessionState } from '../types'
import { appendCorrection, appendPhaseEntry } from './timeline'
import type { GameSessionAction } from './sessionActions'
import { wakeTargetsStructurallyValid } from '../../night-workbench/state/projectWakeDraft'

type NightSessionActionType =
  | 'commit-night-workbench'
  | 'replace-night-run'
  | 'set-active-night-run'

type NightSessionAction = Extract<GameSessionAction, { type: NightSessionActionType }>

export function reduceNightSession(state: GameSessionState, action: NightSessionAction): GameSessionState {
  switch (action.type) {
    case 'commit-night-workbench':
      return commitNightWorkbench(state, action)
    case 'replace-night-run':
      return {
        ...state,
        nightRuns: { ...state.nightRuns, [action.nightRun.id]: action.nightRun },
      }
    case 'set-active-night-run':
      return action.nightRunId && !state.nightRuns[action.nightRunId]
        ? state
        : { ...state, activeNightRunId: action.nightRunId }
  }
}

function commitNightWorkbench(
  state: GameSessionState,
  action: Extract<GameSessionAction, { type: 'commit-night-workbench' }>,
): GameSessionState {
  const run = state.nightRuns[action.nightRun.id]
  if (!run || action.nightRun.id !== state.activeNightRunId) return state
  if (action.roleChanges.some((change) => change.nightRunId !== run.id)) return state

  const queueItemById = new Map(action.nightRun.queue.map((item) => [item.id, item]))
  const records = [...action.records].sort((left, right) =>
    left.confirmedAt.localeCompare(right.confirmedAt) || left.id.localeCompare(right.id))
  const knownRecordIds = new Set([
    ...state.timeline.filter((entry) => entry.kind === 'night_action' && entry.nightRunId === run.id).map((entry) => entry.id),
    ...records.map((record) => record.id),
  ])
  if (records.some((record) =>
    !queueItemById.has(record.wakeItemId) ||
    !wakeTargetsStructurallyValid(queueItemById.get(record.wakeItemId)!, record.snapshot, state.playerCount) ||
    (record.correctionOf !== undefined && !knownRecordIds.has(record.correctionOf)))) return state

  let nextState = state
  let phaseSegmentId = run.phaseSegmentId
  const knownTimelineIds = new Set(nextState.timeline.map((entry) => entry.id))
  for (const record of records) {
    if (knownTimelineIds.has(record.id)) continue
    const item = queueItemById.get(record.wakeItemId)
    if (!item) return state
    const entry = {
      kind: 'night_action' as const,
      nightRunId: run.id,
      wakeItemId: record.wakeItemId,
      actorSeatId: item.seatId,
      roleId: item.roleId,
      summary: record.snapshot.storytellerResult || `${item.seatId}号记录已确认`,
      details: [record.snapshot.playerChoice, record.snapshot.informationGiven].filter(Boolean),
      record: { revision: record.revision, snapshot: structuredClone(record.snapshot) },
    }
    const appended = record.correctionOf
      ? appendCorrection(nextState, record.correctionOf, entry, { id: record.id, createdAt: record.confirmedAt })
      : appendPhaseEntry(nextState, 'night', entry, { id: record.id, createdAt: record.confirmedAt })
    if (!appended) return state
    nextState = appended.state
    phaseSegmentId = appended.segmentId
    knownTimelineIds.add(record.id)
  }

  const latestSetup = nextState.timeline.filter((entry) => entry.kind === 'setup_confirmed').at(-1)
  if (latestSetup?.kind === 'setup_confirmed') {
    for (const change of action.roleChanges) {
      if (knownTimelineIds.has(change.id)) continue
      nextState = {
        ...nextState,
        timeline: [...nextState.timeline, {
          id: change.id,
          kind: 'setup_changed',
          segmentId: null,
          createdAt: change.changedAt,
          confirmedBy: 'storyteller',
          baseSetupId: latestSetup.setup.id,
          originNightRunId: run.id,
          seatId: change.seatId,
          fromRole: structuredClone(change.fromRole),
          toRole: structuredClone(change.toRole),
          reason: change.reason,
          effectiveFrom: 'future_workbenches',
        }],
      }
      knownTimelineIds.add(change.id)
    }
  }

  return {
    ...nextState,
    nightRuns: {
      ...nextState.nightRuns,
      [action.nightRun.id]: { ...action.nightRun, phaseSegmentId },
    },
  }
}


