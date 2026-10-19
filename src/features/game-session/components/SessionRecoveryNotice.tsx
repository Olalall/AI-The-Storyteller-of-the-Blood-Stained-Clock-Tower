import { AlertTriangle, Download, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { Sheet } from '../../../components/ui/Sheet'
import { clearSessionRecovery, readSessionRecovery, type SessionRecoveryRecord } from '../../../services/session'
import { downloadTextFile } from '../../../services/session/exportSession'
import './session-recovery-notice.css'

function downloadRaw(raw: string, savedAt: string) {
  downloadTextFile(`botc-session-recovery-${savedAt.replace(/[:.]/g, '-')}.json`, raw)
}

/**
 * 只在上一份存档读不出时出现。它不尝试修复数据，只保证原文可被导出——
 * 说书人可以拿着这份文件找人恢复，而不是发现对局凭空消失。
 */
export function SessionRecoveryNotice({ recovery, onStart, canStart }: {
  recovery: SessionRecoveryRecord | null
  onStart: () => Promise<void>
  canStart: boolean
}) {
  const [storedRecovery, setStoredRecovery] = useState(readSessionRecovery)
  const [exported, setExported] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const record = recovery ?? storedRecovery
  if (!record) return null

  async function start() {
    if (!exported || !confirmed || busy || !canStart) return
    setBusy(true); setError('')
    try { await onStart() }
    catch (failure) { setError(failure instanceof Error ? failure.message : '原存档尚未替换，请重试。'); setBusy(false) }
  }
  if (recovery) return <Sheet open onOpenChange={() => undefined} dismissible={false} layer="nested" title="原存档无法读取" description="原存档尚未替换。请先导出原文，核对后再决定是否开始空白新局。" contentClassName="sheet-content--save-recovery">
    <section className="session-recovery" role="alert" aria-label="原存档恢复">
      <AlertTriangle aria-hidden="true" />
      <div className="session-recovery__body">
        <strong>{record.persisted === false ? '恢复副本尚未保存，原文仍保留在主存档中。' : '原文已留档，等待你确认下一步。'}</strong>
        <span>当前停止编辑和自动保存。新建前会再次保存恢复副本；留档失败时继续保留原存档。</span>
        {!canStart ? <span>正在等待编辑权；请关闭其他编辑页面后稍候。</span> : null}
        {error ? <p role="alert">{error}</p> : null}
      </div>
      <div className="session-recovery__actions">
        <Button onClick={() => { downloadRaw(record.raw, record.savedAt); setExported(true) }}>导出原文</Button>
        <label><input type="checkbox" checked={confirmed} disabled={!exported || busy} onChange={(event) => setConfirmed(event.target.checked)} />我已保存导出文件，确认开始空白新局</label>
        <Button variant="danger" disabled={!exported || !confirmed || !canStart || busy} onClick={() => { void start() }}>{busy ? '正在留档' : '留档并开始空白新局'}</Button>
      </div>
    </section>
  </Sheet>

  const savedAtLabel = new Date(record.savedAt).toLocaleString('zh-CN')
  const reasonLabel = record.reason === 'parse-error' ? '文件内容不完整' : '文件结构不被识别'

  return (
    <section className="session-recovery" role="alert">
      <AlertTriangle aria-hidden="true" />
      <div className="session-recovery__body">
        <strong>上一份存档没能读出，已为你留档</strong>
        <span>
          {savedAtLabel} · {reasonLabel} · {record.byteLength} 字节。
          当前是一局新的对局；原文件仍可导出，导出后再关闭此提示。
        </span>
      </div>
      <div className="session-recovery__actions">
        <Button
          variant="primary"
          compact
          onClick={() => downloadRaw(record.raw, record.savedAt)}
          disabled={!record.raw}
        >
          <Download aria-hidden="true" />导出原文
        </Button>
        <Button
          variant="ghost"
          compact
          onClick={() => { clearSessionRecovery(); setStoredRecovery(null) }}
          aria-label="关闭存档恢复提示"
        >
          <X aria-hidden="true" />
        </Button>
      </div>
    </section>
  )
}
