import type { Dispatch } from 'react'
import type { GameSessionState, NightRunState, SetupChangedEntry } from '../../game-session/types'
import type { GameSessionAction } from '../../game-session/state/sessionReducer'
import {
  projectCurrentAssignments,
  projectCurrentPlayerStates,
  projectNightConfirmedRecords,
} from '../../game-session/state/projectors'
import { nextNightSequence } from '../../game-session/state/createNextNightRun'
import { getActiveNightRun } from '../../game-session/state/getActiveNightRun'
import type { NightSeatSnapshot, NightWorkbenchState, PlayerStatusSnapshot, RoleChangeReason } from '../types'
import { storytellerSeatLabel } from '../../game-session/seatPresentation'
import { projectNightInteraction } from './projectNightInteraction'
import { refreshNightRunHistoricalContext } from '../../game-session/state/nightHistoricalContext'
import { hasForbiddenRegistration, hasWakeDraftContent, invalidateOutcome, wakeTargetsStructurallyValid } from './projectWakeDraft'

export interface NightWorkbenchSessionBinding {
  session: GameSessionState
  dispatchSession: Dispatch<GameSessionAction>
}

export function nightContextKey(session: GameSessionState) {
  return `${session.id}:${session.timeline.length}`
}

function legacyReason(reason: string): RoleChangeReason {
  if (reason.includes('纠正')) return 'entry_correction'
  if (reason.includes('对局')) return 'gameplay'
  return 'other'
}

function roleChangesForRun(session: GameSessionState, run: NightRunState): SetupChangedEntry[] {
  const roleIdBySeat = new Map(run.queue.map((item) => [item.seatId, item.roleId]))
  return session.timeline
    .filter((entry): entry is SetupChangedEntry => entry.kind === 'setup_changed')
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt) || left.id.localeCompare(right.id))
    .flatMap((entry) => {
      const currentRoleId = roleIdBySeat.get(entry.seatId)
      const belongsToRun = entry.originNightRunId === run.id
      const appliesToSnapshot = entry.originNightRunId === null && currentRoleId === entry.fromRole.id
      if (!belongsToRun && !appliesToSnapshot) return []
      if (currentRoleId === entry.fromRole.id) roleIdBySeat.set(entry.seatId, entry.toRole.id)
      return [entry]
    })
}

function playerStatusSnapshot(state: ReturnType<typeof projectCurrentPlayerStates>[number]): PlayerStatusSnapshot {
  return {
    life: state.life,
    impairments: [
      ...(state.poisoned ? ['poisoned' as const] : []),
      ...(state.drunk ? ['drunk' as const] : []),
    ],
    markers: state.markers.map((marker) => ({ ...marker })),
  }
}

function seatSnapshotsForSession(session: GameSessionState): Record<number, NightSeatSnapshot> {
  const assignmentsBySeat = new Map(projectCurrentAssignments(session).map((assignment) => [assignment.seatId, assignment.role]))
  const states = projectCurrentPlayerStates(session)
  return Object.fromEntries(Array.from({ length: session.playerCount }, (_value, index) => {
    const seatId = index + 1
    const seat = session.seats[seatId]
    const role = assignmentsBySeat.get(seatId) ?? null
    return [seatId, {
      seatId,
      playerLabel: seat ? storytellerSeatLabel(seat) : `${seatId}号玩家`,
      nickname: seat?.nickname ?? '',
      role: role ? { ...role } : null,
      status: playerStatusSnapshot(states[seatId] ?? {
        life: 'alive',
        poisoned: false,
        drunk: false,
        markers: [],
      }),
    }]
  })) as Record<number, NightSeatSnapshot>
}

function wakeContractFingerprint(item: NightWorkbenchState['queue'][number]) {
  return JSON.stringify({
    targetCount: item.targetCount,
    informationInput: item.informationInput,
    minimumTargetCount: item.minimumTargetCount,
    allowedTargetCounts: item.allowedTargetCounts,
    roleCount: item.roleCount,
    targetRoleChoiceCount: item.targetRoleChoiceCount,
    previousRegistration: item.previousRegistration,
    forbiddenRegistrationValues: item.forbiddenRegistrationValues,
    previousTargets: item.previousTargets,
    forbiddenTargetSeatIds: item.forbiddenTargetSeatIds,
    previousTargetRequired: item.previousTargetRequired,
    historicalContext: item.historicalContext,
    outcomeIds: item.outcomeOptions.map((option) => option.id),
  })
}

