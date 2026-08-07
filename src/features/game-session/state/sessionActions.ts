import type { GameSessionState, HostingMode } from '../types'
import type {
  ScriptId,
} from '../../../domain/scripts'
import type {
  DayActionDraft,
  DayVoteDraft,
  GrimoireOp,
  NightRunState,
  PhaseKind,
  PlayerExperience,
  PlayerState,
  PlayerStateBackfill,
  PlayerStateChangeOrigin,
  SetupDraft,
} from '../types'
import type { ConfirmedWakeRecord, RoleChangeEvent, RoleSnapshot } from '../../night-workbench/types'
import type { PhaseTimelineEntryInput, TimelineAppendInput } from './timeline'

export type GameSessionAction =
  | { type: 'set-setup-draft'; draft: SetupDraft | null }
  | { type: 'set-day-vote-draft'; draft: DayVoteDraft }
  | { type: 'clear-day-vote-draft' }
  | { type: 'set-day-action-draft'; draft: DayActionDraft }
  | { type: 'clear-day-action-draft' }
  | { type: 'confirm-setup'; id: string; confirmedAt: string }
  | {
    type: 'append-phase-entry'
    phaseKind: PhaseKind
    entry: PhaseTimelineEntryInput
    input: TimelineAppendInput
  }
  | {
    type: 'append-correction'
    originalEntryId: string
    entry: PhaseTimelineEntryInput
    input: TimelineAppendInput
  }
  | {
    /**
     * 白天最终处决是一个领域命令：处决事实和死亡状态必须同时进入同一条审计链。
     * 不经由通用 append，避免半次保存或在错误的白天段写入结果。
     */
    type: 'confirm-day-execution'
    daySegmentId: string
    nomineeSeatId: number
    sourceRoundId: string
    executionEntryId: string
    playerStateEntryId: string
    confirmedAt: string
    /**
     * 本次处决是否造成死亡，由说书人裁定。false 时只记录处决事实、不改存活状态
     * （弄臣首次免死、魔鬼代言人保护、处决已死亡玩家等）。省略按 true 处理。
     */
    causesDeath?: boolean
  }
  | {
    /** 白天最终无处决同样必须显式确认，且只能写入当前开放的白天段。 */
    type: 'confirm-day-no-execution'
    daySegmentId: string
    entryId: string
    confirmedAt: string
  }
  | {
    type: 'confirm-player-state-change'
    /** 撤销时填被撤销条目的 id。见 PlayerStateChangedEntry.revertOf。 */
    revertOf?: string
    seatId: number
    expectedBefore: PlayerState
    after: PlayerState
    segmentId: string | null
    entryId: string
    confirmedAt: string
    reason: string
    /**
     * 本次改动的原子意图。魔典路径必须带且长度恒为 1；旧路径不带，行为不变。
     * 带了就要接受 grimoireOpInvariant 的检查：差异字段集必须是 ops[0] 名字的字面子集。
     */
    ops?: GrimoireOp[]
    origin?: PlayerStateChangeOrigin
    /** 同一次手势波及多座位时，各座位一条 action，共用这个 id。 */
    batchId?: string
    backfill?: PlayerStateBackfill
  }
  | {
    /** 说书人本机辨认用昵称；不属于身份、状态或昼夜事实。 */
    type: 'update-seat-nickname'
    seatId: number
    nickname: string
  }
  | {
    type: 'append-setup-change'
    id: string
    createdAt: string
    seatId: number
    fromRole: RoleSnapshot
    toRole: RoleSnapshot
    reason: string
  }
  | {
    /**
     * 夜间工作台的单次交互提交：运行态、已确认记录和角色变更同一次写入会话。
     * 草稿/浏览只更新 NightRun；首次确认才会由记录创建夜晚段。
     */
    type: 'commit-night-workbench'
    nightRun: NightRunState
    records: ConfirmedWakeRecord[]
    roleChanges: RoleChangeEvent[]
  }
  | { type: 'replace-night-run'; nightRun: NightRunState }
  | { type: 'set-active-night-run'; nightRunId: string | null }
  | { type: 'open-phase-segment'; phaseKind: PhaseKind; createdAt: string }
  | { type: 'close-active-night-run'; nightRunId: string; closedAt: string }
  | { type: 'start-next-night-run' }
  | { type: 'close-open-segment'; phaseKind: PhaseKind; closedAt: string }
  | {
    type: 'start-setup-session'
    scriptId: ScriptId
    createdAt: string
    playerCount?: number
    seats?: readonly { seatId: number; nickname?: string; experience?: PlayerExperience | null }[]
  }
  | {
    type: 'start-catfishing-setup-session'
    createdAt: string
    playerCount?: number
    seats?: readonly { seatId: number; nickname?: string; experience?: PlayerExperience | null }[]
  }
  | {
    /**
     * 记录本局用哪种模式主持。这是**唯一**写入 hostingMode 的入口。
     * 它只留痕，不改变任何其他状态——模式不得成为行为分支。
     */
    type: 'set-hosting-mode'
    mode: HostingMode
    changedAt: string
    phaseLabel: string
  }
  | { type: 'reset-session' }
  /** 整局替换。只用于「载入示例对局」这类显式动作，不用于任何自动流程。 */
  | { type: 'replace-session'; session: GameSessionState }
