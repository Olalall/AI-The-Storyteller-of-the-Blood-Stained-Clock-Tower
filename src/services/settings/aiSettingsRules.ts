import { defaultAISettings, type AIProviderMode, type AISettings } from './types'

function isMode(value: unknown): value is AIProviderMode {
  return value === 'off' || value === 'backend' || value === 'openai-compatible'
}

function clampInteger(value: unknown, min: number, max: number, fallback: number) {
  const numeric = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(numeric)) return fallback
  return Math.min(max, Math.max(min, Math.round(numeric)))
}

export function normalizeAISettings(value: unknown): AISettings {
  if (!value || typeof value !== 'object') return defaultAISettings
  const candidate = value as Partial<AISettings>
  return {
    mode: isMode(candidate.mode) ? candidate.mode : defaultAISettings.mode,
    model: typeof candidate.model === 'string' && candidate.model.trim() ? candidate.model.trim() : defaultAISettings.model,
    baseUrl: typeof candidate.baseUrl === 'string' && candidate.baseUrl.trim() ? candidate.baseUrl.trim() : defaultAISettings.baseUrl,
    timeoutSeconds: clampInteger(candidate.timeoutSeconds, 5, 120, defaultAISettings.timeoutSeconds),
    maxContextTokens: clampInteger(candidate.maxContextTokens, 2000, 128000, defaultAISettings.maxContextTokens),
    streaming: Boolean(candidate.streaming),
  }
}

export function sanitizeAISettingsForSave(settings: AISettings): AISettings {
  return normalizeAISettings({
    ...settings,
    model: settings.model.trim() || defaultAISettings.model,
    baseUrl: settings.baseUrl.trim() || defaultAISettings.baseUrl,
  })
}
