// arch-allow: state-no-ai-import 遗留同步路径 use-ai-result 由 reducer 直接取建议，倒置依赖会改变可见行为，待主控决定去留
import { createNightResultAdvice as createPrototypeNightResultAdvice } from '../../../services/ai'
import type { AIResultAdvice, NightWorkbenchState, WakeDraft, WakeItem } from '../types'
import { applyAIOutcome } from './projectWakeDraft'

export function createAIResultAdvice(
  state: NightWorkbenchState,
  item: WakeItem,
  draft: WakeDraft,
): AIResultAdvice | null {
  return createPrototypeNightResultAdvice({ state, item, draft })
}

export function isCurrentAIAdvice(
  state: NightWorkbenchState,
  item: WakeItem,
  draft: WakeDraft,
  advice: AIResultAdvice,
) {
  return advice.nightRunId === state.nightRunId &&
    advice.wakeItemId === item.id &&
    advice.contextRevision === state.revision &&
    advice.contextKey === state.contextKey &&
    advice.sourceDraftRevision === draft.draftRevision &&
    advice.knowledgeVersion === state.knowledgeVersion
}

export function applyAIResultAdvice(state: NightWorkbenchState, item: WakeItem, draft: WakeDraft, advice: AIResultAdvice) {
  const valid = advice.status === 'answer' && isCurrentAIAdvice(state, item, draft, advice) && Boolean(advice.recommendedOutcomeId)

  if (!valid) return null
  const next = applyAIOutcome(item, draft, advice.recommendedOutcomeId!, advice)
  return next === draft ? null : next
}
