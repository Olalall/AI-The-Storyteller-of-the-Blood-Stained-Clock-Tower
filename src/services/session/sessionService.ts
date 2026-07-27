import {
  loadGameSession as loadFromAdapter,
  persistGameSession as persistToAdapter,
  resetGameSession as resetAdapter,
} from './localSessionAdapter'
import type { GameSessionState } from '../../features/game-session/types'

export function loadGameSession(): GameSessionState {
  return loadFromAdapter()
}

export function persistGameSession(state: GameSessionState) {
  persistToAdapter(state)
}

export function resetGameSession() {
  resetAdapter()
}
