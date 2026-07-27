import { createContext, useContext } from 'react'
import type { DiscussionTimerContextValue } from './discussionTimerTypes'

export const DiscussionTimerContext = createContext<DiscussionTimerContextValue | null>(null)

export function useDiscussionTimer() {
  const value = useContext(DiscussionTimerContext)
  if (!value) throw new Error('useDiscussionTimer 必须在 DiscussionTimerProvider 内使用')
  return value
}
