import { describe, expect, it } from 'vitest'
import type { FetchLike } from './aiProviderClient'
import { createAIProxyHandlers } from './aiProxyHandlers'
import { createAIProxyRoutes } from './aiProxyRoutes'

const secret = 'sk-route-secret-should-not-leak'
const configuredEnv = {
  BOTC_AI_ENABLED: 'true',
  BOTC_AI_PROVIDER: 'openai-compatible',
  BOTC_AI_BASE_URL: 'https://ai.example.test/v1',
  BOTC_AI_MODEL: 'review-model',
  BOTC_AI_API_KEY: secret,
}

function request(pathname: string, init: RequestInit = {}) {
  return new Request(`http://127.0.0.1${pathname}`, init)
}

async function jsonBody(response: Response) {
  return response.json() as Promise<Record<string, unknown>>
}

function createRoutes(env: NodeJS.ProcessEnv) {
  return createAIProxyRoutes(createAIProxyHandlers({ env }))
}

function setupAdviceBody() {
  return {
    scriptId: 'catfishing',
    scriptName: 'Catfishing / 瓦釜雷鸣',
    knowledgeVersion: 'catfishing/test-v1',
    playerCount: 12,
    seats: [
      { seatId: 1, nickname: '玩家1', experience: 'new' },
      { seatId: 2, nickname: '玩家2', experience: 'regular' },
    ],
    candidates: [
      {
        id: 'setup-a',
        title: '均衡局',
        summary: '信息源分散，节奏稳定。',
        roles: [{ seatId: 1, roleId: 'investigator', roleName: '调查员', team: 'townsfolk' }],
        demonBluffs: ['厨师', '守鸦人', '贤者'],
      },
      {
        id: 'setup-b',
        title: '反转局',
        summary: '身份变化更多。',
        roles: [{ seatId: 2, roleId: 'snake_charmer', roleName: '舞蛇人', team: 'townsfolk' }],
        demonBluffs: ['祖母', '博学者', '贤者'],
      },
    ],
  }
}

function nightSettlementBody() {
  return {
    scriptId: 'catfishing',
    knowledgeVersion: 'catfishing/test-v1',
    nightRunId: 'night-test',
    phaseLabel: '第3夜',
    playerCount: 12,
    wakeItem: {
      id: 'night-3-gambler',
      orderIndex: 2,
      seatId: 6,
      playerLabel: '6号玩家',
      roleId: 'gambler',
      roleName: '赌徒',
      ability: '每夜选择一名玩家并猜测其角色；猜错则死亡。',
      storytellerPrompt: '记录目标与猜测；死亡由说书人确认。',
      targetCount: 1,
      targetLabel: '玩家',
      roleLabel: '猜测身份',
    },
    draft: {
      targets: [8],
      roleChoice: 'chef',
      outcomeId: '',
      playerChoice: '选择8号 · 猜测身份：厨师',
      draftRevision: 2,
    },
    availableOutcomes: [
      { id: 'correct', label: '猜对 · 无事', ready: true, requiredInputs: ['targets', 'role'] },
      { id: 'wrong', label: '猜错 · 待死亡', ready: true, requiredInputs: ['targets', 'role'] },
    ],
  }
}

