import { useReducer } from 'react'
import { act, render, renderHook, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { gameSessionReducer } from '../game-session/state/sessionReducer'
import type { GameSessionState } from '../game-session/types'
import { createNightResultAdviceAsync } from '../../services/ai'
import { NightWorkbench } from './NightWorkbench'
import { cardinalitySession } from './state/nightCardinality.test-support'
import { sessionInitialNightState } from './state/gameSessionAdapter'
import { emptyWakeDraft } from './state/projectWakeDraft'
import type { NightWorkbenchIntent } from './state/nightWorkbenchReducer'
import { useNightAIAdvice } from './hooks/useNightAIAdvice'

vi.mock('../../services/ai', async (importOriginal) => ({
  ...await importOriginal<typeof import('../../services/ai')>(),
  createNightResultAdviceAsync: vi.fn(),
}))

function projected(session: GameSessionState) {
  return sessionInitialNightState({ session, dispatchSession: () => {} })!
}
function actNight(session: GameSessionState, action: NightWorkbenchIntent) {
  const state = projected(session)
  return gameSessionReducer(session, { type: 'night-workbench-action', nightRunId: state.nightRunId,
    expectedWakeItemId: state.previewEntryId, expectedActiveCursorId: state.activeCursorId, action: { ...action, at: new Date().toISOString() } })
}

describe('Farmer AI trigger review boundary', () => {
  function farmerSession() {
    return cardinalitySession('yi-cun-duan-yi-cun-xian', 'farmer', 8, true)
  }
  function inputFor(session: ReturnType<typeof farmerSession>) {
    const state = projected(session), item = state.queue.find((entry) => entry.id === state.activeCursorId)!
    return { state, item, draft: state.drafts[item.id] ?? emptyWakeDraft() }
  }

  it('disables Farmer AI until the storyteller explicitly confirms applicability and then restores the actual request', async () => {
    vi.mocked(createNightResultAdviceAsync).mockReset().mockResolvedValue(null)
    function Harness() {
      const [session, dispatchSession] = useReducer(gameSessionReducer, undefined, farmerSession)
      return <NightWorkbench sessionBinding={{ session, dispatchSession }} onExit={() => {}} />
    }
    render(<Harness />)
    expect(screen.getByRole('button', { name: 'AI推荐' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'AI推荐' }).closest('.wake-recorder')).toHaveAttribute('aria-disabled', 'true')
    expect(screen.getByRole('button', { name: '选择1号玩家' })).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: 'AI推荐' }))
    expect(createNightResultAdviceAsync).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole('button', { name: /^适用$/ }))
    expect(screen.getByRole('button', { name: 'AI推荐' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'AI推荐' }).closest('.wake-recorder')).toHaveAttribute('aria-disabled', 'false')
    expect(screen.getByRole('button', { name: '选择1号玩家' })).toBeEnabled()
    await userEvent.click(screen.getByRole('button', { name: 'AI推荐' }))
    expect(createNightResultAdviceAsync).toHaveBeenCalledTimes(1)
    expect(vi.mocked(createNightResultAdviceAsync).mock.calls[0][0].item.applicability).toBe('applicable')
  })

  it('refuses a forged applicable item and a stale pre-review callback before invoking the provider', async () => {
    vi.mocked(createNightResultAdviceAsync).mockReset().mockResolvedValue(null)
    const session = farmerSession(), waiting = inputFor(session)
    const accepted = inputFor(actNight(session, { type: 'resolve-applicability', value: 'applicable' }))
    const dispatch = vi.fn()
    const { result, rerender } = renderHook(({ state }) => useNightAIAdvice({ state, isReadOnly: false, isPreviewing: false }), { initialProps: { state: accepted.state } })
    const staleRequest = result.current.requestAIAdvice
    rerender({ state: waiting.state })
    await act(async () => {
      await staleRequest(accepted.state, accepted.item, accepted.draft, dispatch)
      await result.current.requestAIAdvice(waiting.state, { ...waiting.item, applicability: 'applicable' }, waiting.draft, dispatch)
    })
    expect(createNightResultAdviceAsync).not.toHaveBeenCalled()
    expect(dispatch).not.toHaveBeenCalled()
  })

  it.each(['preview', 'readonly', 'not_applicable'] as const)('does not request Farmer AI in %s context after an earlier acceptance', async (mode) => {
    vi.mocked(createNightResultAdviceAsync).mockReset().mockResolvedValue(null)
    const session = actNight(farmerSession(), { type: 'resolve-applicability', value: mode === 'not_applicable' ? 'not_applicable' : 'applicable' })
    const input = inputFor(session), dispatch = vi.fn()
    const { result } = renderHook(() => useNightAIAdvice({ state: input.state, isReadOnly: mode === 'readonly', isPreviewing: mode === 'preview' }))
    await act(async () => result.current.requestAIAdvice(input.state, input.item, input.draft, dispatch))
    expect(createNightResultAdviceAsync).not.toHaveBeenCalled()
    expect(dispatch).not.toHaveBeenCalled()
  })

  it('preserves other roles existing needs-review AI assistance', async () => {
    vi.mocked(createNightResultAdviceAsync).mockReset().mockResolvedValue(null)
    const input = inputFor(cardinalitySession('yi-cun-duan-yi-cun-xian', 'chef', 7)), dispatch = vi.fn()
    input.item.applicability = 'needs_review'
    const { result } = renderHook(() => useNightAIAdvice({ state: input.state, isReadOnly: false, isPreviewing: false }))
    await act(async () => result.current.requestAIAdvice(input.state, input.item, input.draft, dispatch))
    expect(createNightResultAdviceAsync).toHaveBeenCalledTimes(1)
  })
})
