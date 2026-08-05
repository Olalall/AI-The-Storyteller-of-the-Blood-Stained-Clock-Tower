import { promises as fs } from 'node:fs'
import path from 'node:path'
import type { RecoveryRepository, RecoverySnapshotRecord, RecoverySnapshotSummary } from './types'

/**
 * 只留最近这么多局。半局快照的价值随时间塌得极快——三个月前那局没打完的对局，
 * 没有任何人会去恢复它。不设上限的话，这个纯救急文件会长到几十 MB，
 * 而每次推送都要把它整份读出来再整份写回去。
 */
export const RECOVERY_SNAPSHOT_LIMIT = 20

function isRecoverySnapshotRecord(value: unknown): value is RecoverySnapshotRecord {
  if (!value || typeof value !== 'object') return false
  const record = value as Partial<RecoverySnapshotRecord>
  return typeof record.sessionId === 'string' &&
    typeof record.savedAt === 'string' &&
    typeof record.receivedAt === 'string' &&
    typeof record.entryCount === 'number' &&
    record.session !== undefined
}

/** 最新的在前。列表与淘汰都按服务端落盘时刻，不按客户端自报的 savedAt——后者可以是任意值。 */
function sortByReceivedAt(records: RecoverySnapshotRecord[]) {
  return [...records].sort((left, right) => right.receivedAt.localeCompare(left.receivedAt))
}

function toSummary(record: RecoverySnapshotRecord): RecoverySnapshotSummary {
  const { session: _session, ...summary } = record
  return summary
}

/**
 * 独立的数据文件，不是 archives.json。
 *
 * 复用归档仓库只需要一行 `repository.save(...)`，而那一行的代价是半局立刻出现在
 * GET /api/archives 与复盘列表里，并且没有任何自动手段能把它们摘干净。
 * 两套存储是这条约束唯一守得住的形态。
 */
export class JsonRecoveryRepository implements RecoveryRepository {
  private readonly filePath: string

  constructor(filePath: string) {
    this.filePath = filePath
  }

  async get(sessionId: string): Promise<RecoverySnapshotRecord | null> {
    return (await this.readAll()).find((record) => record.sessionId === sessionId) ?? null
  }

  async list(): Promise<RecoverySnapshotSummary[]> {
    return (await this.readAll()).map(toSummary)
  }

  async put(record: RecoverySnapshotRecord): Promise<RecoverySnapshotRecord> {
    const records = await this.readAll()
    // 一局只留一份：救生圈要的是「这一局最新的样子」，历史版本由客户端的本地快照轮转负责。
    const next = sortByReceivedAt([record, ...records.filter((existing) => existing.sessionId !== record.sessionId)])
    await this.writeAll(next.slice(0, RECOVERY_SNAPSHOT_LIMIT))
    return record
  }

  private async readAll(): Promise<RecoverySnapshotRecord[]> {
    try {
      const text = await fs.readFile(this.filePath, 'utf8')
      const parsed: unknown = JSON.parse(text)
      if (!Array.isArray(parsed)) return []
      return sortByReceivedAt(parsed.filter(isRecoverySnapshotRecord))
    } catch (error) {
      if (typeof error === 'object' && error && 'code' in error && error.code === 'ENOENT') return []
      // 救生圈文件自己坏了，不该连带让推送变成 500：当作还没有任何快照。
      if (error instanceof SyntaxError) return []
      throw error
    }
  }

  private async writeAll(records: RecoverySnapshotRecord[]) {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true })
    // 先写临时文件再 rename：推送发生在相位关闭那一刻，进程此时被关掉的概率不低，
    // 半截文件会让下一次读取把整个救生圈判成坏文件。
    const tempPath = `${this.filePath}.${process.pid}.${Date.now()}.tmp`
    await fs.writeFile(tempPath, `${JSON.stringify(records, null, 2)}\n`, 'utf8')
    await fs.rename(tempPath, this.filePath)
  }
}
