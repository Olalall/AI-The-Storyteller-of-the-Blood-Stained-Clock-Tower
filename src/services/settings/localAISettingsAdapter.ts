import { normalizeAISettings } from './aiSettingsRules'
import { defaultAISettings, type AISettings } from './types'

export const aiSettingsStorageKey = 'botc-copilot-ai-settings-v1'

export const localAISettingsAdapter = {
  load(): AISettings {
    try {
      const stored = window.localStorage.getItem(aiSettingsStorageKey)
      return stored ? normalizeAISettings(JSON.parse(stored)) : defaultAISettings
    } catch {
      return defaultAISettings
    }
  },

  save(settings: AISettings) {
    window.localStorage.setItem(aiSettingsStorageKey, JSON.stringify(normalizeAISettings(settings)))
  },

  reset() {
    window.localStorage.removeItem(aiSettingsStorageKey)
    return defaultAISettings
  },
}
