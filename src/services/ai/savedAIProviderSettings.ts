import type { ArchiveRuntimeSettings } from '../archive'
import { readAISettings, type AISettings } from '../settings'

export interface SavedAIProviderSettings {
  provider: 'openai-compatible'
  baseUrl: string
  model: string
  apiKey: string
  timeoutSeconds: number
}

/**
 * API Key 只发给本机或 HTTPS 后端；业务请求仍然由后端代理访问模型服务。
 * 这样 GitHub 上的公开前端可以由每个使用者自行配置，不需要把 Key 放进源码。
 */
export function canSendSecretToBackend(baseUrl: string) {
  try {
    const url = new URL(baseUrl)
    return url.protocol === 'https:'
      || url.hostname === '127.0.0.1'
      || url.hostname === 'localhost'
      || url.hostname === '::1'
  } catch {
    return false
  }
}

export function savedAIProviderSettingsFor(
  runtimeSettings: ArchiveRuntimeSettings,
  aiSettings: AISettings = readAISettings(),
): SavedAIProviderSettings | undefined {
  if (runtimeSettings.mode !== 'http' || !canSendSecretToBackend(runtimeSettings.baseUrl)) return undefined
  if (aiSettings.mode !== 'openai-compatible') return undefined

  const baseUrl = aiSettings.baseUrl.trim()
  const model = aiSettings.model.trim()
  const apiKey = aiSettings.apiKey?.trim() ?? ''
  if (!baseUrl || !model || !apiKey) return undefined

  return {
    provider: 'openai-compatible',
    baseUrl,
    model,
    apiKey,
    timeoutSeconds: aiSettings.timeoutSeconds,
  }
}
