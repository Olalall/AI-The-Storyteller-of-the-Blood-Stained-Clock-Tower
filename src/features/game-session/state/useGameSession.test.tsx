import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { gameSessionStorageKey } from '../../../services/session'
import { beforeRestoreStorageKey, SessionConflictError, SessionEditLock } from '../../../services/session/sessionEditLock'
import { createPrototypeGameSession } from '../data/createPrototypeSession'
import { useGameSession } from './useGameSession'

beforeEach(() => { window.localStorage.clear(); window.localStorage.setItem(gameSessionStorageKey, JSON.stringify(createPrototypeGameSession())) })
afterEach(() => vi.restoreAllMocks())

it('checks ownership immediately on foreground return, while a hidden or suspended page cannot resume editing', async () => {
  const acquire = vi.spyOn(SessionEditLock.prototype, 'acquire').mockResolvedValue(false)
  const visible = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden')
  const { result } = renderHook(useGameSession)
  await waitFor(() => expect(result.current.editorStatus).toBe('blocked'))
  const calls = acquire.mock.calls.length
  act(() => document.dispatchEvent(new Event('visibilitychange')))
  expect(acquire).toHaveBeenCalledTimes(calls)
  acquire.mockResolvedValue(true)
  visible.mockReturnValue('visible')
  await act(async () => document.dispatchEvent(new Event('visibilitychange')))
  expect(result.current.editorStatus).toBe('ready')
  act(() => window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })))
  const hiddenCalls = acquire.mock.calls.length
  act(() => document.dispatchEvent(new Event('visibilitychange')))
  expect(acquire).toHaveBeenCalledTimes(hiddenCalls)
})

it('retains the latest session on storage failure and retries without replaying actions', async () => {
  const original = Storage.prototype.setItem
  let fail = false
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key, value) {
    if (fail && key === gameSessionStorageKey) throw new DOMException('Full', 'QuotaExceededError')
    original.call(this, key, value)
  })
  const { result } = renderHook(useGameSession)
  await waitFor(() => expect(result.current.editorStatus).toBe('ready'))
  const previous = window.localStorage.getItem(gameSessionStorageKey)
  const seatId = Number(Object.keys(result.current.session.seats)[0])
  fail = true
  act(() => result.current.dispatch({ type: 'update-seat-nickname', seatId, nickname: '最新昵称' }))
  await waitFor(() => expect(result.current.saveFailed).toBe(true))
  expect(result.current.session.seats[seatId].nickname).toBe('最新昵称')
  expect(window.localStorage.getItem(gameSessionStorageKey)).toBe(previous)
  const leaving = new Event('beforeunload', { cancelable: true })
  window.dispatchEvent(leaving)
  expect(leaving.defaultPrevented).toBe(true)
  await act(() => result.current.retrySave())
  expect(result.current.saveFailed).toBe(true)
  fail = false
  await act(() => result.current.retrySave())
  expect(result.current.saveFailed).toBe(false)
  expect(JSON.parse(window.localStorage.getItem(gameSessionStorageKey)!).seats[seatId].nickname).toBe('最新昵称')
  const savedLeaving = new Event('beforeunload', { cancelable: true })
  window.dispatchEvent(savedLeaving)
  expect(savedLeaving.defaultPrevented).toBe(false)
})

it('remembers roster changes before the setup panel is loaded', async () => {
  const { result } = renderHook(useGameSession)
  await waitFor(() => expect(result.current.editorStatus).toBe('ready'))
  const seatId = Number(Object.keys(result.current.session.seats)[0])
  act(() => result.current.dispatch({ type: 'update-seat-nickname', seatId, nickname: '首页新昵称' }))
  await waitFor(() => expect(JSON.parse(localStorage.getItem('botc-copilot-last-roster-v1')!).seats.find((seat: { seatId: number }) => seat.seatId === seatId).nickname).toBe('首页新昵称'))
})

it('keeps the current game available when every localStorage write fails, including roster memory', async () => {
  const original = Storage.prototype.setItem
  let full = false
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key, value) {
    if (full) throw new DOMException('Storage full', 'QuotaExceededError')
    original.call(this, key, value)
  })
  const { result } = renderHook(useGameSession)
  await waitFor(() => expect(result.current.editorStatus).toBe('ready'))
  full = true
  act(() => result.current.dispatch({ type: 'update-seat-nickname', seatId: 1, nickname: '内存仍保留' }))
  await waitFor(() => expect(result.current.saveFailed).toBe(true))
  expect(result.current.session.seats[1].nickname).toBe('内存仍保留')
  full = false
  await act(() => result.current.retrySave())
  expect(JSON.parse(localStorage.getItem(gameSessionStorageKey)!).seats[1].nickname).toBe('内存仍保留')
})

