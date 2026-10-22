import { loadSmartScriptPack } from '../../../domain/scripts'
import { saveSetupRosterMemory } from '../../setup/setupRosterMemory'
import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { gameSessionReducer, type GameSessionAction } from './sessionReducer'
import { loadGameSessionOutcome } from '../../../services/session'
import { createEmptyGameSession } from '../data/createPrototypeSession'
import { SessionConflictError, SessionEditLock } from '../../../services/session/sessionEditLock'
import type { GameSessionState } from '../types'

export type EditorStatus = 'checking' | 'ready' | 'blocked' | 'conflict' | 'suspended' | 'unavailable'

/** 仅在 App 层创建一次；工作台只接收同一个 session 与 dispatch。 */
export function useGameSession() {
  const [initial] = useState(() => {
    const outcome = loadGameSessionOutcome()
    const { session, baseline } = outcome
    return { session, baseline, recovery: outcome.kind === 'unreadable' ? outcome.recovery : null }
  })
  const [session, reduce] = useReducer(gameSessionReducer, initial.session)
  useEffect(() => { if (!initial.recovery) saveSetupRosterMemory(session) }, [session, initial])
  const [saveFailed, setSaveFailed] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editorStatus, setEditorStatus] = useState<EditorStatus>('checking')
  const editor = useRef<SessionEditLock | null>(null)
  const leavingAfterRestore = useRef(false)
  const restoring = useRef(false)
  const pendingSaves = useRef(0)
  const latestSession = useRef(session)
  latestSession.current = session
  const dispatchedVersion = useRef(0)
  const renderedVersion = dispatchedVersion.current
  const savedSession = useRef(initial.session)
  const pageHidden = useRef(false)
  const lifecycle = useRef({ saveFailed, editorStatus, renderedVersion })
  lifecycle.current = { saveFailed, editorStatus, renderedVersion }

  useEffect(() => {
    const lock = new SessionEditLock(initial.baseline)
    editor.current = lock
    let active = true
    const acquire = async () => {
      try {
        const acquired = await lock.acquire()
        if (active) setEditorStatus(acquired ? 'ready' : 'blocked')
      } catch (error) {
        if (active) setEditorStatus(error instanceof SessionConflictError ? 'conflict' : 'unavailable')
      }
    }
    void acquire()
    const timer = window.setInterval(() => { void acquire() }, 5000)
    // 后台可能暂停轮询；回到前台立即检查，编辑权仍由同一把锁决定。
    const foreground = () => {
      if (active && document.visibilityState === 'visible') void acquire()
    }
    document.addEventListener('visibilitychange', foreground)
    let interrupted = false
    const pageHide = () => {
      interrupted ||= lifecycle.current.saveFailed || lifecycle.current.editorStatus === 'conflict' ||
        pendingSaves.current > 0 || restoring.current || savedSession.current !== latestSession.current ||
        lifecycle.current.renderedVersion !== dispatchedVersion.current
      pageHidden.current = true
      active = false
      window.clearInterval(timer)
      void lock.release().catch(() => undefined)
    }
    const pageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return
      // 缓存中的未存内容先交给导出，不能用自动刷新把它丢掉。
      if (interrupted && !initial.recovery) { leavingAfterRestore.current = false; setEditorStatus('suspended') }
      else window.location.reload()
    }
    window.addEventListener('pagehide', pageHide)
    window.addEventListener('pageshow', pageShow)
    return () => {
      active = false
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', foreground)
      window.removeEventListener('pagehide', pageHide)
      window.removeEventListener('pageshow', pageShow)
      void lock.release().catch(() => undefined)
    }
  }, [initial])

  const retrySave = useCallback(async () => {
    if (pageHidden.current || initial.recovery || editorStatus !== 'ready' || !editor.current || restoring.current || session !== latestSession.current || renderedVersion !== dispatchedVersion.current) return
    pendingSaves.current += 1
    setSaving(true)
    try {
      await editor.current.save(session)
      savedSession.current = session
      if (!pageHidden.current) setSaveFailed(false)
    } catch (error) {
      if (!pageHidden.current) {
        if (error instanceof SessionConflictError) setEditorStatus('conflict')
        else setSaveFailed(true)
      }
    } finally {
      pendingSaves.current -= 1
      setSaving(pendingSaves.current > 0 || restoring.current)
    }
  }, [session, editorStatus, initial, renderedVersion])

  useEffect(() => {
    void retrySave()
  }, [retrySave])

  useEffect(() => {
    if (!saving && !saveFailed && editorStatus !== 'conflict' && editorStatus !== 'suspended') return
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      if (leavingAfterRestore.current) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warnBeforeLeaving)
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving)
  }, [saving, saveFailed, editorStatus])

  const dispatch = useCallback((action: GameSessionAction) => {
    if (!pageHidden.current && !initial.recovery && editorStatus === 'ready' && !restoring.current && action.type !== 'reset-session' && action.type !== 'replace-session') {
      dispatchedVersion.current += 1
      reduce(action)
    }
  }, [editorStatus, initial])

  async function resetSession(expectedSession: GameSessionState) {
    if (pageHidden.current || initial.recovery || editorStatus !== 'ready' || !editor.current || restoring.current) throw new Error('请先处理原存档并在当前页面取得编辑权。')
    if (expectedSession !== latestSession.current || renderedVersion !== dispatchedVersion.current) throw new Error('对局已变化，请重新确认重置。')
    if (pendingSaves.current > 0) throw new Error('对局仍在保存，请稍后重试重置。')
    restoring.current = true
    setSaving(true)
    const createdAt = new Date().toISOString()
    const next = createEmptyGameSession(createdAt)
    try {
      await editor.current.save(next, expectedSession)
      savedSession.current = next
      latestSession.current = next
      reduce({ type: 'reset-session', createdAt })
      setSaveFailed(false)
    } catch (error) {
      if (!pageHidden.current) {
        if (error instanceof SessionConflictError) setEditorStatus('conflict')
        else setSaveFailed(true)
      }
      throw new Error('重置未完成。请检查编辑权和存储空间，当前对局仍保留。')
    } finally {
      restoring.current = false
      setSaving(pendingSaves.current > 0)
    }
  }

  async function restoreSession(next: GameSessionState) {
    if (pageHidden.current || initial.recovery || editorStatus !== 'ready' || !editor.current || restoring.current) throw new Error('请先处理原存档并在当前页面取得编辑权。')
    restoring.current = true
    setSaving(true)
    try {
      try { await loadSmartScriptPack(next.scriptId) }
      catch { throw new Error('剧本资料加载失败，请检查网络后重试恢复。') }
      await editor.current.save(next, session)
      leavingAfterRestore.current = true
      await editor.current.release().catch(() => undefined)
      window.location.reload()
    } catch (error) {
      restoring.current = false
      setSaving(pendingSaves.current > 0)
      if (!pageHidden.current && error instanceof SessionConflictError) setEditorStatus('conflict')
      throw new Error(error instanceof Error && error.message.startsWith('剧本资料') ? error.message : '恢复未完成。请检查编辑权和存储空间，当前对局未在此页面中替换。')
    }
  }
  async function reopenLatest() {
    leavingAfterRestore.current = true
    await editor.current?.release().catch(() => undefined)
    window.location.reload()
  }
  async function startAfterRecovery() {
    if (pageHidden.current || !initial.recovery || editorStatus !== 'ready' || !editor.current || restoring.current) throw new Error('请先取得编辑权，再处理原存档。')
    restoring.current = true
    setSaving(true)
    try {
      await editor.current.save(createEmptyGameSession(), undefined, initial.recovery)
      leavingAfterRestore.current = true
      await editor.current.release().catch(() => undefined)
      window.location.reload()
    } catch {
      restoring.current = false
      setSaving(pendingSaves.current > 0)
      throw new Error('原存档尚未替换。请先导出原文，并释放浏览器存储空间后重试留档。')
    }
  }
  return { session, dispatch, saveFailed, saving, retrySave, editorStatus, resetSession, restoreSession, reopenLatest, recovery: initial.recovery, startAfterRecovery }
}
