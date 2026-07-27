import { describe, expect, it } from 'vitest'
import { initialNightWorkbenchState } from '../../features/night-workbench/data/initialNightWorkbenchState'
import { emptyWakeDraft } from '../../features/night-workbench/state/projectWakeDraft'
import { createNightResultAdviceAsync } from './nightSettlementHttp'

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function adviceInput() {
  const item = initialNightWorkbenchState.queue.find((entry) => entry.id === 'night-3-cerenovus')!
  const draft = { ...emptyWakeDraft(), targets: [3], roleChoice: 'investigator', draftRevision: 2 }
  return { state: initialNightWorkbenchState, item, draft }
}

describe('night settlement HTTP adapter', () => {
  it('uses local night advice without calling backend in local mode', async () => {
    let called = false
    const advice = await createNightResultAdviceAsync(adviceInput(), {
      runtimeSettings: { mode: 'local', baseUrl: 'http://127.0.0.1:8787', timeoutMs: 2000 },
      fetcher: async () => {
        called = true
        return jsonResponse({})
      },
    })

    expect(called).toBe(false)
    expect(advice?.status).toBe('answer')
    expect(advice?.recommendedOutcomeId).toBe('applied')
  })

  it('maps backend night advice into an AI result draft', async () => {
    const advice = await createNightResultAdviceAsync(adviceInput(), {
      runtimeSettings: { mode: 'http', baseUrl: 'http://127.0.0.1:8787', timeoutMs: 2000 },
      fetcher: async (_input, init) => {
        const payload = JSON.parse(String(init?.body)) as Record<string, unknown>
        expect(payload).not.toHaveProperty('session')
        expect(JSON.stringify(payload)).toContain('night-3-cerenovus')
        expect(payload).toHaveProperty('roleKnowledge')
        expect(payload).toHaveProperty('roleResearch')
        expect(payload).toHaveProperty('selectedTargets')
        expect(payload).toHaveProperty('statusFacts')
        expect(payload).toHaveProperty('wakeItem')
        expect((payload.wakeItem as { status?: unknown }).status).toEqual({
          life: 'alive',
          impairments: [],
          markers: [],
        })
        expect(JSON.stringify(payload)).toContain('3号')
        expect(JSON.stringify(payload)).toContain('洗脑师')
        expect((payload.statusFacts as string[]).join(' ')).toContain('发动者：10号洗脑师')
        expect((payload.statusFacts as string[]).join(' ')).toContain('目标：3号筑梦师')
        expect(JSON.stringify(payload)).toContain('mad')
        return jsonResponse({
          accepted: true,
          data: {
            draft: {
              provider: 'openai-compatible',
              confidence: 'medium',
              draftOnly: true,
              status: 'answer',
              recommendedOutcomeId: 'no-effect',
              summary: '当前草稿可按未受影响处理。',
              ruleFacts: ['只会填入草稿。'],
              missing: [],
              warnings: ['先核对发动者状态。'],
              authorityWarnings: ['确认本项前不写日志。'],
              disclaimer: 'AI 只给草稿。',
            },
          },
        })
      },
    })

    expect(advice).toMatchObject({
      status: 'answer',
      recommendedOutcomeId: 'no-effect',
      confidence: 'medium',
      wakeItemId: 'night-3-cerenovus',
      contextRevision: initialNightWorkbenchState.revision,
      sourceDraftRevision: 2,
    })
    expect(advice?.facts).toEqual(['只会填入草稿。'])
    expect(advice?.authorityWarnings).toEqual(['先核对发动者状态。', '确认本项前不写日志。'])
  })

  it('sends selected target context from all seats, not only the night queue', async () => {
    const input = {
      ...adviceInput(),
      draft: { ...emptyWakeDraft(), targets: [1], roleChoice: 'investigator', draftRevision: 3 },
    }

    await createNightResultAdviceAsync(input, {
      runtimeSettings: { mode: 'http', baseUrl: 'http://127.0.0.1:8787', timeoutMs: 2000 },
      fetcher: async (_input, init) => {
        const payload = JSON.parse(String(init?.body)) as {
          selectedTargets?: Array<{ seatId: number; roleId: string; roleName: string; status: { impairments: string[] } }>
        }
        expect(input.state.queue.some((entry) => entry.seatId === 1)).toBe(false)
        expect(payload.selectedTargets).toEqual([
          expect.objectContaining({
            seatId: 1,
            roleId: 'drunk',
            roleName: '酒鬼',
            status: expect.objectContaining({
              impairments: expect.arrayContaining(['poisoned', 'drunk']),
            }),
          }),
        ])
        expect((payload as { statusFacts?: string[] }).statusFacts?.join(' ')).toContain('目标：1号酒鬼，状态：存活 / 中毒 / 醉酒')
        return jsonResponse({
          accepted: true,
          data: {
            draft: {
              status: 'answer',
              recommendedOutcomeId: 'applied',
              summary: '目标上下文完整。',
              ruleFacts: ['已识别目标真实角色。'],
            },
          },
        })
      },
    })
  })

  it('does not accept backend outcomes that are not ready', async () => {
    const input = {
      ...adviceInput(),
      draft: { ...emptyWakeDraft(), draftRevision: 0 },
    }
    const advice = await createNightResultAdviceAsync(input, {
      runtimeSettings: { mode: 'http', baseUrl: 'http://127.0.0.1:8787', timeoutMs: 2000 },
      fetcher: async () => jsonResponse({
        accepted: true,
        data: {
          draft: {
            status: 'answer',
            recommendedOutcomeId: 'applied',
            summary: '不应直接采用。',
            missing: [],
          },
        },
      }),
    })

    expect(advice?.status).toBe('needs_input')
    expect(advice?.recommendedOutcomeId).toBeUndefined()
    expect(advice?.missing).toContain('先补齐本项选择。')
  })

  it('falls back to local advice when backend route fails', async () => {
    const advice = await createNightResultAdviceAsync(adviceInput(), {
      runtimeSettings: { mode: 'http', baseUrl: 'http://127.0.0.1:8787', timeoutMs: 2000 },
      fetcher: async () => jsonResponse({ accepted: false }, 503),
    })

    expect(advice?.recommendedOutcomeId).toBe('applied')
    expect(advice?.facts.join(' ')).toContain('后端夜间建议不可用')
  })
})
