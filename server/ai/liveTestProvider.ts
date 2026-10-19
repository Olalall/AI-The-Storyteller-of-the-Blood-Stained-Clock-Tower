import { callOpenAICompatibleJSON, type FetchLike } from './aiProviderClient'
import type { AIProviderKind } from './types'

export type LiveAISettings = {
  provider: AIProviderKind
  baseUrl?: string
  model?: string
  apiKey?: string
  timeoutSeconds: number
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