it('does not edit or overwrite an unreadable original when its recovery copy cannot be saved', async () => {
  const raw = '{"id":"precious-original",broken'
  localStorage.setItem(gameSessionStorageKey, raw)
  const original = Storage.prototype.setItem
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key, value) {
    if (key === 'botc-copilot-session-recovery-v1') throw new DOMException('Storage full', 'QuotaExceededError')
    original.call(this, key, value)
  })
  const { result } = renderHook(useGameSession)
  await waitFor(() => expect(result.current.editorStatus).toBe('ready'))
  expect(result.current.recovery).toMatchObject({ raw, persisted: false })
  act(() => result.current.dispatch({ type: 'open-phase-segment', phaseKind: 'day', createdAt: new Date().toISOString() }))
  await act(() => result.current.retrySave())
  expect(result.current.session.phaseSegments).toEqual([])
  await expect(result.current.startAfterRecovery()).rejects.toThrow('原存档尚未替换')
  expect(localStorage.getItem(gameSessionStorageKey)).toBe(raw)
  expect(result.current.recovery?.raw).toBe(raw)
})

it('saves the reset backup and blank game before changing memory, with identical persisted bytes', async () => {
  const { result } = renderHook(useGameSession)
  await waitFor(() => expect(result.current.editorStatus).toBe('ready'))
  const previous = result.current.session
  const previousRaw = JSON.stringify(previous)
  const retryPrevious = result.current.retrySave
  const save = SessionEditLock.prototype.save
  let finishSave: (() => void) | undefined
  vi.spyOn(SessionEditLock.prototype, 'save').mockImplementationOnce(async function (this: SessionEditLock, next, before, recovery) {
    await new Promise<void>((resolve) => { finishSave = resolve })
    return save.call(this, next, before, recovery)
  })
  let reset: Promise<void>
  act(() => { reset = result.current.resetSession(previous) })
  expect(result.current.session).toBe(previous)
  expect(localStorage.getItem(gameSessionStorageKey)).toBe(previousRaw)
  act(() => result.current.dispatch({ type: 'update-seat-nickname', seatId: 1, nickname: '重置期间不写入' }))
  await expect(result.current.resetSession(previous)).rejects.toThrow('编辑权')
  finishSave!()
  await act(() => reset!)
  expect(localStorage.getItem(beforeRestoreStorageKey)).toBe(previousRaw)
  expect(result.current.session).toMatchObject({ playerCount: 0, seats: {}, timeline: [], phaseSegments: [] })
  await act(() => retryPrevious())
  expect(localStorage.getItem(gameSessionStorageKey)).toBe(JSON.stringify(result.current.session))
})

it.each([beforeRestoreStorageKey, gameSessionStorageKey])('does not reset memory or the current save when %s is full', async (failingKey) => {
  const { result } = renderHook(useGameSession)
  await waitFor(() => expect(result.current.editorStatus).toBe('ready'))
  const previous = result.current.session
  const previousRaw = localStorage.getItem(gameSessionStorageKey)
  const original = Storage.prototype.setItem
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key, value) {
    if (key === failingKey) throw new DOMException('Storage full', 'QuotaExceededError')
    original.call(this, key, value)
  })
  await act(async () => { await expect(result.current.resetSession(previous)).rejects.toThrow('重置未完成') })
  expect(result.current.session).toBe(previous)
  expect(result.current.saveFailed).toBe(true)
  expect(localStorage.getItem(gameSessionStorageKey)).toBe(previousRaw)
})

it('rejects a stale confirmation even when called through the previous render callback', async () => {
  const { result } = renderHook(useGameSession)
  await waitFor(() => expect(result.current.editorStatus).toBe('ready'))
  const previous = result.current.session
  const resetPrevious = result.current.resetSession
  act(() => result.current.dispatch({ type: 'update-seat-nickname', seatId: 1, nickname: '确认后已修改' }))
  await waitFor(() => expect(JSON.parse(localStorage.getItem(gameSessionStorageKey)!).seats[1].nickname).toBe('确认后已修改'))
  const save = vi.spyOn(SessionEditLock.prototype, 'save')
  await expect(resetPrevious(previous)).rejects.toThrow('对局已变化')
  expect(save).not.toHaveBeenCalled()
  expect(result.current.session.seats[1].nickname).toBe('确认后已修改')
  expect(localStorage.getItem(beforeRestoreStorageKey)).toBeNull()
})

