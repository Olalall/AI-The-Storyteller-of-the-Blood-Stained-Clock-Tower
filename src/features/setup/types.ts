import type {
  DemonBluffAdvice,
  PlayerExperience,
  SetupCandidate,
  SetupRuleSelection,
} from '../game-session/types'
import type { PlayerCount } from '../../domain/scripts'

export type CatfishingSetupStyle = 'balanced' | 'participation' | 'reversal'

export type SetupTeam = 'townsfolk' | 'outsider' | 'minion' | 'demon'

export type TeamCounts = Record<SetupTeam, number>

export interface SetupSeatProfile {
  seatId: number
  experience: PlayerExperience
}

export interface SetupLegalityCheck {
  id: string
  status: 'pass' | 'needs_choice' | 'fail' | 'review'
  passed: boolean
  summary: string
  detail?: string
  source?: string
}

export interface SetupRuleChoice {
  id: string
  label: string
  delta: Partial<TeamCounts>
}

export interface SetupModifierRule {
  id: string
  roleId: string
  label: string
  choices: readonly SetupRuleChoice[]
  requiresStorytellerChoice: boolean
  source: string
}

/**
 * 规则包只保存开局时可复核的事实。没有录入的数据不会由角色名字或 AI 猜测。
 */
export interface ScriptSetupRulePack {
  scriptId: string
  version: string
  baseDistributionByPlayerCount: Readonly<Record<number, TeamCounts>>
  modifiers: readonly SetupModifierRule[]
  /** 已人工核对过的硬冲突；当前 Catfishing 原型未声明任何一项。 */
  conflicts: readonly SetupRoleConflict[]
  demonBluffPolicy: DemonBluffPolicy
}

export interface SetupRoleConflict {
  id: string
  roleIds: readonly string[]
  severity: 'fail' | 'review'
  summary: string
  source: string
}

export interface DemonBluffPolicy {
  count: number
  eligibleTeam: SetupTeam
  eligibleTeams?: readonly SetupTeam[]
  requireNotInPlay: boolean
  summary?: string
}

export interface SetupLegalityReport {
  baseCounts: TeamCounts | null
  expectedCounts: TeamCounts | null
  actualCounts: TeamCounts
  activeSelections: SetupRuleSelection[]
  checks: SetupLegalityCheck[]
}

export interface CatfishingPrototypeCandidate extends SetupCandidate {
  style: CatfishingSetupStyle
  scriptId: string
  playerCount: PlayerCount
  knowledgeVersion: string
  legalityChecks: SetupLegalityCheck[]
  demonBluffAdvice?: DemonBluffAdvice
}

export type SetupPrototypeCandidate = CatfishingPrototypeCandidate
