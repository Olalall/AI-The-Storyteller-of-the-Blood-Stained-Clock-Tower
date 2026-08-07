import type { NightWorkbenchState, WakeDraft, WakeItem } from '../types'
import { outcomeReady, wakeTargetsValid } from './projectWakeDraft'

export function canEditItem(state: NightWorkbenchState, item: WakeItem) {
  return state.previewEntryId === state.activeCursorId &&
    item.applicability === 'applicable' &&
    item.progress !== 'deferred' &&
    item.progress !== 'not_applicable' &&
    !(item.progress === 'confirmed' && state.correctionItemId !== item.id)
}

export function canConfirmDraft(state: NightWorkbenchState, item: WakeItem, draft: WakeDraft) {
  const selectedOutcome = item.outcomeOptions.find((option) => option.id === draft.outcomeId)
  return canEditItem(state, item) && Boolean(
    wakeTargetsValid(item, draft, state.playerCount) &&
    selectedOutcome &&
    outcomeReady(selectedOutcome, item, draft) &&
    draft.outputSource?.templateId === selectedOutcome.id &&
    draft.storytellerResult.trim(),
  )
}
