import type { Dispatch } from 'react'
import type { GameSessionState, NightRunState, SetupChangedEntry } from '../../game-session/types'
import type { GameSessionAction } from '../../game-session/state/sessionReducer'
import {
  projectCurrentAssignments,
  projectCurrentPlayerStates,
  projectNightConfirmedRecords,
} from '../../game-session/state/projectors'
import { nextNightSequence } from '../../game-session/state/createNextNightRun'
import { initialNightWorkbenchState } from '../data/initialNightWorkbenchState'
import type { NightSeatSnapshot, NightWorkbenchState, PlayerStatusSnapshot, RoleChangeReason } from '../types'
import { storytellerSeatLabel } from '../../game-session/seatPresentation'
import { refreshNightRunHistoricalContext } from '../../game-session/state/nightHistoricalContext'
import { hasForbiddenRegistration, hasWakeDraftContent, invalidateOutcome, wakeTargetsStructurallyValid } from './projectWakeDraft'

export interface NightWorkbenchSessionBinding {
  session: GameSessionState
  dispatchSession: Dispatch<GameSessionAction>
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
    minimumTargetCount: item.minimumTargetCount,
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
    if (!item) return []
    if (!wakeTargetsStructurallyValid(item, draft, session.playerCount)) return []
    if (hasForbiddenRegistration(item, draft)) return []
    const original = originalById.get(itemId)
    const contractChanged = !original || wakeContractFingerprint(original) !== wakeContractFingerprint(item)
    const nextDraft = contractChanged ? invalidateOutcome(item, draft) : draft
    return hasWakeDraftContent(nextDraft) ? [[itemId, structuredClone(nextDraft)]] : []
  }))
}

export function sessionInitialNightState(binding: NightWorkbenchSessionBinding): NightWorkbenchState {
  const runId = binding.session.activeNightRunId
  const run = runId ? binding.session.nightRuns[runId] : undefined
  if (!run) return initialNightWorkbenchState
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
      phaseLabel: segment?.label ?? '本夜',
      fromRole: structuredClone(entry.fromRole),
      toRole: structuredClone(entry.toRole),
      reason: legacyReason(entry.reason),
      confirmedBy: 'storyteller' as const,
    }))
  // 每次打开都从有效时间线刷新跨夜事实；上一夜若刚被更正，不沿用创建夜晚时的旧缓存。
  const queue = structuredClone(refreshNightRunHistoricalContext(binding.session, run))
  return {
    nightRunId: run.id,
    scriptId: run.scriptId,
    nightLabel,
    nightType: run.nightType,
    playerCount: run.playerCount,
    revision: run.revision,
    knowledgeVersion: run.knowledgeVersion,
    queue,
    seatSnapshots: seatSnapshotsForSession(binding.session),
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
    ...run
  } = state
  return { ...run, id: nightRunId, phaseSegmentId }
}

/** 每次夜间交互都以单一会话命令提交；不再通过 effect 镜像一份本地权威事实。 */
export function createNightWorkbenchCommit(state: NightWorkbenchState, binding: NightWorkbenchSessionBinding): GameSessionAction {
  const phaseSegmentId = binding.session.nightRuns[state.nightRunId]?.phaseSegmentId ?? null
  return {
    type: 'commit-night-workbench',
    nightRun: toNightRun(state, phaseSegmentId),
    records: Object.values(state.confirmedRecords).flat().map((record) => structuredClone(record)),
    roleChanges: state.roleChangeEvents.map((change) => structuredClone(change)),
  }
}
