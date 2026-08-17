import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { gameSessionStorageKey } from '../../../services/session'
import { createPrototypeGameSession } from '../data/createPrototypeSession'
import type { GameSessionState } from '../types'
import { useGameSession } from './useGameSession'

function storedSession(): GameSessionState {
  return JSON.parse(window.localStorage.getItem(gameSessionStorageKey) ?? '{}') as GameSessionState
}

describe('useGameSession write lock', () => {
  beforeEach(() => window.localStorage.clear())

  it('does not persist changes while this tab is read-only', () => {
    const original = createPrototypeGameSession()
    window.localStorage.setItem(gameSessionStorageKey, JSON.stringify(original))
    const { result } = renderHook(() => useGameSession(false))

    act(() => result.current.dispatch({ type: 'update-seat-nickname', seatId: 1, nickname: '只在内存' }))

    expect(storedSession().seats[1].nickname).not.toBe('只在内存')
  })

  it('reloads the latest stored session before a formerly read-only tab starts writing', () => {
    const openedVersion = createPrototypeGameSession()
    window.localStorage.setItem(gameSessionStorageKey, JSON.stringify(openedVersion))
    const { result, rerender } = renderHook(
      ({ writable }) => useGameSession(writable),
      { initialProps: { writable: false } },
    )
    const latest = {
      ...openedVersion,
      seats: { ...openedVersion.seats, 1: { ...openedVersion.seats[1], nickname: '主窗口最新记录' } },
    }
    window.localStorage.setItem(gameSessionStorageKey, JSON.stringify(latest))

    rerender({ writable: true })

    expect(result.current.session.seats[1].nickname).toBe('主窗口最新记录')
    expect(storedSession().seats[1].nickname).toBe('主窗口最新记录')
  })
})
