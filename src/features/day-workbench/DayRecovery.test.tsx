import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useState } from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createPrototypeGameSession } from '../game-session/data/createPrototypeSession'
import { gameSessionReducer } from '../game-session/state/sessionReducer'
import { projectCurrentPlayerStates } from '../game-session/state/projectors'
import { DayWorkbench } from './DayWorkbench'
import { DiscussionTimerProvider } from './state/discussionTimer'
import { projectStandingExecution } from './state/voteStanding'
import type { GameSessionState } from '../game-session/types'

let latest: GameSessionState
function fixture() {
  const state = createPrototypeGameSession()
  state.timeline = []
  state.phaseSegments = [{ id: 'day-3', kind: 'day', sequence: 3, label: '第3天', createdAt: '2026-10-16T00:00:00Z' }]
  state.dayVoteDraft = null
  state.dayActionDraft = null
  for (const value of Object.values(state.initialPlayerStates)) value.life = 'alive'
  return state
}
function Harness({ initial = fixture(), refuse = false }: { initial?: GameSessionState; refuse?: boolean }) {
  const [state, setState] = useState(initial)
  latest = state
  return <DiscussionTimerProvider sessionId={state.id}><DayWorkbench session={state} dispatch={(action) => { if (!refuse) setState((current) => gameSessionReducer(current, action)) }} onExit={() => undefined} /></DiscussionTimerProvider>
}
async function vote(user: ReturnType<typeof userEvent.setup>, nominator: number, nominee: number, votes: number) {
  const nextRound = screen.queryByRole('button', { name: '开始下一轮提名' })
  if (nextRound) await user.click(nextRound)
  await user.click(screen.getByRole('button', { name: `选择${nominator}号为提名人` }))
  await user.click(screen.getByRole('tab', { name: '被提名人 · 未选' }))
  await user.click(screen.getByRole('button', { name: `选择${nominee}号为被提名人` }))
  await user.click(screen.getByRole('button', { name: '下一步：记录举手' }))
  for (let seat = 1; seat <= votes; seat++) fireEvent.click(screen.getByRole('button', { name: `记录${seat}号举手` }))
  await user.click(screen.getByRole('button', { name: '记录本轮票型' }))
}

