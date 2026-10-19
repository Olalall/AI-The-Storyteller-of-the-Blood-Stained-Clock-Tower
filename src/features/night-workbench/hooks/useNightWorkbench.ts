import { useCallback } from 'react'
import { deriveWorkbenchMode, isReadOnlyMode, isPreviewMode, isCorrectionMode, type WorkbenchSurface } from '../state/workbenchMode'
import { emptyWakeDraft } from '../state/projectWakeDraft'
import { currentRoleForItem, latestRoleChange } from '../state/roleChanges'
import {
  sessionInitialNightState,
  type NightWorkbenchSessionBinding,
} from '../state/gameSessionAdapter'
import type { NightWorkbenchIntent } from '../state/nightWorkbenchReducer'
import { canConfirmDraft } from '../state/workbenchGuards'

export type { NightWorkbenchSessionBinding } from '../state/gameSessionAdapter'

export function useNightWorkbench(binding: NightWorkbenchSessionBinding, surface: WorkbenchSurface = 'live') {
  const state = sessionInitialNightState(binding)
  const nightRunId = state?.nightRunId
  const expectedWakeItemId = state?.previewEntryId
  const expectedActiveCursorId = state?.activeCursorId
  const dispatchSession = binding.dispatchSession
  const dispatch = useCallback((action: NightWorkbenchIntent) => {
    if (surface === 'replay' || surface === 'deal') return
    if (nightRunId && expectedWakeItemId && expectedActiveCursorId) dispatchSession({ type: 'night-workbench-action', nightRunId, expectedWakeItemId, expectedActiveCursorId, action: { ...action, at: new Date().toISOString() } })
  }, [dispatchSession, nightRunId, expectedWakeItemId, expectedActiveCursorId, surface])
  if (!state) return null

  const previewIndex = state.queue.findIndex((item) => item.id === state.previewEntryId)
  const activeIndex = state.queue.findIndex((item) => item.id === state.activeCursorId)
  const current = state.queue[previewIndex]
  const draft = state.drafts[current.id] ?? emptyWakeDraft()
  const completed = state.queue.filter((item) => item.progress === 'confirmed').length
  const needsReview = state.queue.filter((item) => item.applicability === 'needs_review').length
  const deferred = state.queue.filter((item) => item.progress === 'deferred').length
  const mode = deriveWorkbenchMode(state, current, surface)
  const isPreviewing = isPreviewMode(mode)
  const isReadOnly = isReadOnlyMode(mode)
  const isCorrecting = isCorrectionMode(mode)
  const canConfirm = !isReadOnly && canConfirmDraft(state, current, draft)
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
    mode,
    readOnly: isReadOnly,
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
