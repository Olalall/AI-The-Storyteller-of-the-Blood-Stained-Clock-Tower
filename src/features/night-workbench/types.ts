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

/**
 * 魔典上的一枚提示标记。它是贴纸，不是效果：放一张纸不改变任何其它字段。
 * 裁决 9 只放宽这两个可选字段，definitionId / semantics / inverted / removalHintText 推后；
 * 就地放宽而不是另立 ReminderToken，是为了让「标记」在全仓只有一个真身。
 */
export interface ManualStatusMarker {
  id: string
  label: string
  /**
   * 是谁的能力放的（角色 id）。黄昏到期候选要靠它筛：
   * 只有 label 的话，判断「僧侣保护」该不该在黎明清掉就得去猜文案，改个措辞就失效。
   */
  sourceRoleId?: string
  /**
   * 放在哪个相位段。`null` = 放置时没有开放的段落（例如配板阶段就先贴了）。
   * 只存引用不存标签：localSessionAdapter 的 normalizePhaseSegments 会在加载时重算
   * segment.sequence，相位标签是可变派生值——冻结成字符串会在段落被规整后与实际相位对不上。
   * 标签一律由 segmentId 在渲染时查表得出。
   */
  placedInSegmentId?: string | null
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

/**
 * 一条状态建议能指向的字段。刻意与 PlayerState 的字段名对齐但**不是** keyof PlayerState：
 * `marker` 对应的是 markers 数组里的一枚贴纸，不是整个数组赋值。
 */
export type AIStateChangeField = 'life' | 'poisoned' | 'drunk' | 'marker'

/**
 * 建议要改成什么。`to` 是字符串而不是各字段的原生类型，因为它来自模型的 JSON：
 * 收窄成联合类型会让「模型多写一个字」变成解析崩溃，而裁决要求解析失败降级纯文本、不是丢弃结构。
 * 合法取值由 normalizeStateChangeDrafts 白名单校验（life: alive|dead，毒醉: true|false，marker: add|remove）。
 */
export interface AIStateChangeProposal {
  field: AIStateChangeField
  to: string
  /** field 为 marker 时必填：这枚贴纸的文字。其它 field 上出现一律视为解析失败。 */
  markerLabel?: string
}

/**
 * AI 给出的一条状态改动建议。
 *
 * text 必填、seatId 与 change 可选，是这条建议「最强也只是一句话」的类型级保证：
 * 结构解析不出来就退回一句人话，说书人照样看得见；解析出来了也只是多一个采纳按钮，
 * 落盘仍要说书人自己点。一条建议最多对应一个座位的一个字段——多字段建议是级联写入
 * 最自然的伪装形态，说书人点确认时没有任何办法表达他只认可其中一半。
 *
 * 溯源不在这里：复用 AIResultAdvice 上已有的 adviceId / contextRevision / knowledgeVersion，
 * 不给每条建议再发一个 id，否则同一件事会有两条互相追不上的来源链。
 */
export interface AIStateChangeDraft {
  text: string
  /** 必须是本次请求 input 里出现过的座位号；不是就整条丢弃，见 normalizeStateChangeDrafts。 */
  seatId?: number
  change?: AIStateChangeProposal
}

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
  stateChangeDrafts: AIStateChangeDraft[]
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
