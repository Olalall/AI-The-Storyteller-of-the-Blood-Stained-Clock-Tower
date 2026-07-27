import { beforeEach, describe, expect, it } from 'vitest'
import { createPrototypeGameSession } from '../../features/game-session/data/createPrototypeSession'
import { archiveGame, getArchive, listArchives, resetAfterArchive, resetArchiveAdapter, setArchiveAdapter } from './archiveService'
import { gameArchiveStorageKey } from './localArchiveAdapter'
import type { ArchiveAdapter, GameArchiveRecord } from './types'

describe('archive service command boundary', () => {
  beforeEach(() => {
    resetArchiveAdapter()
    window.localStorage.clear()
  })

  it('archives a session through an idempotent command id', () => {
    const session = createPrototypeGameSession()
    const command = {
      commandId: 'archive-command-1',
      session,
      winner: 'good' as const,
    }

    const first = archiveGame(command)
    const second = archiveGame(command)

    expect(first.archive.id).toBe(`archive-${session.id}-${command.commandId}`)
    expect(first.archive.schemaVersion).toBe(1)
    expect(second.archive.id).toBe(first.archive.id)
    expect(listArchives()).toHaveLength(1)
    expect(getArchive(first.archive.id)?.winner).toBe('good')
  })

  it('allows reset only when the archive exists and belongs to the current session', () => {
    const session = createPrototypeGameSession()
    const { archive } = archiveGame({
      commandId: 'archive-for-reset',
      session,
      winner: 'evil',
    })

    expect(resetAfterArchive({
      commandId: 'reset-without-confirm',
      sessionId: session.id,
      archiveId: archive.id,
      confirmReset: false,
    })).toEqual({ ok: false, reason: 'reset_not_confirmed' })
    expect(resetAfterArchive({
      commandId: 'reset-missing',
      sessionId: session.id,
      archiveId: 'missing-archive',
      confirmReset: true,
    })).toEqual({ ok: false, reason: 'archive_not_found' })
    expect(resetAfterArchive({
      commandId: 'reset-mismatch',
      sessionId: 'another-session',
      archiveId: archive.id,
      confirmReset: true,
    })).toEqual({ ok: false, reason: 'session_mismatch' })
    expect(resetAfterArchive({
      commandId: 'reset-ok',
      sessionId: session.id,
      archiveId: archive.id,
      confirmReset: true,
    })).toEqual({ ok: true, archiveId: archive.id })
    expect(listArchives()).toHaveLength(1)
  })

  it('normalizes old local archive records without a schema version', () => {
    const session = createPrototypeGameSession()
    const { archive } = archiveGame({
      commandId: 'legacy-archive',
      session,
      winner: 'good',
    })
    const legacyArchive = { ...archive }
    delete (legacyArchive as Partial<typeof archive>).schemaVersion
    window.localStorage.setItem(gameArchiveStorageKey, JSON.stringify([legacyArchive]))

    expect(listArchives()[0].schemaVersion).toBe(1)
    expect(getArchive(archive.id)?.schemaVersion).toBe(1)
  })

  it('can switch archive persistence through an adapter contract', () => {
    const session = createPrototypeGameSession()
    const records: GameArchiveRecord[] = []
    const memoryAdapter: ArchiveAdapter = {
      load: () => records,
      get: (archiveId) => records.find((archive) => archive.id === archiveId) ?? null,
      save: (record) => {
        records.unshift(record)
        return records
      },
    }

    setArchiveAdapter(memoryAdapter)
    const { archive } = archiveGame({
      commandId: 'memory-adapter-archive',
      session,
      winner: 'good',
    })

    expect(window.localStorage.getItem(gameArchiveStorageKey)).toBeNull()
    expect(getArchive(archive.id)).toBe(archive)
    expect(listArchives()).toEqual([archive])
  })
})
