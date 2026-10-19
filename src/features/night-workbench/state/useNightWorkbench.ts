import { useCallback } from 'react'
import { emptyWakeDraft } from './projectWakeDraft'
import { currentRoleForItem, latestRoleChange } from './roleChanges'
import {
  sessionInitialNightState,
  type NightWorkbenchSessionBinding,
} from './gameSessionAdapter'
import type { NightWorkbenchAction } from './nightWorkbenchReducer'
import { canConfirmDraft } from './workbenchGuards'

export type { NightWorkbenchSessionBinding } from './gameSessionAdapter'

export function useNightWorkbench(binding: NightWorkbenchSessionBinding) {
  const state = sessionInitialNightState(binding)
  const nightRunId = state?.nightRunId
  const expectedWakeItemId = state?.previewEntryId
  const expectedActiveCursorId = state?.activeCursorId
  const dispatchSession = binding.dispatchSession
  const dispatch = useCallback((action: NightWorkbenchAction) => {
    if (nightRunId && expectedWakeItemId && expectedActiveCursorId) dispatchSession({ type: 'night-workbench-action', nightRunId, expectedWakeItemId, expectedActiveCursorId, action })
  }, [dispatchSession, nightRunId, expectedWakeItemId, expectedActiveCursorId])
  if (!state) return null

  const previewIndex = state.queue.findIndex((item) => item.id === state.previewEntryId)
  const activeIndex = state.queue.findIndex((item) => item.id === state.activeCursorId)
  const current = state.queue[previewIndex]
  const draft = state.drafts[current.id] ?? emptyWakeDraft()
  const completed = state.queue.filter((item) => item.progress === 'confirmed').length
  const needsReview = state.queue.filter((item) => item.applicability === 'needs_review').length
  const deferred = state.queue.filter((item) => item.progress === 'deferred').length
  const isPreviewing = state.previewEntryId !== state.activeCursorId
  const isReadOnly =
    current.progress === 'deferred' ||
    current.progress === 'skipped' ||
    current.progress === 'not_applicable' ||
    (current.progress === 'confirmed' && state.correctionItemId !== current.id)
  const isCorrecting = state.correctionItemId === current.id
  const canConfirm = canConfirmDraft(state, current, draft)
  const previous = state.queue[previewIndex - 1]
  const next = state.queue[previewIndex + 1]
  const currentRole = currentRoleForItem(current, state.roleChangeEvents)

  return {
    state,
    dispatch,
    current,
    draft,
    previewIndex,
    activeIndex,
    completed,
    needsReview,
    deferred,
    isPreviewing,
    isReadOnly,
    isCorrecting,
    canConfirm,
    currentRole,
    currentRoleChange: latestRoleChange(state.roleChangeEvents, current.seatId),
    previousRole: previous ? currentRoleForItem(previous, state.roleChangeEvents) : undefined,
    nextRole: next ? currentRoleForItem(next, state.roleChangeEvents) : undefined,
    previous,
    next,
  }
}
