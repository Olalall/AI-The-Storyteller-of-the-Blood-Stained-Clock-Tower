import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { L2_IDLE_FALLBACK_MS } from './shieldLevel'
import { REVEAL_HOLD_MS, useGrimoireShield } from './useGrimoireShield'

describe('useGrimoireShield', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('starts covered at the seat view, never revealed', () => {
    expect(renderHook(() => useGrimoireShield()).result.current.level).toBe('L1')
  })

  it('covers instantly on the blind gesture, with no confirmation in the way', () => {
    const { result } = renderHook(() => useGrimoireShield())

    act(() => result.current.coverNow())

    expect(result.current.level).toBe('L0')
  })

  it('needs the full hold before revealing', () => {
    // 单击即揭示会让一次误触在满桌人面前掀开整局。
    const { result } = renderHook(() => useGrimoireShield())

    act(() => result.current.beginReveal())
    act(() => { vi.advanceTimersByTime(REVEAL_HOLD_MS - 50) })
    expect(result.current.level).toBe('L1')

    act(() => { vi.advanceTimersByTime(50) })
    expect(result.current.level).toBe('L2')
  })

  it('reveals nothing when the hold is released early', () => {
    const { result } = renderHook(() => useGrimoireShield())

    act(() => result.current.beginReveal())
    act(() => { vi.advanceTimersByTime(200) })
    act(() => result.current.cancelReveal())
    act(() => { vi.advanceTimersByTime(REVEAL_HOLD_MS) })

    expect(result.current.level).toBe('L1')
    expect(result.current.revealProgress).toBe(0)
  })

  it('falls back from the revealed view after 90 idle seconds', () => {
    const { result } = renderHook(() => useGrimoireShield())

    act(() => result.current.beginReveal())
    act(() => { vi.advanceTimersByTime(REVEAL_HOLD_MS) })
    expect(result.current.level).toBe('L2')

    act(() => { vi.advanceTimersByTime(L2_IDLE_FALLBACK_MS) })
    expect(result.current.level).toBe('L1')
  })

  it('keeps the revealed view alive while the storyteller is still working', () => {
    const { result } = renderHook(() => useGrimoireShield())
    act(() => result.current.beginReveal())
    act(() => { vi.advanceTimersByTime(REVEAL_HOLD_MS) })

    act(() => { vi.advanceTimersByTime(L2_IDLE_FALLBACK_MS - 1000) })
    act(() => result.current.noteActivity())
    act(() => { vi.advanceTimersByTime(L2_IDLE_FALLBACK_MS - 1000) })

    expect(result.current.level).toBe('L2')
  })

  it('falls back the moment the page is hidden', () => {
    // 切到别的应用、锁屏、切标签页——设备离开视线的那一刻就该落回。
    const { result } = renderHook(() => useGrimoireShield('L2'))

    act(() => {
      vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden')
      document.dispatchEvent(new Event('visibilitychange'))
    })

    expect(result.current.level).toBe('L1')
  })

  it('falls back on window blur', () => {
    const { result } = renderHook(() => useGrimoireShield('L2'))
    act(() => { window.dispatchEvent(new Event('blur')) })
    expect(result.current.level).toBe('L1')
  })

  it('never re-opens a fully covered grimoire by itself', () => {
    // 自动机制只会往更遮蔽的方向走；掀开永远要一次人的动作。
    const { result } = renderHook(() => useGrimoireShield())
    act(() => result.current.coverNow())

    act(() => { window.dispatchEvent(new Event('blur')) })
    act(() => { vi.advanceTimersByTime(L2_IDLE_FALLBACK_MS * 2) })

    expect(result.current.level).toBe('L0')
  })

  it('uncovers back to the seat view rather than to the revealed view', () => {
    const { result } = renderHook(() => useGrimoireShield())
    act(() => result.current.coverNow())

    act(() => result.current.uncover())

    expect(result.current.level).toBe('L1')
  })

  it('drops the revealed view when handing the device over', () => {
    const { result } = renderHook(() => useGrimoireShield('L2'))
    act(() => result.current.conceal())
    expect(result.current.level).toBe('L1')
  })

  it('leaves a full blackout alone when concealing', () => {
    const { result } = renderHook(() => useGrimoireShield('L0'))
    act(() => result.current.conceal())
    expect(result.current.level).toBe('L0')
  })

  it('reports hold progress so the handle can draw a ring', () => {
    const { result } = renderHook(() => useGrimoireShield())

    act(() => result.current.beginReveal())
    act(() => { vi.advanceTimersByTime(300) })

    expect(result.current.revealProgress).toBeGreaterThan(0)
    expect(result.current.revealProgress).toBeLessThan(1)
  })
})
