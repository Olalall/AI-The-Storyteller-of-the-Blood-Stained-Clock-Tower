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
  const provider = input?.provider === 'openai-compatible' ? 'openai-compatible' : fallback.provider
  return {
    provider,
    baseUrl: clean(input?.baseUrl) ?? fallback.baseUrl,
    model: clean(input?.model) ?? fallback.model,
    apiKey: clean(input?.apiKey) ?? fallback.apiKey,
    timeoutSeconds: timeoutSecondsFrom(input?.timeoutSeconds, fallback.timeoutSeconds),
  }
}

export async function runOpenAICompatibleLiveTest(settings: LiveAISettings, fetcher?: FetchLike) {
  await callOpenAICompatibleJSON<{ ok?: unknown; message?: unknown }>({
    baseUrl: settings.baseUrl ?? '',
    model: settings.model ?? '',
    apiKey: settings.apiKey ?? '',
    timeoutSeconds: settings.timeoutSeconds,
    fetcher,
  }, [
    { role: 'system', content: '你是连通性检查。只返回 JSON 对象，不要解释，不要复述密钥。' },
    { role: 'user', content: '返回 {"ok":true,"message":"ready"}。' },
  ])
}
