/**
 * 耐久性的运行时接线：单实例锁 + 启动时的恢复候选。
 *
 * 刻意与 useGameSession 分开：对局状态机不该知道有几个标签页开着。
 * 这里只报告事实（我是不是所有者、有没有可恢复的快照），
 * 由界面决定怎么呈现——恢复永远是一次人的选择，不自动回滚。
 */
import { useEffect, useMemo, useState } from 'react'
import {
  LOCK_HEARTBEAT_MS,
  acquireLock,
  heartbeat,
  listSnapshots,
  readSnapshot,
  releaseLock,
  snapshotBeforeDestructiveChange,
  type LockState,
} from '../../../services/session'
import type { GameSessionAction } from './sessionActions'
import type { GameSessionState } from '../types'

export interface RecoveryCandidate {
  slot: number
  savedAt: string
  sessionId: string
  byteLength: number
  /** 这份快照比当前存档多几条记录。差额只有这里算得出来，别让界面去猜。 */
  extraEntries: number
  session: GameSessionState
}

export interface SessionDurability {
  lock: LockState
  /** 比当前存档更完整的快照；没有就是空数组。最新的在前。 */
  candidates: readonly RecoveryCandidate[]
  /** 用这份快照整份替换当前对局。只由界面上那一次点击触发，绝不自动。 */
  restore: (candidate: RecoveryCandidate) => void
  dismiss: () => void
}

interface SessionDurabilityOptions {
  /** App 已提前取得的写锁；传入后这里不再创建第二把锁。 */
  lock?: LockState
}

function useLockLifecycle(enabled: boolean): LockState {
  // 每个标签页一个 id，跨刷新会换新——刷新本就该重新竞争锁。
  const holderId = useMemo(() => `tab-${Math.random().toString(36).slice(2)}-${performance.now()}`, [])
  const [lock, setLock] = useState<LockState>(() => enabled ? acquireLock(holderId, Date.now()) : 'readonly')

  useEffect(() => {
    if (!enabled) return
    const beat = () => setLock(heartbeat(holderId, Date.now()))
    // React 的清理函数在整页刷新时不保证执行。pagehide 会在手机浏览器刷新、
    // 关闭标签页以及进入 bfcache 前同步触发，及时释放本页的锁，避免刷新后
    // 把同一个用户误报成“另一个窗口正在主持”。崩溃时仍由超时机制兜底。
    const releaseCurrentPageLock = () => releaseLock(holderId)
    const timer = window.setInterval(beat, LOCK_HEARTBEAT_MS)
    window.addEventListener('pagehide', releaseCurrentPageLock)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('pagehide', releaseCurrentPageLock)
      releaseLock(holderId)
    }
  }, [enabled, holderId])

  return lock
}

/** App 在读取并自动保存 session 之前先取得写锁。 */
export function useSessionWriteLock(): LockState {
  return useLockLifecycle(true)
}

/**
 * 只有当快照里的记录**比现在多**时才算恢复候选。
 *
 * 反过来的情况（快照更少）是正常的——它只是更早的一份。把它也提出来会让
 * 说书人每次开局都被问一遍要不要回退，然后学会永远点「不用」，
 * 于是真正需要恢复的那一次也被跳过。
 */
function candidatesFor(current: GameSessionState): RecoveryCandidate[] {
  return listSnapshots().flatMap((entry) => {
    const snapshot = readSnapshot(entry.slot)
    if (!snapshot) return []
    try {
      const session = JSON.parse(snapshot.raw) as GameSessionState
      if (session.id !== current.id) return []
      const extraEntries = session.timeline.length - current.timeline.length
      if (extraEntries <= 0) return []
      return [{
        slot: entry.slot,
        savedAt: entry.savedAt,
        sessionId: session.id,
        byteLength: entry.byteLength,
        extraEntries,
        session,
      }]
    } catch {
      return []
    }
  })
}

export function useSessionDurability(
  session: GameSessionState,
  dispatch: (action: GameSessionAction) => void,
  options: SessionDurabilityOptions = {},
): SessionDurability {
  const ownLock = useLockLifecycle(options.lock === undefined)
  const lock = options.lock ?? ownLock
  const [dismissed, setDismissed] = useState(false)
  // 只在挂载时看一次：开局之后再冒出「要不要恢复」会打断正在进行的主持。
  const [candidates] = useState<RecoveryCandidate[]>(() => candidatesFor(session))

  return {
    lock,
    candidates: lock === 'owner' && !dismissed ? candidates : [],
    restore: (candidate) => {
      if (lock !== 'owner') return
      // 先把当前这份存成快照再替换：恢复本身也是一次破坏性操作，
      // 而说书人有可能恢复错了那一份。界面上承诺了这条，这里必须兑现。
      snapshotBeforeDestructiveChange(session)
      dispatch({ type: 'replace-session', session: candidate.session })
      setDismissed(true)
    },
    dismiss: () => setDismissed(true),
  }
}
