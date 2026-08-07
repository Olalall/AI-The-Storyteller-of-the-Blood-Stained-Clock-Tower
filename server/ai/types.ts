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

/**
 * 工具对本局局面的知情程度。
 *
 * 它是**前端算好后下发的结论**，不是后端能自己推的：后端只看得见本步唤醒项和已选目标，
 * 看不见「这局一共 12 个座位、工具只知道其中 8 个的身份」。缺省（旧客户端不发这个字段）
 * 一律按「没说」处理，行为与加这个字段之前完全一致——把没说当成 minimal 会让所有历史
 * 客户端突然收到一堆 needs_input，而后端连该点名哪个座位都说不出来。
 */
export type NightSettlementContextLevel = 'minimal' | 'standard'

export interface NightSettlementProviderRequest {
  scriptId: string
  knowledgeVersion: string
  nightRunId: string
  phaseLabel: string
  playerCount: number
  contextLevel?: NightSettlementContextLevel
  /**
   * 工具里还不知道身份的座位号。它是 contextLevel 的证据：光说「我知道得不全」，
   * 模型只能泛泛地推辞；点得出座位号，它才能提出一个说书人真能回答的问题。
   */
  unknownSeatIds?: readonly number[]
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
    minimumTargetCount?: number
    targetLabel?: string
    roleLabel?: string
    status: {
      life: string
      impairments: readonly string[]
      markers: readonly string[]
    }
    previousRegistration?: NightSettlementRegistration
    forbiddenRegistrationValues?: readonly NightSettlementRegistration['value'][]
    previousTargets?: readonly number[]
    forbiddenTargetSeatIds?: readonly number[]
    previousTargetRequired?: boolean
    historicalContext?: {
      kind: 'balloonist_role_type' | 'moonchild_choice' | 'once_per_game_use' | 'pukka_poison' | 'shabaloth_regurgitation' | 'yanluo_delayed_death' | 'po_charge'
      status: 'ready' | 'clear' | 'missing'
      seatIds: readonly number[]
      summary: string
    }
  }
  draft: {
    targets: number[]
    roleChoice: string
    outcomeId: string
    playerChoice: string
    draftRevision: number
    registration?: NightSettlementRegistration
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

export interface NightSettlementRegistration {
  kind: 'role_type' | 'alignment'
  seatId: number
  value: 'townsfolk' | 'outsider' | 'minion' | 'demon' | 'good' | 'evil'
}

/**
 * 一条状态建议能指向的字段。`marker` 指 markers 数组里的一枚贴纸，不是整个数组赋值。
 * 与前端 AIStateChangeField 逐字一致但独立声明：这里是 HTTP 契约的一端，
 * 让它 import src/ 会把「网线上传的是什么」和「浏览器里的类型长什么样」绑成一件事。
 */
export type NightSettlementStateChangeField = 'life' | 'poisoned' | 'drunk' | 'marker'

export interface NightSettlementStateChangeProposal {
  field: NightSettlementStateChangeField
  /** life: alive|dead；poisoned/drunk: true|false；marker: add|remove。白名单之外一律判解析失败。 */
  to: string
  /** field 为 marker 时必填；出现在其它 field 上说明模型串了字段，整个 change 作废。 */
  markerLabel?: string
}

/**
 * 一条状态改动建议。text 必填、其余可选，解析失败降级成纯 text。
 *
 * 这里刻意**不是** op 数组：让模型输出内部写入语言，下一步就会有人写一行 forEach
 * 把它直接派发。一条建议最多对应一个座位的一个字段——多字段建议一旦出现，
 * 说书人点确认时就没有任何办法表达他只认可其中一半。
 */
export interface NightSettlementStateChangeDraft {
  text: string
  seatId?: number
  change?: NightSettlementStateChangeProposal
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
  stateChangeDrafts: NightSettlementStateChangeDraft[]
  authorityWarnings: string[]
  disclaimer: string
}
