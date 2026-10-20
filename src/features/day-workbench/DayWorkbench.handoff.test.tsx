import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { createPrototypeGameSession } from '../game-session/data/createPrototypeSession'
import { DiscussionTimerProvider } from './state/discussionTimer'
import { DayWorkbench } from './DayWorkbench'

describe('DayWorkbench closed-day handoff', () => {
  it('retains history without offering fresh votes or day actions after the last day has closed', async () => {
    const session = createPrototypeGameSession()
    session.phaseSegments.push({ id: 'day-3', kind: 'day', sequence: 3, label: '第3天', createdAt: '2026-10-20T00:00:00Z', closedAt: '2026-10-20T01:00:00Z' })
    session.timeline.push({ id: 'old-vote', kind: 'vote_round', segmentId: 'day-3', createdAt: '2026-10-20T00:30:00Z', confirmedBy: 'storyteller', roundId: 'round-1', nominatorSeatId: 1, nomineeSeatId: 4, threshold: 6, raisedSeatIds: [1], ghostVoteSeatIds: [] })
    const before = JSON.stringify(session)
    const dispatch = vi.fn()
    const onExit = vi.fn()
    render(<DiscussionTimerProvider sessionId={session.id}><DayWorkbench session={session} dispatch={dispatch} onExit={onExit} /></DiscussionTimerProvider>)

    expect(screen.getByText('第3天已结束，记录已保留。请返回本局，再按现场进度进入夜晚或白天。')).toBeVisible()
    expect(screen.queryByRole('button', { name: '选择1号为提名人' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '记技能/事件' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '记录特殊处决' })).not.toBeInTheDocument()
    await userEvent.setup().click(screen.getByText('票型记录与更正（1轮）'))
    expect(screen.getByText('第3天 · 1号提名4号 · 1票')).toBeVisible()
    expect(screen.getByRole('button', { name: '更正票型' })).toBeEnabled()
    await userEvent.setup().click(screen.getByRole('button', { name: '返回本局' }))
    expect(onExit).toHaveBeenCalledOnce()
    expect(dispatch).not.toHaveBeenCalled()
    expect(JSON.stringify(session)).toBe(before)
  })

  it('does not claim success or exit when closing the current day is rejected', async () => {
    const session = createPrototypeGameSession()
    session.phaseSegments.push({ id: 'day-3', kind: 'day', sequence: 3, label: '第3天', createdAt: '2026-10-20T00:00:00Z' })
    const dispatch = vi.fn()
    const onExit = vi.fn()
    render(<DiscussionTimerProvider sessionId={session.id}><DayWorkbench session={session} dispatch={dispatch} onExit={onExit} /></DiscussionTimerProvider>)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: '结束今天' }))
    await user.click(screen.getByRole('button', { name: '确认结束' }))
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'close-open-segment', phaseKind: 'day' }))
    expect(screen.getByRole('heading', { name: '第3天' })).toBeVisible()
    expect(screen.queryByText(/已结束，记录已保留/)).not.toBeInTheDocument()
    expect(onExit).not.toHaveBeenCalled()
    expect(session.phaseSegments.at(-1)?.closedAt).toBeUndefined()
  })
})
