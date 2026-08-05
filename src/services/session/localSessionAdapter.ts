import {
  createEmptyGameSession,
  createPrototypeGameSessionFromLegacyNight,
  gameSessionStorageKey,
} from '../../features/game-session/data/createPrototypeSession'
import type { GameSessionState } from '../../features/game-session/types'
import {
  initialNightWorkbenchState,
  legacyNightWorkbenchStorageKey,
} from '../../features/night-workbench/data/initialNightWorkbenchState'
import type { NightWorkbenchState } from '../../features/night-workbench/types'
import { shouldSnapshot, writeSnapshot } from './snapshotRotation'

export { gameSessionStorageKey } from '../../features/game-session/data/createPrototypeSession'
export { legacyNightWorkbenchStorageKey } from '../../features/night-workbench/data/initialNightWorkbenchState'

/** 读不出的存档原文备份在这里，等待用户导出；它不是第二份权威存档。 */
export const sessionRecoveryStorageKey = 'botc-copilot-session-recovery-v1'

export interface SessionRecoveryRecord {
  savedAt: string
  reason: 'parse-error' | 'invalid'
  byteLength: number
  raw: string
}

export type SessionLoadOutcome =
  | { kind: 'restored'; session: GameSessionState }
  | { kind: 'migrated'; session: GameSessionState }
  | { kind: 'fresh'; session: GameSessionState }
  | { kind: 'unreadable'; session: GameSessionState; recovery: SessionRecoveryRecord }

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
 * 读不出的存档必须先备份再放弃：调用方在拿到新对局后会立刻把它写回主键，
 * 原文若不先挪走就会被永久覆盖。备份只保留最近一次，避免无限增长。
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
    return record
  } catch {
    // 备份本身失败（多为配额耗尽）时仍要让上层知道原文读不出，只是没能留档。
    return { ...record, raw: '' }
  }
}

export function loadGameSessionOutcome(): SessionLoadOutcome {
  let stored: string | null = null
  try {
    stored = window.localStorage.getItem(gameSessionStorageKey)
  } catch {
    return { kind: 'fresh', session: createEmptyGameSession() }
  }

  if (stored) {
    try {
      const parsed: unknown = JSON.parse(stored)
      if (isSession(parsed)) return { kind: 'restored', session: normalizeSession(parsed) }
      return {
        kind: 'unreadable',
        session: createEmptyGameSession(),
        recovery: backupUnreadableSession(stored, 'invalid'),
      }
    } catch {
      return {
        kind: 'unreadable',
        session: createEmptyGameSession(),
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
        window.localStorage.setItem(gameSessionStorageKey, JSON.stringify(migrated))
        window.localStorage.removeItem(legacyNightWorkbenchStorageKey)
        return { kind: 'migrated', session: migrated }
      }
    }
  } catch {
    // 旧夜间快照读不出不影响开新局；它不是权威存档，且既有约定是不删除无效旧快照。
  }

  // 首次运行给一局空对局，让说书人从入口界面开始。
  // createPrototypeGameSession 是开发夹具（12人瓦釜雷鸣，冻结在第3夜），
  // 把它当默认落地页会让新用户以为工具里已经有一局在进行。
  return { kind: 'fresh', session: createEmptyGameSession() }
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
  // 快照按时间节流，不是每次写入都存；顺序上放在主副本之后，
  // 因为主副本写失败时没必要再留一份。
  const now = Date.now()
  if (shouldSnapshot('interval', now)) writeSnapshot(state, 'interval', new Date(now).toISOString())
}

/** 破坏性操作前先留一份。这两处正是「回退到刚才」最常被需要的时刻。 */
export function snapshotBeforeDestructiveChange(state: GameSessionState) {
  writeSnapshot(state, 'destructive', new Date().toISOString())
}

export function snapshotOnPhaseClose(state: GameSessionState) {
  writeSnapshot(state, 'phase-close', new Date().toISOString())
}

export function resetGameSession() {
  window.localStorage.removeItem(gameSessionStorageKey)
}
