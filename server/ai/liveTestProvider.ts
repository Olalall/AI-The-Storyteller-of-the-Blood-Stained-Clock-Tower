import { callOpenAICompatibleJSON, type FetchLike } from './aiProviderClient'
import type { AIProviderKind, AISettingsLiveTestRequest } from './types'

export type LiveAISettings = {
  provider: AIProviderKind
  baseUrl?: string
  model?: string
  apiKey?: string
  timeoutSeconds: number
}

function clean(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function timeoutSecondsFrom(value: unknown, fallback: number) {
  const numeric = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(numeric)) return fallback
  return Math.min(120, Math.max(5, Math.round(numeric)))
}

export function liveSettingsFrom(input: AISettingsLiveTestRequest | undefined, fallback: LiveAISettings): LiveAISettings {
  const baseUrl = clean(input?.baseUrl)
  const model = clean(input?.model)
  const apiKey = clean(input?.apiKey)
  const hasClientProviderOverride = Boolean(baseUrl || model || apiKey)
  const provider = input?.provider === 'openai-compatible' ? 'openai-compatible' : fallback.provider
  // 服务器配置与浏览器 BYOK 配置只能整套二选一。逐字段回退会允许攻击者只替换
  // baseUrl，再让服务器把自己的 API Key 作为 Authorization 发往攻击者地址。
  if (hasClientProviderOverride) {
    return {
      provider,
      baseUrl,
      model,
      apiKey,
      timeoutSeconds: timeoutSecondsFrom(input?.timeoutSeconds, fallback.timeoutSeconds),
    }
  }
  return {
    provider,
    baseUrl: fallback.baseUrl,
    model: fallback.model,
    apiKey: fallback.apiKey,
    timeoutSeconds: timeoutSecondsFrom(input?.timeoutSeconds, fallback.timeoutSeconds),
  }
}

export async function runOpenAICompatibleLiveTest(
  settings: LiveAISettings,
  fetcher?: FetchLike,
  redirect?: RequestRedirect,
) {
  await callOpenAICompatibleJSON<{ ok?: unknown; message?: unknown }>({
    baseUrl: settings.baseUrl ?? '',
    model: settings.model ?? '',
    apiKey: settings.apiKey ?? '',
    timeoutSeconds: settings.timeoutSeconds,
    fetcher,
    redirect,
  }, [
    { role: 'system', content: '你是连通性检查。只返回 JSON 对象，不要解释，不要复述密钥。' },
    { role: 'user', content: '返回 {"ok":true,"message":"ready"}。' },
  ])
}
