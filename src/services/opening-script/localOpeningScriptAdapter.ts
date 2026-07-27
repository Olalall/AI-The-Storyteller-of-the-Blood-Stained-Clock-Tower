import { defaultOpeningScript } from './defaultOpeningScript'

const storagePrefix = 'botc-copilot-opening-script-v1'

export function openingScriptStorageKey(sessionId: string) {
  return `${storagePrefix}:${encodeURIComponent(sessionId)}`
}

export const localOpeningScriptAdapter = {
  load(sessionId: string) {
    try {
      const stored = window.localStorage.getItem(openingScriptStorageKey(sessionId))
      return stored?.trim() ? stored : defaultOpeningScript
    } catch {
      return defaultOpeningScript
    }
  },

  save(sessionId: string, content: string) {
    window.localStorage.setItem(openingScriptStorageKey(sessionId), content)
  },

  reset(sessionId: string) {
    window.localStorage.removeItem(openingScriptStorageKey(sessionId))
    return defaultOpeningScript
  },
}

