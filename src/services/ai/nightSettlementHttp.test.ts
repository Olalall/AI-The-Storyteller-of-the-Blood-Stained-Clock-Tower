import { describe, expect, it } from 'vitest'
import { initialNightWorkbenchState } from '../../features/night-workbench/data/initialNightWorkbenchState'
import { emptyWakeDraft } from '../../features/night-workbench/state/projectWakeDraft'
import { defaultAISettings, saveAISettings } from '../settings'
import { createNightResultAdviceAsync } from './nightSettlementHttp'
import { actNight, informationSession, projected } from '../../features/night-workbench/state/nightInformation.test-support'
import { isNightSettlementRequest } from '../../../server/ai/aiRequestValidators'

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
  it('sends the host-entered formal number with range metadata, keeping old payloads optional and rejecting malformed fields', async () => {
    const session = actNight(informationSession('empath'), { type: 'information', value: '0' })
    const state = projected(session), item = state.queue.find((entry) => entry.id === state.activeCursorId)!, draft = state.drafts[item.id]
    const before = structuredClone(session)
    await createNightResultAdviceAsync({ state, item, draft }, {
      runtimeSettings: { mode: 'http', baseUrl: 'https://offline.example.test', timeoutMs: 2000 },
      fetcher: async (_input, init) => {
        const payload = JSON.parse(String(init?.body))
        expect(payload.wakeItem.informationInput).toEqual({ kind: 'number', minimum: 0, maximum: 2 })
        expect(payload.draft.informationGiven).toBe('0')
        expect(payload.availableOutcomes.find((option: { id: string }) => option.id === 'record').ready).toBe(true)
        expect(isNightSettlementRequest(payload)).toBe(true)
        expect(isNightSettlementRequest({ ...payload, draft: { ...payload.draft, informationGiven: {} } })).toBe(false)
        expect(isNightSettlementRequest({ ...payload, wakeItem: { ...payload.wakeItem, informationInput: { kind: 'number', minimum: 3, maximum: 2 } } })).toBe(false)
        delete payload.wakeItem.informationInput
        delete payload.draft.informationGiven
        expect(isNightSettlementRequest(payload)).toBe(true)
        return jsonResponse({ accepted: true, data: { draft: { status: 'answer', recommendedOutcomeId: 'record', summary: '保留主持决定的正式答案' } } })
      },
    })
    expect(session).toEqual(before)
  })
  it('does not let duplicated provider warnings hide the final timing or authority reminder', async () => {
    const warnings = ['核对原角色', '核对阵营', '核对当前状态']
    const advice = await createNightResultAdviceAsync(adviceInput(), {
      runtimeSettings: { mode: 'http', baseUrl: 'https://offline.example.test', timeoutMs: 2000 },
      fetcher: async () => jsonResponse({ accepted: true, data: { draft: { status: 'answer', recommendedOutcomeId: 'no-effect',
        warnings, authorityWarnings: [...warnings, '身份应用后才处理新夜序', '原未发动技能必须停用'],
      } } }),
    })
    expect(advice?.authorityWarnings).toEqual([...warnings, '身份应用后才处理新夜序', '原未发动技能必须停用'])
  })
  it('explains expired private access without changing the current night', async () => {
    const input = adviceInput()
    const before = JSON.stringify(input)
    const advice = await createNightResultAdviceAsync(input, {
      runtimeSettings: { mode: 'http', baseUrl: 'https://botc.example.test', timeoutMs: 2000 },
      fetcher: async () => jsonResponse({ error: { code: 'AI_ACCESS_REQUIRED' } }, 401),
    })
    expect(advice?.authorityWarnings.join(' ')).toContain('验证访问口令')
    expect(JSON.stringify(input)).toBe(before)
  })
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

  it('does not let legacy browser API settings override the fixed night provider', async () => {
    saveAISettings({ ...defaultAISettings, mode: 'openai-compatible', baseUrl: 'https://old-provider.example.test/v1', model: 'old-model', apiKey: 'synthetic-legacy-key' })
    let sent: Record<string, unknown> | undefined
    await createNightResultAdviceAsync(adviceInput(), {
      runtimeSettings: { mode: 'http', baseUrl: 'http://127.0.0.1:8787', timeoutMs: 2000 },
      fetcher: async (_url, init) => {
        sent = JSON.parse(String(init?.body)) as Record<string, unknown>
        return jsonResponse({ accepted: true, data: { draft: { status: 'needs_input' } } })
      },
    })
    expect(sent).toBeDefined()
    expect(sent).not.toHaveProperty('providerSettings')
    expect(JSON.stringify(sent)).not.toContain('synthetic-legacy-key')
    expect(JSON.stringify(sent)).not.toContain('old-provider.example.test')
  })

  it('puts confirmed previous registration and current storyteller registration on the wire', async () => {
    const base = adviceInput()
    const input = {
      ...base,
      item: {
        ...base.item,
        previousRegistration: { kind: 'role_type' as const, seatId: 4, value: 'outsider' as const },
        forbiddenRegistrationValues: ['outsider' as const],
        previousTargets: [4],
        forbiddenTargetSeatIds: [4],
        previousTargetRequired: true,
        minimumTargetCount: 0,
        historicalContext: { kind: 'pukka_poison' as const, status: 'ready' as const, seatIds: [4], summary: '4号为旧毒候选。' },
      },
      draft: {
        ...base.draft,
        registration: { kind: 'role_type' as const, seatId: 3, value: 'minion' as const },
      },
    }
    await createNightResultAdviceAsync(input, {
      runtimeSettings: { mode: 'http', baseUrl: 'http://127.0.0.1:8787', timeoutMs: 2000 },
      fetcher: async (_url, init) => {
        const payload = JSON.parse(String(init?.body)) as { wakeItem: { previousRegistration?: unknown; forbiddenRegistrationValues?: string[]; previousTargets?: number[]; forbiddenTargetSeatIds?: number[]; previousTargetRequired?: boolean; minimumTargetCount?: number; historicalContext?: unknown }; draft: { registration?: unknown } }
        expect(payload.wakeItem.previousRegistration).toEqual(input.item.previousRegistration)
        expect(payload.wakeItem.forbiddenRegistrationValues).toEqual(['outsider'])
        expect(payload.wakeItem.previousTargets).toEqual([4])
        expect(payload.wakeItem.forbiddenTargetSeatIds).toEqual([4])
        expect(payload.wakeItem.previousTargetRequired).toBe(true)
        expect(payload.wakeItem.minimumTargetCount).toBe(0)
        expect(payload.wakeItem.historicalContext).toEqual(input.item.historicalContext)
        expect(payload.draft.registration).toEqual(input.draft.registration)
        return jsonResponse({ accepted: true, data: { draft: { status: 'needs_input', missing: ['仅验证请求。'] } } })
      },
    })
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
    const input = adviceInput()
    input.item.historicalContext = {
      kind: 'pukka_poison', status: 'ready', seatIds: [4], summary: '4号为旧毒候选。',
    }
    const advice = await createNightResultAdviceAsync(input, {
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
              { text: '4号死亡候选', seatId: 4, change: { field: 'life', to: 'dead' } },
              { text: '给7号加中毒', seatId: 7, change: { field: 'poisoned', to: 'true' } },
              '涉及疯狂：不判断玩家是否破疯狂。',
            ],
          },
        },
      }),
    })

    expect(advice?.stateChangeDrafts).toEqual([
      { text: '给3号加中毒', seatId: 3, change: { field: 'poisoned', to: 'true' } },
      { text: '4号死亡候选', seatId: 4, change: { field: 'life', to: 'dead' } },
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
