import { catfishingPrototypeSeatProfiles } from '../../setup'
import { catfishingRoleSnapshots } from '../../night-workbench/data/catfishing'
import { initialNightWorkbenchState } from '../../night-workbench/data/initialNightWorkbenchState'
import { getSmartScriptPack, roleSnapshotsForScript, scriptKnowledgeVersion } from '../../../domain/scripts'
import type { PlayerCount, ScriptId } from '../../../domain/scripts'
import type { NightWorkbenchState } from '../../night-workbench/types'
import type {
  GameSessionState,
  NightActionEntry,
  PlayerExperience,
  PlayerSeat,
  PlayerState,
  SetupChangedEntry,
  SetupConfirmedEntry,
} from '../types'
import { storytellerSeatLabel } from '../seatPresentation'

export const gameSessionStorageKey = 'botc-copilot-session-v1'

const prototypeCreatedAt = '2026-07-13T00:00:00.000Z'
const prototypeNightSegmentId = 'night-3'
const supportedSetupPlayerCounts = new Set([7, 8, 9, 10, 11, 12, 13, 14, 15])

export interface CatfishingSetupSeatInput {
  seatId: number
  nickname?: string
  experience?: PlayerExperience | null
}

export interface CreateCatfishingSetupSessionOptions {
  playerCount?: number
  seats?: readonly CatfishingSetupSeatInput[]
}

export function isSupportedSetupPlayerCount(playerCount: number) {
  return Number.isInteger(playerCount) && supportedSetupPlayerCounts.has(playerCount)
}

export function isSupportedScriptSetupPlayerCount(scriptId: ScriptId, playerCount: number) {
  const pack = getSmartScriptPack(scriptId)
  return isSupportedSetupPlayerCount(playerCount) && pack.playerCounts.includes(playerCount as PlayerCount)
}

export function createEmptyGameSession(createdAt = new Date().toISOString()): GameSessionState {
  return {
    schemaVersion: 1,
    id: `session-${createdAt.replace(/[:.]/g, '-')}`,
    scriptId: 'catfishing',
    playerCount: 0,
    knowledgeVersion: initialNightWorkbenchState.knowledgeVersion,
    scriptRoles: catfishingRoleSnapshots.map((role) => ({ ...role })),
    seats: {},
    initialPlayerStates: {},
    phaseSegments: [],
    timeline: [],
    dayVoteDraft: null,
    dayActionDraft: null,
    setupDraft: null,
    nightRuns: {},
    activeNightRunId: null,
  }
}

export function createCatfishingSetupSession(
  createdAt = new Date().toISOString(),
  options: CreateCatfishingSetupSessionOptions = {},
): GameSessionState {
  return createSmartScriptSetupSession('catfishing', createdAt, options)
}

export function createSmartScriptSetupSession(
  scriptId: ScriptId,
  createdAt = new Date().toISOString(),
  options: CreateCatfishingSetupSessionOptions = {},
): GameSessionState {
  const playerCount = options.playerCount ?? 12
  const pack = getSmartScriptPack(scriptId)
  if (!isSupportedScriptSetupPlayerCount(pack.scriptId, playerCount)) throw new Error('智能板子开局人数必须为 7—15 人')

  const seats = createSetupSeats(playerCount, options.seats)
  const initialPlayerStates = Object.fromEntries(Object.keys(seats).map((seatId) => [Number(seatId), {
    life: 'alive' as const,
    poisoned: false,
    drunk: false,
    markers: [],
  }])) as Record<number, PlayerState>

  return {
    ...createEmptyGameSession(createdAt),
    scriptId: pack.scriptId,
    knowledgeVersion: scriptKnowledgeVersion(pack),
    scriptRoles: roleSnapshotsForScript(pack.scriptId),
    playerCount,
    seats,
    initialPlayerStates,
  }
}

function createNightActionEntries(
  nightState: NightWorkbenchState,
  phaseSegmentId: string,
): NightActionEntry[] {
  return Object.values(nightState.confirmedRecords)
    .flat()
    .map((record) => {
      const item = nightState.queue.find((queueItem) => queueItem.id === record.wakeItemId)
      return {
        id: record.id,
        kind: 'night_action' as const,
        segmentId: phaseSegmentId,
        createdAt: record.confirmedAt,
        confirmedBy: 'storyteller' as const,
        correctionOf: record.correctionOf,
        nightRunId: nightState.nightRunId,
        wakeItemId: record.wakeItemId,
        summary: record.snapshot.storytellerResult || `${item?.seatId ?? ''}号记录已确认`,
        details: [record.snapshot.playerChoice, record.snapshot.informationGiven].filter(Boolean),
        record: { revision: record.revision, snapshot: structuredClone(record.snapshot) },
      }
    })
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
}

function createSeats(): Record<number, PlayerSeat> {
  return Object.fromEntries(catfishingPrototypeSeatProfiles.map((profile) => [profile.seatId, {
    seatId: profile.seatId,
    label: `${profile.seatId}号`,
    nickname: `玩家${profile.seatId}`,
    experience: profile.experience,
  }])) as Record<number, PlayerSeat>
}

function createSetupSeats(playerCount: number, inputs: readonly CatfishingSetupSeatInput[] = []): Record<number, PlayerSeat> {
  const inputBySeat = new Map(inputs.map((input) => [input.seatId, input]))
  return Object.fromEntries(Array.from({ length: playerCount }, (_value, index) => {
    const seatId = index + 1
    const input = inputBySeat.get(seatId)
    const nickname = input?.nickname?.trim() || `玩家${seatId}`
    return [seatId, {
      seatId,
      label: `${seatId}号`,
      nickname,
      experience: input?.experience ?? 'regular',
    }]
  })) as Record<number, PlayerSeat>
}

