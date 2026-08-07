/**
 * 相位关闭时把整份 session 推给后端的 recovery 命名空间。
 *
 * 为什么不复用 httpArchiveAdapter.save()：那条路直通 JsonArchiveRepository，写的是
 * archives.json。推完的那一刻，一局还没打完的对局就出现在 GET /api/archives、
 * 出现在复盘列表、出现在战绩统计里，而没有任何自动手段能把它们摘干净。
 * 所以后端那边是独立路由 + 独立数据文件，这边也必须是独立的推送客户端。
 *
 * 为什么全程尽力而为：相位关闭是不可逆动作。后端没开、网线没插、跨域被拦，
 * 任何一种都不能让说书人卡在「结束今天」这个按钮上，也不能弹一个他此刻无法处理的错——
 * 桌上还有十二个人在等。因此这里永不抛错、永不阻塞，失败只回一个 outcome 供测试断言。
 */
import type { GameSessionState } from '../../features/game-session/types'
import { readArchiveRuntimeSettings, type ArchiveRuntimeSettings } from '../archive/archiveRuntimeSettings'
import type { LockState } from './instanceLock'
import { snapshotOnPhaseClose } from './localSessionAdapter'

type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

export type RecoveryPushOutcome =
  | { pushed: true }
  /** 没推出去的原因。它只用于测试与排查，界面上一个字都不显示。 */
  | { pushed: false; reason: 'readonly-tab' | 'backend-off' | 'timeout' | 'network' | 'rejected' }

export function recoverySnapshotPath(sessionId: string) {
  return `/api/recovery/sessions/${encodeURIComponent(sessionId)}/snapshot`
}

/**
 * 这个标签页最近一次问锁得到的答案。
 *
 * 只读标签页绝不能推：它手里那份 session 可能已经落后好几分钟，推上去会把后端那份
 * 好的救生圈换成旧的，而说书人真去读它的时候已经没有第二份可比了。
 *
 * 锁的 holderId 只有拿锁的那一处知道，所以「我是不是所有者」这个答案只能在锁返回时
 * 被记下来——见 services/session/index.ts 里 acquireLock / heartbeat 的包装。
 * 默认 owner：绝大多数时候只有一个标签页，而这条路径失灵的代价是丢掉整局的后备。
 */
let observedLock: LockState = 'owner'

export function observeWriteLock(lock: LockState): LockState {
  observedLock = lock
  return lock
}

export interface PushRecoverySnapshotOptions {
  fetcher?: FetchLike
  /** 只读地址，不调 applyArchiveRuntimeSettings()：那个函数会重置全局归档适配器。 */
  settings?: ArchiveRuntimeSettings
  lock?: LockState
  savedAt?: string
}

function urlFor(baseUrl: string, pathname: string) {
  return `${baseUrl.replace(/\/$/, '')}${pathname}`
}

export async function pushRecoverySnapshot(
  session: GameSessionState,
  options: PushRecoverySnapshotOptions = {},
): Promise<RecoveryPushOutcome> {
  if ((options.lock ?? observedLock) === 'readonly') return { pushed: false, reason: 'readonly-tab' }

  const settings = options.settings ?? readArchiveRuntimeSettings()
  // 没配后端就没有可推的地方。这不是失败，是这台机器根本没开这条通道。
  if (settings.mode !== 'http') return { pushed: false, reason: 'backend-off' }

  const fetcher = options.fetcher ?? ((input, init) => fetch(input, init))
  const controller = new AbortController()
  let timedOut = false
  const timeoutId = window.setTimeout(() => {
    timedOut = true
    controller.abort()
  }, settings.timeoutMs)

  try {
    const response = await fetcher(urlFor(settings.baseUrl, recoverySnapshotPath(session.id)), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ savedAt: options.savedAt ?? new Date().toISOString(), session }),
      signal: controller.signal,
    })
    return response.ok ? { pushed: true } : { pushed: false, reason: 'rejected' }
  } catch {
    return { pushed: false, reason: timedOut ? 'timeout' : 'network' }
  } finally {
    window.clearTimeout(timeoutId)
  }
}

/**
 * 相位关闭这一刻的两件耐久性动作，合成一次调用：本地快照必落，后端推送尽力。
 *
 * 顺序不能反：本地那份是唯一一定能落的，网络那份只是加保。
 * 调用点放在真正 dispatch 关闭之前——快照要的就是「关闭前的样子」，
 * 而 reducer 的新状态在同一个事件里根本还取不到。
 */
export function savePhaseCloseSnapshot(session: GameSessionState) {
  snapshotOnPhaseClose(session)
  void pushRecoverySnapshot(session)
}
