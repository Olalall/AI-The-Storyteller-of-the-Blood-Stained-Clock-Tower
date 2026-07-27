import type { ArchiveAdapter, GameArchiveRecord } from './types'

export const gameArchiveStorageKey = 'botc-game-archives-v1'

function normalizeArchiveRecord(value: unknown): GameArchiveRecord | null {
  if (!value || typeof value !== 'object') return null
  const record = value as Partial<GameArchiveRecord>
  const valid = (record.schemaVersion === 1 || record.schemaVersion === undefined) &&
    typeof record.id === 'string' &&
    typeof record.sessionId === 'string' &&
    typeof record.archivedAt === 'string' &&
    typeof record.winner === 'string' &&
    typeof record.winnerLabel === 'string' &&
    typeof record.scriptName === 'string' &&
    typeof record.playerCount === 'number' &&
    Boolean(record.summary) &&
    Array.isArray(record.timeline) &&
    Boolean(record.session)
  if (!valid) return null
  return { ...record, schemaVersion: 1 } as GameArchiveRecord
}

function sortByArchivedAt(records: GameArchiveRecord[]) {
  return records.sort((left, right) => right.archivedAt.localeCompare(left.archivedAt))
}

export const localArchiveAdapter: ArchiveAdapter = {
  load(): GameArchiveRecord[] {
    try {
      const stored = window.localStorage.getItem(gameArchiveStorageKey)
      if (!stored) return []
      const parsed: unknown = JSON.parse(stored)
      if (!Array.isArray(parsed)) return []
      return sortByArchivedAt(parsed.map(normalizeArchiveRecord).filter((record): record is GameArchiveRecord => Boolean(record)))
    } catch {
      return []
    }
  },

  get(archiveId: string) {
    return localArchiveAdapter.load().find((archive) => archive.id === archiveId) ?? null
  },

  save(record: GameArchiveRecord) {
    const archives = localArchiveAdapter.load()
    const next = sortByArchivedAt([record, ...archives.filter((archive) => archive.id !== record.id)])
    window.localStorage.setItem(gameArchiveStorageKey, JSON.stringify(next))
    return next
  },
}
