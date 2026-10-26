import type { NightSeatSnapshot } from '../types'
export function seatDescription(seat: NightSeatSnapshot | undefined) {
  return seat ? [seat.role?.name ?? '未配角色', seat.status.life === 'dead' ? '死亡' : '存活',
    ...seat.status.impairments.map(s => s === 'drunk' ? '醉酒' : '中毒')].join(' · ') : undefined
}