describe('AI proxy routes', () => {
  it('returns public settings without leaking the API key', async () => {
    const route = createRoutes({
      BOTC_AI_ENABLED: 'true',
      BOTC_AI_PROVIDER: 'openai-compatible',
      BOTC_AI_BASE_URL: 'https://ai.example.test/v1',
      BOTC_AI_MODEL: 'review-model',
      BOTC_AI_API_KEY: secret,
    })

    const response = await route(request('/api/settings/ai'))

    expect(response.status).toBe(200)
    const text = await response.text()
    expect(text).not.toContain(secret)
    const body = JSON.parse(text) as { settings: Record<string, unknown> }
    expect(body.settings.apiKeyConfigured).toBe(true)
    expect(body.settings).not.toHaveProperty('apiKey')
    expect(body.settings.baseUrl).toBe('/api/ai')
    expect(text).not.toContain('https://ai.example.test/v1')
    expect(text).not.toContain('review-model')
  })

  it('checks disabled settings without calling a provider', async () => {
    const route = createRoutes({})

    const response = await route(request('/api/settings/ai/test', { method: 'POST' }))
    const body = await jsonBody(response)

    expect(response.status).toBe(200)
    expect(body.ok).toBe(false)
    expect(body.code).toBe('AI_PROVIDER_DISABLED')
    expect(JSON.stringify(body)).not.toContain(secret)
  })

  it('checks configured settings without leaking the API key or calling a provider', async () => {
    const route = createRoutes({
      BOTC_AI_ENABLED: 'true',
      BOTC_AI_PROVIDER: 'openai-compatible',
      BOTC_AI_BASE_URL: 'https://ai.example.test/v1',
      BOTC_AI_MODEL: 'review-model',
      BOTC_AI_API_KEY: secret,
    })

    const response = await route(request('/api/settings/ai/test', { method: 'POST' }))
    const text = await response.text()

    expect(response.status).toBe(200)
    expect(text).not.toContain(secret)
    const body = JSON.parse(text) as Record<string, unknown>
    expect(body.ok).toBe(true)
    expect(body.code).toBe('AI_PROVIDER_READY')
    expect(body.message).toContain('未调用模型')
  })

  it.each(['', '{}', '  '])('tests only the fixed enabled server configuration with an empty request (%j)', async (requestBody) => {
    let calls = 0
    const fetcher: FetchLike = async (input, init) => {
      calls++
      expect(input).toBe('https://ai.example.test/v1/chat/completions')
      expect(JSON.parse(String(init?.body)).model).toBe('review-model')
      expect(init?.redirect).toBe('error')
      const headers = init?.headers as Record<string, string>
      expect(headers.Authorization).toBe(`Bearer ${secret}`)
      return new Response(JSON.stringify({
        choices: [{ message: { content: JSON.stringify({ ok: true, message: 'ready' }) } }],
      }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }
    const route = createAIProxyRoutes(createAIProxyHandlers({ env: configuredEnv, fetcher }))

    const response = await route(request('/api/settings/ai/live-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: requestBody,
    }))
    const text = await response.text()

    expect(response.status).toBe(200)
    expect(text).not.toContain(secret)
    const body = JSON.parse(text) as Record<string, unknown>
    expect(body.ok).toBe(true)
    expect(body.code).toBe('AI_PROVIDER_READY')
    expect(body.message).toContain('JSON')
    expect(calls).toBe(1)
  })

  it.each(['BOTC_AI_BASE_URL', 'BOTC_AI_MODEL', 'BOTC_AI_API_KEY'])('does not test an incomplete server configuration without %s', async (field) => {
    let called = false
    const fetcher: FetchLike = async () => {
      called = true
      return new Response('{}')
    }
    const route = createAIProxyRoutes(createAIProxyHandlers({ env: { ...configuredEnv, [field]: '' }, fetcher }))

    const response = await route(request('/api/settings/ai/live-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    }))
    const body = await jsonBody(response)

    expect(response.status).toBe(200)
    expect(body.ok).toBe(false)
    expect(body.code).toBe('AI_PROVIDER_UNCONFIGURED')
    expect(called).toBe(false)
  })

  it('does not call a provider when disabled even if every server credential exists', async () => {
    let calls = 0
    const route = createAIProxyRoutes(createAIProxyHandlers({
      env: { ...configuredEnv, BOTC_AI_ENABLED: 'false' },
      fetcher: async () => { calls++; throw new Error(secret) },
    }))
    const response = await route(request('/api/settings/ai/live-test', { method: 'POST', body: '{}' }))
    expect(response.status).toBe(200)
    const body = await jsonBody(response)
    expect(body).toMatchObject({ ok: false, provider: 'fake', code: 'AI_PROVIDER_DISABLED' })
    expect(JSON.stringify(body)).not.toContain(secret)
    expect(calls).toBe(0)
  })

  it.each([
    { provider: 'openai-compatible' },
    { baseUrl: 'https://untrusted.example.test/v1' },
    { model: 'untrusted-model' },
    { apiKey: secret },
    { timeoutSeconds: 120 },
    { unknown: 'ignored overrides are not allowed' },
    { provider: 'openai-compatible', baseUrl: 'https://untrusted.example.test/v1' },
    null, [], 'string', true, 1,
  ])('rejects any client live-test configuration or non-object body before calling a provider (%j)', async (body) => {
    let calls = 0
    const route = createAIProxyRoutes(createAIProxyHandlers({
      env: configuredEnv, fetcher: async () => { calls++; throw new Error(secret) },
    }))
    const response = await route(request('/api/settings/ai/live-test', { method: 'POST', body: JSON.stringify(body) }))
    expect(response.status).toBe(400)
    const text = await response.text()
    expect(text).not.toContain(secret)
    expect(JSON.parse(text).error.code).toBe('BAD_REQUEST')
    expect(calls).toBe(0)
  })

  it('does not expose server credentials when the configured live provider fails', async () => {
    const route = createAIProxyRoutes(createAIProxyHandlers({
      env: configuredEnv, fetcher: async () => { throw new Error(secret) },
    }))
    const response = await route(request('/api/settings/ai/live-test', { method: 'POST', body: '{}' }))
    const text = await response.text()
    expect(text).not.toContain(secret)
    expect(JSON.parse(text)).toMatchObject({ ok: false, code: 'AI_PROVIDER_UNAVAILABLE' })
  })

  it('does not fall back to env credentials when live test JSON is malformed', async () => {
    let called = false
    const fetcher: FetchLike = async () => {
      called = true
      return new Response('{}')
    }
    const route = createAIProxyRoutes(createAIProxyHandlers({
      env: {
        BOTC_AI_ENABLED: 'true',
        BOTC_AI_PROVIDER: 'openai-compatible',
        BOTC_AI_BASE_URL: 'https://ai.example.test/v1',
        BOTC_AI_MODEL: 'review-model',
        BOTC_AI_API_KEY: secret,
      },
      fetcher,
    }))

    const response = await route(request('/api/settings/ai/live-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{bad json',
    }))
    const body = await jsonBody(response)

    expect(response.status).toBe(400)
    expect((body.error as { code: string }).code).toBe('BAD_REQUEST')
    expect(called).toBe(false)
  })

  it('returns BAD_REQUEST for unknown AI settings routes', async () => {
    const route = createRoutes({})

    const response = await route(request('/api/settings/ai/unknown'))
    const body = await jsonBody(response)

    expect(response.status).toBe(404)
    expect((body.error as { code: string }).code).toBe('BAD_REQUEST')
  })

  it('returns local setup advice when provider is disabled', async () => {
    const route = createRoutes({})

    const response = await route(request('/api/ai/setup-advice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(setupAdviceBody()),
    }))
    const body = await jsonBody(response)
    const draft = ((body.data as Record<string, unknown>).draft as Record<string, unknown>)

    expect(response.status).toBe(200)
    expect(body.accepted).toBe(true)
    expect(draft.provider).toBe('fake')
    expect(draft.draftOnly).toBe(true)
    expect(draft.recommendedCandidateIds).toEqual(['setup-a', 'setup-b'])
  })

  it('can call setup advice provider through injected fetch without leaking the key', async () => {
    const fetcher: FetchLike = async (_input, init) => {
      const headers = init?.headers as Record<string, string>
      expect(String(init?.body)).not.toContain(secret)
      expect(headers.Authorization).toBe(`Bearer ${secret}`)
      return new Response(JSON.stringify({
        choices: [{ message: { content: JSON.stringify({
          confidence: 'medium',
          recommendedCandidateIds: ['setup-b', 'not-real'],
          warnings: ['先核对舞蛇人交换后的醉酒状态。'],
          reasons: ['熟练座更多，反转候选更合适。'],
          disclaimer: 'AI 只给草稿。',
        }) } }],
      }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }
    const route = createAIProxyRoutes(createAIProxyHandlers({
      env: {
        BOTC_AI_ENABLED: 'true',
        BOTC_AI_PROVIDER: 'openai-compatible',
        BOTC_AI_BASE_URL: 'https://ai.example.test/v1',
        BOTC_AI_MODEL: 'setup-model',
        BOTC_AI_API_KEY: secret,
      },
      fetcher,
    }))

    const response = await route(request('/api/ai/setup-advice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(setupAdviceBody()),
    }))
    const text = await response.text()
    const body = JSON.parse(text) as Record<string, unknown>
    const draft = ((body.data as Record<string, unknown>).draft as Record<string, unknown>)

    expect(response.status).toBe(200)
    expect(text).not.toContain(secret)
    expect(draft.provider).toBe('openai-compatible')
    expect(draft.recommendedCandidateIds).toEqual(['setup-b'])
  })

  it('rejects malformed setup advice requests before provider calls', async () => {
    let called = false
    const route = createAIProxyRoutes(createAIProxyHandlers({
      env: {
        BOTC_AI_ENABLED: 'true',
        BOTC_AI_PROVIDER: 'openai-compatible',
        BOTC_AI_BASE_URL: 'https://ai.example.test/v1',
        BOTC_AI_MODEL: 'setup-model',
        BOTC_AI_API_KEY: secret,
      },
      fetcher: async () => {
        called = true
        return new Response('{}')
      },
    }))

    const response = await route(request('/api/ai/setup-advice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scriptId: 'catfishing' }),
    }))
    const body = await jsonBody(response)

    expect(response.status).toBe(400)
    expect((body.error as { code: string }).code).toBe('BAD_REQUEST')
    expect(called).toBe(false)
  })

  it('asks for a manual night outcome when provider is disabled', async () => {
    const route = createRoutes({})

    const response = await route(request('/api/ai/night-settlement-advice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nightSettlementBody()),
    }))
    const body = await jsonBody(response)
    const draft = ((body.data as Record<string, unknown>).draft as Record<string, unknown>)

    expect(response.status).toBe(200)
    expect(body.accepted).toBe(true)
    expect(draft.provider).toBe('fake')
    expect(draft.draftOnly).toBe(true)
    expect(draft.status).toBe('needs_input')
    expect(draft.recommendedOutcomeId).toBeUndefined()
  })

  it('can call night settlement provider through injected fetch without leaking the key', async () => {
    const fetcher: FetchLike = async (_input, init) => {
      const headers = init?.headers as Record<string, string>
      expect(String(init?.body)).not.toContain(secret)
      expect(headers.Authorization).toBe(`Bearer ${secret}`)
      return new Response(JSON.stringify({
        choices: [{ message: { content: JSON.stringify({
          status: 'answer',
          confidence: 'medium',
          recommendedOutcomeId: 'wrong',
          summary: '赌徒猜错时只生成死亡草稿。',
          ruleFacts: ['说书人确认前不改死亡。'],
          missing: [],
          warnings: ['核对实际身份。'],
          disclaimer: 'AI 只给草稿。',
        }) } }],
      }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }
    const route = createAIProxyRoutes(createAIProxyHandlers({
      env: {
        BOTC_AI_ENABLED: 'true',
        BOTC_AI_PROVIDER: 'openai-compatible',
        BOTC_AI_BASE_URL: 'https://ai.example.test/v1',
        BOTC_AI_MODEL: 'night-model',
        BOTC_AI_API_KEY: secret,
      },
      fetcher,
    }))

    const response = await route(request('/api/ai/night-settlement-advice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nightSettlementBody()),
    }))
    const text = await response.text()
    const body = JSON.parse(text) as Record<string, unknown>
    const draft = ((body.data as Record<string, unknown>).draft as Record<string, unknown>)

    expect(response.status).toBe(200)
    expect(text).not.toContain(secret)
    expect(draft.provider).toBe('openai-compatible')
    expect(draft.recommendedOutcomeId).toBe('wrong')
    expect(draft.disclaimer).toContain('草稿')
  })

  it('rejects malformed night settlement requests before provider calls', async () => {
    let called = false
    const route = createAIProxyRoutes(createAIProxyHandlers({
      env: {
        BOTC_AI_ENABLED: 'true',
        BOTC_AI_PROVIDER: 'openai-compatible',
        BOTC_AI_BASE_URL: 'https://ai.example.test/v1',
        BOTC_AI_MODEL: 'night-model',
        BOTC_AI_API_KEY: secret,
      },
      fetcher: async () => {
        called = true
        return new Response('{}')
      },
    }))

    const response = await route(request('/api/ai/night-settlement-advice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scriptId: 'catfishing' }),
    }))
    const body = await jsonBody(response)

    expect(response.status).toBe(400)
    expect((body.error as { code: string }).code).toBe('BAD_REQUEST')
    expect(called).toBe(false)
  })
})
