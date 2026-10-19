import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { gameSessionStorageKey } from '../../../services/session'
import { SessionConflictError, SessionEditLock } from '../../../services/session/sessionEditLock'
import { createPrototypeGameSession } from '../data/createPrototypeSession'
import { useGameSession } from './useGameSession'

beforeEach(() => window.localStorage.clear())
afterEach(() => vi.restoreAllMocks())

describe('single session editor integration', () => {
  it('rejects edits in a second read-only tab without persisting its memory', async () => {
    const original = createPrototypeGameSession()
    const raw = JSON.stringify(original)
    localStorage.setItem(gameSessionStorageKey, raw)
    vi.spyOn(SessionEditLock.prototype, 'acquire').mockResolvedValue(false)
    const { result } = renderHook(useGameSession)
    await waitFor(() => expect(result.current.editorStatus).toBe('blocked'))
    act(() => result.current.dispatch({ type: 'update-seat-nickname', seatId: 1, nickname: '不得覆盖' }))
    expect(result.current.session.seats[1].nickname).toBe(original.seats[1].nickname)
    expect(localStorage.getItem(gameSessionStorageKey)).toBe(raw)
  })

  it('stops editing when the lease detects another owner saved a newer game', async () => {
    const original = createPrototypeGameSession()
    localStorage.setItem(gameSessionStorageKey, JSON.stringify(original))
    vi.spyOn(SessionEditLock.prototype, 'acquire').mockResolvedValueOnce(false).mockResolvedValue(true)
    let beat!: () => void
    const interval = globalThis.setInterval
    vi.spyOn(window, 'setInterval').mockImplementation((callback, delay) => {
      if (delay === 5000) beat = callback as () => void
      return interval(callback, delay)
    })
    const { result } = renderHook(useGameSession)
    await waitFor(() => expect(result.current.editorStatus).toBe('blocked'))
    const latest = { ...original, seats: { ...original.seats, 1: { ...original.seats[1], nickname: '主窗口最新记录' } } }
    const raw = JSON.stringify(latest)
    localStorage.setItem(gameSessionStorageKey, raw)
    // jsdom只替代租约；真实跨页baseline比较由浏览器回归检查。
    vi.spyOn(SessionEditLock.prototype, 'save').mockRejectedValue(new SessionConflictError('内容已变化'))
    await act(async () => beat())
    await waitFor(() => expect(result.current.editorStatus).toBe('conflict'))
    act(() => result.current.dispatch({ type: 'update-seat-nickname', seatId: 1, nickname: '旧窗口不能覆盖' }))
    expect(localStorage.getItem(gameSessionStorageKey)).toBe(raw)
  })
})
