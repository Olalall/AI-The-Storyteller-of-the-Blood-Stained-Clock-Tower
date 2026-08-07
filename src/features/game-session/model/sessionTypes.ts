import type { RoleSnapshot } from '../../night-workbench/types'
import type { DayActionDraft, DayVoteDraft } from './dayTypes'
import type { NightRunState } from './nightTypes'
import type { PhaseSegment } from './phaseTypes'
import type { PlayerSeat, PlayerState } from './playerTypes'
import type { SetupDraft } from './setupTypes'
import type { TimelineEntry } from './timelineTypes'

export type HostingMode = 'record' | 'grimoire'

export interface HostingModeChange {
  mode: HostingMode
  changedAt: string
  phaseLabel: string
}

export interface GameSessionState {
  /**
   * 本局用哪种模式主持。**只是出处元数据**：归档要能诚实回放，否则跨模式回看会把
   * 纯记录局渲染成一张看起来很完整、实则大半没人录过的魔典。
   *
   * 严禁任何 reducer 读它——一旦读，行为就按模式分叉，两套数据模型会悄悄长出来。
   * 允许读的只有三处且都不是 reducer：视图层选渲染组件、归档/复盘展示、AI 上下文说明完整度。
   * 由 verify-architecture 的 hosting-mode-not-behavioural 规则强制。
   */
  hostingMode?: HostingMode
  /** 模式切换历史。与 phaseSegments 同级的追加数组，不进 timeline（它是工具事实，不是对局事实）。 */
  hostingModeHistory?: readonly HostingModeChange[]
  schemaVersion: 1
  id: string
  scriptId: string
  playerCount: number
  knowledgeVersion: string
  /** 当前剧本完整角色目录；供说书人选择公开声称，不用于自动结算。 */
  scriptRoles?: RoleSnapshot[]
  seats: Record<number, PlayerSeat>
  /** 初始人工状态；当前状态由此处加上 `player_state_changed` 事件投影。 */
  initialPlayerStates: Record<number, PlayerState>
  phaseSegments: PhaseSegment[]
  timeline: TimelineEntry[]
  /** 可恢复的白天投票草稿；确认票型后才写入 timeline。 */
  dayVoteDraft: DayVoteDraft | null
  /** 可恢复的白天技能/公开事件表单；确认前不属于 TimelineEntry。 */
  dayActionDraft: DayActionDraft | null
  setupDraft: SetupDraft | null
  nightRuns: Record<string, NightRunState>
  activeNightRunId: string | null
}