function refreshDraftsForQueue(session: GameSessionState, run: NightRunState, queue: NightWorkbenchState['queue']) {
  const originalById = new Map(run.queue.map((item) => [item.id, item]))
  const queueById = new Map(queue.map((item) => [item.id, item]))
  return Object.fromEntries(Object.entries(run.drafts).flatMap(([itemId, draft]) => {
    const item = queueById.get(itemId)
    if (!item || item.progress === 'confirmed' && run.correctionItemId !== itemId) return [[itemId, structuredClone(draft)]]
    const original = originalById.get(itemId)
    const invalidCountChoice = draft.targetCountChoice !== undefined && !item.allowedTargetCounts?.includes(draft.targetCountChoice)
    const currentDraft = invalidCountChoice ? { ...draft, targetCountChoice: undefined } : draft
    const contractChanged = invalidCountChoice || !original || wakeContractFingerprint(original) !== wakeContractFingerprint(item)
      || !wakeTargetsStructurallyValid(item, draft, session.playerCount) || hasForbiddenRegistration(item, draft)
    const nextDraft = contractChanged && currentDraft.outcomeId ? invalidateOutcome(item, currentDraft) : currentDraft
    return hasWakeDraftContent(nextDraft) ? [[itemId, structuredClone(nextDraft)]] : []
  }))
}

export function sessionInitialNightState(binding: NightWorkbenchSessionBinding): NightWorkbenchState | null {
  const run = getActiveNightRun(binding.session)
  if (!run) return null
  const segment = run.phaseSegmentId ? binding.session.phaseSegments.find((item) => item.id === run.phaseSegmentId) : undefined
  const nightLabel = segment?.label ?? `第${nextNightSequence(binding.session)}夜草稿`
  const roleChangeEvents = roleChangesForRun(binding.session, run)
    .map((entry, index) => ({
      id: entry.id,
      seatId: entry.seatId,
      revision: index + 1,
      changedAt: entry.createdAt,
      nightRunId: run.id,
      originNightRunId: entry.originNightRunId,
      sourceNightActionId: entry.sourceNightActionId,
      nightAbilityTiming: entry.nightAbilityTiming,
      phaseLabel: segment?.label ?? '本夜',
      fromRole: structuredClone(entry.fromRole),
      toRole: structuredClone(entry.toRole),
      reason: legacyReason(entry.reason),
      confirmedBy: 'storyteller' as const,
    }))
  const seatSnapshots = seatSnapshotsForSession(binding.session)
  const projectedRun = { ...run, queue: structuredClone(run.queue).map((item) => ({
    ...projectNightInteraction(item, run.scriptId, { nightType: run.nightType, playerCount: run.playerCount, status: seatSnapshots[item.seatId]?.status }),
    status: seatSnapshots[item.seatId]?.status ?? item.status,
  })) }
  const queue = refreshNightRunHistoricalContext(binding.session, projectedRun)
  return {
    nightRunId: run.id,
    scriptId: run.scriptId,
    nightLabel,
    nightType: run.nightType,
    playerCount: run.playerCount,
    revision: run.revision,
    contextKey: nightContextKey(binding.session),
    knowledgeVersion: run.knowledgeVersion,
    queue,
    seatSnapshots,
    activeCursorId: run.activeCursorId,
    previewEntryId: run.previewEntryId,
    drafts: refreshDraftsForQueue(binding.session, run, queue),
    privacyShielded: run.privacyShielded,
    dimmed: run.dimmed,
    aiAdviceLog: structuredClone(run.aiAdviceLog),
    correctionItemId: run.correctionItemId,
    confirmedRecords: projectNightConfirmedRecords(binding.session, run.id),
    roleChangeEvents,
    lastNotice: run.lastNotice,
  }
}

export function toNightRun(state: NightWorkbenchState, phaseSegmentId: string | null): NightRunState {
  const {
    nightRunId,
    nightLabel: _nightLabel,
    confirmedRecords: _confirmedRecords,
    roleChangeEvents: _roleChangeEvents,
    seatSnapshots: _seatSnapshots,
    contextKey: _contextKey,
    ...run
  } = state
  return { ...run, id: nightRunId, phaseSegmentId }
}

/** 每次夜间交互都以单一会话命令提交；不再通过 effect 镜像一份本地权威事实。 */
export function createNightWorkbenchCommit(state: NightWorkbenchState, binding: NightWorkbenchSessionBinding): Extract<GameSessionAction, { type: 'commit-night-workbench' }> {
  const phaseSegmentId = binding.session.nightRuns[state.nightRunId]?.phaseSegmentId ?? null
  return {
    type: 'commit-night-workbench',
    baseRevision: binding.session.nightRuns[state.nightRunId]?.revision ?? 0,
    baseContextKey: nightContextKey(binding.session),
    nightRun: toNightRun(state, phaseSegmentId),
    records: Object.values(state.confirmedRecords).flat().map((record) => structuredClone(record)),
    roleChanges: state.roleChangeEvents.map((change) => structuredClone(change)),
  }
}
