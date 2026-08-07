import type { AIResultAdvice, NightType, WakeDraft, WakeItem } from '../../night-workbench/types'
import type { TimelineBase } from './timelineBaseTypes'

export interface NightActionEntry extends TimelineBase {
  kind: 'night_action'
  nightRunId: string
  wakeItemId: string
  /** 新记录写入；旧记录允许缺失。用于跨夜按同一角色座位检索登记快照。 */
  actorSeatId?: number
  roleId?: string
  summary: string
  details: string[]
  record: {
    revision: number
    snapshot: WakeDraft
  }
}

/**
 * 只保存夜间工作台的队列、草稿、光标和 UI 选择；确认记录与角色变化
 * 必须从 `timeline` 投影，避免夜晚和首页各存一份权威事实。
 */
export interface NightRunState {
  id: string
  phaseSegmentId: string | null
  scriptId: string
  nightType: NightType
  playerCount: number
  revision: number
  knowledgeVersion: string
  queue: WakeItem[]
  activeCursorId: string
  previewEntryId: string
  drafts: Record<string, WakeDraft>
  privacyShielded: boolean
  dimmed: boolean
  aiAdviceLog: Record<string, AIResultAdvice>
  correctionItemId: string | null
  lastNotice: string
}
