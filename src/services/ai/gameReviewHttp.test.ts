import { beforeEach, describe, expect, it } from 'vitest'
import { createPrototypeGameSession } from '../../features/game-session/data/createPrototypeSession'
import { createGameArchiveRecord } from '../archive'
import { createGameReviewDraftAsync } from './gameReviewHttp'

function archiveFixture() {
  const session = createPrototypeGameSession()
  return createGameArchiveRecord({
    session,
    winner: 'good',
    archiveId: 'front-review-archive',
    archivedAt: '2026-07-19T00:00:00.000Z',
  })
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('game review HTTP adapter', () => {
  beforeEach(() => window.localStorage.clear())

  it('uses local review drafts without calling the backend in local mode', async () => {
    let called = false
    const draft = await createGameReviewDraftAsync(archiveFixture(), {
      runtimeSettings: { mode: 'local', baseUrl: 'http://127.0.0.1:8787', timeoutMs: 2000 },
      fetcher: async () => {
        called = true
        return jsonResponse({})
      },
    })

    expect(called).toBe(false)
    expect(draft.provider).toBe('fake')
    expect(draft.source).toBe('local')
  })

  it('maps backend review drafts into the front-end review shape', async () => {
    const draft = await createGameReviewDraftAsync(archiveFixture(), {
      runtimeSettings: { mode: 'http', baseUrl: 'http://127.0.0.1:8787', timeoutMs: 2000 },
      fetcher: async () => jsonResponse({
        accepted: true,
        data: {
          draft: {
            provider: 'openai-compatible',
            disclaimer: 'AI 草稿，仅供参考。',
            gameEvaluation: {
              summary: '后端生成的当局评价。',
              highlights: ['投票链清楚'],
              risks: ['缺少语音'],
            },
            fullReview: {
              summary: '后端整局复盘。',
              turningPoints: ['第1夜：关键行动'],
              suggestedReplayOrder: ['夜间行动', '白天投票'],
            },
            playerReviews: [{
              seatId: 1,
              nickname: '玩家1',
              roleName: '调查员',
              score: 82,
              basis: ['日志出现多次'],
              comment: '积极参与。',
              sharpComment: '有表现，但还得看现场。',
            }],
          },
        },
      }),
    })

    expect(draft.provider).toBe('openai-compatible')
    expect(draft.source).toBe('backend')
    expect(draft.evaluation.density).toContain('后端')
    expect(draft.playerScores[0]).toMatchObject({ seatId: 1, score: 82 })
    expect(draft.playerScores[0].keyEvents).toEqual(['日志出现多次'])
    expect(draft.fullReview.turningPoints).toEqual(['第1夜：关键行动'])
  })

  it('falls back to local drafts when the backend review route fails', async () => {
    const draft = await createGameReviewDraftAsync(archiveFixture(), {
      runtimeSettings: { mode: 'http', baseUrl: 'http://127.0.0.1:8787', timeoutMs: 2000 },
      fetcher: async () => jsonResponse({ accepted: false }, 503),
    })

    expect(draft.provider).toBe('fake')
    expect(draft.source).toBe('local')
    expect(draft.warning).toContain('后端复盘不可用')
  })
})
