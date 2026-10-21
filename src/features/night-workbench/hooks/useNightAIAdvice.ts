/**
 * 取 AI 夜间结果建议。
 *
 * 它住在 hooks/ 而不是 state/：state/ 下不许 import services/ai，
 * 因为 reducer 一旦能自己去取建议，就不再是纯函数，归档也不再能忠实回放。
 * 这里取到之后作为 action payload 交给 reducer，方向是单向的。
 */
import { useCallback, useRef, useState } from 'react'
import { createNightResultAdviceAsync } from '../../../services/ai'
import type { NightWorkbenchState, WakeDraft, WakeItem } from '../types'
import type { NightWorkbenchIntent } from '../state/nightWorkbenchReducer'
import { emptyWakeDraft } from '../state/projectWakeDraft'

interface NightAIAdviceContext {
  state: NightWorkbenchState
  isReadOnly: boolean
  isPreviewing: boolean
}

/** 仅农夫的新触发核对需要先得到主持认可，其他待核对角色仍可借助AI核对。 */
export function farmerTriggerReviewPending(item: WakeItem) {
  return item.roleId === 'farmer' && item.interactionVersion === 'farmer/trigger-review-v1' && item.applicability !== 'applicable'
}

export function useNightAIAdvice(context?: NightAIAdviceContext) {
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null)
  const currentContext = useRef(context)
  currentContext.current = context

  const requestAIAdvice = useCallback(async (
    state: NightWorkbenchState,
    item: WakeItem,
    draft: WakeDraft,
    // 只接意图：时间戳由 dispatch 入口统一盖，异步取建议这条路径也不例外。
    dispatch: (intent: NightWorkbenchIntent) => void,
  ) => {
    if (loadingItemId || item.aiAdviceEnabled === false || item.systemStep) return
    const latest = currentContext.current
    if (!latest || latest.isReadOnly || latest.isPreviewing) return
    const current = latest.state.queue.find((entry) => entry.id === latest.state.activeCursorId)
    if (!current || latest.state.previewEntryId !== current.id || item.id !== current.id
      || state.nightRunId !== latest.state.nightRunId || state.revision !== latest.state.revision || state.contextKey !== latest.state.contextKey
      || item.roleId !== current.roleId || item.interactionVersion !== current.interactionVersion || item.applicability !== current.applicability
      || draft.draftRevision !== (latest.state.drafts[current.id] ?? emptyWakeDraft()).draftRevision
      || ['deferred', 'skipped', 'not_applicable'].includes(current.progress)
      || current.progress === 'confirmed' && latest.state.correctionItemId !== current.id
      || current.aiAdviceEnabled === false || current.systemStep || farmerTriggerReviewPending(current)) return
    setLoadingItemId(item.id)
    try {
      const advice = await createNightResultAdviceAsync({ state, item, draft })
      dispatch({ type: 'apply-ai-advice', advice })
    } finally {
      setLoadingItemId(null)
    }
  }, [loadingItemId])

  return {
    loadingItemId,
    requestAIAdvice,
  }
}
