export type DiscussionStage = 'private' | 'public'

export interface DiscussionTimerContextValue {
  activeStage: DiscussionStage
  currentLabel: string
  summary: string
  isRunning: boolean
  hasElapsed: boolean
  privateMinutes: number
  publicMinutes: number
  setDurations: (durations: { privateMinutes: number; publicMinutes: number }) => void
  startOrPause: () => void
  startPublic: () => void
  resetCurrentStage: () => void
}
