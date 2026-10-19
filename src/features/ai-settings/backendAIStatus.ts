import type { BadgeTone } from '../../components/ui/StatusBadge'
import type { AIRuntimeSettings } from '../../services/ai/aiRuntimeSettings'
import { modelRequestTimeoutMs } from '../../services/ai/modelRequestTimeout'

export type BackendAIStatus = {
  tone: BadgeTone
  message: string
  state?: 'local' | 'off' | 'ready' | 'locked' | 'incomplete' | 'unavailable'
  accessRequired?: boolean
  accessAuthorized?: boolean
  label?: string
  model?: string
  timeoutSeconds?: number
  contextLimit?: number
}

type PublicBackendAISettings = {
  mode: 'off' | 'backend_proxy'
  provider: 'fake' | 'openai-compatible'
  model?: string
  baseUrl?: string
  apiKeyConfigured: boolean
  timeoutSeconds?: number
  contextLimit?: number
}

const localStatus: BackendAIStatus = { tone: 'neutral', state: 'local', label: '本地候选', message: '当前页面使用本地候选，未连接真实模型。' }
const unavailableStatus: BackendAIStatus = { tone: 'warning', state: 'unavailable', label: '状态未知', message: '无法读取后端 AI 配置，当前无法确认模型状态；请检查后端连接。' }

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

export async function readBackendAIStatus(settings: AIRuntimeSettings): Promise<BackendAIStatus> {
  if (settings.mode !== 'http') return localStatus

  try {
    const response = await fetchWithTimeout(backendUrl(settings.baseUrl, '/api/settings/ai'), settings.timeoutMs)
    const body = await response.json() as { settings?: PublicBackendAISettings; access?: { required?: boolean; authorized?: boolean } }
    const backend = body.settings
    if (!response.ok || !backend || (backend.mode !== 'off' && backend.mode !== 'backend_proxy')) return unavailableStatus
    if (backend.mode === 'off') {
      return { tone: 'neutral', state: 'off', label: 'AI 未启用', message: '后端 AI 未启用，配板和夜间推荐使用本地候选。' }
    }
    if (backend.provider === 'fake') {
      return { tone: 'warning', state: 'incomplete', label: '本地候选', message: '后端使用本地草稿提供器，配板和夜间推荐不会调用真实模型。' }
    }
    if (backend.provider !== 'openai-compatible') return unavailableStatus
    if (typeof backend.apiKeyConfigured !== 'boolean') return unavailableStatus
    const model = typeof backend.model === 'string' ? backend.model.trim() : undefined
    const baseUrl = typeof backend.baseUrl === 'string' ? backend.baseUrl.trim() : undefined
    const missing = [!model && '模型', !baseUrl && '接入地址', !backend.apiKeyConfigured && '密钥'].filter(Boolean)
    const accessRequired = body.access?.required === true
    const accessAuthorized = body.access?.authorized === true
    const locked = accessRequired && !accessAuthorized
    return {
      tone: missing.length || locked ? 'warning' : 'success',
      state: missing.length ? 'incomplete' : locked ? 'locked' : 'ready',
      label: missing.length ? '配置不完整' : locked ? '待验证访问' : '配置已就绪',
      message: missing.length
        ? `后端 AI 缺少${missing.join('、')}；配板和夜间推荐将使用本地候选。`
        : locked ? '服务器 API 已固定。请验证访问口令，此设备记住 30 天；无需填写 API 密钥。'
          : '后端密钥已配置。以上为当前业务使用的模型配置，尚未验证真实调用。',
      accessRequired,
      accessAuthorized,
      model,
      timeoutSeconds: typeof backend.timeoutSeconds === 'number' && backend.timeoutSeconds > 0 ? backend.timeoutSeconds : undefined,
      contextLimit: typeof backend.contextLimit === 'number' && backend.contextLimit > 0 ? backend.contextLimit : undefined,
    }
  } catch {
    return unavailableStatus
  }
}

export async function testBackendAIConnection(settings: AIRuntimeSettings): Promise<BackendAIStatus> {
  if (settings.mode !== 'http') return localStatus
  try {
    const response = await fetchWithTimeout(backendUrl(settings.baseUrl, '/api/settings/ai/test'), settings.timeoutMs, { method: 'POST' })
    const body = await response.json() as { ok?: boolean; code?: string; message?: string }
    return {
      tone: response.ok && body.ok ? 'success' : 'warning',
      message: body.message ?? body.code ?? '后端 AI 配置检查完成；未调用模型。',
    }
  } catch {
    return { tone: 'warning', message: '后端 AI 配置检查失败；仍可使用本地候选。' }
  }
}

function isTrustedBackendUrl(baseUrl: string) {
  try {
    const url = new URL(baseUrl, window.location.href)
    return url.protocol === 'https:' || url.hostname === '127.0.0.1' || url.hostname === 'localhost' || url.hostname === '[::1]'
  } catch {
    return false
  }
}

export async function setBackendAIAccess(settings: AIRuntimeSettings, passcode?: string): Promise<BackendAIStatus> {
  if (settings.mode !== 'http' || !isTrustedBackendUrl(settings.baseUrl)) {
    return { tone: 'warning', message: '访问验证需要本机地址或 HTTPS 后端。' }
  }
  try {
    const response = await fetchWithTimeout(backendUrl(settings.baseUrl, '/api/settings/ai/access'), settings.timeoutMs, {
      method: passcode === undefined ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      ...(passcode !== undefined ? { body: JSON.stringify({ passcode }) } : {}),
    })
    const body = await response.json() as { ok?: boolean; error?: { message?: string } }
    return {
      tone: response.ok && body.ok ? 'success' : 'warning',
      message: response.ok && body.ok
        ? passcode === undefined ? '已取消此设备的 AI 访问。' : '此设备已验证，30 天内无需再次填写。'
        : body.error?.message ?? '访问验证失败，请重试。',
    }
  } catch {
    return { tone: 'warning', message: '暂时无法验证访问，请检查网络后重试。' }
  }
}

export async function testLiveAIConnection(settings: AIRuntimeSettings): Promise<BackendAIStatus> {
  if (settings.mode !== 'http') return localStatus
  if (!isTrustedBackendUrl(settings.baseUrl)) {
    return { tone: 'warning', message: '真实连通测试需要本机地址或 HTTPS 后端。' }
  }
  try {
    const response = await fetchWithTimeout(backendUrl(settings.baseUrl, '/api/settings/ai/live-test'), modelRequestTimeoutMs(settings.timeoutMs), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    })
    const body = await response.json() as { ok?: boolean; code?: string; message?: string }
    return {
      tone: response.ok && body.ok ? 'success' : 'warning',
      message: body.message ?? body.code ?? '真实连通测试完成。',
    }
  } catch {
    return { tone: 'warning', message: '真实连通失败；请检查后端配置、额度或网络。' }
  }
}
