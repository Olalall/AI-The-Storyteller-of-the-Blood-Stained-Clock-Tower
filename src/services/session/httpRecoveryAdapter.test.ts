import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPrototypeGameSession } from '../../features/game-session/data/createPrototypeSession'
import type { ArchiveRuntimeSettings } from '../archive/archiveRuntimeSettings'
import { archiveRuntimeSettingsStorageKey } from '../archive/archiveRuntimeSettings'
import { listArchivesAsync, resetAsyncArchiveAdapter, setAsyncArchiveAdapter } from '../archive/archiveService'
import { acquireLock } from './index'
import { instanceLockStorageKey } from './instanceLock'
import { clearSnapshots, listSnapshots } from './snapshotRotation'
import {
  observeWriteLock,
  pushRecoverySnapshot,
  recoverySnapshotPath,
  savePhaseCloseSnapshot,
} from './httpRecoveryAdapter'

const httpSettings: ArchiveRuntimeSettings = {
  mode: 'http',
  baseUrl: 'http://127.0.0.1:8787',
  timeoutMs: 8000,
}

function okFetcher(calls: { url: string; init?: RequestInit }[]) {
  return (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ url: String(input), init })
    return Promise.resolve(new Response(JSON.stringify({ accepted: true }), { status: 200 }))
  }
}

/** 永不自行 resolve，只在 abort 时拒绝——这正是超时那条路径要走的形状。 */
function hangingFetcher(_input: RequestInfo | URL, init?: RequestInit) {
  return new Promise<Response>((_resolve, reject) => {
    init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
  })
}