it('rejects reset against a confirmation with a queued edit and prevents bypass through dispatch', async () => {
  const { result } = renderHook(useGameSession)
  await waitFor(() => expect(result.current.editorStatus).toBe('ready'))
  const previous = result.current.session
  let reset: Promise<void>
  act(() => {
    result.current.dispatch({ type: 'update-seat-nickname', seatId: 1, nickname: '刚刚输入' })
    reset = result.current.resetSession(previous)
  })
  await expect(reset!).rejects.toThrow('对局已变化')
  expect(result.current.session.seats[1].nickname).toBe('刚刚输入')
  act(() => result.current.dispatch({ type: 'reset-session' }))
  expect(result.current.session.playerCount).toBe(12)
  expect(localStorage.getItem(beforeRestoreStorageKey)).toBeNull()
})

it('refuses reset while an autosave is pending, then succeeds after the save finishes', async () => {
  const { result } = renderHook(useGameSession)
  await waitFor(() => expect(result.current.editorStatus).toBe('ready'))
  const save = SessionEditLock.prototype.save
  let finishSave: (() => void) | undefined
  const delayed = vi.spyOn(SessionEditLock.prototype, 'save').mockImplementationOnce(async function (this: SessionEditLock, next, before, recovery) {
    await new Promise<void>((resolve) => { finishSave = resolve })
    return save.call(this, next, before, recovery)
  })
  act(() => result.current.dispatch({ type: 'update-seat-nickname', seatId: 1, nickname: '最后一次修改' }))
  await expect(result.current.resetSession(result.current.session)).rejects.toThrow('仍在保存')
  expect(result.current.session.playerCount).toBe(12)
  expect(delayed).toHaveBeenCalledTimes(1)
  await act(async () => { finishSave!() })
  const previous = result.current.session
  await act(() => result.current.resetSession(previous))
  expect(JSON.parse(localStorage.getItem(beforeRestoreStorageKey)!).seats[1].nickname).toBe('最后一次修改')
  expect(localStorage.getItem(gameSessionStorageKey)).toBe(JSON.stringify(result.current.session))
})

it('keeps the old in-memory game and marks conflict if the edit lease is lost before reset saves', async () => {
  const { result } = renderHook(useGameSession)
  await waitFor(() => expect(result.current.editorStatus).toBe('ready'))
  const previous = result.current.session
  const previousRaw = localStorage.getItem(gameSessionStorageKey)
  vi.spyOn(SessionEditLock.prototype, 'save').mockRejectedValueOnce(new SessionConflictError('另一页面已更新对局'))
  await act(async () => { await expect(result.current.resetSession(previous)).rejects.toThrow('重置未完成') })
  expect(result.current.session).toBe(previous)
  expect(result.current.editorStatus).toBe('conflict')
  expect(localStorage.getItem(gameSessionStorageKey)).toBe(previousRaw)
  expect(localStorage.getItem(beforeRestoreStorageKey)).toBeNull()
})

// These synthetic events test hook decisions only; real BFCache lifecycle is covered by browser tests.
function restoreCachedPage() {
  window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true }))
  window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }))
}

it('suspends a failed-save cached page while retaining its latest memory and original stored bytes', async () => {
  const { result } = renderHook(useGameSession)
  await waitFor(() => expect(result.current.editorStatus).toBe('ready'))
  const before = localStorage.getItem(gameSessionStorageKey)
  localStorage.setItem(beforeRestoreStorageKey, before!)
  const original = Storage.prototype.setItem
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key, value) {
    if (key === gameSessionStorageKey) throw new DOMException('Storage full', 'QuotaExceededError')
    original.call(this, key, value)
  })
  act(() => result.current.dispatch({ type: 'update-seat-nickname', seatId: 1, nickname: '缓存里尚未保存的昵称' }))
  await waitFor(() => expect(result.current.saveFailed).toBe(true))
  const latest = result.current.session
  act(restoreCachedPage)
  expect(result.current.editorStatus).toBe('suspended')
  expect(result.current.session).toBe(latest)
  expect(result.current.session.seats[1].nickname).toBe('缓存里尚未保存的昵称')
  act(() => result.current.dispatch({ type: 'update-seat-nickname', seatId: 1, nickname: '不得继续编辑' }))
  await act(() => result.current.retrySave())
  expect(result.current.session).toBe(latest)
  expect(localStorage.getItem(gameSessionStorageKey)).toBe(before)
  expect(localStorage.getItem(beforeRestoreStorageKey)).toBe(before)
})

