import type { AIResultAdvice, NightType, WakeDraft, WakeItem } from '../../night-workbench/types'
import type { TimelineBase } from './timelineBaseTypes'

export interface NightActionEntry extends TimelineBase {
  kind: 'night_action'
  nightRunId: string
  wakeItemId: string
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
