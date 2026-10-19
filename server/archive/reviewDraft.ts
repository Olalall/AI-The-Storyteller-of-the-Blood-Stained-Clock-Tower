import type { GameArchiveRecord } from '../../src/services/archive/types'
import { createLocalGameReviewDraft } from '../../src/services/ai/gameReviewProjection'
import type { AIReviewDraft, ReviewStyle } from './types'

interface ReviewDraftOptions {
  reviewStyle?: ReviewStyle
  includePlayerScores?: boolean
  generatedAt?: string
}

export function generateFakeReviewDraft(archive: GameArchiveRecord, options: ReviewDraftOptions = {}): AIReviewDraft {
  const local = createLocalGameReviewDraft(archive)
  return {
    archiveId: archive.id,
    generatedAt: options.generatedAt ?? new Date().toISOString(),
    provider: 'fake',
    confidence: archive.summary.records >= 8 ? 'medium' : 'low',
    disclaimer: '本复盘草稿只基于已保存日志，不是客观玩家能力评分，也不会修改归档或当前局。',
    keyEvents: local.keyEvents,
    interpretations: [],
    missing: local.missing,
    gameEvaluation: {
      summary: local.evaluation.density,
      highlights: [local.evaluation.vote],
      risks: [local.evaluation.correction],
    },
    fullReview: {
      summary: local.fullReview.summary,
      turningPoints: [...local.fullReview.turningPoints],
      suggestedReplayOrder: [...local.fullReview.suggestedReplayOrder],
    },
    playerReviews: options.includePlayerScores ? local.playerScores.map((player) => ({
      seatId: player.seatId,
      nickname: player.name,
      roleName: player.roleName,
      score: player.score,
      basis: [...player.keyEvents],
      comment: player.note,
      sharpComment: options.reviewStyle === 'sharp' ? player.roast : undefined,
      confidence: 'low',
    })) : [],
  }
}
