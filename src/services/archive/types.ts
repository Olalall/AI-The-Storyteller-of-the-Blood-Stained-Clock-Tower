import type { GameSessionState, HostingMode, HostingModeChange, TimelineEntry } from '../../features/game-session/types'

export type GameWinner = 'good' | 'evil' | 'undecided'

export const winnerLabels: Record<GameWinner, string> = {
  good: '善良获胜',
  evil: '邪恶获胜',
  undecided: '暂不声明',
}

export interface GameArchiveTimelineItem {
  id: string
  kind: TimelineEntry['kind']
  phaseLabel: string
  summary: string
  createdAt: string
}

export interface GameArchiveSummary {
  alive: number
  dead: number
  phases: number
  records: number
  nightActions: number
  dayActions: number
  votes: number
  executions: number
  corrections: number
}

/**
 * 归档记录的模式与完整度标注。
 *
 * 只有四个数字，刻意**不**把实时完整度投影的 pendingStateHints / pendingStateHintList 一起冻进来：
 * 那两个字段是「还欠多少笔没补」，是给一局**还能改**的对局用的待办；而归档一律只读，
 * 把一张永远点不动的待办清单钉在战绩上，除了让人以为自己当年漏了活之外没有任何用处。
 * 归档要回答的是另一个问题——「当年这局到底录进来多少」，那正是这四个数字。
 */
export interface ArchiveGrimoireCompleteness {
  seatsWithRole: number
  totalSeats: number
  stateChangeCount: number
  markerCount: number
}

/**
 * 1 = 没有模式标注的旧归档；2 = 带 hostingMode / hostingModeHistory / grimoireCompleteness。
 *
 * 类型上保留 1，是因为后端 `server/archive` 至今仍把落盘记录标成 1（见 handlers.ts）。
 * 收窄成 `2` 会让后端整条链编译不过，而那不是本批能改的目录；读进来的 1 一律由
 * `migrateArchiveRecord` 补齐后再交给上层，所以运行时上层拿到的永远是 2。
 */
export type GameArchiveSchemaVersion = 1 | 2

export const CURRENT_ARCHIVE_SCHEMA_VERSION = 2

export interface GameArchiveRecord {
  schemaVersion: GameArchiveSchemaVersion
  id: string
  sessionId: string
  archivedAt: string
  winner: GameWinner
  winnerLabel: string
  scriptName: string
  playerCount: number
  summary: GameArchiveSummary
  timeline: GameArchiveTimelineItem[]
  session: GameSessionState
  /**
   * 这局当时是怎么主持的。跨模式回看的诚实条全靠它——
   * 没有它，一局纯记录模式的对局会被渲染成一张看起来很完整、实则大半没人录过的魔典。
   */
  hostingMode: HostingMode
  /** 中途换过模式时的完整轨迹，用来说「第 3 夜起才开的魔典」。 */
  hostingModeHistory: readonly HostingModeChange[]
  grimoireCompleteness: ArchiveGrimoireCompleteness
}

export interface GameArchiveSessionProjection {
  alive: number
  dead: number
  entries: TimelineEntry[]
  nightCount: number
  dayCount: number
  voteCount: number
  executionCount: number
  correctionCount: number
  reviewSignals: string[]
}

export interface ArchiveGameCommand {
  commandId: string
  session: GameSessionState
  winner: GameWinner
  archiveId?: string
}

export interface ArchiveGameResult {
  archive: GameArchiveRecord
  archives: GameArchiveRecord[]
}

export interface ArchiveAdapter {
  load(): GameArchiveRecord[]
  save(record: GameArchiveRecord): GameArchiveRecord[]
  get(archiveId: string): GameArchiveRecord | null
}

export interface AsyncArchiveAdapter {
  load(): Promise<GameArchiveRecord[]>
  save(record: GameArchiveRecord): Promise<GameArchiveRecord[]>
  get(archiveId: string): Promise<GameArchiveRecord | null>
}

export interface ResetAfterArchiveCommand {
  commandId: string
  sessionId: string
  archiveId: string
  confirmReset: boolean
}

export type ResetAfterArchiveResult =
  | { ok: true; archiveId: string }
  | { ok: false; reason: 'archive_not_found' | 'session_mismatch' | 'reset_not_confirmed' }
