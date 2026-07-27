import { beforeEach, describe, expect, it } from 'vitest'
import {
  aiSettingsStorageKey,
  defaultAISettings,
  readAISettings,
  resetAISettings,
  saveAISettings,
  type AISettings,
} from './index'

describe('settings service', () => {
  beforeEach(() => window.localStorage.clear())

  it('saves only normalized non-sensitive AI settings', () => {
    const settings: AISettings & { apiKey?: string } = {
      ...defaultAISettings,
      mode: 'openai-compatible',
      model: '  gpt-test  ',
      baseUrl: '  https://example.test/v1  ',
      timeoutSeconds: 999,
      maxContextTokens: 1,
      streaming: true,
      apiKey: 'sk-should-not-persist',
    }

    saveAISettings(settings)

    const raw = window.localStorage.getItem(aiSettingsStorageKey)
    expect(raw).not.toContain('sk-should-not-persist')
    expect(readAISettings()).toMatchObject({
      mode: 'openai-compatible',
      model: 'gpt-test',
      baseUrl: 'https://example.test/v1',
      timeoutSeconds: 120,
      maxContextTokens: 2000,
      streaming: true,
    })
  })

  it('falls back to defaults for invalid stored settings and can reset', () => {
    window.localStorage.setItem(aiSettingsStorageKey, '{"mode":"bad","model":"","timeoutSeconds":"bad"}')

    expect(readAISettings()).toMatchObject(defaultAISettings)

    saveAISettings({ ...defaultAISettings, mode: 'backend' })
    expect(readAISettings().mode).toBe('backend')

    expect(resetAISettings()).toEqual(defaultAISettings)
    expect(window.localStorage.getItem(aiSettingsStorageKey)).toBeNull()
  })
})
