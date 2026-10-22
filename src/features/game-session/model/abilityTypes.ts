import type { RoleSnapshot } from '../../night-workbench/types'
import type { TimelineBase } from './timelineBaseTypes'

/** 能力与真实身份分别留痕；失去能力同样追加记录。 */
export interface AbilityChangedEntry extends TimelineBase {
  kind: 'ability_changed'
  sourceSeatId: number
  sourceRoleId: string
  seatId: number
  actorRole: RoleSnapshot
  abilityRole: RoleSnapshot | null
  sourceEntryId?: string
  parentGrantId?: string
  triggerSeatId?: number
  timing: 'tonight' | 'later'
  reason: string
}

export interface AbilitySource {
  grantId: string
  sourceSeatId: number
  sourceRoleId: string
  actorRole: RoleSnapshot
}
