import { normalizeRoleId } from '../../../domain/scripts'
import type { GameSessionState } from '../types'
import { appendCorrection, appendPhaseEntry } from './timeline'
import type { GameSessionAction } from './sessionActions'
import { createNightWorkbenchCommit, nightContextKey, sessionInitialNightState } from '../../night-workbench/state/gameSessionAdapter'
import { nightWorkbenchReducer, type NightWorkbenchAction } from '../../night-workbench/state/nightWorkbenchReducer'
import { kazaliAllocationBlocksItem } from './applyKazaliAllocation'
import { projectCurrentAssignments, projectCurrentPlayerStates } from './projectors'

const itemIndependentActions = new Set<NightWorkbenchAction['type']>([
  'preview', 'return-current', 'toggle-privacy', 'set-privacy', 'toggle-dim', 'skip-item', 'apply-ai-advice',
])
import { formalNightRecordValid, wakeTargetsStructurallyValid } from '../../night-workbench/state/projectWakeDraft'
import { projectNightResultContract } from './nightWakeContract'
import { hasLilMonstaOpening, validLilMonstaItem } from './lilMonstaNight'
import { projectAbilityGrants } from './abilityChanges'

type NightSessionActionType =
  | 'commit-night-workbench'
  | 'night-workbench-action'
  | 'replace-night-run'
  | 'set-active-night-run'

type NightSessionAction = Extract<GameSessionAction, { type: NightSessionActionType }>

