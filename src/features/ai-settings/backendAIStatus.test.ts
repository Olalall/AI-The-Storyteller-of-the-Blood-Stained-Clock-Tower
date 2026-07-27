import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ArchiveRuntimeSettings } from '../../services/archive'
import { defaultAISettings } from '../../services/settings'
import { readBackendAIStatus, testBackendAIConnection, testLiveAIConnection } from './backendAIStatus'

const localRuntime: ArchiveRuntimeSettings = {
  mode: 'local',
  baseUrl: 'http://127.0.0.1:8787',
  timeoutMs: 2000,
}

describe('backend AI status helpers', () => {
  beforeEach(() => window.localStorage.clear())

  it('reads backend AI availability without exposing secrets', async () => {
    const fetchSpy = vi.spyOn(window, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      settings: {
        mode: 'backend_proxy',
        provider: 'openai-compatible',
        model: 'MiniMax-M3',
        apiKeyConfigured: true,
      },
    })))

    const result = await readBackendAIStatus({ ...localRuntime, mode: 'http' })

    expect(fetchSpy).toHaveBeenCalledWith('http://127.0.0.1:8787/api/settings/ai', expect.any(Object))
    expect(result).toMatchObject({ tone: 'success' })
    expect(result.message).toContain('MiniMax-M3')
    expect(result.message).toContain('后端 Key 已配置')
    expect(JSON.stringify(result)).not.toContain('sk-')
    fetchSpy.mockRestore()
  })

  it('reports backend restart or offline state clearly', async () => {
    const fetchSpy = vi.spyOn(window, 'fetch').mockRejectedValue(new Error('offline'))

    const result = await testBackendAIConnection({ ...localRuntime, mode: 'http' })

    expect(result.tone).toBe('warning')
    expect(result.message).toContain('后端 AI 配置检查失败')
    fetchSpy.mockRestore()
  })

  it('does not send a temporary key to an unsafe backend URL', async () => {
    const fetchSpy = vi.spyOn(window, 'fetch')

    const result = await testLiveAIConnection({
      ...localRuntime,
      baseUrl: 'http://example.test:8787',
    }, {
      ...defaultAISettings,
      mode: 'openai-compatible',
      baseUrl: 'https://ai.example.test/v1',
      model: 'review-model',
    }, 'sk-should-not-send')

    expect(result.tone).toBe('warning')
    expect(fetchSpy).not.toHaveBeenCalled()
    fetchSpy.mockRestore()
  })

  it('sends a one-off live test to a local backend without persisting the key', async () => {
    const secret = 'sk-temporary-live-test'
    const fetchSpy = vi.spyOn(window, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      ok: true,
      code: 'AI_PROVIDER_READY',
      message: '真实连通成功；模型已返回可解析 JSON。',
    })))

    const result = await testLiveAIConnection(localRuntime, {
      ...defaultAISettings,
      mode: 'openai-compatible',
      baseUrl: 'https://ai.example.test/v1',
      model: 'review-model',
    }, secret)

    const [, init] = fetchSpy.mock.calls[0]
    const body = JSON.parse((init as RequestInit).body as string) as Record<string, unknown>
    expect(body.apiKey).toBe(secret)
    expect(window.localStorage.length).toBe(0)
    expect(result).toMatchObject({ tone: 'success' })
    fetchSpy.mockRestore()
  })
})
