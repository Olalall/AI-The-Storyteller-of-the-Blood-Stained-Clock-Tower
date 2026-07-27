import type { LifeState, ManualStatusMarker } from '../../night-workbench/types'
import type { TimelineBase } from './timelineBaseTypes'

export type PlayerExperience = 'new' | 'regular' | 'veteran'

export interface PlayerSeat {
  seatId: number
  label: string
  /** 仅供说书人识别玩家；不是账号、联机身份或权限凭据。 */
  nickname: string
  experience: PlayerExperience
}

export interface PlayerState {
  life: LifeState
  poisoned: boolean
  drunk: boolean
  markers: ManualStatusMarker[]
}

export interface PlayerStateChangedEntry extends TimelineBase {
  kind: 'player_state_changed'
  seatId: number
  before: PlayerState
  after: PlayerState
  reason: string
}
