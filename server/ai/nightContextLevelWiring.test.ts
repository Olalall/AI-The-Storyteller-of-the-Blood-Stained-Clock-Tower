import { describe, expect, it } from 'vitest'
import type { FetchLike } from './aiProviderClient'
import { isNightSettlementRequest } from './aiRequestValidators'
import { buildNightSettlementProviderMessages } from './nightSettlementPromptBuilder'
import { createOpenAICompatibleNightSettlementProvider } from './nightSettlementProvider'
import type { NightSettlementProviderRequest } from './types'

/**
 * contextLevel 从「只存在于类型里」变成「真的改变行为」的证据。
 *
 * 只在前端 build 函数里把 'minimal' 换成推导值，单测会从 minimal 变 standard 而线上零变化——
 * 这一整个文件就是为了让那种假绿不成立：同一份模型响应，只因为请求声明的知情程度不同，
 * 后端给出的 status 必须不同。
 */

function request(overrides: Partial<NightSettlementProviderRequest> = {}): NightSettlementProviderRequest {
  return {
    scriptId: 'catfishing',
    knowledgeVersion: 'catfishing/test-v1',
    nightRunId: 'night-test',
    phaseLabel: '第3夜',
    playerCount: 12,
    wakeItem: {
      id: 'night-3-poisoner',
      orderIndex: 2,
      seatId: 10,
      playerLabel: '10号玩家',
      roleId: 'poisoner',
      roleName: '下毒者',
      ability: '每夜选择一名玩家：该玩家今晚与明天白天中毒。',
      storytellerPrompt: '记录中毒目标。',
      targetCount: 1,
      status: { life: 'alive', impairments: [], markers: [] },
    },
    draft: { targets: [3], roleChoice: '', outcomeId: '', playerChoice: '', draftRevision: 1 },
    availableOutcomes: [{ id: 'applied', label: '生效', ready: true, requiredInputs: ['targets'] }],
    selectedTargets: [{
      seatId: 3,
      playerLabel: '3号玩家',
      roleId: 'chef',
      roleName: '厨师',
      status: { life: 'alive', impairments: [], markers: [] },
    }],
    ...overrides,
  }
}

