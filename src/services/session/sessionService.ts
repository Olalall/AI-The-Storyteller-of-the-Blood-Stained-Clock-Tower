import {
  clearSessionRecovery as clearRecoveryFromAdapter,
  loadGameSession as loadFromAdapter,
  loadGameSessionOutcome as loadOutcomeFromAdapter,
  persistGameSession as persistToAdapter,
  readSessionRecovery as readRecoveryFromAdapter,
  resetGameSession as resetAdapter,
  type SessionLoadOutcome,
  type SessionRecoveryRecord,
} from './localSessionAdapter'
import type { GameSessionState } from '../../features/game-session/types'

export function loadGameSession(): GameSessionState {
  return loadFromAdapter()
}

export function loadGameSessionOutcome(): SessionLoadOutcome {
  return loadOutcomeFromAdapter()
}

export function readSessionRecovery(): SessionRecoveryRecord | null {
  return readRecoveryFromAdapter()
}

export function clearSessionRecovery() {
  clearRecoveryFromAdapter()
}

export function persistGameSession(state: GameSessionState) {
  persistToAdapter(state)
}

export function resetGameSession() {
  resetAdapter()
}
