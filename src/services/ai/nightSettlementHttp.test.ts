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

  /*
   * contextLevel 只有上了网线才叫接通。
   * 违反的后果：build 函数里的推导单测从 minimal 变 standard 全绿，而后端收到的请求体
   * 里根本没有这个字段——线上一个字节都不会变。
   */
  it('puts the derived context level and the unknown seats on the wire', async () => {
    const partial = {
      ...adviceInput(),
      state: {
        ...initialNightWorkbenchState,
        seatSnapshots: {
          ...initialNightWorkbenchState.seatSnapshots,
          4: { ...initialNightWorkbenchState.seatSnapshots[4], role: null },
        },
      },
    }

    await createNightResultAdviceAsync(partial, {
      runtimeSettings: { mode: 'http', baseUrl: 'http://127.0.0.1:8787', timeoutMs: 2000 },
      fetcher: async (_input, init) => {
        const payload = JSON.parse(String(init?.body)) as { contextLevel?: string; unknownSeatIds?: number[] }
        expect(payload.contextLevel).toBe('minimal')
        expect(payload.unknownSeatIds).toEqual([4])
        return jsonResponse({ accepted: true, data: { draft: { status: 'needs_input', missing: ['先补录4号身份。'] } } })
      },
    })

    await createNightResultAdviceAsync(adviceInput(), {
      runtimeSettings: { mode: 'http', baseUrl: 'http://127.0.0.1:8787', timeoutMs: 2000 },
      fetcher: async (_input, init) => {
        const payload = JSON.parse(String(init?.body)) as { contextLevel?: string; unknownSeatIds?: number[] }
        expect(payload.contextLevel).toBe('standard')
        expect(payload.unknownSeatIds).toEqual([])
        return jsonResponse({ accepted: true, data: { draft: { status: 'needs_input', missing: [] } } })
      },
    })
  })

  /*
   * 结构化建议只在座位号真的出现在本次请求里时才保留结构。
   * 违反的后果：一条「给 7 号加中毒」会带着可点的落盘按钮送到说书人面前，
   * 而 7 号这一步根本没被提到——按钮点下去写的是一次凭空的状态变更。
   */
  it('keeps structured state-change drafts only for seats in this request', async () => {
    const advice = await createNightResultAdviceAsync(adviceInput(), {
      runtimeSettings: { mode: 'http', baseUrl: 'http://127.0.0.1:8787', timeoutMs: 2000 },
      fetcher: async () => jsonResponse({
        accepted: true,
        data: {
          draft: {
            status: 'answer',
            recommendedOutcomeId: 'applied',
            summary: '草稿。',
            stateChangeDrafts: [
              { text: '给3号加中毒', seatId: 3, change: { field: 'poisoned', to: 'true' } },
              { text: '给7号加中毒', seatId: 7, change: { field: 'poisoned', to: 'true' } },
              '涉及疯狂：不判断玩家是否破疯狂。',
            ],
          },
        },
      }),
    })

    expect(advice?.stateChangeDrafts).toEqual([
      { text: '给3号加中毒', seatId: 3, change: { field: 'poisoned', to: 'true' } },
      { text: '涉及疯狂：不判断玩家是否破疯狂。' },
    ])
  })

  /*
   * 后端一条状态建议都没给时回退到本地草稿，而本地草稿只有纯文本。
   * 这条钉的是「两套形状并存」那个缺陷：回退回来的东西必须仍然是 AIStateChangeDraft。
   */
  it('falls back to text-only local drafts, keeping one shape end to end', async () => {
    const advice = await createNightResultAdviceAsync(adviceInput(), {
      runtimeSettings: { mode: 'http', baseUrl: 'http://127.0.0.1:8787', timeoutMs: 2000 },
      fetcher: async () => jsonResponse({
        accepted: true,
        data: { draft: { status: 'answer', recommendedOutcomeId: 'applied', summary: '草稿。' } },
      }),
    })

    expect(advice?.stateChangeDrafts.length).toBeGreaterThan(0)
    expect(advice?.stateChangeDrafts.every((draft) => (
      typeof draft.text === 'string' && draft.seatId === undefined && draft.change === undefined
    ))).toBe(true)
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
