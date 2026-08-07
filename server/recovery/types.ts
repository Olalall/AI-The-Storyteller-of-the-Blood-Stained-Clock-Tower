/**
 * 后端 recovery 命名空间：半局的救生圈，不是战绩。
 *
 * 它与归档必须一直是两套东西。归档回答「这局打完了，结果如何」，会进 GET /api/archives、
 * 进复盘列表、进统计；recovery 回答「这局打到一半，本地那份可能会没」，只在说书人
 * 真的丢了本地存档时才被读一次。半局一旦混进归档列表，战绩里就会多出一堆没打完的对局，
 * 而且没有任何自动手段能把它们摘干净。
 *
 * 所以这里既不复用 ArchiveRepository，也不共用 archives.json——共用任何一个都足以让
 * 「不进归档列表」这条约束在一次无心的复用里失效。
 */

/**
 * 服务端不解释对局语义：整份 session 原样存回，只额外记几个索引与判优用的标量。
 * 后端一旦开始理解 timeline 的内容，它就成了第二个规则实现。
 */
export interface RecoverySnapshotRecord {
  schemaVersion: 1
  sessionId: string
  /** 客户端相位关闭的时刻。 */
  savedAt: string
  /** 服务端落盘的时刻。它与 savedAt 差多少，本身就是排查「推送是不是卡住了」的线索。 */
  receivedAt: string
  reason: 'phase-close'
  /** timeline 条数。唯一的「哪一份更完整」判据，见 handlers 里的不覆盖规则。 */
  entryCount: number
  byteLength: number
  session: unknown
}

/** 列表只给标量，不带整份 session：一份就有几十 KB，列表拉全份没有意义。 */
export type RecoverySnapshotSummary = Omit<RecoverySnapshotRecord, 'session'>

export interface RecoveryRepository {
  get(sessionId: string): Promise<RecoverySnapshotRecord | null>
  list(): Promise<RecoverySnapshotSummary[]>
  put(record: RecoverySnapshotRecord): Promise<RecoverySnapshotRecord>
}

export interface PushRecoverySnapshotCommand {
  sessionId: string
  savedAt: string
  session: unknown
}

export interface PushRecoverySnapshotData {
  snapshot: RecoverySnapshotRecord
  /** true 表示这次推送比服务端已有的那份更少，服务端保留了原来那份。 */
  superseded: boolean
}

export type RecoveryErrorCode = 'BAD_REQUEST' | 'RECOVERY_NOT_FOUND'

/** 与归档同形，好让路由层两边一个写法；但它是另一套 code，两边的错误不共用命名空间。 */
export type RecoveryCommandResult<T> =
  | { accepted: true; data: T; warnings: string[] }
  | { accepted: false; error: RecoveryErrorCode; warnings: string[] }
