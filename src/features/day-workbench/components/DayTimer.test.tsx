import { render, screen, act, fireEvent } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DiscussionTimerProvider } from '../state/discussionTimer'
import { discussionTimerStorageKey } from '../state/discussionTimerStorage'
import { DayTimer } from './DayTimer'

const sessionId = 'timer-test'

function renderTimer() {
  return render(<DiscussionTimerProvider sessionId={sessionId}><DayTimer /></DiscussionTimerProvider>)
}

describe('DayTimer', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-14T12:00:00.000Z'))
  })

  afterEach(() => vi.useRealTimers())

  it('starts with the private discussion timer and keeps the public timer next', () => {
    renderTimer()

    const timer = screen.getByRole('timer', { name: '白天节奏计时' })
    expect(timer).toHaveTextContent(/私聊\s*15:00/)
    expect(timer).toHaveTextContent('下一段：公聊 10分')
    expect(screen.getByRole('button', { name: '开始私聊倒计时' })).toBeEnabled()
    expect(window.localStorage.getItem('botc-copilot-session-v1')).toBeNull()
  })

  it('lets the storyteller set private and public durations before starting', () => {
    renderTimer()

    fireEvent.click(screen.getByRole('button', { name: '设置私聊和公聊时长' }))
    fireEvent.change(screen.getByLabelText('私聊分钟数'), { target: { value: '17' } })
    fireEvent.change(screen.getByLabelText('公聊分钟数'), { target: { value: '8' } })
    fireEvent.click(screen.getByRole('button', { name: '保存时长' }))

    const timer = screen.getByRole('timer', { name: '白天节奏计时' })
    expect(timer).toHaveTextContent(/私聊\s*17:00/)
    expect(timer).toHaveTextContent('下一段：公聊 8分')
    expect(window.localStorage.getItem(discussionTimerStorageKey(sessionId))).toContain('1020000')
    expect(window.localStorage.getItem(discussionTimerStorageKey(sessionId))).toContain('480000')
  })

  it('requires the private timer to finish before the storyteller can start public discussion', () => {
    window.localStorage.setItem(discussionTimerStorageKey(sessionId), JSON.stringify({
      activeStage: 'private',
      private: { durationMs: 900_000, remainingMs: 1_000, endsAt: Date.now() + 1_000 },
      public: { durationMs: 480_000, remainingMs: 480_000, endsAt: null },
    }))
    renderTimer()

    act(() => vi.advanceTimersByTime(1_000))
    expect(screen.getByRole('timer', { name: '白天节奏计时' })).toHaveTextContent(/私聊\s*结束/)
    expect(screen.getByRole('button', { name: '开始公聊倒计时' })).toBeEnabled()

    fireEvent.click(screen.getByRole('button', { name: '开始公聊倒计时' }))
    expect(screen.getByRole('timer', { name: '白天节奏计时' })).toHaveTextContent(/公聊\s*8:00/)
    expect(screen.getByRole('button', { name: '暂停公聊倒计时' })).toBeEnabled()
    expect(window.localStorage.getItem('botc-copilot-session-v1')).toBeNull()
  })

  it('shows that public discussion is over without ending the day', () => {
    window.localStorage.setItem(discussionTimerStorageKey(sessionId), JSON.stringify({
      activeStage: 'public',
      private: { durationMs: 900_000, remainingMs: 0, endsAt: null },
      public: { durationMs: 600_000, remainingMs: 1_000, endsAt: Date.now() + 1_000 },
    }))
    renderTimer()

    act(() => vi.advanceTimersByTime(1_000))
    expect(screen.getByRole('timer', { name: '白天节奏计时' })).toHaveTextContent(/公聊\s*结束/)
    expect(screen.getByText('可开始提名')).toBeInTheDocument()
    expect(window.localStorage.getItem('botc-copilot-session-v1')).toBeNull()
  })
})
