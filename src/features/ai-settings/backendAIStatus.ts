import type { BadgeTone } from '../../components/ui/StatusBadge'
import type { ArchiveRuntimeSettings } from '../../services/archive'
import type { AISettings } from '../../services/settings'

export type BackendAIStatus = {
  tone: BadgeTone
  message: string
}

type PublicBackendAISettings = {
  mode: 'off' | 'backend_proxy'
  model?: string
  apiKeyConfigured: boolean
}

async function fetchWithTimeout(input: string, timeoutMs: number, init?: RequestInit) {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(input, { ...init, signal: controller.signal })
  } finally {
    window.clearTimeout(timeoutId)
  }
}

function backendUrl(baseUrl: string, pathname: string) {
  return `${baseUrl.replace(/\/$/, '')}${pathname}`
}

export async function readBackendAIStatus(settings: ArchiveRuntimeSettings): Promise<BackendAIStatus> {
  if (settings.mode !== 'http') {
    return { tone: 'neutral', message: '本机模式：AI 使用本地草稿。' }
  }

  try {
    const response = await fetchWithTimeout(backendUrl(settings.baseUrl, '/api/settings/ai'), settings.timeoutMs)
    const body = await response.json() as { settings?: PublicBackendAISettings }
    const backendSettings = body.settings
    if (!response.ok || !backendSettings || backendSettings.mode === 'off') {
      return { tone: 'neutral', message: '后端 AI 未启用；当前使用本地草稿。' }
    }
    return {
      tone: backendSettings.apiKeyConfigured ? 'success' : 'warning',
      message: `${backendSettings.model ?? '未设置模型'} · ${backendSettings.apiKeyConfigured ? '后端 Key 已配置' : '后端缺少 Key'}`,
    }
  } catch {
    return { tone: 'warning', message: '无法读取后端 AI 状态；请确认后端已启动。' }
  }
}

export async function testBackendAIConnection(settings: ArchiveRuntimeSettings): Promise<BackendAIStatus> {
  try {
    const response = await fetchWithTimeout(backendUrl(settings.baseUrl, '/api/settings/ai/test'), settings.timeoutMs, {
      method: 'POST',
    })
    const body = await response.json() as { ok?: boolean; code?: string; message?: string }
    return {
      tone: body.ok ? 'success' : 'warning',
      message: body.message ?? body.code ?? '后端 AI 配置检查完成。',
    }
  } catch {
    return { tone: 'warning', message: '后端 AI 配置检查失败；仍可使用本地草稿。' }
  }
}

function canSendSecretTo(baseUrl: string) {
  try {
    const url = new URL(baseUrl)
    return url.protocol === 'https:' || url.hostname === '127.0.0.1' || url.hostname === 'localhost' || url.hostname === '::1'
  } catch {
    return false
  }
}

export async function testLiveAIConnection(
  runtimeSettings: ArchiveRuntimeSettings,
  aiSettings: AISettings,
  apiKey: string,
): Promise<BackendAIStatus> {
  if (!canSendSecretTo(runtimeSettings.baseUrl)) {
    return { tone: 'warning', message: '真实连通测试需要本机地址或 HTTPS 后端。' }
  }
  if (aiSettings.mode === 'off') {
    return { tone: 'neutral', message: 'AI 已关闭，未发起真实请求。' }
  }
  if (aiSettings.mode === 'openai-compatible' && (!aiSettings.baseUrl.trim() || !aiSettings.model.trim() || !apiKey.trim())) {
    return { tone: 'warning', message: '请先填写接入地址、模型和 API KEY。' }
  }

  const payload = aiSettings.mode === 'backend'
    ? {}
    : {
        provider: 'openai-compatible',
        baseUrl: aiSettings.baseUrl,
        model: aiSettings.model,
        apiKey,
        timeoutSeconds: aiSettings.timeoutSeconds,
      }

  try {
    const response = await fetchWithTimeout(backendUrl(runtimeSettings.baseUrl, '/api/settings/ai/live-test'), runtimeSettings.timeoutMs, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const body = await response.json() as { ok?: boolean; code?: string; message?: string }
    return {
      tone: body.ok ? 'success' : 'warning',
      message: body.message ?? body.code ?? '真实连通测试完成。',
    }
  } catch {
    return { tone: 'warning', message: '真实连通失败；请确认后端已启动，且地址、模型、Key 有效。' }
  }
}
