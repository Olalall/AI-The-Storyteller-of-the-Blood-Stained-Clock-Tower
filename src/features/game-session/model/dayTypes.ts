import type { RoleSnapshot, StorytellerRegistrationSnapshot } from '../../night-workbench/types'
import type { TimelineBase } from './timelineBaseTypes'

/** 未确认的白天票型草稿；可恢复，但不是时间线事实。 */
export interface DayVoteDraft {
  /** 首次落库前使用 `day-pending`，不能据此创建昼夜记录段。 */
  segmentId: string
  nominatorSeatId: number | null
  nomineeSeatId: number | null
  threshold: number
  raisedSeatIds: number[]
  ghostVoteSeatIds: number[]
}

export type DaySkillOutcomeKind = 'no_effect' | 'applied' | 'custom'

export interface DaySkillParticipantSnapshot {
  seatId: number
  /** 记录当时的真实身份；缺失时不能用当前身份倒推。 */
  actualRole: RoleSnapshot | null
  /** 仅在技能需要时由说书人明确登记；旧记录允许缺失。 */
  registration?: StorytellerRegistrationSnapshot
}

/**
 * 白天技能是说书人私有的事实快照。
 * “按哪个技能结算”“实际身份”和“公开声称”故意分开，避免把声称写成真实身份。
 */
export interface DaySkillContext {
  abilityRole: RoleSnapshot | null
  actor: DaySkillParticipantSnapshot | null
  claimedRole: RoleSnapshot | null
  targets: DaySkillParticipantSnapshot[]
  outcome: {
    kind: DaySkillOutcomeKind
    note?: string
  }
}

/**
 * 白天“记技能/事件”尚未确认时的可恢复输入。
 * 它是工作台草稿，不是 TimelineEntry，也不能因此创建昼夜段或改变局面。
 */
export interface DayActionSkillDraft {
  actorSeatId: number | null
  actorActualRoleId: string
  abilityRoleId: string
  claimedRoleId: string
  targetSeatIds: number[]
  targetActualRoleIds: Record<number, string>
  targetAlignments?: Record<number, 'good' | 'evil'>
  outcomeKind: DaySkillOutcomeKind | null
  outcomeNote: string
}

export interface DayPublicEventDraft {
  targetSeatIds: number[]
  note: string
}

export interface DayActionDraft {
  category: 'skill' | 'public_event'
  skill: DayActionSkillDraft
  publicEvent: DayPublicEventDraft
}

export interface DayActionEntry extends TimelineBase {
  kind: 'day_action'
  category: 'skill' | 'public_event'
  actorSeatId: number | null
  targetSeatIds: number[]
  /** 新记录写入结构化快照；旧本地记录允许缺失。 */
  skillContext?: DaySkillContext
  summary: string
  details: string[]
}
