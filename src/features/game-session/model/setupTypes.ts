import type { RoleSnapshot } from '../../night-workbench/types'
import type { TimelineBase } from './timelineBaseTypes'

export interface SetupAssignment {
  seatId: number
  role: RoleSnapshot
}

export interface SetupRationale {
  summary: string
  pace: 'steady' | 'long' | 'swingy'
  playerFit: string
  risk: string
}

/**
 * 配板时由说书人显式选择的开局规则选项。
 * 这只影响配板人数检查，不能用于自动结算后续技能。
 */
export interface SetupRuleSelection {
  ruleId: string
  choiceId: string
}

/** 恶魔伪装的说明草稿；不是规则事实，也不会自动替换伪装。 */
export interface DemonBluffAdviceItem {
  role: RoleSnapshot
  reason: string
  risk: string
}

export interface DemonBluffAdvice {
  source: 'prototype'
  items: DemonBluffAdviceItem[]
}

export interface SetupCandidate {
  id: string
  title: string
  assignments: SetupAssignment[]
  demonBluffs: RoleSnapshot[]
  /** 少数剧本可能允许同一角色出现多个座位，例如 Riot；默认仍不允许重复。 */
  repeatableRoleIds?: string[]
  /** 候选生成时已选定的开局人数修正；说书人可以在草稿中改选。 */
  setupRuleSelections?: SetupRuleSelection[]
  /** 规则包版本必须和确认后的配板快照一起冻结，供后续审计。 */
  setupRulePackVersion?: string
  demonBluffAdvice?: DemonBluffAdvice
  rationale: SetupRationale
  source: 'prototype'
}

export interface SetupDraft {
  candidateId: string
  /** 编辑草稿基于哪一次已确认配板；开局后用于拒绝过期草稿。 */
  baseSetupId?: string
  revision: number
  assignments: SetupAssignment[]
  demonBluffs: RoleSnapshot[]
  repeatableRoleIds?: string[]
  setupRuleSelections?: SetupRuleSelection[]
  setupRulePackVersion?: string
  updatedAt: string
}

export interface ConfirmedSetup {
  id: string
  draft: SetupDraft
  confirmedAt: string
}

export interface SetupConfirmedEntry extends TimelineBase {
  kind: 'setup_confirmed'
  setup: ConfirmedSetup
}

export interface SetupChangedEntry extends TimelineBase {
  kind: 'setup_changed'
  baseSetupId: string
  /**
   * 仅夜间工作台内确认的换角会归属到某一次夜间运行态；配板微调没有夜间来源。
   * 该字段只控制夜间只读投影，不改变角色变更对后续工作台快照的影响。
   */
  originNightRunId: string | null
  seatId: number
  fromRole: RoleSnapshot
  toRole: RoleSnapshot
  reason: string
  /** 只影响这次调整之后新建的工作台，不回写已建夜序快照。 */
  effectiveFrom: 'future_workbenches'
}
