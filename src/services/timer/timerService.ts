import { localDiscussionTimerAdapter } from './localDiscussionTimerAdapter'
import type { DiscussionTimerState } from './types'

export function readDiscussionTimer(sessionId: string): DiscussionTimerState {
  return localDiscussionTimerAdapter.load(sessionId)
}

export function saveDiscussionTimer(sessionId: string, timer: DiscussionTimerState) {
  localDiscussionTimerAdapter.save(sessionId, timer)
}
