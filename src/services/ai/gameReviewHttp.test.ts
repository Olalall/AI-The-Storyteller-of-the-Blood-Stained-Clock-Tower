import { beforeEach, describe, expect, it } from 'vitest'
import { createPrototypeGameSession } from '../../features/game-session/data/createPrototypeSession'
import { createGameArchiveRecord } from '../archive'
import { createGameReviewDraftAsync } from './gameReviewHttp'
import { createLocalGameReviewDraft } from './gameReviewProjection'

function archiveFixture() {
  return createGameArchiveRecord({ session: createPrototypeGameSession(), winner: 'good', archiveId: 'front-review-archive' })
}
function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}
const runtimeSettings = { mode: 'http' as const, baseUrl: 'http://127.0.0.1:8787', timeoutMs: 2000 }

describe('game review HTTP adapter', () => {
  beforeEach(() => window.localStorage.clear())

  it('uses local review drafts without calling the backend in local mode', async () => {
    let called = false
    const draft = await createGameReviewDraftAsync(archiveFixture(), {
      runtimeSettings: { ...runtimeSettings, mode: 'local' },
      fetcher: async () => { called = true; return jsonResponse({}) },
    })
    expect(called).toBe(false)
    expect(draft.source).toBe('local')
  })

  it('keeps legacy unreferenced narratives and model scores out of authoritative facts and entertainment scores', async () => {
    const archive = archiveFixture()
    const fallback = createLocalGameReviewDraft(archive)
    const draft = await createGameReviewDraftAsync(archive, {
      runtimeSettings,
      fetcher: async (_input, init) => {
        expect(JSON.parse(String(init?.body))).toEqual({ reviewStyle: 'neutral', includePlayerScores: false })
        return jsonResponse({ accepted: true, data: { draft: {
          provider: 'openai-compatible',
          gameEvaluation: { summary: '伪造评价' },
          fullReview: { summary: '伪造因果', turningPoints: ['并不存在的发言'] },
          playerReviews: [{ seatId: 1, score: 100, basis: ['伪造依据'] }],
          keyEvents: [{ recordId: 'invented', fact: '伪造事实' }],
        } } })
      },
    })
    expect(draft.source).toBe('backend')
    expect(draft.keyEvents).toEqual(fallback.keyEvents)
    expect(draft.playerScores).toEqual(fallback.playerScores)
    expect(draft.fullReview).toEqual(fallback.fullReview)
    expect(draft.interpretations).toEqual([])
    expect(draft.warning).toContain('没有可核对的有效引用')
  })

  it('accepts only interpretations citing the displayed frozen archive records', async () => {
    const archive = archiveFixture()
    const validId = createLocalGameReviewDraft(archive).keyEvents.find((item) => !item.superseded)!.recordId
    const draft = await createGameReviewDraftAsync(archive, {
      runtimeSettings,
      fetcher: async () => jsonResponse({ accepted: true, data: { draft: {
        provider: 'openai-compatible',
        interpretations: [{ recordIds: [validId], explanation: '请回看该记录并补充现场语境。' },
          { recordIds: [validId, 'not-in-archive'], explanation: '无效混合引用' }],
        missing: ['缺少现场发言'],
      } } }),
    })
    expect(draft.interpretations).toHaveLength(1)
    expect(draft.interpretations[0].recordIds).toEqual([validId])
    expect(draft.missing).toContain('缺少现场发言')
  })

  it('falls back to local drafts when the backend review route fails', async () => {
    const draft = await createGameReviewDraftAsync(archiveFixture(), {
      runtimeSettings, fetcher: async () => jsonResponse({ accepted: false }, 503),
    })
    expect(draft.source).toBe('local')
    expect(draft.warning).toContain('后端复盘不可用')
  })
})
