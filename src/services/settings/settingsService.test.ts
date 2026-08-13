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

  it('saves normalized AI settings including the local browser API key', () => {
    const settings: AISettings = {
      ...defaultAISettings,
      mode: 'openai-compatible',
      model: '  gpt-test  ',
      baseUrl: '  https://example.test/v1  ',
      timeoutSeconds: 999,
      maxContextTokens: 1,
      streaming: true,
      apiKey: '  test-key-persisted-locally  ',
    }

    saveAISettings(settings)

    const raw = window.localStorage.getItem(aiSettingsStorageKey)
    expect(raw).toContain('test-key-persisted-locally')
    expect(readAISettings()).toMatchObject({
      mode: 'openai-compatible',
      model: 'gpt-test',
      baseUrl: 'https://example.test/v1',
      timeoutSeconds: 120,
      maxContextTokens: 2000,
      streaming: true,
      apiKey: 'test-key-persisted-locally',
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
