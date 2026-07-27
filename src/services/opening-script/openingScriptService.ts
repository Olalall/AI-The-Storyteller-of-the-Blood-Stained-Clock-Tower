import { localOpeningScriptAdapter } from './localOpeningScriptAdapter'

export function readOpeningScript(sessionId: string) {
  return localOpeningScriptAdapter.load(sessionId)
}

export function saveOpeningScript(sessionId: string, content: string) {
  localOpeningScriptAdapter.save(sessionId, content)
}

export function restoreDefaultOpeningScript(sessionId: string) {
  return localOpeningScriptAdapter.reset(sessionId)
}

