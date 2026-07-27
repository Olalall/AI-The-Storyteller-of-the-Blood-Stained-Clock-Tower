import { describe, expect, it } from 'vitest'
import { createPrototypeGameSession } from '../../src/features/game-session/data/createPrototypeSession'
import { createGameArchiveRecord } from '../../src/services/archive/archiveService'
import { createOpenAICompatibleReviewDraftProvider } from './reviewDraftProvider'
import { buildReviewProviderMessages, buildReviewProviderPromptInput } from './reviewPromptBuilder'
import type { FetchLike } from './aiProviderClient'

const secret = 'sk-review-provider-secret'

function archiveFixture() {
  const session = createPrototypeGameSession()
  return createGameArchiveRecord({
    session,
    winner: 'good',
    archiveId: 'provider-review-archive',
    archivedAt: '2026-07-19T00:00:00.000Z',
  })
}

function response(content: unknown) {
  return new Response(JSON.stringify({
    choices: [{ message: { content: JSON.stringify(content) } }],
  }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}

describe('review provider prompt and adapter', () => {
  it('builds minimal review context without full session or timeline bodies', () => {
    const archive = archiveFixture()
    const input = buildReviewProviderPromptInput(archive, { reviewStyle: 'neutral', includePlayerScores: false })
    const messages = buildReviewProviderMessages(input)
    const serialized = JSON.stringify(messages)

    expect(input.archiveId).toBe(archive.id)
    expect(input.summary).toEqual(archive.summary)
    expect(serialized).not.toContain('"session"')
    expect(serialized).not.toContain('"timeline"')
    expect(serialized).not.toContain('BOTC_AI_API_KEY')
  })

  it('generates an openai-compatible draft through a mock fetcher', async () => {
    const fetcher: FetchLike = async (_input, init) => {
      const headers = init?.headers as Record<string, string>
      expect(String(init?.body)).not.toContain(secret)
      expect(headers.Authorization).toBe(`Bearer ${secret}`)
      return response({
        confidence: 'medium',
        disclaimer: 'AI 复盘草稿，仅供说书人参考。',
        gameEvaluation: {
          summary: '这局节奏完整。',
          highlights: ['投票链清晰'],
          risks: ['日志不含语音语境'],
        },
        fullReview: {
          summary: '先看夜晚，再看白天投票。',
          turningPoints: ['第3天处决'],
          suggestedReplayOrder: ['夜晚行动', '白天提名'],
        },
        playerReviews: [{
          seatId: 1,
          nickname: '玩家1',
          roleName: '调查员',
          score: 80,
          basis: ['日志出现多次'],
          comment: '表现积极。',
          sharpComment: '活跃但要看现场证据。',
          confidence: 'medium',
        }],
      })
    }

    const provider = createOpenAICompatibleReviewDraftProvider({
      baseUrl: 'https://ai.example.test/v1',
      model: 'review-model',
      apiKey: secret,
      timeoutSeconds: 1,
      fetcher,
      now: () => '2026-07-19T00:00:00.000Z',
    })
    const result = await provider.generateReviewDraft(archiveFixture(), { reviewStyle: 'sharp', includePlayerScores: true })

    expect(result.draft.provider).toBe('openai-compatible')
    expect(result.draft.generatedAt).toBe('2026-07-19T00:00:00.000Z')
    expect(result.draft.playerReviews[0].sharpComment).toBeTruthy()
    expect(result.warnings).toContain('draft_only')
    expect(JSON.stringify(result)).not.toContain(secret)
  })
})