describe('相位关闭时向后端 recovery 命名空间推快照', () => {
  beforeEach(() => {
    window.localStorage.clear()
    // 每个用例都从「这个标签页是所有者」起步，否则上一个用例记下的 readonly 会串进来。
    observeWriteLock('owner')
  })

  afterEach(() => {
    observeWriteLock('owner')
    resetAsyncArchiveAdapter()
    vi.restoreAllMocks()
  })

  it('推到 /api/recovery/，不碰归档的任何路径', async () => {
    // 这是整件事的要害：走归档路由等于半局立刻出现在 GET /api/archives 与复盘列表里，
    // 而没有任何自动手段能把没打完的对局从战绩里摘干净。
    const calls: { url: string; init?: RequestInit }[] = []
    const session = createPrototypeGameSession()

    const outcome = await pushRecoverySnapshot(session, { settings: httpSettings, fetcher: okFetcher(calls) })

    expect(outcome).toEqual({ pushed: true })
    expect(calls).toHaveLength(1)
    expect(calls[0].url).toBe(`${httpSettings.baseUrl}${recoverySnapshotPath(session.id)}`)
    expect(calls[0].url).toContain('/api/recovery/')
    expect(calls[0].url).not.toContain('/archive')
    expect(calls[0].init?.method).toBe('POST')
    const body = JSON.parse(String(calls[0].init?.body)) as { session: { id: string }; savedAt: string }
    expect(body.session.id).toBe(session.id)
    expect(typeof body.savedAt).toBe('string')
  })

  it('只读标签页一个字节都不推', async () => {
    // 两个标签页都推，后端那份救生圈会被落后的那个覆盖成更旧的状态；
    // 而说书人真去读它的时候，已经没有第二份可以比对了。
    const calls: { url: string; init?: RequestInit }[] = []

    const outcome = await pushRecoverySnapshot(createPrototypeGameSession(), {
      settings: httpSettings,
      fetcher: okFetcher(calls),
      lock: 'readonly',
    })

    expect(outcome).toEqual({ pushed: false, reason: 'readonly-tab' })
    expect(calls).toHaveLength(0)
  })

  it('拿不到锁的标签页自动不推，不需要调用方自己传 lock', async () => {
    // 这条是 5 号约束的端到端接线：推送端拿不到 holderId，判断只能来自 acquireLock 的返回值。
    // 如果 index.ts 的包装被谁绕过去（直接 import instanceLock），这条会立刻红。
    const calls: { url: string; init?: RequestInit }[] = []
    window.localStorage.setItem(
      instanceLockStorageKey,
      JSON.stringify({ holderId: 'first-tab', beatAt: Date.now() }),
    )

    expect(acquireLock('second-tab', Date.now())).toBe('readonly')
    const outcome = await pushRecoverySnapshot(createPrototypeGameSession(), {
      settings: httpSettings,
      fetcher: okFetcher(calls),
    })

    expect(outcome).toEqual({ pushed: false, reason: 'readonly-tab' })
    expect(calls).toHaveLength(0)
  })

  it('没配后端就不推，也不当成失败', async () => {
    // 绝大多数用户是纯本地的。把「没开这条通道」当错误上报，等于每次关相位都报一次假警。
    const calls: { url: string; init?: RequestInit }[] = []

    const outcome = await pushRecoverySnapshot(createPrototypeGameSession(), {
      settings: { mode: 'local', baseUrl: httpSettings.baseUrl, timeoutMs: 8000 },
      fetcher: okFetcher(calls),
    })

    expect(outcome).toEqual({ pushed: false, reason: 'backend-off' })
    expect(calls).toHaveLength(0)
  })

  it('不传 settings 时从 localStorage 读地址，且默认（未配置）就是不推', async () => {
    const calls: { url: string; init?: RequestInit }[] = []

    expect(await pushRecoverySnapshot(createPrototypeGameSession(), { fetcher: okFetcher(calls) }))
      .toEqual({ pushed: false, reason: 'backend-off' })

    window.localStorage.setItem(archiveRuntimeSettingsStorageKey, JSON.stringify(httpSettings))
    expect(await pushRecoverySnapshot(createPrototypeGameSession(), { fetcher: okFetcher(calls) }))
      .toEqual({ pushed: true })
    expect(calls[0].url.startsWith(httpSettings.baseUrl)).toBe(true)
  })

  it('读地址不得走 applyArchiveRuntimeSettings：那会把全局归档适配器重置掉', async () => {
    // applyArchiveRuntimeSettings 有副作用（重建并安装归档适配器）。
    // 用它读一下地址，代价是把用户当前正在用的适配器换成另一个实例——
    // 表现为归档页在关一次相位之后忽然连不上，而没人会把这两件事联系起来。
    window.localStorage.setItem(archiveRuntimeSettingsStorageKey, JSON.stringify(httpSettings))
    const sentinel = {
      load: vi.fn(() => Promise.resolve([])),
      save: vi.fn(() => Promise.resolve([])),
      get: vi.fn(() => Promise.resolve(null)),
    }
    setAsyncArchiveAdapter(sentinel)

    await pushRecoverySnapshot(createPrototypeGameSession(), { fetcher: okFetcher([]) })
    await listArchivesAsync()

    expect(sentinel.load).toHaveBeenCalledTimes(1)
  })

  it('后端拒绝时静默失败，不抛错', async () => {
    const outcome = await pushRecoverySnapshot(createPrototypeGameSession(), {
      settings: httpSettings,
      fetcher: () => Promise.resolve(new Response('nope', { status: 500 })),
    })

    expect(outcome).toEqual({ pushed: false, reason: 'rejected' })
  })

  it('网线不通时静默失败，不抛错', async () => {
    const outcome = await pushRecoverySnapshot(createPrototypeGameSession(), {
      settings: httpSettings,
      fetcher: () => Promise.reject(new TypeError('Failed to fetch')),
    })

    expect(outcome).toEqual({ pushed: false, reason: 'network' })
  })

  it('后端不响应时自己超时收场，而不是永远挂着', async () => {
    // 没有这条超时，一个只 accept 不回包的后端会让这个 promise 永远悬着。
    // 现在它不阻塞关闭流程，但悬着的请求会攒住整份 session 的内存副本，一夜几十次。
    const outcome = await pushRecoverySnapshot(createPrototypeGameSession(), {
      settings: { ...httpSettings, timeoutMs: 5 },
      fetcher: hangingFetcher,
    })

    expect(outcome).toEqual({ pushed: false, reason: 'timeout' })
  })
})

describe('savePhaseCloseSnapshot', () => {
  beforeEach(() => {
    window.localStorage.clear()
    clearSnapshots()
    observeWriteLock('owner')
  })

  afterEach(() => {
    observeWriteLock('owner')
    vi.restoreAllMocks()
  })

  it('本地快照必落，且标成 phase-close', () => {
    // 相位关闭同时清掉当天草稿、封掉这一段，是不可逆的。
    // 本地这一份是唯一一定能落的后备，网络那份只是加保。
    const session = createPrototypeGameSession()

    savePhaseCloseSnapshot(session)

    const snapshots = listSnapshots()
    expect(snapshots).toHaveLength(1)
    expect(snapshots[0].reason).toBe('phase-close')
    expect(snapshots[0].sessionId).toBe(session.id)
  })

  it('后端整个炸掉也不阻塞、不抛错，本地快照照样落', () => {
    // 相位关闭是不可逆动作，桌上还有十二个人在等。
    // 网络不通绝不能把说书人卡在「结束今天」这个按钮上，也不能弹一个他此刻处理不了的错。
    window.localStorage.setItem(archiveRuntimeSettingsStorageKey, JSON.stringify(httpSettings))
    vi.stubGlobal('fetch', () => {
      throw new Error('后端根本没起来')
    })

    expect(() => savePhaseCloseSnapshot(createPrototypeGameSession())).not.toThrow()
    expect(listSnapshots()).toHaveLength(1)

    vi.unstubAllGlobals()
  })
})
