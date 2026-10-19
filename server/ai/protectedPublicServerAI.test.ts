import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createArchiveRuntime } from '../runtime'
import { createAIProxyHandlers } from './aiProxyHandlers'
import { createAIProxyRoutes } from './aiProxyRoutes'
import type { SetupAdviceProviderRequest } from './types'

const passcode = 'synthetic-invited-device-passcode-for-tests'
const serverKey = 'synthetic-server-key-for-tests'
const env = {
  BOTC_PUBLIC_ACCESS_MODE: 'true',
  BOTC_AI_ENABLED: 'true',
  BOTC_AI_PROVIDER: 'openai-compatible',
  BOTC_AI_BASE_URL: 'https://server-provider.example.test/v1',
  BOTC_AI_MODEL: 'fixed-test-model',
  BOTC_AI_API_KEY: serverKey,
  BOTC_AI_TIMEOUT_MS: '90000',
  BOTC_AI_ACCESS_SECRET: passcode,
  BOTC_AI_PUBLIC_ORIGIN: 'https://botc.example.test',
}
const input: SetupAdviceProviderRequest = {
  scriptId: 'trouble-brewing', scriptName: '暗流涌动', knowledgeVersion: 'test', playerCount: 7,
  seats: [{ seatId: 1, nickname: '玩家1' }],
  candidates: [{ id: 'candidate-a', title: '隔离测试配板', summary: '仅使用虚构配置和模拟模型。', roles: [{ seatId: 1, roleId: 'chef', roleName: '厨师', team: 'townsfolk' }], demonBluffs: ['守鸦人', '士兵', '僧侣'] }],
}
const tempDirs: string[] = []

function request(pathname: string, init: RequestInit = {}) {
  return new Request(`https://botc.example.test${pathname}`, init)
}

function providerResponse() {
  return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({
    ok: true, confidence: 'medium', recommendedCandidateIds: ['candidate-a'], warnings: [], reasons: ['仅为隔离测试草稿'],
  }) } }] }))
}

function mockProvider() {
  return vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => providerResponse())
}

async function authorize(route: ReturnType<typeof createAIProxyRoutes>) {
  const response = await route(request('/api/settings/ai/access', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ passcode }),
  }))
  expect(response.status).toBe(200)
  const cookie = response.headers.get('set-cookie')!
  expect(cookie).toContain('HttpOnly; SameSite=Strict')
  expect(cookie).toContain('; Secure')
  return cookie.split(';')[0]
}

