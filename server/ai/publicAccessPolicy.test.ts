import { describe, expect, it } from 'vitest'
import {
  resolveAIPublicAccessPolicy,
  validatePublicProviderSettings,
} from './publicAccessPolicy'

const completeProviderSettings = {
  provider: 'openai-compatible' as const,
  baseUrl: 'https://ai.example.test/v1',
  model: 'public-model',
  apiKey: 'sk-browser-owned',
}

describe('AI public access policy', () => {
  it('is disabled by default and can be enabled from env with an exact hostname allowlist', () => {
    expect(resolveAIPublicAccessPolicy({}, {})).toMatchObject({ mode: 'local' })

    const policy = resolveAIPublicAccessPolicy({}, {
      BOTC_PUBLIC_ACCESS_MODE: 'true',
      BOTC_PUBLIC_AI_ALLOWED_HOSTS: 'AI.EXAMPLE.TEST, second.example.test ',
    })

    expect(policy.mode).toBe('public')
    expect([...policy.allowedProviderHostnames]).toEqual(['ai.example.test', 'second.example.test'])
  })

  it.each([
    ['empty allowlist', completeProviderSettings, []],
    ['plain HTTP', { ...completeProviderSettings, baseUrl: 'http://ai.example.test/v1' }, ['ai.example.test']],
    ['hostname suffix trick', { ...completeProviderSettings, baseUrl: 'https://ai.example.test.evil/v1' }, ['ai.example.test']],
    ['localhost', { ...completeProviderSettings, baseUrl: 'https://localhost/v1' }, ['localhost']],
    ['IPv4 literal', { ...completeProviderSettings, baseUrl: 'https://127.0.0.1/v1' }, ['127.0.0.1']],
    ['IPv6 literal', { ...completeProviderSettings, baseUrl: 'https://[::1]/v1' }, ['::1']],
    ['cloud metadata hostname', { ...completeProviderSettings, baseUrl: 'https://metadata.google.internal/v1' }, ['metadata.google.internal']],
    ['URL credentials', { ...completeProviderSettings, baseUrl: 'https://user:pass@ai.example.test/v1' }, ['ai.example.test']],
  ])('rejects %s even when it appears in configuration', (_label, settings, allowlist) => {
    const policy = resolveAIPublicAccessPolicy({
      mode: 'public',
      allowedProviderHostnames: allowlist,
    }, {})

    expect(validatePublicProviderSettings(settings, policy)).toMatchObject({ ok: false })
  })

  it('accepts a complete HTTPS BYOK bundle only for an exact allowlisted hostname', () => {
    const policy = resolveAIPublicAccessPolicy({
      mode: 'public',
      allowedProviderHostnames: ['AI.EXAMPLE.TEST.'],
    }, {})

    expect(validatePublicProviderSettings(completeProviderSettings, policy)).toEqual({ ok: true })
  })
})
