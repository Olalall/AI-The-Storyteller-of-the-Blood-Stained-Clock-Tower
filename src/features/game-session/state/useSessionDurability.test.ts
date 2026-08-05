import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { createPrototypeGameSession } from '../data/createPrototypeSession'
import { acquireLock, clearSnapshots, listSnapshots, snapshotSlotKey } from '../../../services/session'
import { writeSnapshot } from '../../../services/session/snapshotRotation'
import { useSessionDurability } from './useSessionDurability'

const AT = (minute: number) => `2026-08-05T12:${String(minute).padStart(2, '0')}:00.000Z`

function sessionWithTimelineOf(length: number) {
  const base = createPrototypeGameSession()
  return { ...base, timeline: base.timeline.slice(0, length) }
}

describe('useSessionDurability', () => {
  beforeEach(() => { window.localStorage.clear(); clearSnapshots() })

  it('owns the lock when it is the only tab', () => {
    const { result } = renderHook(() => useSessionDurability(createPrototypeGameSession(), () => undefined))
    expect(result.current.lock).toBe('owner')
  })

  it('is read-only when another tab already holds the lock', () => {
    acquireLock('another-tab', Date.now())
    const { result } = renderHook(() => useSessionDurability(createPrototypeGameSession(), () => undefined))
    expect(result.current.lock).toBe('readonly')
  })

  it('offers a snapshot that holds more records than the current save', () => {
    const full = createPrototypeGameSession()
    writeSnapshot(full, 'interval', AT(0))

    const { result } = renderHook(() => useSessionDurability(sessionWithTimelineOf(1), () => undefined))

    expect(result.current.candidates).toHaveLength(1)
    expect(result.current.candidates[0].session.timeline.length).toBe(full.timeline.length)
  })

  it('stays quiet when the snapshot is merely older', () => {
    // 每次开局都被问一遍要不要回退，说书人会学会永远点「不用」，
    // 于是真正需要恢复的那一次也被跳过。
    writeSnapshot(sessionWithTimelineOf(1), 'interval', AT(0))

    const { result } = renderHook(() => useSessionDurability(createPrototypeGameSession(), () => undefined))

    expect(result.current.candidates).toEqual([])
  })

  it('never offers a snapshot from a different game', () => {
    writeSnapshot({ ...createPrototypeGameSession(), id: 'some-other-game' }, 'interval', AT(0))

    const { result } = renderHook(() => useSessionDurability(sessionWithTimelineOf(0), () => undefined))

    expect(result.current.candidates).toEqual([])
  })

  it('lets the storyteller dismiss the offer', () => {
    writeSnapshot(createPrototypeGameSession(), 'interval', AT(0))
    const { result } = renderHook(() => useSessionDurability(sessionWithTimelineOf(1), () => undefined))
    expect(result.current.candidates).toHaveLength(1)

    act(() => result.current.dismiss())

    expect(result.current.candidates).toEqual([])
  })

  it('does not raise the question again mid-game', () => {
    // 开局之后再冒出「要不要恢复」会打断正在进行的主持。
    const { result, rerender } = renderHook(
      ({ session }) => useSessionDurability(session, () => undefined),
      { initialProps: { session: sessionWithTimelineOf(1) } },
    )
    expect(result.current.candidates).toEqual([])

    writeSnapshot(createPrototypeGameSession(), 'interval', AT(1))
    rerender({ session: sessionWithTimelineOf(1) })

    expect(result.current.candidates).toEqual([])
  })

  it('ignores an unparseable snapshot instead of crashing the app', () => {
    writeSnapshot(createPrototypeGameSession(), 'interval', AT(0))
    const { slot } = listSnapshots()[0]
    window.localStorage.setItem(snapshotSlotKey(slot), '{broken')

    const { result } = renderHook(() => useSessionDurability(sessionWithTimelineOf(1), () => undefined))

    expect(result.current.candidates).toEqual([])
  })

  it('reports how many records the snapshot has beyond the current save', () => {
    const full = createPrototypeGameSession()
    writeSnapshot(full, 'interval', AT(0))

    const { result } = renderHook(() => useSessionDurability(sessionWithTimelineOf(1), () => undefined))

    expect(result.current.candidates[0].extraEntries).toBe(full.timeline.length - 1)
  })

  it('snapshots the current save before replacing it', () => {
    // 界面上承诺了「替换前的这份会作为新快照留下」，恢复错一份也还能退回来。
    writeSnapshot(createPrototypeGameSession(), 'interval', AT(0))
    const current = sessionWithTimelineOf(1)
    const { result } = renderHook(() => useSessionDurability(current, () => undefined))
    const before = listSnapshots().length

    act(() => result.current.restore(result.current.candidates[0]))

    const after = listSnapshots()
    expect(after.length).toBeGreaterThan(before)
    expect(after[0].reason).toBe('destructive')
  })

  it('releases the lock when the tab goes away', () => {
    const { unmount } = renderHook(() => useSessionDurability(createPrototypeGameSession(), () => undefined))
    unmount()

    // 锁释放后，下一个标签页应当能拿到所有权。
    expect(acquireLock('next-tab', Date.now())).toBe('owner')
  })
})
