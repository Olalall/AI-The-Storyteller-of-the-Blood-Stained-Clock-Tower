import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { createPrototypeGameSession } from '../features/game-session/data/createPrototypeSession'
import { usePhaseEntry } from './usePhaseEntry'

describe('phase entry waits for edit authority', () => {
  it.each(['night', 'day'] as const)('keeps an early %s click on the current view and requires another explicit click after readiness', (phase) => {
    const session = createPrototypeGameSession()
    const before = JSON.stringify(session)
    const dispatch = vi.fn(), onOpenSetup = vi.fn(), onReady = vi.fn()
    const { result, rerender } = renderHook(({ canEdit }) => usePhaseEntry(session, dispatch, onOpenSetup, onReady, 'dashboard', canEdit), { initialProps: { canEdit: false } })
    const enter = () => phase === 'night' ? result.current.enterNight() : result.current.enterDay()

    act(enter)
    expect(result.current.notice).toBe(`本局暂时不能编辑，请稍候；如有编辑保护提示，请先处理，再进入${phase === 'night' ? '夜晚' : '白天'}。`)
    expect(dispatch).not.toHaveBeenCalled()
    expect(onReady).not.toHaveBeenCalled()
    expect(onOpenSetup).not.toHaveBeenCalled()
    expect(JSON.stringify(session)).toBe(before)

    rerender({ canEdit: true })
    expect(dispatch).not.toHaveBeenCalled()
    expect(onReady).not.toHaveBeenCalled()
    act(enter)
    expect(result.current.notice).toBe('')
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'open-phase-segment', phaseKind: phase }))
    expect(onReady).toHaveBeenCalledWith(phase)
  })
})
