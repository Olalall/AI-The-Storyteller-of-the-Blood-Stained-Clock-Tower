/**
 * 单实例锁：同一份存档只许一个标签页写。
 *
 * 两个标签页各持一份内存状态、又都往同一个 localStorage key 写整份 session 时，
 * 后写的会**整份覆盖**先写的——不是合并冲突，是静默丢掉一整段记录。
 * 说书人不会察觉，因为两边界面各自看起来都对。
 *
 * 后开的那个转为只读，而不是抢锁：抢锁会让先开的那个（很可能正在主持）突然失效。
 *
 * 锁靠心跳而不是靠 unload 释放——崩溃、强杀、锁屏都不会触发 unload，
 * 靠它释放会让下一次打开永远打不开。
 */

export const instanceLockStorageKey = 'botc-copilot-session-lock-v1'
/** 心跳间隔。 */
export const LOCK_HEARTBEAT_MS = 3_000
/** 超过这个时间没心跳就认为持有者已经不在了。 */
export const LOCK_STALE_MS = 10_000

export interface LockRecord {
  holderId: string
  beatAt: number
}

export type LockState = 'owner' | 'readonly'

function readLock(): LockRecord | null {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(instanceLockStorageKey) ?? 'null') as unknown
    if (!parsed || typeof parsed !== 'object') return null
    const record = parsed as LockRecord
    return typeof record.holderId === 'string' && typeof record.beatAt === 'number' ? record : null
  } catch {
    return null
  }
}

function writeLock(record: LockRecord) {
  try {
    window.localStorage.setItem(instanceLockStorageKey, JSON.stringify(record))
  } catch {
    // 写不进锁不该阻止主持；退化成「没有锁」，比拒绝开局好。
  }
}

export function isLockStale(record: LockRecord | null, now: number): boolean {
  return record === null || now - record.beatAt > LOCK_STALE_MS
}

/**
 * 试着拿锁。拿不到就返回 readonly——不抢。
 * 同一个 holderId 再次调用视为续期，所以刷新页面不会把自己锁在外面。
 */
export function acquireLock(holderId: string, now: number): LockState {
  const current = readLock()
  if (current !== null && current.holderId !== holderId && !isLockStale(current, now)) return 'readonly'
  writeLock({ holderId, beatAt: now })
  return 'owner'
}

/** 续期。若锁已被别人接管则报告丢锁，由调用方切成只读。 */
export function heartbeat(holderId: string, now: number): LockState {
  const current = readLock()
  if (current !== null && current.holderId !== holderId && !isLockStale(current, now)) return 'readonly'
  writeLock({ holderId, beatAt: now })
  return 'owner'
}

export function releaseLock(holderId: string) {
  if (readLock()?.holderId === holderId) window.localStorage.removeItem(instanceLockStorageKey)
}
