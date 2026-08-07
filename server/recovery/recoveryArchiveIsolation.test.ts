import { access, mkdtemp, readFile, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createPrototypeGameSession } from '../../src/features/game-session/data/createPrototypeSession'
import { createGameArchiveRecord } from '../../src/services/archive/archiveService'
import { createArchiveRuntime } from '../runtime'
import type { GameArchiveRecord } from '../../src/services/archive/types'

/**
 * 半局快照与归档必须互不串门。
 *
 * 这组用例守的是设计文档里那句「不进归档列表，避免半局出现在战绩里」。
 * 它有两个具体的失效路径，两个都不会报错、都只在几周后以「战绩里怎么全是没打完的局」出现：
 *   1. 路由注册在 `/api/` 兜底分支之后——请求悄悄落进归档路由；
 *   2. 复用 httpArchiveAdapter.save()／ArchiveRepository——半局写进同一个 archives.json。
 */
let tempDir = ''
let dataFile = ''
let recoveryDataFile = ''
let handleRequest: (request: Request) => Promise<Response>

function request(pathname: string, init: RequestInit = {}) {
  return new Request(`http://127.0.0.1${pathname}`, init)
}

async function jsonBody(response: Response) {
  return await response.json() as Record<string, unknown>
}

async function exists(filePath: string) {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

describe('recovery 与 archive 互不串门', () => {
  beforeEach(async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), 'botc-recovery-isolation-'))
    dataFile = path.join(tempDir, 'archives.json')
    recoveryDataFile = path.join(tempDir, 'recovery-snapshots.json')
    handleRequest = createArchiveRuntime({ dataFile, recoveryDataFile, staticDir: path.join(tempDir, 'no-static') })
  })

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true })
  })

  it('推一份半局，GET /api/archives 依然是空的', async () => {
    // 这是整条需求的验收句。一旦半局进了归档列表，它就同时进了复盘列表与战绩统计，
    // 而没有任何自动手段能把没打完的对局从里面摘干净。
    const session = createPrototypeGameSession()

    const pushed = await handleRequest(request(`/api/recovery/sessions/${session.id}/snapshot`, {
      method: 'POST',
      body: JSON.stringify({ savedAt: '2026-08-05T20:00:00.000Z', session }),
    }))
    expect(pushed.status).toBe(200)
    expect((await jsonBody(pushed)).accepted).toBe(true)

    const archives = (await jsonBody(await handleRequest(request('/api/archives')))).archives
    expect(archives).toEqual([])
    expect(await exists(dataFile)).toBe(false)
    expect(await exists(recoveryDataFile)).toBe(true)
  })

  it('归档过的对局不会因此在恢复命名空间里冒出来', async () => {
    // 反方向同样要成立：两套存储各自只装自己的东西，
    // 否则「有没有半局待恢复」这个判断会被已经打完的对局污染。
    const session = createPrototypeGameSession()
    const archive = createGameArchiveRecord({
      session,
      winner: 'good',
      archiveId: 'archive-isolation',
      archivedAt: '2026-08-05T21:00:00.000Z',
    })

    const saved = await handleRequest(request(`/api/games/${session.id}/archive`, {
      method: 'POST',
      body: JSON.stringify({ commandId: 'isolation', payload: { archive } }),
    }))
    expect(saved.status).toBe(200)

    const list = (await jsonBody(await handleRequest(request('/api/archives')))).archives as GameArchiveRecord[]
    expect(list).toHaveLength(1)

    const recovery = await handleRequest(request(`/api/recovery/sessions/${session.id}/snapshot`))
    expect(recovery.status).toBe(404)
    const snapshots = (await jsonBody(await handleRequest(request('/api/recovery/snapshots')))).snapshots
    expect(snapshots).toEqual([])
    expect(await exists(recoveryDataFile)).toBe(false)
  })

  it('恢复路由注册在 /api/ 兜底之前，未匹配路径也不会掉进归档路由', async () => {
    // 这条是那个陷阱本身的探针。注册顺序反了的话，上面两条仍可能因为归档路由恰好
    // 也回 404/200 而看不出来；只有 404 的措辞能证明请求究竟被谁接走了。
    const unmatched = await handleRequest(request('/api/recovery/definitely-not-a-route'))

    expect(unmatched.status).toBe(404)
    const error = (await jsonBody(unmatched)).error as { message: string }
    expect(error.message).toBe('未匹配的恢复接口')
    expect(error.message).not.toContain('归档')
  })

  it('半局的字节不出现在 archives.json 里', async () => {
    // 前面几条查的是接口，这条查的是磁盘：哪怕将来有人在归档侧加了「顺手也存一份」，
    // 文件里出现半局的 sessionId 就是越界。
    const session = createPrototypeGameSession()
    await handleRequest(request(`/api/recovery/sessions/${session.id}/snapshot`, {
      method: 'POST',
      body: JSON.stringify({ savedAt: '2026-08-05T20:00:00.000Z', session }),
    }))
    await handleRequest(request(`/api/games/other-session/archive`, {
      method: 'POST',
      body: JSON.stringify({
        commandId: 'isolation-bytes',
        payload: {
          archive: createGameArchiveRecord({
            session: { ...createPrototypeGameSession(), id: 'other-session' },
            winner: 'evil',
            archiveId: 'archive-other',
            archivedAt: '2026-08-05T21:00:00.000Z',
          }),
        },
      }),
    }))

    expect(await readFile(dataFile, 'utf8')).not.toContain(session.id)
    expect(await readFile(recoveryDataFile, 'utf8')).not.toContain('other-session')
  })
})
