import { describe, expect, it } from 'vitest'
import { isAIProviderConfigured, readAIProviderPrivateSettings, readPublicAISettings } from './aiProviderSettings'

const secret = 'sk-test-secret-should-not-leak'

function env(overrides: NodeJS.ProcessEnv = {}): NodeJS.ProcessEnv {
  return { ...overrides }
}

describe('AI provider settings', () => {
  it('defaults to disabled fake settings without a configured key', () => {
    const settings = readPublicAISettings(env())

    expect(settings).toEqual({
      mode: 'off',
      provider: 'fake',
      timeoutSeconds: 30,
      contextLimit: 12000,
      apiKeyConfigured: false,
    })
  })

  it('exposes only non-sensitive provider configuration', () => {
    const settings = readPublicAISettings(env({
      BOTC_AI_ENABLED: 'true',
      BOTC_AI_PROVIDER: 'openai-compatible',
      BOTC_AI_BASE_URL: 'https://ai.example.test/v1',
      BOTC_AI_MODEL: 'review-model',
      BOTC_AI_API_KEY: secret,
      BOTC_AI_TIMEOUT_MS: '45000',
      BOTC_AI_MAX_CONTEXT_TOKENS: '9000',
    }))

    expect(settings).toEqual({
      mode: 'backend_proxy',
      provider: 'openai-compatible',
      baseUrl: 'https://ai.example.test/v1',
      model: 'review-model',
      timeoutSeconds: 45,
      contextLimit: 9000,
      apiKeyConfigured: true,
    })
    expect(JSON.stringify(settings)).not.toContain(secret)
  })

  it('keeps the private key out of public settings while allowing internal readiness checks', () => {
    const privateSettings = readAIProviderPrivateSettings(env({
      BOTC_AI_ENABLED: 'true',
      BOTC_AI_BASE_URL: 'https://ai.example.test/v1',
      BOTC_AI_MODEL: 'review-model',
      BOTC_AI_API_KEY: secret,
    }))

    expect(privateSettings.apiKey).toBe(secret)
    expect(isAIProviderConfigured(privateSettings)).toBe(true)
    const { apiKey: _apiKey, enabled: _enabled, ...publicSettings } = privateSettings
    expect(JSON.stringify(publicSettings)).not.toContain(secret)
  })

  it('falls back to safe numeric defaults for invalid timeout and context limits', () => {
    const settings = readPublicAISettings(env({
      BOTC_AI_ENABLED: 'true',
      BOTC_AI_TIMEOUT_MS: '-1',
      BOTC_AI_MAX_CONTEXT_TOKENS: 'not-a-number',
    }))

    expect(settings.timeoutSeconds).toBe(30)
    expect(settings.contextLimit).toBe(12000)
  })
})
