import type { GameSessionState } from '../../features/game-session/types'
import { gameSessionStorageKey, persistGameSession, sessionRecoveryStorageKey, type SessionRecoveryRecord } from './localSessionAdapter'

export const beforeRestoreStorageKey = 'botc-session-before-restore-v1'
const leaseDuration = 15_000
type Lease = { owner: string; expires: number; protocol?: 'web-lock-v1' }
export class SessionConflictError extends Error {}

/** IndexedDB 只存编辑租约；对局仍只写既有 localStorage 真源。 */
export class SessionEditLock {
  private readonly owner = `${Date.now()}-${Math.random()}`
  private db?: Promise<IDBDatabase>
  private baseline: string | null
  private closed = false
  private readonly nativeLocks = navigator.locks
  private nativeHeld = false
  private nativePending?: Promise<boolean>
  private releaseNative?: () => void

  constructor(baseline: string | null) { this.baseline = baseline }

  private acquireNative() {
    if (!this.nativeLocks || this.nativeHeld) return Promise.resolve(true)
    this.nativePending ??= new Promise<boolean>((resolve, reject) => {
      void this.nativeLocks.request('botc-session-editor-v1', { ifAvailable: true }, async (lock) => {
        if (!lock || this.closed) { resolve(false); return }
        this.nativeHeld = true
        await new Promise<void>((release) => { this.releaseNative = release; resolve(true) })
      }).catch((error: unknown) => { this.nativeHeld = false; reject(error) })
    }).finally(() => { this.nativePending = undefined })
    return this.nativePending
  }

  private dropNative() {
    this.nativeHeld = false
    this.releaseNative?.()
    this.releaseNative = undefined
  }

  private canEdit() { return !this.closed && (!this.nativeLocks || this.nativeHeld) }

  private database() {
    this.db ??= new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('botc-session-editor-v1', 1)
      request.onupgradeneeded = () => request.result.createObjectStore('leases')
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
      request.onblocked = () => reject(new Error('编辑保护暂不可用'))
    })
    return this.db
  }

  private async transaction<T>(operation: (lease: Lease | undefined, store: IDBObjectStore) => T): Promise<T> {
    const db = await this.database()
    return new Promise<T>((resolve, reject) => {
      const tx = db.transaction('leases', 'readwrite')
      const store = tx.objectStore('leases')
      let result: T
      let failure: unknown
      const request = store.get('current')
      request.onsuccess = () => {
        try { result = operation(request.result as Lease | undefined, store) }
        catch (error) { failure = error; tx.abort() }
      }
      tx.oncomplete = () => resolve(result)
      tx.onabort = () => reject(failure ?? tx.error ?? new Error('编辑保护写入失败'))
      tx.onerror = () => { /* onabort 统一返回错误 */ }
    })
  }

  async acquire() {
    try {
      if (this.closed || !await this.acquireNative()) return false
      const acquired = await this.transaction((lease, store) => {
        if (!this.canEdit()) return false
        // 原生锁随旧文档结束而释放；只提前接手同协议租约，旧版页面仍等待过期。
        if (lease && lease.owner !== this.owner && lease.expires > Date.now() && !(this.nativeHeld && lease.protocol === 'web-lock-v1')) return false
        if (localStorage.getItem(gameSessionStorageKey) !== this.baseline) throw new SessionConflictError('另一页面已更新对局')
        store.put({ owner: this.owner, expires: Date.now() + leaseDuration, ...(this.nativeHeld ? { protocol: 'web-lock-v1' } : {}) }, 'current')
        return true
      })
      if (!acquired) this.dropNative()
      return acquired && this.canEdit()
    } catch (error) {
      this.dropNative()
      throw error
    }
  }

  async save(session: GameSessionState, beforeRestore?: GameSessionState, recovery?: SessionRecoveryRecord) {
    const renewedUntil = await this.transaction((lease, store) => {
      if (!this.canEdit() || lease?.owner !== this.owner || localStorage.getItem(gameSessionStorageKey) !== this.baseline) {
        throw new SessionConflictError('编辑权或对局内容已变化')
      }
      if (recovery && this.baseline !== recovery.raw) throw new SessionConflictError('原存档已变化')
      const expires = Date.now() + leaseDuration
      store.put({ owner: this.owner, expires, ...(this.nativeHeld ? { protocol: 'web-lock-v1' } : {}) }, 'current')
      return expires
    })
    if (!this.canEdit() || Date.now() >= renewedUntil || localStorage.getItem(gameSessionStorageKey) !== this.baseline) {
      throw new SessionConflictError('编辑权或对局内容已变化')
    }
    // 租约提交成功后才写对局；页面若已挂起到租约过期，必须重新取得编辑权。
    if (recovery) localStorage.setItem(sessionRecoveryStorageKey, JSON.stringify({ ...recovery, persisted: true }))
    if (beforeRestore) localStorage.setItem(beforeRestoreStorageKey, JSON.stringify(beforeRestore))
    persistGameSession(session)
    this.baseline = JSON.stringify(session)
  }

  async release() {
    this.closed = true
    this.dropNative()
    try {
      await this.transaction((lease, store) => { if (lease?.owner === this.owner) store.delete('current') })
    } finally {
      if (this.db) void this.db.then((db) => db.close(), () => undefined)
    }
  }
}
