import { beforeEach, describe, expect, it } from 'vitest'
import { createPrototypeGameSession } from '../../features/game-session/data/createPrototypeSession'
import { archiveGame, createGameArchiveRecord, getArchive, listArchives, resetAfterArchive, resetArchiveAdapter, setArchiveAdapter } from './archiveService'
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
    expect(() => archiveGame({ ...command, winner: 'evil' })).toThrow('不能覆盖不同的对局内容')
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

  it('requires the saved snapshot and winner to match again immediately before reset', () => {
    const session = createPrototypeGameSession()
    const { archive } = archiveGame({ commandId: 'snapshot', session, winner: 'good' })
    const command = { commandId: 'reset', sessionId: session.id, archiveId: archive.id, confirmReset: true, expectedSession: session, expectedWinner: 'good' as const }
    expect(resetAfterArchive(command).ok).toBe(true)
    expect(resetAfterArchive({ ...command, expectedSession: { ...session, seats: { ...session.seats, 1: { ...session.seats[1], nickname: '后来修改' } } } })).toMatchObject({ ok: false, reason: 'archive_outdated' })
    expect(resetAfterArchive({ ...command, expectedWinner: 'evil' })).toMatchObject({ ok: false, reason: 'archive_outdated' })
  })

  it('uses the real script name for new archives and repairs only old display metadata on read', () => {
    const session = { ...createPrototypeGameSession(), scriptId: 'trouble-brewing' }
    const archive = createGameArchiveRecord({ session, winner: 'undecided' })
    expect(archive.scriptName).toBe('暗流涌动 / Trouble Brewing')
    localStorage.setItem(gameArchiveStorageKey, JSON.stringify([{ ...archive, scriptName: 'Catfishing / 瓦釜雷鸣' }]))
    expect(getArchive(archive.id)?.scriptName).toBe('暗流涌动 / Trouble Brewing')
    expect(getArchive(archive.id)?.session).toEqual(session)
  })

  it('keeps withdrawn votes auditable without counting them and includes adjusted votes and exceptional execution reasons', () => {
    const session = createPrototypeGameSession()
    const base = { segmentId: 'night-3', createdAt: '2026-10-16T00:00:00Z', confirmedBy: 'storyteller' as const }
    session.timeline = [
      { ...base, id: 'adjusted', kind: 'vote_round', roundId: 'adjusted', nominatorSeatId: 1, nomineeSeatId: 2, threshold: 4, raisedSeatIds: [1, 2], ghostVoteSeatIds: [], voteAdjustment: { count: 2, reason: '手工核对额外票' } },
      { ...base, id: 'withdrawn', kind: 'vote_round', roundId: 'withdrawn', nominatorSeatId: 3, nomineeSeatId: 4, threshold: 4, raisedSeatIds: [3], ghostVoteSeatIds: [], voided: true },
      { ...base, id: 'execution', kind: 'execution', executedSeatId: 2, causedDeath: false, exceptionReason: '说书人确认特殊能力结算' },
    ]
    const archive = createGameArchiveRecord({ session, winner: 'undecided' })
    expect(archive.summary).toMatchObject({ records: 2, votes: 1, executions: 1 })
    expect(archive.timeline).toHaveLength(3)
    expect(archive.timeline.find((entry) => entry.id === 'adjusted')?.summary).toContain('4票 · 修正+2：手工核对额外票')
    expect(archive.timeline.find((entry) => entry.id === 'withdrawn')?.summary).toContain('已撤销')
    expect(archive.timeline.find((entry) => entry.id === 'execution')?.summary).toContain('说书人确认特殊能力结算')
  })
})
