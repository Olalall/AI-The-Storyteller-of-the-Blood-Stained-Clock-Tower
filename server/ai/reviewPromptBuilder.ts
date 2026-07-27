import type { GameArchiveRecord } from '../../src/services/archive/types'
import type { ReviewStyle } from '../archive/types'
import type { AIProviderChatMessage } from './types'

export interface ReviewProviderPromptInput {
  archiveId: string
  scriptName: string
  playerCount: number
  winnerLabel: string
  summary: GameArchiveRecord['summary']
  reviewStyle: ReviewStyle
  includePlayerScores: boolean
}

export function buildReviewProviderPromptInput(
  archive: GameArchiveRecord,
  options: { reviewStyle?: ReviewStyle; includePlayerScores?: boolean } = {},
): ReviewProviderPromptInput {
  return {
    archiveId: archive.id,
    scriptName: archive.scriptName,
    playerCount: archive.playerCount,
    winnerLabel: archive.winnerLabel,
    summary: { ...archive.summary },
    reviewStyle: options.reviewStyle ?? 'sharp',
    includePlayerScores: options.includePlayerScores ?? true,
  }
}

export function buildReviewProviderMessages(input: ReviewProviderPromptInput): AIProviderChatMessage[] {
  return [
    {
      role: 'system',
      content: [
        '你是血染钟楼说书人复盘助手。',
        '只基于给定摘要生成草稿，不声称客观评分，不修改任何游戏状态。',
        '只返回 JSON 对象，不要 Markdown。',
      ].join('\n'),
    },
    {
      role: 'user',
      content: JSON.stringify({
        task: 'generate_review_draft',
        outputShape: {
          confidence: 'low | medium | high',
          disclaimer: 'string',
          gameEvaluation: { summary: 'string', highlights: ['string'], risks: ['string'] },
          fullReview: { summary: 'string', turningPoints: ['string'], suggestedReplayOrder: ['string'] },
          playerReviews: [{
            seatId: 1,
            nickname: 'string',
            roleName: 'string',
            score: 0,
            basis: ['string'],
            comment: 'string',
            sharpComment: 'string',
            confidence: 'low | medium | high',
          }],
        },
        input,
      }),
    },
  ]
}