afterEach(async () => {
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
  await Promise.all(tempDirs.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
})

describe('invited fixed-server AI in public runtime mode', () => {
  it('preserves the public settings DTO and configuration check without exposing keys or invoking AI', async () => {
    const fetcher = mockProvider()
    const route = createAIProxyRoutes(createAIProxyHandlers({ env, fetcher }), { env })
    const response = await route(request('/api/settings/ai'))
    const text = await response.text()
    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(JSON.parse(text)).toMatchObject({
      settings: { mode: 'backend_proxy', provider: 'openai-compatible', model: 'fixed-test-model', timeoutSeconds: 90, apiKeyConfigured: true },
      access: { required: true, authorized: false, rememberDays: 30 },
    })
    expect(JSON.parse(text).settings).not.toHaveProperty('apiKey')
    expect(text).not.toContain(serverKey)
    expect(text).not.toContain(passcode)
    const check = await route(request('/api/settings/ai/test', { method: 'POST' }))
    expect(await check.json()).toMatchObject({ ok: true, code: 'AI_PROVIDER_READY', model: 'fixed-test-model' })
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('guards anonymous and cross-site requests, then serves authorized setup advice with the fixed configuration and no override', async () => {
    const fetcher = mockProvider()
    const route = createAIProxyRoutes(createAIProxyHandlers({ env, fetcher }), { env })
    for (const pathname of ['/api/settings/ai/live-test', '/api/ai/setup-advice', '/api/ai/night-settlement-advice']) {
      expect((await route(request(pathname, { method: 'POST', body: '{}' }))).status).toBe(401)
    }
    expect(fetcher).not.toHaveBeenCalled()
    const cookie = await authorize(route)
    const crossSite = await route(request('/api/ai/setup-advice', {
      method: 'POST', headers: { Cookie: cookie, Origin: 'https://other.example.test', 'Sec-Fetch-Site': 'cross-site' }, body: JSON.stringify(input),
    }))
    expect(crossSite.status).toBe(403)
    expect(fetcher).not.toHaveBeenCalled()
    const response = await route(request('/api/ai/setup-advice', { method: 'POST', headers: { Cookie: cookie }, body: JSON.stringify(input) }))
    const text = await response.text()
    expect(response.status).toBe(200)
    expect(JSON.parse(text)).toMatchObject({ accepted: true, data: { draft: { provider: 'openai-compatible', recommendedCandidateIds: ['candidate-a'] } } })
    expect(fetcher).toHaveBeenCalledExactlyOnceWith('https://server-provider.example.test/v1/chat/completions', expect.objectContaining({
      redirect: 'error', headers: expect.objectContaining({ Authorization: `Bearer ${serverKey}` }),
    }))
    const sent = JSON.parse(String(fetcher.mock.calls[0][1]?.body))
    expect(sent.model).toBe('fixed-test-model')
    expect(JSON.stringify(sent)).not.toContain(serverKey)
    expect(text).not.toContain(serverKey)
    expect(text).not.toContain(passcode)
    const status = await route(request('/api/settings/ai', { headers: { Cookie: cookie } }))
    expect((await status.json()).access).toMatchObject({ required: true, authorized: true, rememberDays: 30 })
  })

  it.each([undefined, '', ' '.repeat(40), 'x'.repeat(31), ` ${'x'.repeat(31)} `])('keeps server configuration hidden and live tests offline without a sufficiently long invitation secret (%j)', async (secret) => {
    const fetcher = mockProvider()
    const handlers = createAIProxyHandlers({ env: { ...env, BOTC_AI_ACCESS_SECRET: secret }, fetcher })
    expect(handlers.getPublicSettings()).toMatchObject({ mode: 'off', provider: 'fake', apiKeyConfigured: false })
    expect(JSON.stringify(handlers.getPublicSettings())).not.toContain('server-provider')
    expect(handlers.testProviderSettings()).toMatchObject({ ok: false, code: 'AI_PROVIDER_DISABLED' })
    expect(await handlers.liveTestProviderSettings()).toMatchObject({ ok: false, code: 'AI_PROVIDER_DISABLED' })
    expect((await handlers.generateSetupAdvice(input)).provider).toBe('fake')
    expect(fetcher).not.toHaveBeenCalled()
  })

  it.each(['x'.repeat(32), ` ${'x'.repeat(32)} `])('accepts a complete fixed configuration at the trimmed invitation boundary (%j)', (secret) => {
    const handlers = createAIProxyHandlers({ env: { ...env, BOTC_AI_ACCESS_SECRET: secret }, fetcher: mockProvider() })
    expect(handlers.getPublicSettings()).toMatchObject({ mode: 'backend_proxy', model: 'fixed-test-model', timeoutSeconds: 90, apiKeyConfigured: true })
  })

  it('uses the same fixed resolver for an authorized live-test request', async () => {
    const fetcher = mockProvider()
    const route = createAIProxyRoutes(createAIProxyHandlers({ env, fetcher }), { env })
    const cookie = await authorize(route)
    const response = await route(request('/api/settings/ai/live-test', { method: 'POST', headers: { Cookie: cookie }, body: '{}' }))
    expect(await response.json()).toMatchObject({ ok: true, code: 'AI_PROVIDER_READY', model: 'fixed-test-model' })
    expect(fetcher).toHaveBeenCalledExactlyOnceWith('https://server-provider.example.test/v1/chat/completions', expect.objectContaining({ redirect: 'error' }))
  })

  it.each(['BOTC_AI_BASE_URL', 'BOTC_AI_MODEL', 'BOTC_AI_API_KEY', 'BOTC_AI_ENABLED'])('does not publish or use an incomplete fixed configuration without %s', async (field) => {
    const fetcher = mockProvider()
    const handlers = createAIProxyHandlers({ env: { ...env, [field]: '' }, fetcher })
    expect(handlers.getPublicSettings()).toMatchObject({ mode: 'off', provider: 'fake', apiKeyConfigured: false })
    expect(await handlers.liveTestProviderSettings()).toMatchObject({ ok: false, code: 'AI_PROVIDER_DISABLED' })
    expect(fetcher).not.toHaveBeenCalled()
  })

  it.each(['http://browser-provider.example.test/v1', 'https://unlisted.example.test/v1', 'https://127.0.0.1/v1'])('rejects unsafe BYOK overrides even when fixed server AI is available (%s)', async (baseUrl) => {
    const fetcher = mockProvider()
    const handlers = createAIProxyHandlers({ env, fetcher, publicAccess: { allowedProviderHostnames: ['browser-provider.example.test', '127.0.0.1'] } })
    const draft = await handlers.generateSetupAdvice({ ...input, providerSettings: { provider: 'openai-compatible', baseUrl, model: 'browser-test-model', apiKey: 'synthetic-browser-key' } })
    expect(draft.provider).toBe('fake')
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('keeps allowed BYOK requests separate from fixed credentials and disables redirects', async () => {
    const fetcher = mockProvider()
    const handlers = createAIProxyHandlers({ env, fetcher, publicAccess: { allowedProviderHostnames: ['browser-provider.example.test'] } })
    const draft = await handlers.generateSetupAdvice({ ...input, providerSettings: {
      provider: 'openai-compatible', baseUrl: 'https://browser-provider.example.test/v1', model: 'browser-test-model', apiKey: 'synthetic-browser-key',
    } })
    expect(draft.provider).toBe('openai-compatible')
    expect(fetcher).toHaveBeenCalledExactlyOnceWith('https://browser-provider.example.test/v1/chat/completions', expect.objectContaining({
      redirect: 'error', headers: expect.objectContaining({ Authorization: 'Bearer synthetic-browser-key' }),
    }))
    expect(String(fetcher.mock.calls[0][1]?.body)).not.toContain(serverKey)
    expect(String(fetcher.mock.calls[0][1]?.body)).not.toContain('synthetic-browser-key')
    expect(JSON.parse(String(fetcher.mock.calls[0][1]?.body)).model).toBe('browser-test-model')
  })

  it('rejects an incomplete BYOK override instead of falling back to the fixed server key', async () => {
    const fetcher = mockProvider()
    const handlers = createAIProxyHandlers({ env, fetcher, publicAccess: { allowedProviderHostnames: ['browser-provider.example.test'] } })
    const draft = await handlers.generateSetupAdvice({ ...input, providerSettings: {
      provider: 'openai-compatible', baseUrl: 'https://browser-provider.example.test/v1', model: 'browser-test-model', apiKey: '',
    } })
    expect(draft.provider).toBe('fake')
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('keeps public archive and recovery routes forbidden even after device authorization', async () => {
    for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value)
    const fetcher = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network must remain unused'))
    const directory = await mkdtemp(path.join(os.tmpdir(), 'botc-public-fixed-ai-'))
    tempDirs.push(directory)
    const route = createArchiveRuntime({ publicAccessMode: true, dataFile: path.join(directory, 'archives.json'), recoveryDataFile: path.join(directory, 'recovery.json') })
    const settings = await route(request('/api/settings/ai'))
    expect((await settings.json()).settings).toMatchObject({ mode: 'backend_proxy', model: 'fixed-test-model', timeoutSeconds: 90 })
    const cookie = await authorize(route)
    for (const pathname of ['/api/archives', '/api/recovery/snapshots']) {
      for (const method of ['GET', 'POST']) {
        const response = await route(request(pathname, { method, headers: { Cookie: cookie }, ...(method === 'POST' ? { body: '{}' } : {}) }))
        expect(response.status).toBe(403)
        expect(await response.json()).toMatchObject({ error: { code: 'PUBLIC_API_FORBIDDEN' } })
      }
    }
    expect((await route(request('/healthz'))).status).toBe(200)
    expect(fetcher).not.toHaveBeenCalled()
  })
})
