import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ArchiveRuntimeSettings } from '../../services/archive'
import { gameSessionStorageKey } from '../../services/session'
import { readBackendAIStatus, setBackendAIAccess, testBackendAIConnection, testLiveAIConnection } from './backendAIStatus'

const localRuntime: ArchiveRuntimeSettings = { mode: 'local', baseUrl: 'http://127.0.0.1:8787', timeoutMs: 2000 }
const httpRuntime: ArchiveRuntimeSettings = { ...localRuntime, mode: 'http' }
const readySettings = {
  mode: 'backend_proxy', provider: 'openai-compatible', model: 'configured-model', baseUrl: 'https://ai.example.test/v1',
  apiKeyConfigured: true, timeoutSeconds: 30, contextLimit: 12000,
}

function respond(body: unknown, status = 200) {
  return vi.spyOn(window, 'fetch').mockResolvedValue(new Response(JSON.stringify(body), { status }))
}

describe('backend AI status helpers', () => {
  beforeEach(() => window.localStorage.clear())
  afterEach(() => vi.restoreAllMocks())

  it('reports a configured private model as locked until the device is verified', async () => {
    respond({ settings: readySettings, access: { required: true, authorized: false } })
    expect(await readBackendAIStatus(httpRuntime)).toMatchObject({ state: 'locked', accessRequired: true, accessAuthorized: false, model: 'configured-model' })
  })

  it('shows verification errors, sends no game data and can cancel only this device access', async () => {
    const fetchSpy = respond({ error: { message: '访问口令不正确。' } }, 401)
    expect(await setBackendAIAccess(httpRuntime, 'fake-passcode')).toMatchObject({ tone: 'warning', message: '访问口令不正确。' })
    expect(fetchSpy).toHaveBeenLastCalledWith('http://127.0.0.1:8787/api/settings/ai/access', expect.objectContaining({ method: 'POST', body: '{"passcode":"fake-passcode"}' }))
    fetchSpy.mockResolvedValue(new Response('{"ok":true}'))
    expect((await setBackendAIAccess(httpRuntime)).tone).toBe('success')
    expect(fetchSpy).toHaveBeenLastCalledWith('http://127.0.0.1:8787/api/settings/ai/access', expect.objectContaining({ method: 'DELETE' }))
    expect(fetchSpy.mock.calls.at(-1)?.[1]?.body).toBeUndefined()
  })

  it('reports local candidates without contacting a backend or model', async () => {
    const fetchSpy = vi.spyOn(window, 'fetch')
    for (const action of [readBackendAIStatus, testBackendAIConnection, testLiveAIConnection]) {
      expect(await action(localRuntime)).toMatchObject({ state: 'local', tone: 'neutral' })
    }
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('reads the effective backend model and parameters without exposing credentials', async () => {
    const fetchSpy = respond({ settings: { ...readySettings, apiKey: 'must-not-be-returned' } })
    const result = await readBackendAIStatus(httpRuntime)
    expect(fetchSpy).toHaveBeenCalledWith('http://127.0.0.1:8787/api/settings/ai', expect.any(Object))
    expect(result).toMatchObject({ state: 'ready', tone: 'success', model: 'configured-model', timeoutSeconds: 30, contextLimit: 12000 })
    expect(result.message).toContain('尚未验证真实调用')
    expect(JSON.stringify(result)).not.toContain('must-not-be-returned')
    expect(JSON.stringify(result)).not.toContain('https://ai.example.test')
  })

  it('distinguishes disabled AI from incomplete configuration and names the fallback', async () => {
    respond({ settings: { ...readySettings, mode: 'off' } })
    const disabled = await readBackendAIStatus(httpRuntime)
    expect(disabled).toMatchObject({ state: 'off', tone: 'neutral' })
    expect(disabled.model).toBeUndefined()
    vi.restoreAllMocks()
    respond({ settings: { ...readySettings, model: '', apiKeyConfigured: false } })
    const missing = await readBackendAIStatus(httpRuntime)
    expect(missing).toMatchObject({ state: 'incomplete', tone: 'warning' })
    expect(missing.message).toContain('模型、密钥')
    expect(missing.message).toContain('本地候选')
  })

  it('does not label an HTTP error or malformed status as disabled AI', async () => {
    for (const [body, status] of [[{ settings: readySettings }, 503], [{ settings: {} }, 200], [null, 200]] as const) {
      vi.restoreAllMocks()
      respond(body, status)
      expect(await readBackendAIStatus(httpRuntime)).toMatchObject({ state: 'unavailable', tone: 'warning' })
    }
  })

  it('does not report a fake or unsupported provider as ready even when all model fields are present', async () => {
    respond({ settings: { ...readySettings, provider: 'fake' } })
    const fake = await readBackendAIStatus(httpRuntime)
    expect(fake).toMatchObject({ state: 'incomplete', tone: 'warning' })
    expect(fake.message).toContain('不会调用真实模型')
    vi.restoreAllMocks()
    respond({ settings: { ...readySettings, provider: 'unknown' } })
    expect(await readBackendAIStatus(httpRuntime)).toMatchObject({ state: 'unavailable', tone: 'warning' })
  })

  it('reports backend restart or offline state clearly', async () => {
    vi.spyOn(window, 'fetch').mockRejectedValue(new Error('offline'))
    expect(await readBackendAIStatus(httpRuntime)).toMatchObject({ state: 'unavailable', tone: 'warning' })
    const result = await testBackendAIConnection(httpRuntime)
    expect(result.message).toContain('后端 AI 配置检查失败')
  })

  it('uses the non-model configuration check endpoint and honors HTTP failures', async () => {
    const fetchSpy = respond({ ok: true, message: '检查配置，未调用模型。' }, 503)
    const result = await testBackendAIConnection(httpRuntime)
    expect(fetchSpy).toHaveBeenCalledWith('http://127.0.0.1:8787/api/settings/ai/test', expect.objectContaining({ method: 'POST' }))
    expect(result.tone).toBe('warning')
  })

  it('refuses a live request to an insecure remote backend', async () => {
    const fetchSpy = vi.spyOn(window, 'fetch')
    const result = await testLiveAIConnection({ ...httpRuntime, baseUrl: 'http://example.test:8787' })
    expect(result.tone).toBe('warning')
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('tests only the backend model, with no temporary configuration, game state or storage writes', async () => {
    window.localStorage.setItem(gameSessionStorageKey, 'private-current-session')
    const fetchSpy = respond({ ok: true, message: '真实连通成功。' })
    const result = await testLiveAIConnection(httpRuntime)
    expect(fetchSpy).toHaveBeenCalledWith('http://127.0.0.1:8787/api/settings/ai/live-test', expect.objectContaining({ method: 'POST', body: '{}' }))
    expect(window.localStorage.length).toBe(1)
    expect(window.localStorage.getItem(gameSessionStorageKey)).toBe('private-current-session')
    expect(result.tone).toBe('success')
  })
})
