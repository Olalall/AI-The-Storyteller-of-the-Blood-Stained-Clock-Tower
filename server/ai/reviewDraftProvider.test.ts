import { describe, expect, it } from 'vitest'
import { createPrototypeGameSession } from '../../src/features/game-session/data/createPrototypeSession'
import { createGameArchiveRecord } from '../../src/services/archive/archiveService'
import { generateFakeReviewDraft } from '../archive/reviewDraft'
import { createOpenAICompatibleReviewDraftProvider } from './reviewDraftProvider'
import { buildReviewProviderMessages, buildReviewProviderPromptInput } from './reviewPromptBuilder'
import type { FetchLike } from './aiProviderClient'

const secret = 'sk-review-provider-secret'
function archiveFixture() {
  return createGameArchiveRecord({ session: createPrototypeGameSession(), winner: 'good', archiveId: 'provider-review-archive' })
}
function response(content: unknown) {
  return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(content) } }] }),
    { status: 200, headers: { 'Content-Type': 'application/json' } })
}

describe('review provider prompt and adapter', () => {
  it('sends bounded factual excerpts with record IDs, omitting full session and default scores', () => {
    const archive = archiveFixture()
    const before = JSON.stringify(archive)
    const input = buildReviewProviderPromptInput(archive)
    const serialized = JSON.stringify(buildReviewProviderMessages(input))
    expect(input.archiveId).toBe(archive.id)
    expect(input.records.length).toBeGreaterThan(0)
    expect(input.records.every((record) => archive.session.timeline.some((entry) => entry.id === record.recordId))).toBe(true)
    expect(input.includePlayerScores).toBe(false)
    expect(input.reviewStyle).toBe('neutral')
    expect(serialized).not.toContain('"session"')
    expect(serialized).not.toContain('BOTC_AI_API_KEY')
    expect(JSON.stringify(archive)).toBe(before)
    expect(generateFakeReviewDraft(archive).playerReviews).toEqual([])
    expect(generateFakeReviewDraft(archive, { includePlayerScores: true, reviewStyle: 'sharp' }).playerReviews).toHaveLength(archive.playerCount)
  })

  it('retains confirmed facts and drops invented or partly invalid references from model explanations', async () => {
    const archive = archiveFixture()
    const recordId = buildReviewProviderPromptInput(archive).records.find((item) => !item.superseded)!.recordId
    const fetcher: FetchLike = async (_input, init) => {
      expect(String(init?.body)).not.toContain(secret)
      expect((init.headers as Record<string, string>).Authorization).toBe(`Bearer ${secret}`)
      return response({
        interpretations: [
          { recordIds: [recordId], explanation: '应核对该记录与现场发言。' },
          { recordIds: ['invented'], explanation: '伪造引用' },
          { recordIds: [recordId, 'invented'], explanation: '混合引用' },
        ],
        gameEvaluation: { summary: '伪造胜因' },
        fullReview: { summary: '伪造因果' },
        playerReviews: [{ seatId: 1, score: 100, sharpComment: '伪造能力判断' }],
        missing: ['没有记录私聊'],
      })
    }
    const provider = createOpenAICompatibleReviewDraftProvider({
      baseUrl: 'https://ai.example.test/v1', model: 'review-model', apiKey: secret,
      timeoutSeconds: 1, fetcher, now: () => '2026-07-19T00:00:00.000Z',
    })
    const before = JSON.stringify(archive)
    const result = await provider.generateReviewDraft(archive, { reviewStyle: 'sharp', includePlayerScores: true })
    expect(result.draft.provider).toBe('openai-compatible')
    expect(result.draft.generatedAt).toBe('2026-07-19T00:00:00.000Z')
    expect(result.draft.interpretations).toEqual([{ recordIds: [recordId], explanation: '应核对该记录与现场发言。' }])
    expect(result.draft.fullReview).toEqual(generateFakeReviewDraft(archive).fullReview)
    expect(result.draft.playerReviews).toEqual(generateFakeReviewDraft(archive, { reviewStyle: 'sharp', includePlayerScores: true }).playerReviews)
    expect(result.draft.missing).toContain('没有记录私聊')
    expect(result.warnings).toContain('draft_only')
    expect(JSON.stringify(result)).not.toContain(secret)
    expect(JSON.stringify(archive)).toBe(before)
  })

  it('keeps an old response without citations as a facts-only review rather than inventing support', async () => {
    const provider = createOpenAICompatibleReviewDraftProvider({
      baseUrl: 'https://ai.example.test/v1', model: 'review-model', apiKey: secret,
      timeoutSeconds: 1, fetcher: async () => response({ fullReview: { summary: '无来源断言' } }),
    })
    const result = await provider.generateReviewDraft(archiveFixture(), {})
    expect(result.draft.interpretations).toEqual([])
    expect(result.warnings).toContain('review_no_valid_citations')
    expect(JSON.stringify(result.draft)).not.toContain('无来源断言')
  })
})
