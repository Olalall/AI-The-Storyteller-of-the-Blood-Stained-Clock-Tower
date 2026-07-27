import type { AIProviderKind, AIProviderPrivateSettings, PublicAISettings } from './types'

const defaultTimeoutSeconds = 30
const defaultContextLimit = 12_000

function clean(value: string | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

function enabledFrom(value: string | undefined) {
  return value?.trim().toLowerCase() === 'true'
}

function providerFrom(value: string | undefined, enabled: boolean): AIProviderKind {
  if (!enabled) return 'fake'
  return value?.trim() === 'openai-compatible' ? 'openai-compatible' : 'openai-compatible'
}

function positiveNumber(value: string | undefined, fallback: number) {
  if (!value) return fallback
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : fallback
}

function timeoutSecondsFrom(value: string | undefined) {
  return Math.round(positiveNumber(value, defaultTimeoutSeconds * 1000) / 1000)
}

export function readAIProviderPrivateSettings(env: NodeJS.ProcessEnv = process.env): AIProviderPrivateSettings {
  const enabled = enabledFrom(env.BOTC_AI_ENABLED)
  const provider = providerFrom(env.BOTC_AI_PROVIDER, enabled)
  const baseUrl = clean(env.BOTC_AI_BASE_URL)
  const model = clean(env.BOTC_AI_MODEL)
  const apiKey = clean(env.BOTC_AI_API_KEY)

  return {
    mode: enabled ? 'backend_proxy' : 'off',
    provider,
    baseUrl,
    model,
    timeoutSeconds: timeoutSecondsFrom(env.BOTC_AI_TIMEOUT_MS),
    contextLimit: Math.round(positiveNumber(env.BOTC_AI_MAX_CONTEXT_TOKENS, defaultContextLimit)),
    apiKeyConfigured: Boolean(apiKey),
    enabled,
    apiKey,
  }
}

export function publicAISettingsFrom(settings: AIProviderPrivateSettings): PublicAISettings {
  const { enabled: _enabled, apiKey: _apiKey, ...publicSettings } = settings
  return publicSettings
}

export function readPublicAISettings(env: NodeJS.ProcessEnv = process.env): PublicAISettings {
  return publicAISettingsFrom(readAIProviderPrivateSettings(env))
}

export function isAIProviderConfigured(settings: AIProviderPrivateSettings) {
  return Boolean(settings.enabled && settings.provider === 'openai-compatible' && settings.baseUrl && settings.model && settings.apiKey)
}
