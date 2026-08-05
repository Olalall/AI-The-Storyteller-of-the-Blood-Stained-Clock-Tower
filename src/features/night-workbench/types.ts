export type WakeProgress =
  | 'pending'
  | 'draft'
  | 'confirmed'
  | 'deferred'
  | 'skipped'
  | 'not_applicable'

export type Applicability = 'applicable' | 'needs_review' | 'not_applicable'

export type NightType = 'first' | 'other'

export type LifeState = 'alive' | 'dead'

export type ImpairmentState = 'poisoned' | 'drunk'

export interface ManualStatusMarker {
  id: string
  label: string
}

export interface PlayerStatusSnapshot {
  life: LifeState
  impairments: ImpairmentState[]
  markers: ManualStatusMarker[]
}

export type OutcomeInput = 'targets' | 'role'

export type TargetKind = 'player_choice' | 'storyteller_info'

export interface WakeRoleChoice {
  id: string
  label: string
}

export interface RoleSnapshot {
  id: string
  name: string
  initial: string
  iconPath: string
}

export type RoleChangeReason = 'gameplay' | 'entry_correction' | 'other'

export interface RoleChangeEvent {
  id: string
  seatId: number
  revision: number
  changedAt: string
  nightRunId: string
  /** `null` 表示来自配板微调，只用于当前队列快照的角色提示，不写入本夜记录。 */
  originNightRunId: string | null
  phaseLabel: string
  fromRole: RoleSnapshot
  toRole: RoleSnapshot
  reason: RoleChangeReason
  confirmedBy: 'storyteller'
}

export interface WakeOutcomeOption {
  id: string
  label: string
  requiredInputs: OutcomeInput[]
  resultTemplate: string
  informationTemplate?: string
}

export interface AIAdviceReference {
  adviceId: string
  contextRevision: number
  sourceDraftRevision: number
  knowledgeVersion: string
}

export type DraftOutputSource = {
  kind: 'preset'
  templateId: string
  specVersion: string
  modifiedFromAI?: AIAdviceReference
} | ({
  kind: 'ai'
  templateId: string
  specVersion: string
} & AIAdviceReference)

export interface AIResultAdvice extends AIAdviceReference {
  id: string
  kind: 'result'
  nightRunId: string
  wakeItemId: string
  status: 'answer' | 'needs_input'
  recommendedOutcomeId?: string
  summary: string
  facts: string[]
  missing: string[]
  journalDrafts: string[]
  playerMessageDrafts: string[]
  stateChangeDrafts: string[]
  authorityWarnings: string[]
  confidence: 'low' | 'medium' | 'high'
}

export interface OutcomeResolutionHint {
  recommendedOutcomeId: string
  title: string
  detail: string
}

/**
 * 首夜开头的两个系统步骤：《规则概要》二.2(1)(2) 的「爪牙信息」与「恶魔信息」。
 * 它们没有单一行动者，也没有可选目标——按评审裁决，多座位指认只做勾选清单，
 * 名单一律是只读文案，不进 WakeDraft.targets，也不改 projectWakeDraft 的目标模型。
 */
export type SystemStepKind = 'minion_info' | 'demon_info'

export interface SystemStepCheck {
  id: string
  label: string
}

export interface SystemStepBluffChoice extends WakeRoleChoice {
  /** 「镇民」「外来者」；只用于展示，不参与校验。 */
  teamLabel: string
  /** 配板时预设过的三张伪装，只做提示。 */
  suggested: boolean
}

export interface SystemStepSpec {
  kind: SystemStepKind
  /** 只读名单：本局全部爪牙座位。不建模为目标。 */
  minionLabels: string[]
  /** 只读：本局恶魔座位。 */
  demonLabel: string
  /** 要出示的信息标记文案，按出示顺序。 */
  infoTokens: string[]
  checks: SystemStepCheck[]
  /** 仅恶魔信息：要展示的不在场善良角色张数。 */
  bluffCount?: number
  /** 仅恶魔信息：剧本角色减去在场角色后的善良角色。 */
  bluffChoices?: SystemStepBluffChoice[]
}

export interface WakeItem {
  id: string
  orderIndex: number
  seatId: number
  playerLabel: string
  roleId: string
  roleName: string
  roleInitial: string
  iconPath: string
  ability: string
  storytellerPrompt: string
  progress: WakeProgress
  applicability: Applicability
  status: PlayerStatusSnapshot
  history?: string
  reason?: string
  targetCount: number
  targetLabel?: string
  targetKind?: TargetKind
  roleChoices?: WakeRoleChoice[]
  roleLabel?: string
  interactionVersion: string
  outcomeOptions: WakeOutcomeOption[]
  /** 有值时本项是系统步骤卡，没有目标网格，也不参与换角与AI建议。 */
  systemStep?: SystemStepSpec
}

export interface NightSeatSnapshot {
  seatId: number
  playerLabel: string
  nickname: string
  role: RoleSnapshot | null
  status: PlayerStatusSnapshot
}

export interface WakeDraft {
  targets: number[]
  roleChoice: string
  outcomeId: string
  playerChoice: string
  storytellerResult: string
  informationGiven: string
  outputSource?: DraftOutputSource
  /** 系统步骤卡已勾选的确认项。旧记录没有这个字段，读取时一律按空数组处理。 */
  systemChecks?: string[]
  /** 恶魔信息卡本夜给出的不在场善良角色，按点击顺序。 */
  bluffRoleIds?: string[]
  draftRevision: number
  updatedAt?: string
}

export interface NightWorkbenchState {
  nightRunId: string
  scriptId: string
  nightLabel: string
  nightType: NightType
  playerCount: number
  revision: number
  knowledgeVersion: string
  queue: WakeItem[]
  /** 由 GameSession 投影出的全座位快照；仅给 AI 上下文和 UI 展示用，不持久化进 NightRun。 */
  seatSnapshots: Record<number, NightSeatSnapshot>
  activeCursorId: string
  previewEntryId: string
  drafts: Record<string, WakeDraft>
  privacyShielded: boolean
  dimmed: boolean
  aiAdviceLog: Record<string, AIResultAdvice>
  correctionItemId: string | null
  confirmedRecords: Record<string, ConfirmedWakeRecord[]>
  roleChangeEvents: RoleChangeEvent[]
  lastNotice: string
}

export interface NightOrderListItem {
  id: string
  kind: 'game' | 'reference'
  orderIndex: number
  roleId: string
  roleName: string
  roleInitial: string
  iconPath?: string
  seatId?: number
  playerLabel?: string
  history?: string
  progress?: WakeProgress
  applicability?: Applicability
  phaseMarker?: boolean
  /** 系统步骤：没有单一座位，playerLabel 本身就是名单，遮蔽时必须整条替换。 */
  systemStep?: boolean
}

export interface ConfirmedWakeRecord {
  id: string
  wakeItemId: string
  revision: number
  confirmedAt: string
  correctionOf?: string
  snapshot: WakeDraft
}

export interface ScriptSourceMetadata {
  scriptId: string
  displayName: string
  author: string
  version: string
  sourceUrl: string
  retrievedAt: string
  contentHash: string
  officialNightOrderUrl: string
  officialNightOrderHash: string
  officialRolesUrl: string
  officialRolesHash: string
  trustLevel: 'community-json/T1'
}
