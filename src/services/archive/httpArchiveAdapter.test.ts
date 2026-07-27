import { describe, expect, it, vi } from 'vitest'
import { createPrototypeGameSession } from '../../features/game-session/data/createPrototypeSession'
import { createGameArchiveRecord } from './archiveService'
import { ArchiveHttpError, createHttpArchiveAdapter } from './httpArchiveAdapter'

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function archiveFixture(commandId = 'http-save') {
  const session = createPrototypeGameSession()
  const archive = createGameArchiveRecord({
    session,
    winner: 'good',
    archiveId: `archive-${session.id}-${commandId}`,
    archivedAt: '2026-07-17T12:00:00.000Z',
  })
  return { archive, session, commandId }
}

describe('http archive adapter', () => {
  it('loads archives from the HTTP list route', async () => {
    const { archive } = archiveFixture('load')
    const fetcher = vi.fn(async () => jsonResponse({ archives: [archive] }))
    const adapter = createHttpArchiveAdapter({ baseUrl: '/backend', fetcher })

    await expect(adapter.load()).resolves.toEqual([archive])
    expect(fetcher).toHaveBeenCalledWith('/backend/api/archives', undefined)
  })

  it('saves an archive through the HTTP archive command route', async () => {
    const { archive, session, commandId } = archiveFixture('save')
    const fetcher = vi.fn(async () => jsonResponse({
      accepted: true,
      data: { archive, archives: [archive], resetUnlocked: true },
      warnings: [],
    }))
    const adapter = createHttpArchiveAdapter({ fetcher })

    await expect(adapter.save(archive)).resolves.toEqual([archive])
    expect(fetcher).toHaveBeenCalledTimes(1)
    const [[url, init]] = fetcher.mock.calls as unknown as [RequestInfo | URL, RequestInit | undefined][]
    expect(url).toBe(`/api/games/${session.id}/archive`)
    expect(init?.method).toBe('POST')
    expect(JSON.parse(init?.body as string)).toEqual({
      commandId,
      payload: { archive },
    })
  })

  it('does not pretend a failed save succeeded', async () => {
    const { archive } = archiveFixture('failed')
    const fetcher = vi.fn(async () => jsonResponse({
      accepted: false,
      error: { code: 'BAD_REQUEST', message: 'bad request' },
    }, 400))
    const adapter = createHttpArchiveAdapter({ fetcher })

    await expect(adapter.save(archive)).rejects.toMatchObject({
      name: 'ArchiveHttpError',
      code: 'BAD_REQUEST',
      status: 400,
    })
  })

  it('gets one archive and maps ARCHIVE_NOT_FOUND to null', async () => {
    const { archive } = archiveFixture('get')
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ archive }))
      .mockResolvedValueOnce(jsonResponse({
        accepted: false,
        error: { code: 'ARCHIVE_NOT_FOUND', message: 'missing' },
      }, 404))
    const adapter = createHttpArchiveAdapter({ fetcher })

    await expect(adapter.get(archive.id)).resolves.toEqual(archive)
    await expect(adapter.get('missing')).resolves.toBeNull()
  })

  it('throws when the archive response shape is invalid', async () => {
    const { archive } = archiveFixture('invalid')
    const fetcher = vi.fn(async () => jsonResponse({ accepted: true, data: {} }))
    const adapter = createHttpArchiveAdapter({ fetcher })

    await expect(adapter.save(archive)).rejects.toBeInstanceOf(ArchiveHttpError)
  })
})
