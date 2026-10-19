import {
  createEmptyGameSession,
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

/** 读不出的存档原文备份在这里，等待用户导出；它不是第二份权威存档。 */
export const sessionRecoveryStorageKey = 'botc-copilot-session-recovery-v1'

export interface SessionRecoveryRecord {
  savedAt: string
  reason: 'parse-error' | 'invalid'
  byteLength: number
  raw: string
  persisted?: boolean
}

export type SessionLoadOutcome = { baseline: string | null } & (
  | { kind: 'restored'; session: GameSessionState }
  | { kind: 'migrated'; session: GameSessionState }
  | { kind: 'fresh'; session: GameSessionState }
  | { kind: 'unreadable'; session: GameSessionState; recovery: SessionRecoveryRecord }
)

/**
 * 只校验读取所必需的骨架，且接受 schemaVersion ≥ 1 与任何未知字段：
 * 更高版本或新增可选字段的存档必须仍能读出，否则一次前进式改动就会让所有旧对局
 * 变成「无法解析」而被备份走。真正读不出的存档由 loadGameSessionOutcome 负责备份。
 */
function isSession(value: unknown): value is GameSessionState {
  if (!value || typeof value !== 'object') return false
  const session = value as Partial<GameSessionState>
  return typeof session.schemaVersion === 'number' && session.schemaVersion >= 1 &&
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

/**
 * 先尝试为原文留档；失败仍完整交给恢复界面。不可读时禁止自动写主键，
 * 只有用户显式确认且恢复副本写入成功后才可新建。副本只保留最近一次。
 */
function backupUnreadableSession(raw: string, reason: SessionRecoveryRecord['reason']) {
  const record: SessionRecoveryRecord = {
    savedAt: new Date().toISOString(),
    reason,
    byteLength: raw.length,
    raw,
  }
  try {
    window.localStorage.setItem(sessionRecoveryStorageKey, JSON.stringify(record))
    return { ...record, persisted: true }
  } catch {
    // 配额不足时原文仍留在主键；恢复界面必须能导出完整原文。
    return { ...record, persisted: false }
  }
}

export function loadGameSessionOutcome(): SessionLoadOutcome {
  let stored: string | null = null
  try {
    stored = window.localStorage.getItem(gameSessionStorageKey)
  } catch {
    return { kind: 'fresh', session: createPrototypeGameSession(), baseline: null }
  }

  if (stored) {
    try {
      const parsed: unknown = JSON.parse(stored)
      if (isSession(parsed)) return { kind: 'restored', session: normalizeSession(parsed), baseline: stored }
      return {
        kind: 'unreadable',
        session: createEmptyGameSession(),
        baseline: stored,
        recovery: backupUnreadableSession(stored, 'invalid'),
      }
    } catch {
      return {
        kind: 'unreadable',
        session: createEmptyGameSession(),
        baseline: stored,
        recovery: backupUnreadableSession(stored, 'parse-error'),
      }
    }
  }

  try {
    const legacyStored = window.localStorage.getItem(legacyNightWorkbenchStorageKey)
    if (legacyStored) {
      const legacyParsed: unknown = JSON.parse(legacyStored)
      if (isLegacyNightWorkbenchState(legacyParsed)) {
        const migrated = createPrototypeGameSessionFromLegacyNight(legacyParsed)
        const baseline = JSON.stringify(migrated)
        window.localStorage.setItem(gameSessionStorageKey, baseline)
        window.localStorage.removeItem(legacyNightWorkbenchStorageKey)
        return { kind: 'migrated', session: migrated, baseline }
      }
    }
  } catch {
    // 旧夜间快照读不出不影响开新局；它不是权威存档，且既有约定是不删除无效旧快照。
  }

  return { kind: 'fresh', session: createPrototypeGameSession(), baseline: stored }
}

export function loadGameSession(): GameSessionState {
  return loadGameSessionOutcome().session
}

export function readSessionRecovery(): SessionRecoveryRecord | null {
  try {
    const stored = window.localStorage.getItem(sessionRecoveryStorageKey)
    if (!stored) return null
    const parsed: unknown = JSON.parse(stored)
    if (!parsed || typeof parsed !== 'object') return null
    const record = parsed as Partial<SessionRecoveryRecord>
    if (typeof record.savedAt !== 'string' || typeof record.raw !== 'string') return null
    return {
      savedAt: record.savedAt,
      reason: record.reason === 'parse-error' ? 'parse-error' : 'invalid',
      byteLength: typeof record.byteLength === 'number' ? record.byteLength : record.raw.length,
      raw: record.raw,
    }
  } catch {
    return null
  }
}

export function clearSessionRecovery() {
  try {
    window.localStorage.removeItem(sessionRecoveryStorageKey)
  } catch {
    // 清理失败不影响主流程；下次启动仍会提示，用户可再试。
  }
}

export function persistGameSession(state: GameSessionState) {
  window.localStorage.setItem(gameSessionStorageKey, JSON.stringify(state))
}

export function resetGameSession() {
  window.localStorage.removeItem(gameSessionStorageKey)
}
