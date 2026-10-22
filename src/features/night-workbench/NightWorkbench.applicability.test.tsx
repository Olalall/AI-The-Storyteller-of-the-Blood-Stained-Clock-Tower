import { useReducer } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { NightWorkbench } from './NightWorkbench'
import { NightCloseFooter } from './components/NightCloseFooter'
import { cardinalitySession } from './state/nightCardinality.test-support'
import { actNight, projected } from './state/nightInformation.test-support'
import { gameSessionReducer } from '../game-session/state/sessionReducer'
import { projectCurrentPlayerStates } from '../game-session/state/projectors'
import type { GameSessionState } from '../game-session/types'

function openNight(session: GameSessionState) {
  return gameSessionReducer(session, { type: 'open-phase-segment', phaseKind: 'night', createdAt: '2026-10-22T00:00:00.000Z' })
}

function zombuulAfterDeath() {
  const session = openNight(cardinalitySession('fei-fan-ying-tian', 'zombuul', 9, true))
  const day = session.phaseSegments.find(p => p.kind === 'day' && p.sequence === 1)!
  const before = session.initialPlayerStates[1]
  session.timeline.push({ id: 'confirmed-day-death', kind: 'player_state_changed', seatId: 1,
    before, after: { ...before, life: 'dead' }, segmentId: day.id, createdAt: day.createdAt,
    confirmedBy: 'storyteller', reason: '说书人确认白天实际死亡' })
  return session
}

function Harness({ initial }: { initial: GameSessionState }) {
  const [session, dispatchSession] = useReducer(gameSessionReducer, initial)
  return <><NightWorkbench sessionBinding={{ session, dispatchSession }} onExit={() => {}} />
    <output aria-label="audit-session">{JSON.stringify(session)}</output></>
}

describe('inapplicable night flow', () => {
  it('lets the host acknowledge the no-wake Zombuul and continue without fabricating an action or changing history', async () => {
    const initial = zombuulAfterDeath(), item = projected(initial).queue.find(i => i.roleId === 'zombuul')!
    expect(item.applicability).toBe('not_applicable')
    render(<Harness initial={initial} />)
    expect(screen.getByText('本夜不适用')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '本夜不唤醒僵怖' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '确认不适用并继续' }))
    const after: GameSessionState = JSON.parse(screen.getByLabelText('audit-session').textContent!)
    expect(after.nightRuns[after.activeNightRunId!].queue.find(i => i.id === item.id)?.progress).toBe('not_applicable')
    expect(after.timeline).toEqual(initial.timeline)
    expect(projectCurrentPlayerStates(after)).toEqual(projectCurrentPlayerStates(initial))
    expect(after.phaseSegments).toEqual(initial.phaseSegments)
  })

  it('continues to reject a night attack and preserves drafts while acknowledging a clear inapplicable item', () => {
    const initial = zombuulAfterDeath(), item = projected(initial).queue.find(i => i.roleId === 'zombuul')!
    const denied = actNight(initial, { type: 'outcome', outcomeId: 'kill' })
    expect(denied).toBe(initial)
    const after = actNight(initial, { type: 'advance' })
    expect(after.nightRuns[after.activeNightRunId!].queue.find(i => i.id === item.id)?.progress).toBe('not_applicable')
    expect(after.timeline).toEqual(initial.timeline)
    expect(after.nightRuns[after.activeNightRunId!].drafts).toEqual(initial.nightRuns[initial.activeNightRunId!].drafts)
  })

  it('retains the normal Zombuul choice when the previous day ended with no death', () => {
    const initial = cardinalitySession('fei-fan-ying-tian', 'zombuul', 9, true)
    expect(projected(initial).queue.find(i => i.roleId === 'zombuul')?.applicability).toBe('applicable')
    render(<Harness initial={initial} />)
    expect(screen.queryByRole('button', { name: '确认不适用并继续' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '确认并下一位' })).toBeInTheDocument()
  })
})

describe('night close acknowledgement', () => {
  it('keeps an unapplied Kazali allocation on screen instead of pretending the night was closed', async () => {
    const session = openNight(cardinalitySession('punchy', 'kazali', 13)), dispatch = vi.fn(), onExit = vi.fn()
    render(<NightCloseFooter session={session} dispatch={dispatch} nightRunId={session.activeNightRunId!}
      queue={projected(session).queue} concealed={false} onPreview={() => {}} onSkip={() => {}} onExit={onExit} />)
    await userEvent.click(screen.getByRole('button', { name: '检查并关闭' }))
    expect(screen.getByRole('button', { name: '确认关闭' })).toBeDisabled()
    expect(screen.getByRole('alert')).toHaveTextContent('首夜爪牙分配')
    expect(onExit).not.toHaveBeenCalled()
    expect(dispatch).not.toHaveBeenCalled()
  })

  it('only leaves after the reducer has actually persisted the closed night', async () => {
    const initial = openNight(cardinalitySession('fei-fan-ying-tian', 'zombuul', 9, true)), onExit = vi.fn()
    function CloseHarness() {
      const [session, dispatch] = useReducer(gameSessionReducer, initial)
      return <NightCloseFooter session={session} dispatch={dispatch} nightRunId={session.activeNightRunId!}
        queue={projected(session).queue} concealed={false} onPreview={() => {}} onSkip={() => {}} onExit={onExit} />
    }
    render(<CloseHarness />)
    await userEvent.click(screen.getByRole('button', { name: '检查并关闭' }))
    expect(onExit).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole('button', { name: '确认关闭' }))
    await waitFor(() => expect(onExit).toHaveBeenCalledTimes(1))
  })
})
