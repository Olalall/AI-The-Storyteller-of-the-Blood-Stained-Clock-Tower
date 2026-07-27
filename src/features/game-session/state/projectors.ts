import type {
  ConfirmedSetup,
  GameSessionState,
  NightActionEntry,
  PlayerState,
  SetupAssignment,
  SetupChangedEntry,
} from '../types'
import type { ConfirmedWakeRecord, RoleSnapshot } from '../../night-workbench/types'

/** 仅给说书人端使用的座位摘要；不作为对外身份投影。 */
export interface StorytellerSeatSummary {
  seatId: number
  nickname: string
  role: RoleSnapshot | null
  state: PlayerState
}

function chronological<T extends { createdAt: string; id: string }>(items: readonly T[]) {
  return [...items].sort((left, right) => left.createdAt.localeCompare(right.createdAt) || left.id.localeCompare(right.id))
}

export function projectConfirmedSetup(state: GameSessionState): ConfirmedSetup | null {
  const setupEntries = chronological(state.timeline.filter((entry) => entry.kind === 'setup_confirmed'))
  return setupEntries.at(-1)?.setup ?? null
}

export function projectCurrentAssignments(state: GameSessionState): SetupAssignment[] {
  const setupEntry = chronological(state.timeline.filter((entry) => entry.kind === 'setup_confirmed')).at(-1)
  if (!setupEntry || setupEntry.kind !== 'setup_confirmed') return []
  const setup = setupEntry.setup

  const assignments = new Map(setup.draft.assignments.map((assignment) => [assignment.seatId, {
    seatId: assignment.seatId,
    role: { ...assignment.role },
  }]))
  const setupChanges = chronological(state.timeline.filter((entry): entry is SetupChangedEntry =>
    entry.kind === 'setup_changed' && entry.baseSetupId === setup.id,
  ))

  for (const change of setupChanges) {
    const current = assignments.get(change.seatId)
    if (!current || current.role.id !== change.fromRole.id) continue
    assignments.set(change.seatId, { seatId: change.seatId, role: { ...change.toRole } })
  }

  return [...assignments.values()].sort((left, right) => left.seatId - right.seatId)
}

export function projectCurrentPlayerStates(state: GameSessionState): Record<number, PlayerState> {
  const projected = Object.fromEntries(Object.entries(state.initialPlayerStates).map(([seatId, playerState]) => [
    Number(seatId),
    { ...playerState, markers: playerState.markers.map((marker) => ({ ...marker })) },
  ])) as Record<number, PlayerState>

  const changes = chronological(state.timeline.filter((entry) => entry.kind === 'player_state_changed'))
  for (const change of changes) {
    projected[change.seatId] = {
      ...change.after,
      markers: change.after.markers.map((marker) => ({ ...marker })),
    }
  }
  return projected
}

/**
 * 将配板、昵称与追加式状态合成为一个只读摘要。
 * 首页和侧栏都应基于这份投影展示，不能各自保存角色或状态副本。
 */
export function projectStorytellerSeatSummaries(state: GameSessionState): StorytellerSeatSummary[] {
  const rolesBySeat = new Map(projectCurrentAssignments(state).map((assignment) => [assignment.seatId, assignment.role]))
  const states = projectCurrentPlayerStates(state)

  return Array.from({ length: state.playerCount }, (_value, index) => {
    const seatId = index + 1
    return {
      seatId,
      nickname: state.seats[seatId]?.nickname ?? '',
      role: rolesBySeat.get(seatId) ? { ...rolesBySeat.get(seatId)! } : null,
      state: states[seatId],
    }
  }).filter((summary): summary is StorytellerSeatSummary => Boolean(summary.state))
}

export function projectNightConfirmedRecords(
  state: GameSessionState,
  nightRunId: string,
): Record<string, ConfirmedWakeRecord[]> {
  const records: Record<string, ConfirmedWakeRecord[]> = {}
  const entries = chronological(state.timeline.filter((entry): entry is NightActionEntry =>
    entry.kind === 'night_action' && entry.nightRunId === nightRunId,
  ))
  for (const entry of entries) {
    const record: ConfirmedWakeRecord = {
      id: entry.id,
      wakeItemId: entry.wakeItemId,
      revision: entry.record.revision,
      confirmedAt: entry.createdAt,
      correctionOf: entry.correctionOf,
      snapshot: structuredClone(entry.record.snapshot),
    }
    records[entry.wakeItemId] = [...(records[entry.wakeItemId] ?? []), record]
  }
  return records
}

export function projectOpenSegmentLabels(state: GameSessionState) {
  return state.phaseSegments
    .filter((segment) => !segment.closedAt)
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
    .map((segment) => ({ id: segment.id, kind: segment.kind, label: segment.label }))
}
