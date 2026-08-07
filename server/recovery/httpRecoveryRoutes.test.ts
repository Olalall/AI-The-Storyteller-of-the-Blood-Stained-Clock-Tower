import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createRecoveryHandlers } from './handlers'
import { createRecoveryHttpRoutes } from './httpRecoveryRoutes'
import { JsonRecoveryRepository } from './jsonRecoveryRepository'
import type { RecoverySnapshotRecord, RecoverySnapshotSummary } from './types'

let tempDir = ''
let dataFile = ''
let handleRequest: (request: Request) => Promise<Response>

function halfGame(entryCount: number, id = 'session-half') {
  return {
    schemaVersion: 1,
    id,
    playerCount: 12,
    timeline: Array.from({ length: entryCount }, (_value, index) => ({ id: `entry-${index}` })),
  }
}

function request(pathname: string, init: RequestInit = {}) {
  return new Request(`http://127.0.0.1${pathname}`, init)
}

function post(sessionId: string, body: unknown) {
  return handleRequest(request(`/api/recovery/sessions/${sessionId}/snapshot`, {
    method: 'POST',
    body: JSON.stringify(body),
  }))
}

async function jsonBody(response: Response) {
  return await response.json() as Record<string, unknown>
}

describe('recovery HTTP 路由', () => {
  beforeEach(async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), 'botc-recovery-routes-'))
    dataFile = path.join(tempDir, 'recovery-snapshots.json')
    handleRequest = createRecoveryHttpRoutes(createRecoveryHandlers(new JsonRecoveryRepository(dataFile)))
  })

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true })
  })

  it('存进去的半局能原样取回来', async () => {
    // 这份快照存在的全部理由就是「本地那份没了还能读回来」。
    // 服务端不许对 session 做任何加工——任何加工都意味着恢复出来的不是当时那一局。
    const session = halfGame(7)
    const saved = await post(session.id, { savedAt: '2026-08-05T20:00:00.000Z', session })
    expect(saved.status).toBe(200)

    const loaded = await handleRequest(request(`/api/recovery/sessions/${session.id}/snapshot`))
    expect(loaded.status).toBe(200)
    const snapshot = (await jsonBody(loaded)).snapshot as RecoverySnapshotRecord
    expect(snapshot.session).toEqual(session)
    expect(snapshot.entryCount).toBe(7)
    expect(snapshot.reason).toBe('phase-close')
    expect(snapshot.savedAt).toBe('2026-08-05T20:00:00.000Z')
  })

  it('没有这一局时回 404，而不是回一份空壳', async () => {
    // 回空壳会让客户端把「后端没有」误当成「后端说这局是空的」，
    // 于是拿一份空 session 去覆盖本地那份还在的存档。
    const missing = await handleRequest(request('/api/recovery/sessions/never-pushed/snapshot'))
    expect(missing.status).toBe(404)
    expect((await jsonBody(missing)).accepted).toBe(false)
  })

  it('缺 session 或缺 savedAt 一律 400，不落盘', async () => {
    expect((await post('session-half', { savedAt: '2026-08-05T20:00:00.000Z' })).status).toBe(400)
    expect((await post('session-half', { session: halfGame(3) })).status).toBe(400)
    const list = await jsonBody(await handleRequest(request('/api/recovery/snapshots')))
    expect(list.snapshots).toEqual([])
  })

  it('同一局重推只留最新那一份，不无限堆积', async () => {
    // 半局快照要的是「这一局最新的样子」。历史版本由客户端的本地快照轮转负责，
    // 后端每局堆一串的结果是这个纯救急文件长到每次推送都要整份读写几十 MB。
    await post('session-half', { savedAt: '2026-08-05T20:00:00.000Z', session: halfGame(3) })
    await post('session-half', { savedAt: '2026-08-05T21:00:00.000Z', session: halfGame(9) })

    const snapshots = (await jsonBody(await handleRequest(request('/api/recovery/snapshots'))))
      .snapshots as RecoverySnapshotSummary[]
    expect(snapshots).toHaveLength(1)
    expect(snapshots[0].entryCount).toBe(9)
  })

  it('记录更少的那份顶不掉更完整的那份', async () => {
    // 客户端已经拦了只读标签页，但拦不住时间差：落后几分钟的标签页推来的半局
    // 会把好的那份救生圈换成旧的，而说书人真去读它的时候已经没有第二份可比。
    await post('session-half', { savedAt: '2026-08-05T21:00:00.000Z', session: halfGame(9) })
    const stale = await post('session-half', { savedAt: '2026-08-05T20:00:00.000Z', session: halfGame(3) })

    expect(stale.status).toBe(200)
    const data = (await jsonBody(stale)).data as { snapshot: RecoverySnapshotRecord; superseded: boolean }
    expect(data.superseded).toBe(true)
    expect(data.snapshot.entryCount).toBe(9)

    const loaded = await handleRequest(request('/api/recovery/sessions/session-half/snapshot'))
    expect(((await jsonBody(loaded)).snapshot as RecoverySnapshotRecord).entryCount).toBe(9)
  })

  it('列表只给标量，不把整份 session 拖出来', async () => {
    // 一份就有几十 KB。列表拉全份在 20 局上限下等于每次列表都传几 MB，
    // 而列表唯一的用途是让人挑一局。
    await post('session-half', { savedAt: '2026-08-05T20:00:00.000Z', session: halfGame(4) })

    const snapshots = (await jsonBody(await handleRequest(request('/api/recovery/snapshots'))))
      .snapshots as RecoverySnapshotSummary[]
    expect(snapshots).toHaveLength(1)
    expect(snapshots[0]).not.toHaveProperty('session')
    expect(snapshots[0].byteLength).toBeGreaterThan(0)
  })

  it('数据文件坏掉时当作没有快照，而不是让推送 500', async () => {
    // 救生圈文件自己坏了还把推送打成 500，等于第二道保险失效的同时又制造一次报错。
    await post('session-half', { savedAt: '2026-08-05T20:00:00.000Z', session: halfGame(4) })
    await writeFile(dataFile, '{ 这不是 JSON', 'utf8')

    const retry = await post('session-half', { savedAt: '2026-08-05T22:00:00.000Z', session: halfGame(5) })
    expect(retry.status).toBe(200)
    expect(JSON.parse(await readFile(dataFile, 'utf8'))).toHaveLength(1)
  })

  it('未匹配的恢复路径回的是恢复路由自己的 404', async () => {
    // 这条措辞是路由注册顺序的探针：runtime 里 `/api/` 兜底分支会把一切交给归档路由，
    // 恢复路由若注册晚了，这里拿到的会是「未匹配的归档接口」。
    const unmatched = await handleRequest(request('/api/recovery/nonsense'))
    expect(unmatched.status).toBe(404)
    const error = (await jsonBody(unmatched)).error as { message: string }
    expect(error.message).toContain('恢复')
  })
})