describe('day correction and manual resolution recovery', () => {
  beforeEach(() => window.localStorage.clear())
  it('corrects a wrong high tally downward, then voids its latest version while retaining the entire chain', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await vote(user, 1, 4, 8)
    await vote(user, 2, 5, 7)
    const original = latest.timeline[0]
    await user.click(screen.getByText('票型记录与更正（2轮）'))
    await user.click(screen.getAllByRole('button', { name: '更正票型' })[0])
    const dialog = within(screen.getByRole('dialog', { name: '更正票型' }))
    await user.click(dialog.getByRole('button', { name: '取消7号举手' }))
    await user.click(dialog.getByRole('button', { name: '取消8号举手' }))
    expect(dialog.getByRole('button', { name: '确认更正票型' })).toBeDisabled()
    fireEvent.change(dialog.getByLabelText('更正原因'), { target: { value: '核对现场实际6票' } })
    await user.click(dialog.getByRole('button', { name: '确认更正票型' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(latest.timeline[0]).toEqual(original)
    expect(projectStandingExecution(latest.timeline, 'day-3')).toMatchObject({ nomineeSeatId: 5, voteCount: 7 })
    const corrected = latest.timeline.at(-1)!
    expect(corrected.correctionOf).toBe(original.id)
    const row = screen.getByText(/1号提名4号 · 6票/).closest('article')!
    await user.click(within(row).getByRole('button', { name: '撤销票型' }))
    const cancellation = within(screen.getByRole('dialog', { name: '撤销票型' }))
    fireEvent.change(cancellation.getByLabelText('撤销原因'), { target: { value: '该次投票无效' } })
    await user.click(cancellation.getByRole('button', { name: '确认撤销票型' }))
    expect(latest.timeline.at(-1)).toMatchObject({ kind: 'vote_round', voided: true, correctionOf: corrected.id, correctionReason: '该次投票无效' })
    expect(latest.timeline.filter((entry) => entry.kind === 'player_state_changed')).toEqual([])
  })

  it('cancels an accidental nomination draft without closing the day or changing the previous result', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await vote(user, 1, 4, 6)
    const before = JSON.stringify(latest.timeline)
    const nextRound = screen.queryByRole('button', { name: '开始下一轮提名' })
    if (nextRound) await user.click(nextRound)
    await user.click(screen.getByRole('button', { name: '选择2号为提名人' }))
    expect(screen.getByRole('button', { name: '记录处决4号' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: '取消本轮提名' }))
    expect(screen.getByRole('button', { name: '记录处决4号' })).toBeEnabled()
    expect(latest.dayVoteDraft).toBeNull()
    expect(latest.phaseSegments[0].closedAt).toBeUndefined()
    expect(JSON.stringify(latest.timeline)).toBe(before)
  })

  it('records a direct special execution with a reason and creates the first day atomically', async () => {
    const user = userEvent.setup()
    const initial = fixture()
    initial.phaseSegments = []
    render(<Harness initial={initial} />)
    await user.click(screen.getByRole('button', { name: '记录特殊处决' }))
    const dialog = within(screen.getByRole('dialog', { name: '记录特殊处决' }))
    await user.selectOptions(dialog.getByLabelText('被处决座位'), '1')
    expect(dialog.getByRole('button', { name: '确认特殊处决' })).toBeDisabled()
    fireEvent.change(dialog.getByLabelText('特殊处决原因'), { target: { value: '确认贞洁者能力触发，处决提名者' } })
    await user.click(dialog.getByRole('button', { name: '确认特殊处决' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(latest.phaseSegments).toHaveLength(1)
    expect(latest.timeline.map((entry) => entry.kind)).toEqual(['execution', 'player_state_changed'])
    expect(latest.timeline[0]).toMatchObject({ executedSeatId: 1, exceptionReason: '确认贞洁者能力触发，处决提名者' })
    expect(projectCurrentPlayerStates(latest)[1].life).toBe('dead')
    expect(latest.phaseSegments[0].closedAt).toBeUndefined()
  })

  it('counts a storyteller-confirmed additional vote and requires its reason before recording', async () => {
    const user = userEvent.setup()
    const initial = fixture()
    for (let seat = 7; seat <= 12; seat++) initial.initialPlayerStates[seat].life = 'dead'
    render(<Harness initial={initial} />)
    const nextRound = screen.queryByRole('button', { name: '开始下一轮提名' })
    if (nextRound) await user.click(nextRound)
    await user.click(screen.getByRole('button', { name: '选择2号为提名人' }))
    await user.click(screen.getByRole('tab', { name: '被提名人 · 未选' }))
    await user.click(screen.getByRole('button', { name: '选择4号为被提名人' }))
    await user.click(screen.getByRole('button', { name: '下一步：记录举手' }))
    for (const seat of [1, 2]) await user.click(screen.getByRole('button', { name: `记录${seat}号举手` }))
    await user.click(screen.getByLabelText('手工修正票数'))
    fireEvent.change(screen.getByLabelText('票数修正', { exact: true }), { target: { value: '1' } })
    expect(screen.getByRole('button', { name: '记录本轮票型' })).toBeDisabled()
    fireEvent.change(screen.getByLabelText('票数修正原因'), { target: { value: '确认1号双票，另计一票' } })
    await user.click(screen.getByRole('button', { name: '记录本轮票型' }))
    expect(projectStandingExecution(latest.timeline, 'day-3')).toMatchObject({ status: 'leading', nomineeSeatId: 4, voteCount: 3 })
    expect(latest.timeline[0]).toMatchObject({ raisedSeatIds: [1, 2], voteAdjustment: { count: 1, reason: '确认1号双票，另计一票' } })
  })

  it('keeps special execution inputs when the command is rejected instead of showing success or closing', async () => {
    const user = userEvent.setup()
    render(<Harness refuse />)
    await user.click(screen.getByRole('button', { name: '记录特殊处决' }))
    const dialog = within(screen.getByRole('dialog', { name: '记录特殊处决' }))
    await user.selectOptions(dialog.getByLabelText('被处决座位'), '1')
    fireEvent.change(dialog.getByLabelText('特殊处决原因'), { target: { value: '人工确认' } })
    await user.click(dialog.getByRole('button', { name: '确认特殊处决' }))
    expect(dialog.getByLabelText('特殊处决原因')).toHaveValue('人工确认')
    expect(dialog.getByRole('status')).toHaveTextContent('尚未写入')
    expect(latest.timeline).toEqual([])
  })
})



describe('day stepper retains deployed adjudication controls', () => {
  it('keeps ghost votes and a reasoned tally correction while revisiting nomination, without changing life', async () => {
    const user = userEvent.setup()
    const initial = fixture()
    initial.initialPlayerStates[7].life = 'dead'
    render(<Harness initial={initial} />)
    const before = projectCurrentPlayerStates(latest)
    await user.click(screen.getByRole('button', { name: '选择1号为提名人' }))
    await user.click(screen.getByRole('tab', { name: '被提名人 · 未选' }))
    await user.click(screen.getByRole('button', { name: '选择4号为被提名人' }))
    await user.click(screen.getByRole('button', { name: '下一步：记录举手' }))
    await user.click(screen.getByRole('button', { name: '记录7号举手（已死亡）' }))
    await user.click(screen.getByRole('button', { name: '标死亡票' }))
    await user.click(screen.getByLabelText('手工修正票数'))
    fireEvent.change(screen.getByLabelText('票数修正', { exact: true }), { target: { value: '1' } })
    expect(screen.getByRole('button', { name: '记录本轮票型' })).toBeDisabled()
    fireEvent.change(screen.getByLabelText('票数修正原因'), { target: { value: '说书人核实特殊票数' } })
    await user.click(screen.getByRole('button', { name: '回到步骤1：提名' }))
    expect(latest.timeline).toEqual([])
    await user.click(screen.getByRole('button', { name: '下一步：记录举手' }))
    expect(screen.getByRole('button', { name: '取消7号举手（已死亡）' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '死亡票' })).toHaveClass('is-active')
    expect(screen.getByLabelText('票数修正原因')).toHaveValue('说书人核实特殊票数')
    await user.click(screen.getByRole('button', { name: '记录本轮票型' }))
    expect(latest.timeline[0]).toMatchObject({ kind: 'vote_round', raisedSeatIds: [7], ghostVoteSeatIds: [7], voteAdjustment: { count: 1, reason: '说书人核实特殊票数' } })
    expect(projectCurrentPlayerStates(latest)).toEqual(before)
  })

  it('records a protected execution only after confirmation, then closes locally without starting night or uploading', async () => {
    const user = userEvent.setup()
    const network = vi.spyOn(globalThis, 'fetch')
    try {
      render(<Harness />)
      await vote(user, 1, 4, 6)
      const before = projectCurrentPlayerStates(latest)
      await user.click(screen.getByRole('button', { name: '记录处决4号' }))
      expect(latest.timeline.some((entry) => entry.kind === 'execution')).toBe(false)
      expect(screen.getByRole('button', { name: '回到步骤1：提名' })).toBeDisabled()
      await user.click(screen.getByLabelText('本次处决造成死亡'))
      await user.click(screen.getByRole('button', { name: '确认记录' }))
      expect(latest.timeline.at(-1)).toMatchObject({ kind: 'execution', executedSeatId: 4, causedDeath: false })
      expect(projectCurrentPlayerStates(latest)).toEqual(before)
      await user.click(screen.getByRole('button', { name: '结束今天' }))
      await user.click(screen.getByRole('button', { name: '确认结束' }))
      expect(latest.phaseSegments[0].closedAt).toBeTruthy()
      expect(latest.phaseSegments.some((segment) => segment.kind === 'night')).toBe(false)
      expect(network).not.toHaveBeenCalled()
    } finally { network.mockRestore() }
  })
})
