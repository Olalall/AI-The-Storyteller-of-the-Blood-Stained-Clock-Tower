import { useCallback, useState } from 'react'
// arch-allow: state-no-ai-import 这是组件层 hook，误落在 state/ 目录；搬家会动 NightWorkbench 的 import，留给主控排期
import { createNightResultAdviceAsync } from '../../../services/ai'
import type { NightWorkbenchState, WakeDraft, WakeItem } from '../types'
import type { NightWorkbenchAction } from './nightWorkbenchReducer'

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
