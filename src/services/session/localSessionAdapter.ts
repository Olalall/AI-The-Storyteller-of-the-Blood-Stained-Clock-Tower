import {
  createEmptyGameSession,
  createPrototypeGameSessionFromLegacyNight,
  gameSessionStorageKey,
} from '../../features/game-session/data/createPrototypeSession'
import type { GameSessionState } from '../../features/game-session/types'
import { legacyNightWorkbenchStorageKey } from '../../features/night-workbench/data/initialNightWorkbenchState'
import {
  isLegacyNightWorkbenchState,
  isReadableGameSession,
  normalizeReadableGameSession,
} from './sessionImport'
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
      if (isReadableGameSession(parsed)) return { kind: 'restored', session: normalizeReadableGameSession(parsed) }
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

/** 破坏性操作前先留一份；返回 false 时调用方不得继续执行不可逆替换。 */
export function snapshotBeforeDestructiveChange(
  state: GameSessionState,
  reason: 'destructive' | 'import' = 'destructive',
) {
  return writeSnapshot(state, reason, new Date().toISOString())
}

export function snapshotOnPhaseClose(state: GameSessionState) {
  writeSnapshot(state, 'phase-close', new Date().toISOString())
}

export function resetGameSession() {
  window.localStorage.removeItem(gameSessionStorageKey)
}
