import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useReducer } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { createPrototypeGameSession } from '../data/createPrototypeSession'
import { gameSessionReducer } from '../state/sessionReducer'
import { StateFollowupSheet } from './StateFollowupSheet'
import { PlayerStatusOverlay } from '../../dashboard/components/PlayerStatusOverlay'

function Harness() {
  const [session, dispatch] = useReducer(gameSessionReducer, undefined, () => {
    const session = createPrototypeGameSession()
    session.stateFollowups = [{ id: 'task', sourceEntryId: session.timeline.find((entry) => entry.kind === 'night_action')!.id, seatId: 1, note: '核对中毒', createdAt: '2026-10-21T01:00:00Z' }]
    if (session.activeNightRunId) session.nightRuns[session.activeNightRunId].privacyShielded = false
    return session
  })
  return <><StateFollowupSheet session={session} dispatch={dispatch} /><output>{session.stateFollowups?.[0].resolution?.kind ?? 'pending'}</output></>
}

describe('state confirmation navigation', () => {
  it('closes both sheets only after the state and followup have actually been committed', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: '状态待办 1' }))
    await user.click(screen.getByRole('button', { name: '处理状态' }))
    await user.click(screen.getByRole('button', { name: '中毒' }))
    expect(screen.getByText('pending')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '确认状态' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(screen.getByText('applied')).toBeInTheDocument()
    expect(screen.getByText('已更新1号状态，已返回工作台')).toHaveAttribute('role', 'status')
  })
  it('retains the state editor and explains a rejected write instead of reporting success', async () => {
    const user = userEvent.setup()
    const close = vi.fn()
    render(<PlayerStatusOverlay seatId={1} session={createPrototypeGameSession()} dispatch={vi.fn()} onOpenChange={close} />)
    await user.click(screen.getByRole('button', { name: '中毒' }))
    await user.click(screen.getByRole('button', { name: '确认状态' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('状态未保存')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(close).not.toHaveBeenCalled()
  })
})
