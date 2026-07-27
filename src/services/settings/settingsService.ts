import { sanitizeAISettingsForSave } from './aiSettingsRules'
import { localAISettingsAdapter } from './localAISettingsAdapter'
import type { AISettings } from './types'

export function readAISettings(): AISettings {
  return localAISettingsAdapter.load()
}

export function saveAISettings(settings: AISettings) {
  localAISettingsAdapter.save(sanitizeAISettingsForSave(settings))
}

export function resetAISettings() {
  return localAISettingsAdapter.reset()
}

export { sanitizeAISettingsForSave }
