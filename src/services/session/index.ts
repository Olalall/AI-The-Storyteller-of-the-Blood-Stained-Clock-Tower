import {
  acquireLock as acquireInstanceLock,
  heartbeat as beatInstanceLock,
  type LockState,
} from './instanceLock'
import { observeWriteLock } from './httpRecoveryAdapter'

export {
  clearSessionRecovery,
  loadGameSession,
  loadGameSessionOutcome,
  persistGameSession,
  readSessionRecovery,
  resetGameSession,
} from './sessionService'
export { gameSessionStorageKey, legacyNightWorkbenchStorageKey, sessionRecoveryStorageKey } from './localSessionAdapter'
export type { SessionLoadOutcome, SessionRecoveryRecord } from './localSessionAdapter'
export {
  snapshotBeforeDestructiveChange,
  snapshotOnPhaseClose,
} from './localSessionAdapter'
export {
  SNAPSHOT_SLOTS,
  clearSnapshots,
  listSnapshots,
  readSnapshot,
  snapshotIndexKey,
  snapshotSlotKey,
  snapshotStorageKeyPrefix,
} from './snapshotRotation'
export type { SnapshotRecord } from './snapshotRotation'
export {
  LOCK_HEARTBEAT_MS,
  instanceLockStorageKey,
  releaseLock,
} from './instanceLock'
export type { LockState } from './instanceLock'
export { downloadTextFile, exportSessionJson, sessionExportFilename } from './exportSession'
export {
  pushRecoverySnapshot,
  recoverySnapshotPath,
  savePhaseCloseSnapshot,
} from './httpRecoveryAdapter'
export type { RecoveryPushOutcome } from './httpRecoveryAdapter'

/*
 * 锁的答案在这里分叉给恢复推送。
 *
 * 「谁能写本地存档」与「谁能往后端推半局快照」必须永远是同一个答案：两个标签页都推，
 * 后端那份救生圈会被落后的那个覆盖成更旧的状态。而 holderId 只有拿锁的那一处知道，
 * 所以这个答案只能在锁返回的那一刻被记下来，推送端没法自己算出来。
 *
 * 代价是：直接 import './instanceLock' 会绕过记录。应用代码请一律从本模块取
 * acquireLock / heartbeat，instanceLock.ts 只留给它自己的单测。
 */
export function acquireLock(holderId: string, now: number): LockState {
  return observeWriteLock(acquireInstanceLock(holderId, now))
}

export function heartbeat(holderId: string, now: number): LockState {
  return observeWriteLock(beatInstanceLock(holderId, now))
}