/** 一份「模型很自信」的响应：状态 answer、结果就绪、missing 为空。 */
function confidentAnswer(): FetchLike {
  return async () => new Response(JSON.stringify({
    choices: [{
      message: {
        content: JSON.stringify({
          status: 'answer',
          confidence: 'high',
          recommendedOutcomeId: 'applied',
          summary: '按当前录入生成结果草稿。',
          ruleFacts: ['下毒者选定目标。'],
          missing: [],
          warnings: [],
          disclaimer: 'AI 只给夜间草稿。',
        }),
      },
    }],
  }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}

function providerWith(fetcher: FetchLike) {
  return createOpenAICompatibleNightSettlementProvider({
    baseUrl: 'https://ai.example.test/v1',
    model: 'night-model',
    apiKey: 'sk-test',
    timeoutSeconds: 1,
    fetcher,
  })
}

describe('提示词读 contextLevel', () => {
  /*
   * 「未列出等于未知，不是正常」必须出现在提示词里，并且点得出座位号。
   * 违反的后果：模型看到的是一份没有缺口标记的输入，默认读法是「没提到的座位都正常」，
   * 而一个中毒了但工具没记的座位会被当成健康座位参与推理。
   */
  it('names the unknown seats and forbids reading absence as normal', () => {
    const serialized = JSON.stringify(buildNightSettlementProviderMessages(
      request({ contextLevel: 'minimal', unknownSeatIds: [7, 2, 7] }),
    ))

    expect(serialized).toContain('未在输入中列出的座位状态一律视为')
    expect(serialized).toContain('2、7 号座位的身份工具里没有')
    expect(serialized).toContain('本次必须返回 needs_input')
  })

  /* 知情完整时不许出现追问分支——那会让模型在不需要问的时候也问。 */
  it('drops the gap branch when the tool knows every seat', () => {
    const serialized = JSON.stringify(buildNightSettlementProviderMessages(
      request({ contextLevel: 'standard' }),
    ))

    expect(serialized).not.toContain('未在输入中列出的座位状态一律视为')
    expect(serialized).toContain('可以当作完整局面使用')
  })

  /*
   * 提示词与 provider 用的是同一份座位名单（nightUnknownSeats）。
   * 违反的后果：提示词说要点名 2、7 号，provider 却按另一套口径判，
   * 两边的不一致从响应里完全看不出来。
   */
  it('asks for exactly the seats the provider will enforce', async () => {
    const input = request({ contextLevel: 'minimal', unknownSeatIds: [2, 7] })
    const prompt = JSON.stringify(buildNightSettlementProviderMessages(input))
    const { draft } = await providerWith(confidentAnswer()).generateNightSettlementAdvice(input)

    expect(draft.missing.some((line) => prompt.includes(line))).toBe(true)
  })
})

describe('provider 按 contextLevel 改变行为（G3 验收④）', () => {
  /*
   * coverage 非 full → 即使模型返回 answer，也必须降级成 needs_input 并点名座位。
   * 违反的后果：说书人拿到一个「基于半张棋盘」却看起来完整的结论——
   * 那比不回答危险得多，因为界面上没有任何东西提示它是残缺的。
   */
  it('forces needs_input and names the seats when the tool only knows part of the board', async () => {
    const { draft } = await providerWith(confidentAnswer()).generateNightSettlementAdvice(
      request({ contextLevel: 'minimal', unknownSeatIds: [2, 7] }),
    )

    expect(draft.status).toBe('needs_input')
    expect(draft.recommendedOutcomeId).toBeUndefined()
    expect(draft.missing[0]).toContain('2、7 号座位')
    expect(draft.missing[0]).toContain('不代表这些座位一切正常')
  })

  /*
   * 同一份模型响应，standard 时必须仍是 answer。
   * 没有这一条，上面那条测的可能只是「provider 永远返回 needs_input」。
   */
  it('still answers when the tool knows the whole board', async () => {
    const { draft } = await providerWith(confidentAnswer()).generateNightSettlementAdvice(
      request({ contextLevel: 'standard', unknownSeatIds: [] }),
    )

    expect(draft.status).toBe('answer')
    expect(draft.recommendedOutcomeId).toBe('applied')
  })

  /*
   * 旧客户端不发 contextLevel → 行为与加这个字段之前完全一致。
   * 违反的后果：所有还没升级的客户端突然收到一堆 needs_input，
   * 而后端连该点名哪个座位都说不出来，说书人无从补救。
   */
  it('leaves requests that never declared a context level untouched', async () => {
    const { draft } = await providerWith(confidentAnswer()).generateNightSettlementAdvice(request())

    expect(draft.status).toBe('answer')
    expect(draft.recommendedOutcomeId).toBe('applied')
  })
})

describe('校验器认 contextLevel', () => {
  /* 缺省合法：拒收会让旧客户端整个 AI 功能一起挂掉。 */
  it('accepts a request without the field', () => {
    expect(isNightSettlementRequest(request())).toBe(true)
  })

  /*
   * 认不出的档位一律拒收。
   * 违反的后果：一个 'partial' 会让 provider 的 `!== 'minimal'` 判成「知情完整」，
   * 静默走回加这个字段之前的行为——最坏的一种失败，因为没有任何人会发现。
   */
  it('rejects a level it does not understand', () => {
    expect(isNightSettlementRequest({ ...request(), contextLevel: 'partial' })).toBe(false)
    expect(isNightSettlementRequest({ ...request(), unknownSeatIds: ['7'] })).toBe(false)
  })

  it('rejects invalid target and registration drafts before provider use', () => {
    expect(isNightSettlementRequest({
      ...request(),
      draft: { ...request().draft, targets: [3, 3] },
    })).toBe(false)
    expect(isNightSettlementRequest({
      ...request(),
      wakeItem: { ...request().wakeItem, targetCount: 1 },
      draft: { ...request().draft, targets: [3, 4] },
    })).toBe(false)
    expect(isNightSettlementRequest({
      ...request(),
      wakeItem: { ...request().wakeItem, forbiddenTargetSeatIds: [3] },
    })).toBe(false)
    expect(isNightSettlementRequest({
      ...request(),
      wakeItem: { ...request().wakeItem, forbiddenRegistrationValues: ['outsider'] },
      draft: {
        ...request().draft,
        registration: { kind: 'role_type', seatId: 3, value: 'outsider' },
      },
    })).toBe(false)
  })

  it('rejects selected target snapshots outside the current player range', () => {
    const selectedTarget = request().selectedTargets[0]
    expect(isNightSettlementRequest({
      ...request(),
      selectedTargets: [{ ...selectedTarget, seatId: 999 }],
    })).toBe(false)
    expect(isNightSettlementRequest({
      ...request(),
      selectedTargets: [selectedTarget, { ...selectedTarget }],
    })).toBe(false)
  })
})
