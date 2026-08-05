import { beforeEach, describe, expect, it } from 'vitest'
import {
  LOCK_STALE_MS,
  acquireLock,
  heartbeat,
  instanceLockStorageKey,
  isLockStale,
  releaseLock,
} from './instanceLock'

const T0 = 1_754_400_000_000

describe('单实例锁', () => {
  beforeEach(() => window.localStorage.clear())

  it('gives the lock to the first tab', () => {
    expect(acquireLock('tab-a', T0)).toBe('owner')
  })

  it('makes the second tab read-only instead of letting it overwrite the first', () => {
    // 两边都写整份 session 时，后写的会整份覆盖先写的——不是冲突，是静默丢一整段记录。
    acquireLock('tab-a', T0)
    expect(acquireLock('tab-b', T0 + 100)).toBe('readonly')
  })

  it('does not let the newcomer steal the lock from a tab that is still hosting', () => {
    acquireLock('tab-a', T0)
    acquireLock('tab-b', T0 + 100)

    expect(heartbeat('tab-a', T0 + 200)).toBe('owner')
  })

  it('lets the same tab renew, so a refresh does not lock itself out', () => {
    acquireLock('tab-a', T0)
    expect(acquireLock('tab-a', T0 + 500)).toBe('owner')
  })

  it('hands the lock over once the holder stops beating', () => {
    // 崩溃、强杀、锁屏都不会触发 unload；靠 unload 释放会让下一次永远打不开。
    acquireLock('tab-a', T0)
    expect(acquireLock('tab-b', T0 + LOCK_STALE_MS + 1)).toBe('owner')
  })

  it('holds the lock right up to the staleness boundary', () => {
    acquireLock('tab-a', T0)
    expect(acquireLock('tab-b', T0 + LOCK_STALE_MS)).toBe('readonly')
  })

  it('drops an owner that got taken over while it was suspended', () => {
    acquireLock('tab-a', T0)
    acquireLock('tab-b', T0 + LOCK_STALE_MS + 1)

    expect(heartbeat('tab-a', T0 + LOCK_STALE_MS + 2)).toBe('readonly')
  })

  it('treats an unreadable lock as absent rather than blocking the game', () => {
    window.localStorage.setItem(instanceLockStorageKey, 'not json')
    expect(acquireLock('tab-a', T0)).toBe('owner')
  })

  it('only releases its own lock', () => {
    acquireLock('tab-a', T0)
    releaseLock('tab-b')
    expect(window.localStorage.getItem(instanceLockStorageKey)).not.toBeNull()

    releaseLock('tab-a')
    expect(window.localStorage.getItem(instanceLockStorageKey)).toBeNull()
  })

  it('reports an absent lock as stale', () => {
    expect(isLockStale(null, T0)).toBe(true)
  })
})
