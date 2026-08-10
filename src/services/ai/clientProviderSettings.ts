import {
  defaultArchiveRuntimeSettings,
  type ArchiveRuntimeSettings,
} from '../archive'
import { readAISettings, type AISettings } from '../settings'

export interface ClientAIProviderSettings {
  provider: 'openai-compatible'
  baseUrl: string
  model: string
  apiKey: string
  timeoutSeconds: number
}

function isLoopbackUrl(value: string) {
  try {
    const url = new URL(value)
    return url.hostname === '127.0.0.1' || url.hostname === 'localhost' || url.hostname === '::1'
  } catch {
    return false
  }
}

/**
 * 本机浏览器模式仍通过本机 runtime 请求 AI；没有 runtime 时由调用方回退本地草稿。
 * 远程 archive runtime 继续走它自己的后端 .env 配置。
 */
export function aiTransportSettings(settings: ArchiveRuntimeSettings): ArchiveRuntimeSettings {
  if (settings.mode === 'http') return settings
  return {
    ...defaultArchiveRuntimeSettings,
    mode: 'http',
  }
}

/**
 * 只有请求目标是 loopback 时才把浏览器本机保存的 Key 交给后端。
 * 这样 GitHub 下载版能真正使用本机配置，但不会把 Key 发到公网 VPS。
 */
export function clientProviderSettingsFor(
  runtimeSettings: ArchiveRuntimeSettings,
  aiSettings: AISettings = readAISettings(),
): ClientAIProviderSettings | undefined {
  const transport = aiTransportSettings(runtimeSettings)
  if (aiSettings.mode !== 'openai-compatible') return undefined
  if (!aiSettings.baseUrl.trim() || !aiSettings.model.trim() || !aiSettings.apiKey.trim()) return undefined
  if (!isLoopbackUrl(transport.baseUrl)) return undefined

  return {
    provider: 'openai-compatible',
    baseUrl: aiSettings.baseUrl.trim(),
    model: aiSettings.model.trim(),
    apiKey: aiSettings.apiKey.trim(),
    timeoutSeconds: aiSettings.timeoutSeconds,
  }
}

export function aiEnabledFor(settings: AISettings = readAISettings()) {
  return settings.mode !== 'off'
}
