import type { DiscussionStage } from '../../features/day-workbench/state/discussionTimerTypes'
import type { DiscussionTimerState, StageTimerState } from './types'

const legacyTimerStorageKey = 'botc-copilot-day-timer-v1'
const priorTimerStorageKey = 'botc-copilot-day-timer-v2'
const prototypeSessionId = 'prototype-catfishing-12'
const minuteMs = 60_000
const minimumDurationMs = minuteMs
const maximumDurationMs = 180 * minuteMs

const stages = {
  private: { defaultDurationMs: 15 * minuteMs },
  public: { defaultDurationMs: 10 * minuteMs },
} as const

export function discussionTimerStorageKey(sessionId: string) {
  return `botc-copilot-ui:${encodeURIComponent(sessionId)}:discussion-timer:v3`
}

function emptyStage(stage: DiscussionStage): StageTimerState {
  const durationMs = stages[stage].defaultDurationMs
  return { durationMs, remainingMs: durationMs, endsAt: null }
}

export function emptyDiscussionTimer(): DiscussionTimerState {
  return { activeStage: 'private', private: emptyStage('private'), public: emptyStage('public') }
}

function isDuration(value: number) {
  return Number.isInteger(value / minuteMs) && value >= minimumDurationMs && value <= maximumDurationMs
}

function readStage(stage: DiscussionStage, value: Partial<StageTimerState> | undefined) {
  const fallback = emptyStage(stage)
  if (!value) return fallback
  const durationMs = typeof value.durationMs === 'number' && isDuration(value.durationMs)
    ? value.durationMs
    : fallback.durationMs
  const remainingMs = typeof value.remainingMs === 'number' && Number.isFinite(value.remainingMs)
    ? Math.max(0, Math.min(value.remainingMs, durationMs))
    : durationMs
  const endsAt = typeof value.endsAt === 'number' && Number.isFinite(value.endsAt) ? value.endsAt : null
  return { durationMs, remainingMs, endsAt }
}

function parseTimer(value: string): DiscussionTimerState | null {
  try {
    const parsed = JSON.parse(value) as Partial<DiscussionTimerState>
    return {
      activeStage: parsed.activeStage === 'public' ? 'public' : 'private',
      private: readStage('private', parsed.private),
      public: readStage('public', parsed.public),
    }
  } catch {
    return null
  }
}

export const localDiscussionTimerAdapter = {
  load(sessionId: string): DiscussionTimerState {
    try {
      const stored = window.localStorage.getItem(discussionTimerStorageKey(sessionId))
      if (stored) return parseTimer(stored) ?? emptyDiscussionTimer()
      if (sessionId !== prototypeSessionId) return emptyDiscussionTimer()

      const prior = window.localStorage.getItem(priorTimerStorageKey)
      if (prior) return parseTimer(prior) ?? emptyDiscussionTimer()

      const legacy = window.localStorage.getItem(legacyTimerStorageKey)
      if (legacy) {
        const parsed = JSON.parse(legacy) as Partial<DiscussionTimerState> & Partial<StageTimerState>
        if (parsed.private || parsed.public) return parseTimer(legacy) ?? emptyDiscussionTimer()
        return { ...emptyDiscussionTimer(), public: readStage('public', parsed) }
      }
    } catch {
      // 本机计时数据异常不应阻塞白天工作台。
    }
    return emptyDiscussionTimer()
  },

  save(sessionId: string, timer: DiscussionTimerState) {
    window.localStorage.setItem(discussionTimerStorageKey(sessionId), JSON.stringify(timer))
  },
}
