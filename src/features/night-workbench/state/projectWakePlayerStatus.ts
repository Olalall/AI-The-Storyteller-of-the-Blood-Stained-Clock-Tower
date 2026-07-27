import { projectCurrentPlayerStates } from '../../game-session/state/projectors'
import type { GameSessionState } from '../../game-session/types'
import type { PlayerStatusSnapshot, WakeItem } from '../types'

export function projectWakePlayerStatus(session: GameSessionState, item: WakeItem): PlayerStatusSnapshot {
  const state = projectCurrentPlayerStates(session)[item.seatId]
  if (!state) return item.status
  return {
    life: state.life,
    impairments: [
      ...(state.poisoned ? ['poisoned' as const] : []),
      ...(state.drunk ? ['drunk' as const] : []),
    ],
    markers: state.markers,
  }
}
