import type { RoleSnapshot } from '../../night-workbench/types'
import type { DayActionDraft, DayVoteDraft } from './dayTypes'
import type { NightRunState } from './nightTypes'
import type { PhaseSegment } from './phaseTypes'
import type { PlayerSeat, PlayerState } from './playerTypes'
import type { SetupDraft } from './setupTypes'
import type { TimelineEntry } from './timelineTypes'

export interface GameSessionState {
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