it('keeps a pending-save cached page suspended after the closed editor rejects its late save', async () => {
  const { result } = renderHook(useGameSession)
  await waitFor(() => expect(result.current.editorStatus).toBe('ready'))
  const before = localStorage.getItem(gameSessionStorageKey)
  let finishSave!: () => void
  // The lease mock cannot model browser ownership; return the real lock's closed-editor rejection.
  const save = vi.spyOn(SessionEditLock.prototype, 'save').mockImplementationOnce(() => new Promise<void>((_resolve, reject) => {
    finishSave = () => reject(new SessionConflictError('编辑权或对局内容已变化'))
  }))
  act(() => result.current.dispatch({ type: 'update-seat-nickname', seatId: 1, nickname: '待保存的最新昵称' }))
  await waitFor(() => expect(save).toHaveBeenCalledTimes(1))
  const latest = result.current.session
  act(restoreCachedPage)
  expect(result.current.editorStatus).toBe('suspended')
  await act(async () => { finishSave() })
  expect(result.current.editorStatus).toBe('suspended')
  act(() => result.current.dispatch({ type: 'update-seat-nickname', seatId: 1, nickname: '恢复前不得继续编辑' }))
  await act(() => result.current.retrySave())
  expect(result.current.session).toBe(latest)
  expect(result.current.session.seats[1].nickname).toBe('待保存的最新昵称')
  expect(localStorage.getItem(gameSessionStorageKey)).toBe(before)
  expect(save).toHaveBeenCalledTimes(1)
})

it('keeps a pending-reset cached page suspended when its closed editor rejects the replacement', async () => {
  const { result } = renderHook(useGameSession)
  await waitFor(() => expect(result.current.editorStatus).toBe('ready'))
  const previous = result.current.session
  const before = localStorage.getItem(gameSessionStorageKey)
  let finishSave!: () => void
  const save = vi.spyOn(SessionEditLock.prototype, 'save').mockImplementationOnce(() => new Promise<void>((_resolve, reject) => {
    finishSave = () => reject(new SessionConflictError('编辑权或对局内容已变化'))
  }))
  let reset!: Promise<void>
  act(() => { reset = result.current.resetSession(previous) })
  await waitFor(() => expect(save).toHaveBeenCalledTimes(1))
  act(restoreCachedPage)
  expect(result.current.editorStatus).toBe('suspended')
  await act(async () => {
    finishSave()
    await expect(reset).rejects.toThrow('重置未完成')
  })
  expect(result.current.editorStatus).toBe('suspended')
  act(() => result.current.dispatch({ type: 'update-seat-nickname', seatId: 1, nickname: '不能进入半次新局' }))
  expect(result.current.session).toBe(previous)
  expect(localStorage.getItem(gameSessionStorageKey)).toBe(before)
  expect(localStorage.getItem(beforeRestoreStorageKey)).toBeNull()
})

it('registers beforeunload only while saving or failed, then removes it after a successful retry', async () => {
  const activeListeners = new Set<EventListenerOrEventListenerObject>()
  const add = window.addEventListener
  const remove = window.removeEventListener
  vi.spyOn(window, 'addEventListener').mockImplementation((type, listener, options) => {
    if (type === 'beforeunload') activeListeners.add(listener)
    add.call(window, type, listener, options)
  })
  vi.spyOn(window, 'removeEventListener').mockImplementation((type, listener, options) => {
    if (type === 'beforeunload') activeListeners.delete(listener)
    remove.call(window, type, listener, options)
  })
  const { result } = renderHook(useGameSession)
  await waitFor(() => expect(result.current.editorStatus).toBe('ready'))
  expect(activeListeners.size).toBe(0)
  let failSave!: () => void
  vi.spyOn(SessionEditLock.prototype, 'save').mockImplementationOnce(() => new Promise<void>((_resolve, reject) => {
    failSave = () => reject(new DOMException('Storage full', 'QuotaExceededError'))
  }))
  act(() => result.current.dispatch({ type: 'update-seat-nickname', seatId: 1, nickname: '需要离页保护的昵称' }))
  await waitFor(() => expect(activeListeners.size).toBe(1))
  const pendingLeave = new Event('beforeunload', { cancelable: true })
  window.dispatchEvent(pendingLeave)
  expect(pendingLeave.defaultPrevented).toBe(true)
  await act(async () => { failSave() })
  expect(result.current.saveFailed).toBe(true)
  expect(activeListeners.size).toBe(1)
  const failedLeave = new Event('beforeunload', { cancelable: true })
  window.dispatchEvent(failedLeave)
  expect(failedLeave.defaultPrevented).toBe(true)
  await act(() => result.current.retrySave())
  expect(result.current.saveFailed).toBe(false)
  expect(activeListeners.size).toBe(0)
  expect(localStorage.getItem(gameSessionStorageKey)).toBe(JSON.stringify(result.current.session))
})
