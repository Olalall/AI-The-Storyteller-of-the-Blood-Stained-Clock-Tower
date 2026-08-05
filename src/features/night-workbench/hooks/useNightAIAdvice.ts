/**
 * 取 AI 夜间结果建议。
 *
 * 它住在 hooks/ 而不是 state/：state/ 下不许 import services/ai，
 * 因为 reducer 一旦能自己去取建议，就不再是纯函数，归档也不再能忠实回放。
 * 这里取到之后作为 action payload 交给 reducer，方向是单向的。
 */
import { useCallback, useState } from 'react'
import { createNightResultAdviceAsync } from '../../../services/ai'
import type { NightWorkbenchState, WakeDraft, WakeItem } from '../types'
import type { NightWorkbenchAction } from '../state/nightWorkbenchReducer'

export function useNightAIAdvice() {
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null)

  const requestAIAdvice = useCallback(async (
    state: NightWorkbenchState,
    item: WakeItem,
    draft: WakeDraft,
    dispatch: (action: NightWorkbenchAction) => void,
  ) => {
    if (loadingItemId) return
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
