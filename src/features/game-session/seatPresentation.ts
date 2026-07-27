import type { PlayerSeat, PlayerState } from './types'

/**
 * 座位号是稳定键，昵称只辅助现场辨认。两者并列，避免重名导致说书人误操作。
 */
export function storytellerSeatLabel(seat: Pick<PlayerSeat, 'label' | 'nickname'>) {
  const nickname = seat.nickname.trim()
  return nickname ? `${seat.label} · ${nickname}` : seat.label
}

export function storytellerStateLabel(state: PlayerState) {
  return [
    state.life === 'alive' ? '存活' : '死亡',
    state.poisoned ? '中毒' : '',
    state.drunk ? '醉酒' : '',
    state.markers.length ? `${state.markers.length}标` : '',
  ].filter(Boolean).join(' · ')
}
