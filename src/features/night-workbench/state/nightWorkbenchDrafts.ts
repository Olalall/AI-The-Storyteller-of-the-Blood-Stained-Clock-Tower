import type { NightWorkbenchState, WakeDraft, WakeItem } from '../types'
import { emptyWakeDraft } from './projectWakeDraft'

export function updatePreviewDraft(
  state: NightWorkbenchState,
  update: (draft: WakeDraft, item: WakeItem) => WakeDraft,
): NightWorkbenchState {
  const item = state.queue.find((entry) => entry.id === state.previewEntryId)
  if (!item) return state
  const current = state.drafts[item.id] ?? emptyWakeDraft()
  const changed = update(current, item)
  if (changed === current) return state
  const nextDraft = {
    ...changed,
    draftRevision: current.draftRevision + 1,
    updatedAt: new Date().toISOString(),
  }
  const queue = state.queue.map((entry) =>
    entry.id === item.id && entry.progress === 'pending' ? { ...entry, progress: 'draft' as const } : entry,
  )
  return {
    ...state,
    queue,
    revision: state.revision + 1,
    drafts: { ...state.drafts, [item.id]: nextDraft },
    lastNotice: '草稿已保留',
  }
}

export function advanceFrom(state: NightWorkbenchState): NightWorkbenchState {
  const currentIndex = state.queue.findIndex((item) => item.id === state.activeCursorId)
  const next = state.queue.slice(currentIndex + 1).find((item) => !['confirmed', 'not_applicable'].includes(item.progress))
  if (!next) return { ...state, lastNotice: '已到夜序末尾，请打开夜间顺序检查暂缓和待核对项' }
  return {
    ...state,
    activeCursorId: next.id,
    previewEntryId: next.id,
    correctionItemId: null,
    lastNotice: `当前进入${next.playerLabel}`,
  }
}

