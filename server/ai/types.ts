export type AIProviderKind = 'fake' | 'openai-compatible'
export type PublicAIMode = 'off' | 'backend_proxy'

export interface PublicAISettings {
  mode: PublicAIMode
  provider: AIProviderKind
  baseUrl?: string
  model?: string
  timeoutSeconds: number
  contextLimit: number
  apiKeyConfigured: boolean
}

export interface AIProviderPrivateSettings extends PublicAISettings {
  enabled: boolean
  apiKey?: string
}

export type AISettingsCheckCode =
  | 'AI_PROVIDER_DISABLED'
  | 'AI_PROVIDER_UNCONFIGURED'
  | 'AI_PROVIDER_READY'

export interface AISettingsTestResult {
  ok: boolean
  provider: AIProviderKind
  model?: string
  code: AISettingsCheckCode
  message: string
}

export type AISettingsLiveTestCode =
  | AISettingsCheckCode
  | 'AI_PROVIDER_TIMEOUT'
  | 'AI_PROVIDER_RATE_LIMITED'
  | 'AI_PROVIDER_BAD_RESPONSE'
  | 'AI_PROVIDER_UNAVAILABLE'

export interface AISettingsLiveTestRequest {
  provider?: AIProviderKind
  baseUrl?: string
  model?: string
  apiKey?: string
  timeoutSeconds?: number
}

export interface AISettingsLiveTestResult {
  ok: boolean
  provider: AIProviderKind
  model?: string
  code: AISettingsLiveTestCode
  message: string
}

export interface AIProviderChatMessage {
  role: 'system' | 'user'
  content: string
}

export type AIAdviceConfidence = 'low' | 'medium' | 'high'

export interface SetupAdviceSeatBrief {
  seatId: number
  nickname?: string
  experience?: 'new' | 'regular' | 'veteran'
}

export interface SetupAdviceRoleBrief {
  seatId: number
  roleId: string
  roleName: string
  team?: string
  abilityText?: string
  roleKnowledge?: {
    roleId: string
    title: string
    riskTags: readonly string[]
    requiredContext: readonly string[]
    reminders: readonly string[]
    aiCannot: readonly string[]
  }
  roleResearch?: RoleResearchProviderBrief
}

export interface SetupAdviceRolePoolBrief {
  roleId: string
  roleName: string
  team: string
  abilityText: string
  knowledgeStatus?: string
  inputKinds?: readonly string[]
  setupImpact?: readonly string[]
  possibleOutcomes?: readonly string[]
  highRiskNotes?: readonly string[]
  roleKnowledge?: SetupAdviceRoleBrief['roleKnowledge']
  roleResearch?: RoleResearchProviderBrief
}

export interface SetupAdviceCheckBrief {
  id: string
  status: string
  summary: string
}

export interface SetupAdviceCandidateBrief {
  id: string
  title: string
  style?: string
  summary: string
  playerFit?: string
  risk?: string
  roles: readonly SetupAdviceRoleBrief[]
  demonBluffs: readonly string[]
  legalityChecks?: readonly SetupAdviceCheckBrief[]
}

export interface SetupAdviceProviderRequest {
  scriptId: string
  scriptName: string
  knowledgeVersion: string
  playerCount: number
  seats: readonly SetupAdviceSeatBrief[]
  rolePool?: readonly SetupAdviceRolePoolBrief[]
  candidates: readonly SetupAdviceCandidateBrief[]
}

export interface SetupAdviceMicroAdjustment {
  candidateId: string
  candidateTitle?: string
  replaceOutRoleId: string
  replaceOutRoleName?: string
  replaceInRoleId: string
  replaceInRoleName?: string
  reason: string
  expectedEffect: string
  risk: string
}

export type SetupQualityTone = 'stable' | 'swingy' | 'good_favored' | 'evil_favored' | 'new_player_heavy' | 'storyteller_heavy'

export interface SetupQualityTag {
  candidateId: string
  label: string
  tone: SetupQualityTone
  reason: string
}

export interface SetupAdviceDraft {
  provider: AIProviderKind
  confidence: AIAdviceConfidence
  draftOnly: true
  recommendedCandidateIds: string[]
  warnings: string[]
  reasons: string[]
  balanceSummary: string[]
  storytellerNotes: string[]
  microAdjustments: SetupAdviceMicroAdjustment[]
  qualityTags: SetupQualityTag[]
  disclaimer: string
}

export interface NightSettlementOutcomeBrief {
  id: string
  label: string
  ready: boolean
  requiredInputs: readonly string[]
}

export interface NightSettlementSelectedTargetBrief {
  seatId: number
  playerLabel: string
  roleId: string
  roleName: string
  status: {
    life: string
    impairments: readonly string[]
    markers: readonly string[]
  }
}

export interface RoleResearchProviderBrief {
  roleId: string
  name: string
  officialName?: string
  knowledgeStatus: string
  inputKinds: readonly string[]
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

export interface NightSettlementProviderRequest {
  scriptId: string
  knowledgeVersion: string
  nightRunId: string
  phaseLabel: string
  playerCount: number
  wakeItem: {
    id: string
    orderIndex: number
    seatId: number
    playerLabel: string
    roleId: string
    roleName: string
    ability: string
    storytellerPrompt: string
    targetCount: number
    targetLabel?: string
    roleLabel?: string
    status: {
      life: string
      impairments: readonly string[]
      markers: readonly string[]
    }
  }
  draft: {
    targets: number[]
    roleChoice: string
    outcomeId: string
    playerChoice: string
    draftRevision: number
  }
  availableOutcomes: readonly NightSettlementOutcomeBrief[]
  selectedTargets?: readonly NightSettlementSelectedTargetBrief[]
  statusFacts?: readonly string[]
  roleKnowledge?: {
    roleId: string
    title: string
    riskTags: readonly string[]
    requiredContext: readonly string[]
    reminders: readonly string[]
    aiCannot: readonly string[]
  }
  roleResearch?: RoleResearchProviderBrief
}

export interface NightSettlementAdviceDraft {
  provider: AIProviderKind
  confidence: AIAdviceConfidence
  draftOnly: true
  status: 'answer' | 'needs_input'
  recommendedOutcomeId?: string
  summary: string
  ruleFacts: string[]
  missing: string[]
  warnings: string[]
  journalDrafts: string[]
  playerMessageDrafts: string[]
  stateChangeDrafts: string[]
  authorityWarnings: string[]
  disclaimer: string
}
