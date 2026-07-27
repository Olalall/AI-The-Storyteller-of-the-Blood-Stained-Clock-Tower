import type { GameSessionState, TimelineEntry } from '../../features/game-session/types'

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

export interface GameArchiveRecord {
  schemaVersion: 1
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
