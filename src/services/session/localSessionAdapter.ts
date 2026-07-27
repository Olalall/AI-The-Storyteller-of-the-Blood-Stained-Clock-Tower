import {
  createPrototypeGameSession,
  createPrototypeGameSessionFromLegacyNight,
  gameSessionStorageKey,
} from '../../features/game-session/data/createPrototypeSession'
import type { GameSessionState } from '../../features/game-session/types'
import {
  initialNightWorkbenchState,
  legacyNightWorkbenchStorageKey,
} from '../../features/night-workbench/data/initialNightWorkbenchState'
import type { NightWorkbenchState } from '../../features/night-workbench/types'

export { gameSessionStorageKey } from '../../features/game-session/data/createPrototypeSession'
export { legacyNightWorkbenchStorageKey } from '../../features/night-workbench/data/initialNightWorkbenchState'

function isSession(value: unknown): value is GameSessionState {
  if (!value || typeof value !== 'object') return false
  const session = value as Partial<GameSessionState>
  return session.schemaVersion === 1 &&
    typeof session.id === 'string' &&
    Array.isArray(session.phaseSegments) &&
    Array.isArray(session.timeline) &&
    Boolean(session.nightRuns) &&
    Boolean(session.initialPlayerStates)
}

function phaseLabel(kind: 'night' | 'day', sequence: number) {
  return kind === 'night' ? `第${sequence}夜` : `第${sequence}天`
}

function normalizePhaseSegments(session: GameSessionState): GameSessionState {
  const ordered = [...session.phaseSegments]
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt) || left.id.localeCompare(right.id))
  let highestNight = 0
  let highestDay = 0
  const normalizedById = new Map<string, GameSessionState['phaseSegments'][number]>()

  for (const segment of ordered) {
    const sequence = segment.kind === 'day'
      ? Math.max(segment.sequence, highestDay + 1, highestNight)
      : Math.max(segment.sequence, highestNight + 1, highestDay + 1)
    if (segment.kind === 'day') highestDay = sequence
    else highestNight = sequence

    const label = phaseLabel(segment.kind, sequence)
    normalizedById.set(segment.id, sequence === segment.sequence && label === segment.label
      ? segment
      : { ...segment, sequence, label })
  }

  const phaseSegments = session.phaseSegments.map((segment) => normalizedById.get(segment.id) ?? segment)
  return phaseSegments.every((segment, index) => segment === session.phaseSegments[index])
    ? session
    : { ...session, phaseSegments }
}

/**
 * 旧 v1 本地快照没有记录换角来自哪一夜。不能猜测归属到当前夜，
 * 否则跨夜后会把历史变更错误显示在新夜；未知来源一律保留为非夜间投影。
 */
function normalizeSession(session: GameSessionState): GameSessionState {
  const timeline = session.timeline.map((entry) => {
    const originNightRunId = (entry as { originNightRunId?: string | null }).originNightRunId
    if (entry.kind !== 'setup_changed' || originNightRunId !== undefined) return entry
    return { ...entry, originNightRunId: null }
  })
  const seats = Object.fromEntries(Object.entries(session.seats).map(([seatId, seat]) => {
    const legacySeat = seat as typeof seat & { name?: string; nickname?: string }
    const { name: _legacyName, ...seatWithoutLegacyName } = legacySeat
    const nickname = typeof legacySeat.nickname === 'string'
      ? legacySeat.nickname
      : typeof legacySeat.name === 'string'
        ? legacySeat.name.replace(/^\d+号/, '')
        : ''
    return [seatId, { ...seatWithoutLegacyName, nickname }]
  })) as GameSessionState['seats']
  const timelineChanged = !timeline.every((entry, index) => entry === session.timeline[index])
  const normalized = normalizePhaseSegments(timelineChanged ? { ...session, timeline, seats } : { ...session, seats })
  return {
    ...normalized,
    dayVoteDraft: normalized.dayVoteDraft ?? null,
    dayActionDraft: normalized.dayActionDraft ?? null,
  }
}

function isLegacyNightWorkbenchState(value: unknown): value is NightWorkbenchState {
  if (!value || typeof value !== 'object') return false
  const state = value as Partial<NightWorkbenchState>
  if (typeof state.nightRunId !== 'string' ||
    !Array.isArray(state.queue) ||
    typeof state.activeCursorId !== 'string' ||
    typeof state.previewEntryId !== 'string' ||
    !state.drafts ||
    !state.confirmedRecords ||
    !Array.isArray(state.roleChangeEvents)) return false

  const expectedItemIds = new Set(initialNightWorkbenchState.queue.map((item) => item.id))
  const queueItemIds = new Set(state.queue.map((item) => item.id))
  if (queueItemIds.size !== expectedItemIds.size ||
    [...expectedItemIds].some((itemId) => !queueItemIds.has(itemId)) ||
    !queueItemIds.has(state.activeCursorId) ||
    !queueItemIds.has(state.previewEntryId)) return false

  const records = Object.values(state.confirmedRecords).flat()
  const recordIds = new Set(records.map((record) => record.id))
  if (recordIds.size !== records.length || records.some((record) =>
    !queueItemIds.has(record.wakeItemId) ||
    typeof record.id !== 'string' ||
    typeof record.confirmedAt !== 'string' ||
    (record.correctionOf !== undefined && !recordIds.has(record.correctionOf)))) return false

  return state.queue.every((item) =>
    item.progress !== 'confirmed' || records.some((record) => record.wakeItemId === item.id))
}

export function loadGameSession(): GameSessionState {
  try {
    const stored = window.localStorage.getItem(gameSessionStorageKey)
    if (stored) {
      const parsed: unknown = JSON.parse(stored)
      return isSession(parsed) ? normalizeSession(parsed) : createPrototypeGameSession()
    }

    const legacyStored = window.localStorage.getItem(legacyNightWorkbenchStorageKey)
    if (legacyStored) {
      const legacyParsed: unknown = JSON.parse(legacyStored)
      if (isLegacyNightWorkbenchState(legacyParsed)) {
        const migrated = createPrototypeGameSessionFromLegacyNight(legacyParsed)
        window.localStorage.setItem(gameSessionStorageKey, JSON.stringify(migrated))
        window.localStorage.removeItem(legacyNightWorkbenchStorageKey)
        return migrated
      }
    }

    return createPrototypeGameSession()
  } catch {
    return createPrototypeGameSession()
  }
}

export function persistGameSession(state: GameSessionState) {
  window.localStorage.setItem(gameSessionStorageKey, JSON.stringify(state))
}

export function resetGameSession() {
  window.localStorage.removeItem(gameSessionStorageKey)
}
