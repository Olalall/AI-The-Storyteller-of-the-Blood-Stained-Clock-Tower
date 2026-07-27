import type { GameArchiveRecord, GameWinner } from '../../src/services/archive/types'

export interface ArchiveListQuery {
  dateFrom?: string
  dateTo?: string
  winner?: GameWinner
  playerCount?: number
}

export interface ArchiveRepository {
  list(query?: ArchiveListQuery): Promise<GameArchiveRecord[]>
  get(archiveId: string): Promise<GameArchiveRecord | null>
  save(record: GameArchiveRecord): Promise<GameArchiveRecord[]>
}

export interface ArchiveGameCommand {
  commandId: string
  sessionId: string
  archive: GameArchiveRecord
}

export interface ResetAfterArchiveCommand {
  commandId: string
  sessionId: string
  archiveId: string
  confirmReset: boolean
}

export type ReviewStyle = 'neutral' | 'sharp'

export interface GenerateReviewDraftCommand {
  archiveId: string
  reviewStyle?: ReviewStyle
  includePlayerScores?: boolean
}

export type ArchiveErrorCode =
  | 'BAD_REQUEST'
  | 'ARCHIVE_NOT_FOUND'
  | 'SESSION_MISMATCH'
  | 'RESET_NOT_CONFIRMED'

export type ArchiveCommandResult<T> =
  | { accepted: true; data: T; warnings: string[] }
  | { accepted: false; error: ArchiveErrorCode; warnings: string[] }

export interface ArchiveGameData {
  archive: GameArchiveRecord
  archives: GameArchiveRecord[]
  resetUnlocked: true
}

export interface ResetAfterArchiveData {
  archiveId: string
  resetAllowed: true
}

export interface PlayerReviewDraft {
  seatId: number
  nickname: string
  roleName: string
  score: number
  basis: string[]
  comment: string
  sharpComment?: string
  confidence: 'low' | 'medium' | 'high'
}

export interface AIReviewDraft {
  archiveId: string
  generatedAt: string
  provider: 'fake' | 'openai-compatible'
  confidence: 'low' | 'medium' | 'high'
  disclaimer: string
  gameEvaluation: {
    summary: string
    highlights: string[]
    risks: string[]
  }
  fullReview: {
    summary: string
    turningPoints: string[]
    suggestedReplayOrder: string[]
  }
  playerReviews: PlayerReviewDraft[]
}

export interface ReviewDraftData {
  draft: AIReviewDraft
}

export interface ReviewDraftProvider {
  generateReviewDraft(
    archive: GameArchiveRecord,
    options: {
      reviewStyle?: ReviewStyle
      includePlayerScores?: boolean
    }
  ): Promise<{ draft: AIReviewDraft; warnings?: string[] }>
}
