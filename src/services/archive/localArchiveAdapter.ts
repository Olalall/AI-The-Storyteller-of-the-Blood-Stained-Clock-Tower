import { migrateArchiveRecords } from './archiveMigration'
import type { ArchiveAdapter, GameArchiveRecord } from './types'

export const gameArchiveStorageKey = 'botc-game-archives-v1'

function sortByArchivedAt(records: GameArchiveRecord[]) {
  return records.sort((left, right) => right.archivedAt.localeCompare(left.archivedAt))
}

export const localArchiveAdapter: ArchiveAdapter = {
  load(): GameArchiveRecord[] {
    try {
      const stored = window.localStorage.getItem(gameArchiveStorageKey)
      if (!stored) return []
      // 校验与 1→2 迁移在同一处：读进来的记录一律已经带齐模式标注，
      // 上层不必再各自写一句 `?? 'record'`——那种回落写第二遍时就会有人写成 'grimoire'。
      return sortByArchivedAt(migrateArchiveRecords(JSON.parse(stored)))
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
