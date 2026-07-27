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
