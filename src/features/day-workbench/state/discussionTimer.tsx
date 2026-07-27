import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { readDiscussionTimer, saveDiscussionTimer, type DiscussionTimerState, type StageTimerState } from '../../../services/timer'
import { DiscussionTimerContext } from './useDiscussionTimer'
import type { DiscussionStage, DiscussionTimerContextValue } from './discussionTimerTypes'

const minuteMs = 60_000

const stages = {
  private: { label: '私聊', defaultDurationMs: 15 * minuteMs },
  public: { label: '公聊', defaultDurationMs: 10 * minuteMs },
} as const

function remainingAt(timer: StageTimerState, now: number) {
  return timer.endsAt === null ? timer.remainingMs : Math.max(0, timer.endsAt - now)
}

function formatDiscussionDuration(remainingMs: number) {
  const totalSeconds = Math.ceil(remainingMs / 1000)
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')}`
}

function formatMinutes(durationMs: number) {
  return `${durationMs / minuteMs}分`
}

function timerSummary(stage: DiscussionStage, current: StageTimerState, remainingMs: number, isRunning: boolean, hasElapsed: boolean, publicDurationMs: number) {
  if (hasElapsed) return stage === 'private' ? '私聊结束 · 可开始公聊' : '公聊结束 · 可开始提名'
  if (isRunning) return `${stages[stage].label} · ${formatDiscussionDuration(remainingMs)}`
  if (remainingMs < current.durationMs) return `${stages[stage].label} · 已暂停 ${formatDiscussionDuration(remainingMs)}`
  return stage === 'private'
    ? `私聊 ${formatMinutes(current.durationMs)} → 公聊 ${formatMinutes(publicDurationMs)}`
    : `公聊 ${formatMinutes(current.durationMs)}`
}

export function DiscussionTimerProvider({ sessionId, children }: { sessionId: string; children: ReactNode }) {
  const [timer, setTimer] = useState<DiscussionTimerState>(() => readDiscussionTimer(sessionId))
  const [now, setNow] = useState(() => Date.now())
  const stage = timer.activeStage
  const current = timer[stage]
  const remainingMs = remainingAt(current, now)
  const isRunning = current.endsAt !== null && remainingMs > 0
  const hasElapsed = current.endsAt === null && remainingMs === 0

  useEffect(() => {
    const next = readDiscussionTimer(sessionId)
    setTimer(next)
    setNow(Date.now())
  }, [sessionId])

  useEffect(() => {
    if (current.endsAt === null) return
    const intervalId = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(intervalId)
  }, [current.endsAt])

  useEffect(() => {
    if (current.endsAt !== null && remainingMs === 0) {
      setTimer((value) => ({
        ...value,
        [value.activeStage]: { ...value[value.activeStage], endsAt: null, remainingMs: 0 },
      }))
    }
  }, [current.endsAt, remainingMs])

  useEffect(() => {
    saveDiscussionTimer(sessionId, timer)
  }, [sessionId, timer])

  const value = useMemo<DiscussionTimerContextValue>(() => ({
    activeStage: stage,
    currentLabel: hasElapsed ? '结束' : formatDiscussionDuration(remainingMs),
    summary: timerSummary(stage, current, remainingMs, isRunning, hasElapsed, timer.public.durationMs),
    isRunning,
    hasElapsed,
    privateMinutes: timer.private.durationMs / minuteMs,
    publicMinutes: timer.public.durationMs / minuteMs,
    setDurations(durations) {
      setNow(Date.now())
      setTimer((state) => ({
        ...state,
        private: state.private.endsAt === null
          ? { durationMs: durations.privateMinutes * minuteMs, remainingMs: durations.privateMinutes * minuteMs, endsAt: null }
          : state.private,
        public: state.public.endsAt === null
          ? { durationMs: durations.publicMinutes * minuteMs, remainingMs: durations.publicMinutes * minuteMs, endsAt: null }
          : state.public,
      }))
    },
    startOrPause() {
      const startedAt = Date.now()
      setNow(startedAt)
      setTimer((state) => {
        const active = state.activeStage
        const activeTimer = state[active]
        const nextRemainingMs = remainingAt(activeTimer, startedAt)
        if (activeTimer.endsAt !== null && nextRemainingMs > 0) {
          return { ...state, [active]: { ...activeTimer, endsAt: null, remainingMs: nextRemainingMs } }
        }
        const durationMs = nextRemainingMs || activeTimer.durationMs
        return { ...state, [active]: { ...activeTimer, remainingMs: durationMs, endsAt: startedAt + durationMs } }
      })
    },
    startPublic() {
      const startedAt = Date.now()
      setNow(startedAt)
      setTimer((state) => ({
        ...state,
        activeStage: 'public',
        public: { ...state.public, endsAt: startedAt + state.public.remainingMs },
      }))
    },
    resetCurrentStage() {
      setNow(Date.now())
      setTimer((state) => {
        const active = state.activeStage
        const activeTimer = state[active]
        return { ...state, [active]: { ...activeTimer, endsAt: null, remainingMs: activeTimer.durationMs } }
      })
    },
  }), [current, hasElapsed, isRunning, remainingMs, stage, timer.private.durationMs, timer.public.durationMs])

  return <DiscussionTimerContext.Provider value={value}>{children}</DiscussionTimerContext.Provider>
}
