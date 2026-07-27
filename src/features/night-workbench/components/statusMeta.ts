import type { BadgeTone } from '../../../components/ui/StatusBadge'
import type { ImpairmentState, LifeState, WakeProgress } from '../types'

export const progressMeta: Record<WakeProgress, { label: string; tone: BadgeTone }> = {
  pending: { label: '待处理', tone: 'neutral' },
  draft: { label: '草稿', tone: 'info' },
  confirmed: { label: '已确认', tone: 'success' },
  deferred: { label: '暂缓', tone: 'warning' },
  skipped: { label: '已跳过', tone: 'danger' },
  not_applicable: { label: '不适用', tone: 'neutral' },
}

export const lifeMeta: Record<LifeState, { label: string; tone: BadgeTone }> = {
  alive: { label: '存活', tone: 'success' },
  dead: { label: '死亡', tone: 'neutral' },
}

export const impairmentMeta: Record<ImpairmentState, { label: string; tone: BadgeTone }> = {
  poisoned: { label: '中毒', tone: 'danger' },
  drunk: { label: '醉酒', tone: 'warning' },
}
