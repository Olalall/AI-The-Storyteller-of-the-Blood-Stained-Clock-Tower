import type { NightWorkbenchState, WakeDraft, WakeItem } from '../types'
import { outcomeReady, targetRoleChoicesSatisfied, wakeTargetsStructurallyValid } from './projectWakeDraft'
import { currentRoleForItem } from './roleChanges'

export function canEditItem(state: NightWorkbenchState, item: WakeItem) {
  return (currentRoleForItem(item, state.roleChangeEvents).id === item.roleId || state.correctionItemId === item.id) &&
    state.previewEntryId === state.activeCursorId &&
    item.applicability === 'applicable' &&
    item.progress !== 'deferred' &&
    item.progress !== 'skipped' &&
    item.progress !== 'not_applicable' &&
    !(item.progress === 'confirmed' && state.correctionItemId !== item.id)
}

export function canConfirmDraft(state: NightWorkbenchState, item: WakeItem, draft: WakeDraft) {
  if (item.abilityPhase === 'initial' && draft.targets.some((seat) => state.seatSnapshots[seat]?.status.life !== 'alive')) return false
  if (!targetRoleChoicesSatisfied(item, draft, state.playerCount)) return false
  if (draft.outputSource?.kind === 'ai' && draft.outputSource.contextKey !== state.contextKey) return false
  const selectedOutcome = item.outcomeOptions.find((option) => option.id === draft.outcomeId)
  return canEditItem(state, item) && Boolean(
    wakeTargetsStructurallyValid(item, draft, state.playerCount) &&
    selectedOutcome &&
    outcomeReady(selectedOutcome, item, draft) &&
    draft.outputSource?.templateId === selectedOutcome.id &&
    draft.storytellerResult.trim(),
  )
}
