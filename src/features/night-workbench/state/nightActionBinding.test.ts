import { act, renderHook } from '@testing-library/react'
import { useReducer } from 'react'
import { describe, expect, it } from 'vitest'
import { createPrototypeGameSession } from '../../game-session/data/createPrototypeSession'
import { gameSessionReducer } from '../../game-session/state/sessionReducer'
import { applyOutcome, emptyWakeDraft } from './projectWakeDraft'
import { useNightWorkbench } from './useNightWorkbench'

function preparedSession(targetCount = 0) {
  const session = createPrototypeGameSession()
  session.timeline = session.timeline.filter((entry) => entry.kind === 'setup_confirmed')
  const run = session.nightRuns[session.activeNightRunId!]
  run.queue = run.queue.slice(0, 2).map((item) => ({
    ...item, progress: 'draft', applicability: 'applicable', roleChoices: undefined, targetCount,
    outcomeOptions: [{ id: 'skip', label: '不发动', requiredInputs: [], resultTemplate: '{actor}本夜不发动。' }],
  }))
  run.activeCursorId = run.previewEntryId = run.queue[0].id
  run.drafts = Object.fromEntries(run.queue.map((item) => [item.id, applyOutcome(item, emptyWakeDraft(), 'skip')]))
  return session
}

describe('night workbench item binding', () => {
  it('confirms only the clicked item when an old confirm-next callback is queued twice', () => {
    const { result } = renderHook(() => {
      const [session, dispatchSession] = useReducer(gameSessionReducer, preparedSession())
      return useNightWorkbench({ session, dispatchSession })!
    })
    const dispatch = result.current.dispatch
    const firstId = result.current.current.id
    const secondId = result.current.next!.id
    act(() => {
      dispatch({ type: 'confirm', advance: true })
      dispatch({ type: 'confirm', advance: true })
    })
    expect(result.current.state.activeCursorId).toBe(secondId)
    expect(result.current.state.confirmedRecords[firstId]).toHaveLength(1)
    expect(result.current.state.confirmedRecords[secondId]).toBeUndefined()
    expect(result.current.current.progress).toBe('draft')
    expect(result.current.canConfirm).toBe(true)
  })

  it('accumulates rapid target updates on the same item without locking the whole run revision', () => {
    const { result } = renderHook(() => {
      const [session, dispatchSession] = useReducer(gameSessionReducer, preparedSession(3))
      return useNightWorkbench({ session, dispatchSession })!
    })
    const dispatch = result.current.dispatch
    act(() => {
      dispatch({ type: 'target', seatId: 1 })
      dispatch({ type: 'target', seatId: 2 })
      dispatch({ type: 'target', seatId: 3 })
    })
    expect(result.current.draft.targets).toEqual([1, 2, 3])
  })

  it('rejects an old item edit after preview changes while allowing global privacy actions', () => {
    const { result } = renderHook(() => {
      const [session, dispatchSession] = useReducer(gameSessionReducer, preparedSession())
      return useNightWorkbench({ session, dispatchSession })!
    })
    const dispatch = result.current.dispatch
    const before = result.current.state.drafts
    const secondId = result.current.next!.id
    act(() => {
      dispatch({ type: 'preview', id: secondId })
      dispatch({ type: 'target', seatId: 4 })
      dispatch({ type: 'set-privacy', shielded: true })
    })
    expect(result.current.state.previewEntryId).toBe(secondId)
    expect(result.current.state.drafts).toEqual(before)
    expect(result.current.state.privacyShielded).toBe(true)
  })
})
