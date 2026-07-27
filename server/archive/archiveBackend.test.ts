import { mkdtemp, rm, readFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createPrototypeGameSession } from '../../src/features/game-session/data/createPrototypeSession'
import { createGameArchiveRecord } from '../../src/services/archive/archiveService'
import type { GameArchiveRecord } from '../../src/services/archive/types'
import { createArchiveHandlers } from './handlers'
import { JsonArchiveRepository } from './jsonArchiveRepository'

let tempDir = ''
let repository: JsonArchiveRepository

function archiveFixture(options: { commandId: string, winner?: 'good' | 'evil' | 'undecided', archivedAt?: string }) {
  const session = createPrototypeGameSession()
  return {
    commandId: options.commandId,
    session,
    archive: createGameArchiveRecord({
      session,
      winner: options.winner ?? 'good',
      archiveId: `local-${options.commandId}`,
      archivedAt: options.archivedAt,
    }),
  }
}

describe('archive backend P0 handlers', () => {
  beforeEach(async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), 'botc-archives-'))
    repository = new JsonArchiveRepository(path.join(tempDir, 'archives.json'))
  })

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true })
  })

  it('returns an empty archive list before any archive is saved', async () => {
    expect(await repository.list()).toEqual([])
  })

  it('saves and reads a full archive record through an idempotent command id', async () => {
    const handlers = createArchiveHandlers(repository)
    const fixture = archiveFixture({ commandId: 'save-once', winner: 'good' })

    const first = await handlers.archiveGame({
      commandId: fixture.commandId,
      sessionId: fixture.session.id,
      archive: fixture.archive,
    })
    const second = await handlers.archiveGame({
      commandId: fixture.commandId,
      sessionId: fixture.session.id,
      archive: { ...fixture.archive, winner: 'evil', winnerLabel: '邪恶获胜' },
    })

    expect(first.accepted).toBe(true)
    expect(second.accepted).toBe(true)
    if (!first.accepted || !second.accepted) throw new Error('archive command rejected')
    expect(first.data.archive.id).toBe(`archive-${fixture.session.id}-${fixture.commandId}`)
    expect(second.data.archive).toEqual(first.data.archive)
    expect(await repository.list()).toHaveLength(1)
    expect((await handlers.getArchive(first.data.archive.id))?.session.id).toBe(fixture.session.id)
  })

  it('appends a new archive version when the same session uses a different command id', async () => {
    const handlers = createArchiveHandlers(repository)
    const first = archiveFixture({ commandId: 'version-1', archivedAt: '2026-07-17T10:00:00.000Z' })
    const second = { ...first, commandId: 'version-2', archive: { ...first.archive, archivedAt: '2026-07-17T11:00:00.000Z' } }

    await handlers.archiveGame({ commandId: first.commandId, sessionId: first.session.id, archive: first.archive })
    await handlers.archiveGame({ commandId: second.commandId, sessionId: second.session.id, archive: second.archive })

    const archives = await repository.list()
    expect(archives).toHaveLength(2)
    expect(archives.map((archive) => archive.id)).toEqual([
      `archive-${first.session.id}-version-2`,
      `archive-${first.session.id}-version-1`,
    ])
  })

  it('filters archives by archivedAt date range', async () => {
    const handlers = createArchiveHandlers(repository)
    const early = archiveFixture({ commandId: 'early', archivedAt: '2026-07-16T23:00:00.000Z' })
    const current = archiveFixture({ commandId: 'current', archivedAt: '2026-07-17T12:00:00.000Z' })

    await handlers.archiveGame({ commandId: early.commandId, sessionId: early.session.id, archive: early.archive })
    await handlers.archiveGame({ commandId: current.commandId, sessionId: current.session.id, archive: current.archive })

    expect((await handlers.listArchives({
      dateFrom: '2026-07-17T00:00:00.000Z',
      dateTo: '2026-07-17T23:59:59.999Z',
    })).map((archive) => archive.id)).toEqual([`archive-${current.session.id}-current`])
  })

  it('guards reset after archive without creating a new session', async () => {
    const handlers = createArchiveHandlers(repository)
    const fixture = archiveFixture({ commandId: 'reset-archive' })
    const saved = await handlers.archiveGame({
      commandId: fixture.commandId,
      sessionId: fixture.session.id,
      archive: fixture.archive,
    })
    if (!saved.accepted) throw new Error('archive command rejected')

    await expect(handlers.resetAfterArchive({
      commandId: 'reset-no-confirm',
      sessionId: fixture.session.id,
      archiveId: saved.data.archive.id,
      confirmReset: false,
    })).resolves.toEqual({ accepted: false, error: 'RESET_NOT_CONFIRMED', warnings: [] })
    await expect(handlers.resetAfterArchive({
      commandId: 'reset-missing',
      sessionId: fixture.session.id,
      archiveId: 'missing',
      confirmReset: true,
    })).resolves.toEqual({ accepted: false, error: 'ARCHIVE_NOT_FOUND', warnings: [] })
    await expect(handlers.resetAfterArchive({
      commandId: 'reset-mismatch',
      sessionId: 'another-session',
      archiveId: saved.data.archive.id,
      confirmReset: true,
    })).resolves.toEqual({ accepted: false, error: 'SESSION_MISMATCH', warnings: [] })
    await expect(handlers.resetAfterArchive({
      commandId: 'reset-ok',
      sessionId: fixture.session.id,
      archiveId: saved.data.archive.id,
      confirmReset: true,
    })).resolves.toEqual({
      accepted: true,
      data: { archiveId: saved.data.archive.id, resetAllowed: true },
      warnings: [],
    })
  })

  it('normalizes legacy archive records without schemaVersion when reading JSON', async () => {
    const fixture = archiveFixture({ commandId: 'legacy' })
    const legacyRecord = { ...fixture.archive }
    delete (legacyRecord as Partial<GameArchiveRecord>).schemaVersion
    await repository.save(legacyRecord as GameArchiveRecord)

    const raw = await readFile(path.join(tempDir, 'archives.json'), 'utf8')
    expect(raw).toContain('legacy')
    expect((await repository.get(legacyRecord.id))?.schemaVersion).toBe(1)
  })
})
