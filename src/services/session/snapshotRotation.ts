/**
 * 快照轮转：主副本之外再留最近 5 份。
 *
 * 为什么在允许「在魔典上直接改状态」之前必须先有这个：G1 的魔典是只读的，
 * 工具还不是唯一事实来源，丢了存档最多丢一份笔记。G2 一旦允许在魔典上落账，
 * 说书人就会停止在别处记录，此后丢数据等于整局报废。
 *
 * 轮转刻意按**时间间隔**而不是按每次写入：一局会产生上千次写入，每次都存
 * 会把 5 个槽在十几秒内冲干净，真正需要回退的时候只剩下十几秒前的状态。
 */
import type { GameSessionState } from '../../features/game-session/types'

export const snapshotStorageKeyPrefix = 'botc-copilot-session-snapshot-v1'
/** 保留几份。够回退到几分钟前，又不至于把 localStorage 撑爆。 */
export const SNAPSHOT_SLOTS = 5
/** 两份快照之间至少隔这么久。 */
export const SNAPSHOT_INTERVAL_MS = 60_000

export interface SnapshotRecord {
  savedAt: string
  sessionId: string
  reason: 'interval' | 'destructive' | 'phase-close'
  byteLength: number
  raw: string
}

interface StoredIndexEntry {
  slot: number
  savedAt: string
  sessionId: string
  reason: SnapshotRecord['reason']
  byteLength: number
}

/** key 的构造只在这里一处；调用方（含测试）一律用它，不自己拼字符串。 */
export const snapshotIndexKey = `${snapshotStorageKeyPrefix}-index`
export const snapshotSlotKey = (slot: number) => `${snapshotStorageKeyPrefix}-${slot}`

const indexKey = snapshotIndexKey
const slotKey = snapshotSlotKey

function readIndex(): StoredIndexEntry[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(indexKey) ?? '[]') as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((entry): entry is StoredIndexEntry =>
      Boolean(entry) && typeof entry === 'object'
      && typeof (entry as StoredIndexEntry).slot === 'number'
      && typeof (entry as StoredIndexEntry).savedAt === 'string')
  } catch {
    // 索引本身坏了不该连累主存档；当作没有快照即可。
    return []
  }
}

function writeIndex(entries: StoredIndexEntry[]) {
  window.localStorage.setItem(indexKey, JSON.stringify(entries))
}

/** 最新的在前。 */
export function listSnapshots(): StoredIndexEntry[] {
  return [...readIndex()].sort((left, right) => right.savedAt.localeCompare(left.savedAt))
}

export function readSnapshot(slot: number): SnapshotRecord | null {
  const entry = readIndex().find((candidate) => candidate.slot === slot)
  const raw = window.localStorage.getItem(slotKey(slot))
  if (!entry || raw === null) return null
  return { ...entry, raw }
}

/**
 * 需要新存一份吗？
 * `destructive` 与 `phase-close` 无条件存——这两处正是「回退到刚才」最常被需要的时刻。
 */
export function shouldSnapshot(reason: SnapshotRecord['reason'], now: number): boolean {
  if (reason !== 'interval') return true
  const latest = listSnapshots()[0]
  if (!latest) return true
  return now - Date.parse(latest.savedAt) >= SNAPSHOT_INTERVAL_MS
}

/**
 * 写一份快照，占用最旧的槽。
 *
 * 写不进去（配额满）时**静默放弃而不是抛错**：快照是安全网，
 * 它失败绝不能连带让正在进行的一局中断。
 */
export function writeSnapshot(
  session: GameSessionState,
  reason: SnapshotRecord['reason'],
  savedAt: string,
): boolean {
  const raw = JSON.stringify(session)
  const entries = readIndex()
  const used = new Set(entries.map((entry) => entry.slot))
  const free = Array.from({ length: SNAPSHOT_SLOTS }, (_value, index) => index).find((slot) => !used.has(slot))
  const oldest = [...entries].sort((left, right) => left.savedAt.localeCompare(right.savedAt))[0]
  const slot = free ?? oldest?.slot ?? 0

  try {
    window.localStorage.setItem(slotKey(slot), raw)
  } catch {
    return false
  }

  writeIndex([
    ...entries.filter((entry) => entry.slot !== slot),
    { slot, savedAt, sessionId: session.id, reason, byteLength: raw.length },
  ])
  return true
}

export function clearSnapshots() {
  for (let slot = 0; slot < SNAPSHOT_SLOTS; slot += 1) window.localStorage.removeItem(slotKey(slot))
  window.localStorage.removeItem(indexKey)
}
