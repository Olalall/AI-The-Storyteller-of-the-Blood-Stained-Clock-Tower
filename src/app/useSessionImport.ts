import { useState } from 'react'
import type { GameSessionAction } from '../features/game-session/state/sessionActions'
import type { GameSessionState } from '../features/game-session/types'
import {
  deleteSnapshot,
  listSnapshots,
  parseSessionImportText,
  persistGameSession,
  readSnapshot,
  snapshotBeforeDestructiveChange,
} from '../services/session'

interface ImportUndoState {
  session: GameSessionState
  snapshotSlot: number
}

function latestImportUndo(): ImportUndoState | null {
  for (const entry of listSnapshots()) {
    if (entry.reason !== 'import') continue
    const snapshot = readSnapshot(entry.slot)
    if (!snapshot) continue
    const parsed = parseSessionImportText(snapshot.raw)
    if (parsed.ok) return { session: parsed.session, snapshotSlot: entry.slot }
  }
  return null
}

function importError(message: string, cause?: unknown) {
  return new Error(message, cause === undefined ? undefined : { cause })
}

/**
 * 导入会整份替换当前对局，因此在这里统一保留一次可见、可立即操作的撤销机会。
 * 页面跳转由 App 注入，避免这个数据钩子反过来依赖顶层界面结构。
 */
export function useSessionImport(
  session: GameSessionState,
  dispatch: (action: GameSessionAction) => void,
  onApplied: (restored: GameSessionState) => void,
) {
  const [undoState, setUndoState] = useState<ImportUndoState | null>(latestImportUndo)

  function apply(imported: GameSessionState) {
    if (!snapshotBeforeDestructiveChange(session, 'import')) {
      throw importError('本机空间不足，无法保存恢复前快照；当前对局没有被替换。')
    }
    const snapshotEntry = listSnapshots().find((candidate) => candidate.reason === 'import')
    if (!snapshotEntry) {
      throw importError('恢复前快照无法读取；当前对局没有被替换。')
    }
    try {
      persistGameSession(imported)
    } catch (cause) {
      deleteSnapshot(snapshotEntry.slot)
      throw importError('无法把备份写入本机存储；当前对局没有被替换。', cause)
    }
    try {
      dispatch({ type: 'replace-session', session: imported })
    } catch (cause) {
      try { persistGameSession(session) } catch { /* 主状态回滚失败时仍保留导入前快照。 */ }
      throw importError('页面未能切换到恢复的对局；请刷新后使用恢复前快照。', cause)
    }
    for (const oldImport of listSnapshots()) {
      if (oldImport.reason === 'import' && oldImport.slot !== snapshotEntry.slot) deleteSnapshot(oldImport.slot)
    }
    setUndoState({ session, snapshotSlot: snapshotEntry.slot })
    onApplied(imported)
  }

  function undo() {
    if (!undoState) return
    if (!snapshotBeforeDestructiveChange(session)) {
      throw importError('本机空间不足，无法保存当前状态；这次撤销没有执行。')
    }
    try {
      persistGameSession(undoState.session)
    } catch (cause) {
      throw importError('无法把恢复前对局写回本机；这次撤销没有执行。', cause)
    }
    dispatch({ type: 'replace-session', session: undoState.session })
    onApplied(undoState.session)
    deleteSnapshot(undoState.snapshotSlot)
    setUndoState(null)
  }

  function dismissUndo() {
    if (undoState) deleteSnapshot(undoState.snapshotSlot)
    setUndoState(null)
  }

  return {
    previousSession: undoState?.session ?? null,
    apply,
    undo,
    dismissUndo,
  }
}
