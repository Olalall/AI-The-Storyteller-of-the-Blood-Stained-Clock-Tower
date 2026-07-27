export type ScriptId = string

export type RoleId = string

export type PlayerCount = 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15

export type KnowledgeStatus = 'confirmed' | 'needs-review' | 'missing'

export type RoleTeam = 'townsfolk' | 'outsider' | 'minion' | 'demon' | 'traveler' | 'fabled'

export type SetupCountedTeam = 'townsfolk' | 'outsider' | 'minion' | 'demon'

export type SetupTemplateStyle = 'balanced' | 'chaos' | 'beginner' | 'long-game' | 'bluff-heavy'

export type AbilityInputKind = 'none' | 'player' | 'players' | 'role' | 'number' | 'text'

export interface ScriptSource {
  author?: string
  version?: string
  url?: string
  contentHash: string
  verifiedAt: string
}

export interface SmartRoleDefinition {
  id: RoleId
  name: string
  officialName?: string
  team: RoleTeam
  abilityText: string
  iconPath?: string
  inputKinds: readonly AbilityInputKind[]
  knowledgeStatus: KnowledgeStatus
  research?: RoleResearchMetadata
}

export interface RoleResearchMetadata {
  edition?: string
  setupImpact: readonly string[]
  possibleOutcomes: readonly string[]
  stateChanges: readonly string[]
  identityChanges: readonly string[]
  teamChanges: readonly string[]
  playerMessageTemplates: readonly string[]
  highRiskNotes: readonly string[]
  sourceUrls: readonly string[]
  reviewedAt: string
}

export interface AIRoleResearchBrief {
  roleId: RoleId
  name: string
  officialName?: string
  knowledgeStatus: KnowledgeStatus
  inputKinds: readonly AbilityInputKind[]
  setupImpact: readonly string[]
  possibleOutcomes: readonly string[]
  stateChanges: readonly string[]
  identityChanges: readonly string[]
  teamChanges: readonly string[]
  playerMessageTemplates: readonly string[]
  highRiskNotes: readonly string[]
  sourceUrls: readonly string[]
  reviewedAt?: string
}

export interface NightOrderEntry {
  roleId: RoleId
  order: number
  note?: string
  knowledgeStatus: KnowledgeStatus
}

export interface SetupTemplate {
  templateId: string
  scriptId: ScriptId
  playerCount: PlayerCount
  style: SetupTemplateStyle
  roles: readonly RoleId[]
  repeatableRoles?: readonly RoleId[]
  bluffs: readonly RoleId[]
  setupAdjustments?: readonly SetupAdjustment[]
  notes: readonly string[]
  verified: boolean
}

export interface SetupAdjustment {
  ruleId: string
  compositionDelta: Partial<Record<SetupCountedTeam, number>>
  choiceId?: string
  note?: string
}

export interface SetupRule {
  id: string
  roleId?: RoleId
  summary: string
  knowledgeStatus: KnowledgeStatus
  sourceUrls?: readonly string[]
  reviewedAt?: string
}

export interface SmartScriptPack {
  scriptId: ScriptId
  displayName: string
  source: ScriptSource
  playerCounts: readonly PlayerCount[]
  roles: readonly SmartRoleDefinition[]
  nightOrders: {
    firstNight: readonly NightOrderEntry[]
    otherNight: readonly NightOrderEntry[]
  }
  setupTemplates: readonly SetupTemplate[]
  setupRules: readonly SetupRule[]
  demonBluffPolicy?: SmartScriptDemonBluffPolicy
  knowledgeStatus: KnowledgeStatus
}

export interface SmartScriptDemonBluffPolicy {
  count: number
  eligibleTeams: readonly SetupCountedTeam[]
  requireNotInPlay: boolean
  summary: string
}
