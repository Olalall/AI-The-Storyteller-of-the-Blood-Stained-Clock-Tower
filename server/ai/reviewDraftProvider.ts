import type { ReviewDraftProvider } from '../archive/types'
import { generateFakeReviewDraft } from '../archive/reviewDraft'
import { reviewModelMissing, validReviewInterpretations } from '../../src/services/ai/gameReviewEvidence'
import { callOpenAICompatibleJSON, type FetchLike } from './aiProviderClient'
import { buildReviewProviderMessages, buildReviewProviderPromptInput } from './reviewPromptBuilder'

interface ProviderDraftPayload {
  interpretations?: unknown
  missing?: unknown
}

export interface OpenAIReviewDraftProviderOptions {
  baseUrl: string
  model: string
  apiKey: string
  timeoutSeconds: number
  fetcher?: FetchLike
  now?: () => string
}

export function createOpenAICompatibleReviewDraftProvider(options: OpenAIReviewDraftProviderOptions): ReviewDraftProvider {
  return {
    async generateReviewDraft(archive, reviewOptions) {
      const input = buildReviewProviderPromptInput(archive)
      const payload = await callOpenAICompatibleJSON<ProviderDraftPayload>({
        baseUrl: options.baseUrl,
        model: options.model,
        apiKey: options.apiKey,
        timeoutSeconds: options.timeoutSeconds,
        fetcher: options.fetcher,
      }, buildReviewProviderMessages(input))
      const baseline = generateFakeReviewDraft(archive, { ...reviewOptions, generatedAt: options.now?.() })
      const interpretations = validReviewInterpretations(payload.interpretations, input.records)
      const missing = reviewModelMissing(payload.missing)
      return {
        draft: {
          ...baseline,
          provider: 'openai-compatible',
          interpretations,
          missing: [...baseline.missing ?? [], ...missing],
        },
        warnings: ['provider_review_draft', 'draft_only', ...interpretations.length ? [] : ['review_no_valid_citations']],
      }
    },
  }
}