export function reduceNightSession(state: GameSessionState, action: NightSessionAction): GameSessionState {
  switch (action.type) {
    case 'night-workbench-action': {
      if (action.nightRunId !== state.activeNightRunId) return state
      const run = state.nightRuns[action.nightRunId]
      if (run?.phaseSegmentId && state.phaseSegments.find((segment) => segment.id === run.phaseSegmentId)?.closedAt) return state
      const binding = { session: state, dispatchSession: () => {} }
      const current = sessionInitialNightState(binding)
      if (!current) return state
      const targetId = action.action.type === 'skip-item' ? action.action.id : current.previewEntryId
      const targetItem = current.queue.find(item => item.id === targetId)
      const pendingInitialization = targetItem?.abilityPhase !== 'initial' && current.queue.some(item => item.abilityPhase === 'initial'
        && item.seatId === targetItem?.seatId && item.roleId === targetItem?.roleId && item.progress !== 'confirmed')
      if (pendingInitialization && ['confirm', 'outcome', 'apply-ai-advice'].includes(action.action.type)) return {
        ...state, nightRuns: { ...state.nightRuns, [run.id]: { ...run, lastNotice: '请先确认存活宿主，再处理本夜攻击。' } },
      }
      if (['confirm', 'outcome', 'apply-ai-advice', 'change-role', 'skip-item', 'resolve-applicability'].includes(action.action.type)
        && kazaliAllocationBlocksItem(state, targetId)) return {
        ...state, nightRuns: { ...state.nightRuns, [run.id]: { ...run, lastNotice: '请先确认并应用卡扎力首夜爪牙分配，再继续当晚夜序。' } },
      }
      if (!itemIndependentActions.has(action.action.type) &&
        (action.expectedWakeItemId !== current.previewEntryId || action.expectedActiveCursorId !== current.activeCursorId)) return state
      const next = nightWorkbenchReducer(current, action.action)
      return next === current ? state : commitNightWorkbench(state, createNightWorkbenchCommit(next, binding))
    }
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
  if (action.baseRevision !== run.revision || action.baseContextKey !== nightContextKey(state)) return state
  if (action.roleChanges.some((change) => change.nightRunId !== run.id)) return state

  const queueItemById = new Map(action.nightRun.queue.map((item) => [item.id, item]))
  // A new Farmer record must use the review already persisted in the current run,
  // never a claimed approval supplied alongside that new record.
  const currentQueueById = new Map(sessionInitialNightState({ session: state, dispatchSession: () => {} })?.queue.map((item) => [item.id, item]))
  const records = [...action.records].sort((left, right) =>
    left.confirmedAt.localeCompare(right.confirmedAt) || left.id.localeCompare(right.id))
  const knownRecordIds = new Set([
    ...state.timeline.filter((entry) => entry.kind === 'night_action' && entry.nightRunId === run.id).map((entry) => entry.id),
    ...records.map((record) => record.id),
  ])
  const existingRecordIds = new Set(state.timeline.filter((entry) => entry.kind === 'night_action').map((entry) => entry.id))
  if (records.some((record) => !existingRecordIds.has(record.id) && (
    !queueItemById.has(record.wakeItemId) ||
    ((normalizeRoleId(queueItemById.get(record.wakeItemId)!.roleId) === 'farmer'
      || normalizeRoleId(currentQueueById.get(record.wakeItemId)?.roleId ?? '') === 'farmer')
      && (currentQueueById.get(record.wakeItemId)?.interactionVersion !== 'farmer/trigger-review-v1'
        || currentQueueById.get(record.wakeItemId)?.applicability !== 'applicable')) ||
    !wakeTargetsStructurallyValid(queueItemById.get(record.wakeItemId)!, record.snapshot, state.playerCount) ||
    !formalNightRecordValid(projectNightResultContract(queueItemById.get(record.wakeItemId)!, state.playerCount), record.snapshot) ||
    (record.correctionOf !== undefined && !knownRecordIds.has(record.correctionOf))))) return state

  let nextState = state
  let phaseSegmentId = run.phaseSegmentId
  const knownTimelineIds = new Set(nextState.timeline.map((entry) => entry.id))
  for (const record of records) {
    if (knownTimelineIds.has(record.id)) continue
    if (kazaliAllocationBlocksItem(state, record.wakeItemId)) return state
    const item = queueItemById.get(record.wakeItemId)
    if (!item) return state
    const currentItem = currentQueueById.get(record.wakeItemId)
    if (currentItem?.hostConfirmation && !formalNightRecordValid(currentItem, record.snapshot)) return state
    if (!record.correctionOf && item.abilityPhase !== 'initial' && run.queue.some(initial => initial.abilityPhase === 'initial'
      && initial.seatId === item.seatId && initial.roleId === item.roleId && initial.progress !== 'confirmed')) return state
    const nonSeated = validLilMonstaItem(item, currentQueueById.get(item.id)) && hasLilMonstaOpening(state, projectCurrentAssignments(state))
    const granted = item.abilitySource && projectAbilityGrants(state).some(grant => grant.id === item.abilitySource?.grantId
      && grant.seatId === item.seatId && grant.abilityRole?.id === item.roleId
      && projectCurrentAssignments(state).some(a => a.seatId === item.seatId && a.role.id === grant.actorRole.id))
    if (!record.correctionOf && !item.systemStep && !nonSeated && !granted && normalizeRoleId(projectCurrentAssignments(state).find((assignment) => assignment.seatId === item.seatId)?.role.id ?? '') !== normalizeRoleId(item.roleId)) return state
    if (!record.correctionOf && item.abilityPhase === 'initial' && (record.snapshot.targets.length !== 1 || record.snapshot.targets.some((seat) => projectCurrentPlayerStates(state)[seat]?.life !== 'alive'))) return state
    const entry = {
      kind: 'night_action' as const,
      nightRunId: run.id,
      wakeItemId: record.wakeItemId,
      actorSeatId: item.seatId,
      roleId: item.roleId,
      ...(item.abilitySource ? { abilitySource: structuredClone(item.abilitySource) } : {}),
      summary: record.snapshot.storytellerResult || `${item.seatId}号记录已确认`,
      details: [record.snapshot.playerChoice, record.snapshot.informationGiven, record.snapshot.storytellerContext && `说书人已核对：${record.snapshot.storytellerContext}`].filter((value): value is string => Boolean(value)),
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


