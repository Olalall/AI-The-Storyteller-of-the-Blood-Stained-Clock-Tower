import type { LifeState, ManualStatusMarker } from '../../night-workbench/types'
import type { GrimoireOp } from './grimoireOp'
import type { TimelineBase } from './timelineBaseTypes'

// ops 是 PlayerStateChangedEntry 的字段，所以 op 类型跟着这个模型一起出门，
// 免得调用方为了读一个字段的类型再去认第二个模块路径。
export type { GrimoireOp, GrimoireOpKind } from './grimoireOp'

export type PlayerExperience = 'new' | 'regular' | 'veteran'

export interface PlayerSeat {
  seatId: number
  label: string
  /** 仅供说书人识别玩家；不是账号、联机身份或权限凭据。 */
  nickname: string
  experience: PlayerExperience
}

export interface PlayerState {
  life: LifeState
  poisoned: boolean
  drunk: boolean
  markers: ManualStatusMarker[]
}

/** 这次改动从哪个界面发起。缺省按 'player_panel' 理解——那是加这个字段之前唯一的入口。 */
export type PlayerStateChangeOrigin =
  | 'player_panel'
  | 'grimoire'
  | 'night_workbench'
  | 'day_workbench'
  | 'handoff'

/**
 * 事后补录的时间归属。
 * createdAt 一律是真实补录时刻，绝不回填：projectCurrentPlayerStates 严格按 createdAt
 * 叠加，往历史时间点插一条会改变后续覆盖顺序，可能让后来的正确状态被旧值盖掉。
 * 所以「这件事其实发生在第 2 夜」只能作为展示层的旁注存在，投影逻辑一个字不动。
 */
export interface PlayerStateBackfill {
  attributedPhaseSegmentId: string
  /** 补录的依据条目（如那条处决记录），让复盘能点回去看来源。 */
  sourceEntryId?: string
}

export interface PlayerStateChangedEntry extends TimelineBase {
  kind: 'player_state_changed'
  seatId: number
  before: PlayerState
  after: PlayerState
  reason: string
  /**
   * 本次改动的原子意图，让记录能显示「给3号加了中毒标记」而不是让人对两份快照做 diff。
   * 它不是命令、永不重放；权威事实始终是 before/after。旧归档没有这个字段，
   * 缺失时 UI 回退到既有的差分文案，两者投影出的当前局面完全一致。
   */
  ops?: GrimoireOp[]
  origin?: PlayerStateChangeOrigin
  /**
   * 同一次手势波及多座位时（如「限」让两人同时中毒），按座位各写一条 entry 共用 batchId。
   * 不合并成一条多座位 entry：那会让 ops 变成复数，而复数 ops 正是级联写入最自然的伪装形态。
   */
  batchId?: string
  /**
   * 这条记录撤销的是哪一条。
   *
   * 刻意**不**复用 correctionOf：在本仓里 correctionOf 的含义是「取代」——
   * projectEffectiveTimelineEntries 与 projectTimelineHistory 都会把被指向的原条目
   * 从历史里滤掉。而撤销的要求恰好相反：「投影结果回到操作前，但历史里两条记录都在」。
   * 用 correctionOf 表达撤销，会正好把撤销本该保住的那条记录藏起来。
   *
   * 当前局面投影不需要认识这个字段——它按时间顺序应用每一条 player_state_changed，
   * 撤销条目把 after 写回原来的 before，自然就回到了操作前。
   */
  revertOf?: string
  backfill?: PlayerStateBackfill
}
