import type { AIReviewDraft, PlayerReviewDraft, ReviewDraftProvider } from '../archive/types'
import { AIProviderError, callOpenAICompatibleJSON, type FetchLike } from './aiProviderClient'
import { buildReviewProviderMessages, buildReviewProviderPromptInput } from './reviewPromptBuilder'

interface ProviderDraftPayload {
  confidence?: unknown
  disclaimer?: unknown
  gameEvaluation?: unknown
  fullReview?: unknown
  playerReviews?: unknown
}

export interface OpenAIReviewDraftProviderOptions {
  baseUrl: string
  model: string
  apiKey: string
  timeoutSeconds: number
  fetcher?: FetchLike
  now?: () => string
}

function confidenceFrom(value: unknown): AIReviewDraft['confidence'] {
  return value === 'high' || value === 'medium' || value === 'low' ? value : 'low'
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && Boolean(item.trim())) : []
}

function text(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function number(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function normalizePlayerReviews(value: unknown): PlayerReviewDraft[] {
  if (!Array.isArray(value)) return []
  return value.map((item, index) => {
    const candidate = item as Partial<PlayerReviewDraft>
    const seatId = number(candidate.seatId, index + 1)
    return {
      seatId,
      nickname: text(candidate.nickname, `${seatId}号`),
      roleName: text(candidate.roleName, '未知角色'),
      score: Math.max(0, Math.min(100, Math.round(number(candidate.score, 0)))),
      basis: stringArray(candidate.basis),
      comment: text(candidate.comment, 'AI 未提供有效评语。'),
      sharpComment: typeof candidate.sharpComment === 'string' ? candidate.sharpComment : undefined,
      confidence: confidenceFrom(candidate.confidence),
    }
  })
}

function normalizeDraft(payload: ProviderDraftPayload, archiveId: string, generatedAt: string): AIReviewDraft {
  const gameEvaluation = payload.gameEvaluation as AIReviewDraft['gameEvaluation'] | undefined
  const fullReview = payload.fullReview as AIReviewDraft['fullReview'] | undefined

  return {
    archiveId,
    generatedAt,
    provider: 'openai-compatible',
    confidence: confidenceFrom(payload.confidence),
    disclaimer: text(payload.disclaimer, 'AI 复盘草稿仅供说书人参考，不是客观玩家能力评分。'),
    gameEvaluation: {
      summary: text(gameEvaluation?.summary, 'AI 未提供有效当局评价。'),
      highlights: stringArray(gameEvaluation?.highlights),
      risks: stringArray(gameEvaluation?.risks),
    },
    fullReview: {
      summary: text(fullReview?.summary, 'AI 未提供有效整局复盘。'),
      turningPoints: stringArray(fullReview?.turningPoints),
      suggestedReplayOrder: stringArray(fullReview?.suggestedReplayOrder),
    },
    playerReviews: normalizePlayerReviews(payload.playerReviews),
  }
}

export function createOpenAICompatibleReviewDraftProvider(
  options: OpenAIReviewDraftProviderOptions,
): ReviewDraftProvider {
  return {
    async generateReviewDraft(archive, reviewOptions) {
      const input = buildReviewProviderPromptInput(archive, reviewOptions)
      const payload = await callOpenAICompatibleJSON<ProviderDraftPayload>({
        baseUrl: options.baseUrl,
        model: options.model,
        apiKey: options.apiKey,
        timeoutSeconds: options.timeoutSeconds,
        fetcher: options.fetcher,
      }, buildReviewProviderMessages(input))

      const draft = normalizeDraft(payload, archive.id, options.now?.() ?? new Date().toISOString())
      if (!draft.gameEvaluation.summary || !draft.fullReview.summary) {
        throw new AIProviderError('AI_PROVIDER_BAD_RESPONSE', 502)
      }
      return { draft, warnings: ['provider_review_draft', 'draft_only'] }
    },
  }
}
