import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createPrototypeGameSession } from '../../src/features/game-session/data/createPrototypeSession'
import {
  archiveGameAsync,
  getArchiveAsync,
  listArchivesAsync,
  resetAfterArchiveAsync,
  resetArchiveAdapter,
  resetAsyncArchiveAdapter,
  setAsyncArchiveAdapter,
} from '../../src/services/archive/archiveService'
import { createHttpArchiveAdapter } from '../../src/services/archive/httpArchiveAdapter'
import { gameArchiveStorageKey } from '../../src/services/archive/localArchiveAdapter'
import { createArchiveHandlers } from './handlers'
import { createArchiveHttpRoutes } from './httpArchiveRoutes'
import { JsonArchiveRepository } from './jsonArchiveRepository'

function createRouteFetcher(route: (request: Request) => Promise<Response>) {
  return (input: RequestInfo | URL, init?: RequestInit) => {
    const rawUrl = typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url
    const url = rawUrl.startsWith('http') ? rawUrl : `http://127.0.0.1${rawUrl}`
    return route(new Request(url, init))
  }
}

describe('archive service HTTP loop', () => {
  let tempDir: string

  beforeEach(async () => {
    resetArchiveAdapter()
    resetAsyncArchiveAdapter()
    window.localStorage.clear()
    tempDir = await mkdtemp(path.join(os.tmpdir(), 'botc-archive-'))
  })

  afterEach(async () => {
    resetArchiveAdapter()
    resetAsyncArchiveAdapter()
    window.localStorage.clear()
    await rm(tempDir, { recursive: true, force: true })
  })

  it('archives and resets through an injected HTTP adapter without using localStorage', async () => {
    const repository = new JsonArchiveRepository(path.join(tempDir, 'archives.json'))
    const route = createArchiveHttpRoutes(createArchiveHandlers(repository))
    setAsyncArchiveAdapter(createHttpArchiveAdapter({ fetcher: createRouteFetcher(route) }))

    const session = createPrototypeGameSession()
    const result = await archiveGameAsync({
      commandId: 'http-loop-archive',
      session,
      winner: 'evil',
    })

    expect(result.archive.id).toBe(`archive-${session.id}-http-loop-archive`)
    expect(result.archive.winner).toBe('evil')
    expect(await listArchivesAsync()).toEqual([result.archive])
    expect(await getArchiveAsync(result.archive.id)).toEqual(result.archive)
    expect(window.localStorage.getItem(gameArchiveStorageKey)).toBeNull()
    await expect(repository.list()).resolves.toEqual([result.archive])

    await expect(resetAfterArchiveAsync({
      commandId: 'reset-without-confirm',
      sessionId: session.id,
      archiveId: result.archive.id,
      confirmReset: false,
    })).resolves.toEqual({ ok: false, reason: 'reset_not_confirmed' })
    await expect(resetAfterArchiveAsync({
      commandId: 'reset-mismatch',
      sessionId: 'another-session',
      archiveId: result.archive.id,
      confirmReset: true,
    })).resolves.toEqual({ ok: false, reason: 'session_mismatch' })
    await expect(resetAfterArchiveAsync({
      commandId: 'reset-ok',
      sessionId: session.id,
      archiveId: result.archive.id,
      confirmReset: true,
    })).resolves.toEqual({ ok: true, archiveId: result.archive.id })
  })

  it('keeps the local archive path as the default async fallback', async () => {
    const session = createPrototypeGameSession()
    const result = await archiveGameAsync({
      commandId: 'local-fallback-archive',
      session,
      winner: 'good',
    })

    expect(result.archive.id).toBe(`archive-${session.id}-local-fallback-archive`)
    expect(await listArchivesAsync()).toEqual([result.archive])
    expect(await getArchiveAsync(result.archive.id)).toEqual(result.archive)
    expect(window.localStorage.getItem(gameArchiveStorageKey)).toContain(result.archive.id)
  })

  it('saves changed content under a new command, while retrying the same snapshot remains idempotent', async () => {
    const repository = new JsonArchiveRepository(path.join(tempDir, 'versions.json'))
    setAsyncArchiveAdapter(createHttpArchiveAdapter({ fetcher: createRouteFetcher(createArchiveHttpRoutes(createArchiveHandlers(repository))) }))
    const session = createPrototypeGameSession()
    const first = await archiveGameAsync({ commandId: 'first', session, winner: 'good' })
    const changed = { ...session, seats: { ...session.seats, 1: { ...session.seats[1], nickname: '新快照' } } }
    const next = await archiveGameAsync({ commandId: 'second', archiveId: first.archive.id, session: changed, winner: 'evil' })
    const retry = await archiveGameAsync({ commandId: 'second', archiveId: next.archive.id, session: changed, winner: 'evil' })
    expect(next.archive.id).not.toBe(first.archive.id)
    expect(next.archive.session).toEqual(changed)
    expect(retry.archive).toEqual(next.archive)
    expect(await repository.list()).toHaveLength(2)
    await expect(resetAfterArchiveAsync({ commandId: 'reset-old', sessionId: session.id, archiveId: first.archive.id, confirmReset: true, expectedSession: changed, expectedWinner: 'evil' })).resolves.toMatchObject({ ok: false, reason: 'archive_outdated' })
  })
})