function createInitialPlayerStates(): Record<number, PlayerState> {
  const statusBySeat = new Map(initialNightWorkbenchState.queue.map((item) => [item.seatId, item.status]))
  return Object.fromEntries(Array.from({ length: 12 }, (_value, index) => {
    const status = statusBySeat.get(index + 1)
    return [index + 1, {
      life: status?.life ?? 'alive',
      poisoned: status?.impairments.includes('poisoned') ?? false,
      drunk: status?.impairments.includes('drunk') ?? false,
      markers: status?.markers.map((marker) => ({ ...marker })) ?? [],
    }]
  })) as Record<number, PlayerState>
}

export function createPrototypeGameSession(): GameSessionState {
  const roleById = new Map(catfishingRoleSnapshots.map((role) => [role.id, role]))
  const role = (roleId: string) => {
    const snapshot = roleById.get(roleId)
    if (!snapshot) throw new Error(`原型局缺少角色：${roleId}`)
    return { ...snapshot }
  }
  const setupDraft = {
    candidateId: 'prototype-catfishing-night-3-snapshot',
    revision: 1,
    assignments: [
      'drunk', 'balloonist', 'dreamer', 'fortuneteller', 'snakecharmer', 'gambler',
      'philosopher', 'recluse', 'lunatic', 'cerenovus', 'pithag', 'fanggu',
    ].map((roleId, index) => ({ seatId: index + 1, role: role(roleId) })),
    demonBluffs: ['chef', 'grandmother', 'savant'].map(role),
    setupRuleSelections: [],
    setupRulePackVersion: 'catfishing-11.1.1/prototype-setup-rules-v1',
    updatedAt: prototypeCreatedAt,
  }
  const confirmedSetup = {
    id: 'prototype-setup-confirmed-1',
    draft: setupDraft,
    confirmedAt: prototypeCreatedAt,
  }
  const setupEntry: SetupConfirmedEntry = {
    id: 'prototype-setup-confirmed-entry-1',
    kind: 'setup_confirmed',
    segmentId: null,
    createdAt: prototypeCreatedAt,
    confirmedBy: 'storyteller',
    setup: confirmedSetup,
  }
  const seats = createSeats()
  const baselineNightEntries = createNightActionEntries(initialNightWorkbenchState, prototypeNightSegmentId)
  const {
    confirmedRecords: _confirmedRecords,
    roleChangeEvents: _roleChangeEvents,
    nightLabel: _nightLabel,
    seatSnapshots: _seatSnapshots,
    ...nightRun
  } = initialNightWorkbenchState

  return {
    schemaVersion: 1,
    id: 'prototype-catfishing-12',
    scriptId: 'catfishing',
    playerCount: 12,
    knowledgeVersion: initialNightWorkbenchState.knowledgeVersion,
    scriptRoles: catfishingRoleSnapshots.map((role) => ({ ...role })),
    seats,
    initialPlayerStates: createInitialPlayerStates(),
    phaseSegments: [{
      id: prototypeNightSegmentId,
      kind: 'night',
      sequence: 3,
      label: '第3夜',
      createdAt: prototypeCreatedAt,
    }],
    timeline: [setupEntry, ...baselineNightEntries],
    dayVoteDraft: null,
    dayActionDraft: null,
    setupDraft: null,
    nightRuns: {
      [nightRun.nightRunId]: {
        ...nightRun,
        queue: nightRun.queue.map((item) => ({
          ...item,
          playerLabel: seats[item.seatId] ? storytellerSeatLabel(seats[item.seatId]) : `${item.seatId}号`,
        })),
        id: nightRun.nightRunId,
        phaseSegmentId: prototypeNightSegmentId,
      },
    },
    activeNightRunId: nightRun.nightRunId,
  }
}

/** 将 v5 夜间原型的一次性快照迁入 v1 对局；后续只使用 v1。 */
export function createPrototypeGameSessionFromLegacyNight(legacyNight: NightWorkbenchState): GameSessionState {
  const session = createPrototypeGameSession()
  const setupEntry = session.timeline.find((entry): entry is SetupConfirmedEntry => entry.kind === 'setup_confirmed')
  if (!setupEntry) return session

  const migratedNightEntries = createNightActionEntries(legacyNight, prototypeNightSegmentId)
  const migratedRoleChanges: SetupChangedEntry[] = legacyNight.roleChangeEvents.map((change) => ({
    id: change.id,
    kind: 'setup_changed',
    segmentId: null,
    createdAt: change.changedAt,
    confirmedBy: 'storyteller',
    baseSetupId: setupEntry.setup.id,
    originNightRunId: change.nightRunId,
    seatId: change.seatId,
    fromRole: structuredClone(change.fromRole),
    toRole: structuredClone(change.toRole),
    reason: change.reason,
    effectiveFrom: 'future_workbenches',
  }))
  const {
    confirmedRecords: _confirmedRecords,
    roleChangeEvents: _roleChangeEvents,
    nightLabel: _nightLabel,
    seatSnapshots: _seatSnapshots,
    ...nightRun
  } = legacyNight

  return {
    ...session,
    timeline: [setupEntry, ...migratedNightEntries, ...migratedRoleChanges]
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt)),
    nightRuns: {
      [legacyNight.nightRunId]: {
        ...nightRun,
        id: legacyNight.nightRunId,
        phaseSegmentId: prototypeNightSegmentId,
      },
    },
    activeNightRunId: legacyNight.nightRunId,
  }
}
