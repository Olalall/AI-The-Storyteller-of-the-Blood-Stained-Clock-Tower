import { promises as fs } from 'node:fs'
import path from 'node:path'
import type { GameArchiveRecord } from '../../src/services/archive/types'
import type { ArchiveListQuery, ArchiveRepository } from './types'

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

function matchesQuery(record: GameArchiveRecord, query: ArchiveListQuery) {
  if (query.winner && record.winner !== query.winner) return false
  if (query.playerCount !== undefined && record.playerCount !== query.playerCount) return false
  if (query.dateFrom && record.archivedAt < query.dateFrom) return false
  if (query.dateTo && record.archivedAt > query.dateTo) return false
  return true
}

export class JsonArchiveRepository implements ArchiveRepository {
  private readonly filePath: string

  constructor(filePath: string) {
    this.filePath = filePath
  }

  async list(query: ArchiveListQuery = {}): Promise<GameArchiveRecord[]> {
    const records = await this.readAll()
    return records.filter((record) => matchesQuery(record, query))
  }

  async get(archiveId: string): Promise<GameArchiveRecord | null> {
    return (await this.readAll()).find((archive) => archive.id === archiveId) ?? null
  }

  async save(record: GameArchiveRecord): Promise<GameArchiveRecord[]> {
    const archives = await this.readAll()
    const next = sortByArchivedAt([record, ...archives.filter((archive) => archive.id !== record.id)])
    await this.writeAll(next)
    return next
  }

  private async readAll() {
    try {
      const text = await fs.readFile(this.filePath, 'utf8')
      const parsed: unknown = JSON.parse(text)
      if (!Array.isArray(parsed)) return []
      return sortByArchivedAt(parsed.map(normalizeArchiveRecord).filter((record): record is GameArchiveRecord => Boolean(record)))
    } catch (error) {
      if (typeof error === 'object' && error && 'code' in error && error.code === 'ENOENT') return []
      throw error
    }
  }

  private async writeAll(records: GameArchiveRecord[]) {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true })
    const tempPath = `${this.filePath}.${process.pid}.${Date.now()}.tmp`
    await fs.writeFile(tempPath, `${JSON.stringify(records, null, 2)}\n`, 'utf8')
    await fs.rename(tempPath, this.filePath)
  }
}
