import type { DiscussionStage } from '../../features/day-workbench/state/discussionTimerTypes'

export interface StageTimerState {
  durationMs: number
  remainingMs: number
  endsAt: number | null
}

export interface DiscussionTimerState {
  activeStage: DiscussionStage
  private: StageTimerState
  public: StageTimerState
}
