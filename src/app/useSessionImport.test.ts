import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPrototypeGameSession } from '../features/game-session/data/createPrototypeSession'
import {
  gameSessionStorageKey,
  listSnapshots,
  snapshotStorageKeyPrefix,
} from '../services/session'
import { useSessionImport } from './useSessionImport'

describe('useSessionImport', () => {
  beforeEach(() => window.localStorage.clear())

  it('persists the imported session before replacing React state', () => {
    const current = createPrototypeGameSession()
    const imported = { ...createPrototypeGameSession(), id: 'imported-session' }
    const dispatch = vi.fn()
    const onApplied = vi.fn()
    const { result } = renderHook(() => useSessionImport(current, dispatch, onApplied))

    act(() => result.current.apply(imported))

    expect(JSON.parse(window.localStorage.getItem(gameSessionStorageKey)!).id).toBe(imported.id)
    expect(dispatch).toHaveBeenCalledWith({ type: 'replace-session', session: imported })
    expect(onApplied).toHaveBeenCalledWith(imported)
    expect(result.current.previousSession?.id).toBe(current.id)
    expect(listSnapshots().some((entry) => entry.reason === 'import')).toBe(true)
  })

  it('does not replace the current session when the pre-import snapshot cannot be saved', () => {
    const current = createPrototypeGameSession()
    const imported = { ...createPrototypeGameSession(), id: 'imported-session' }
    const dispatch = vi.fn()
    const onApplied = vi.fn()
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key) => {
      if (String(key).startsWith(snapshotStorageKeyPrefix)) {
        throw new DOMException('quota', 'QuotaExceededError')
      }
    })
    const { result } = renderHook(() => useSessionImport(current, dispatch, onApplied))

    expect(() => act(() => result.current.apply(imported))).toThrow('当前对局没有被替换')
    expect(dispatch).not.toHaveBeenCalled()
    expect(onApplied).not.toHaveBeenCalled()
    expect(result.current.previousSession).toBeNull()
    setItem.mockRestore()
  })

  it('does not replace the current session or report success when persistence fails', () => {
    const originalSetItem = Storage.prototype.setItem
    const current = createPrototypeGameSession()
    const imported = { ...createPrototypeGameSession(), id: 'imported-session' }
    const dispatch = vi.fn()
    const onApplied = vi.fn()
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key, value) {
      if (key === gameSessionStorageKey) throw new DOMException('quota', 'QuotaExceededError')
      return originalSetItem.call(this, key, value)
    })
    const { result } = renderHook(() => useSessionImport(current, dispatch, onApplied))

    expect(() => act(() => result.current.apply(imported))).toThrow('无法把备份写入本机存储')
    expect(dispatch).not.toHaveBeenCalled()
    expect(onApplied).not.toHaveBeenCalled()
    expect(listSnapshots().some((entry) => entry.reason === 'import')).toBe(false)
    setItem.mockRestore()
  })

  it('recovers the last pre-import undo candidate after a refresh', () => {
    const current = createPrototypeGameSession()
    const imported = { ...createPrototypeGameSession(), id: 'imported-session' }
    const first = renderHook(() => useSessionImport(current, vi.fn(), vi.fn()))
    act(() => first.result.current.apply(imported))
    first.unmount()

    const refreshed = renderHook(() => useSessionImport(imported, vi.fn(), vi.fn()))

    expect(refreshed.result.current.previousSession?.id).toBe(current.id)
  })

  it('consumes the import snapshot after undo so it does not reappear next launch', () => {
    const current = createPrototypeGameSession()
    const imported = { ...createPrototypeGameSession(), id: 'imported-session' }
    const first = renderHook(() => useSessionImport(current, vi.fn(), vi.fn()))
    act(() => first.result.current.apply(imported))
    first.unmount()

    const refreshed = renderHook(() => useSessionImport(imported, vi.fn(), vi.fn()))
    act(() => refreshed.result.current.undo())
    refreshed.unmount()

    const afterUndo = renderHook(() => useSessionImport(current, vi.fn(), vi.fn()))
    expect(afterUndo.result.current.previousSession).toBeNull()
  })
})
