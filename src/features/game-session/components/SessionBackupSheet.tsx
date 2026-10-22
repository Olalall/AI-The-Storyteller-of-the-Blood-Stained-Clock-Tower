import { useRef, useState } from 'react'
import { ArchiveRestore } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Sheet } from '../../../components/ui/Sheet'
import { scriptDisplayName } from '../../../domain/scripts'
import { downloadSessionBackup, maxBackupBytes, parseSessionBackup } from '../../../services/session/sessionBackup'
import { beforeRestoreStorageKey } from '../../../services/session/sessionEditLock'
import type { GameSessionState } from '../types'
import './session-backup.css'

export function SessionBackupSheet({ session, onRestore }: { session: GameSessionState; onRestore: (next: GameSessionState) => Promise<void> }) {
  const [open, setOpen] = useState(false)
  const [preview, setPreview] = useState<GameSessionState | null>(null)
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [busy, setBusy] = useState(false)
  const reading = useRef(0)
  const fileInput = useRef<HTMLInputElement>(null)
  function choose(raw: string, name: string) {
    setPreview(null); setConfirmed(false); setError('')
    try { setPreview(parseSessionBackup(raw)); setFileName(name) }
    catch (failure) { setError(failure instanceof Error ? failure.message : '无法读取备份。') }
  }
  async function readFile(file?: File) {
    const version = ++reading.current
    setPreview(null); setConfirmed(false); setError('')
    if (!file) return
    if (file.size > maxBackupBytes) { setError('备份超过 10 MB，请先检查文件。'); return }
    try {
      const raw = await file.text()
      if (version === reading.current) choose(raw, file.name)
    } catch { if (version === reading.current) setError('文件读取失败，请重新选择。') }
  }
  function previousBackup() {
    ++reading.current
    try {
      const raw = localStorage.getItem(beforeRestoreStorageKey)
      if (!raw) { setPreview(null); setError('尚无恢复前备份。'); return }
      choose(raw, '恢复前的对局')
    } catch { setPreview(null); setError('无法读取恢复前备份。') }
  }
  async function restore() {
    if (!preview || !confirmed || busy) return
    setBusy(true); setError('')
    try { await onRestore(preview) }
    catch (failure) { setError(failure instanceof Error ? failure.message : '恢复失败。'); setBusy(false) }
  }
  const phases = preview?.phaseSegments.filter((phase) => !phase.closedAt).map((phase) => phase.label).join('、') || '尚未开始 / 已结束'
  return <Sheet open={open} onOpenChange={(next) => { if (!busy) { setOpen(next); if (!next) { ++reading.current; setPreview(null); setError(''); setConfirmed(false) } } }}
    title="对局备份" description="备份只保存在你的设备中。选择文件后先预览，确认恢复才会替换当前局。"
    trigger={<Button variant="ghost" compact aria-label="备份恢复" title="导出或恢复对局备份"><ArchiveRestore aria-hidden="true" />备份</Button>}>
    <div className="session-backup">
      <div className="session-backup__actions">
        <Button onClick={() => downloadSessionBackup(session)} disabled={busy}>导出当前对局</Button>
        <Button onClick={previousBackup} disabled={busy}>查看恢复前备份</Button>
      </div>
      <div className="session-backup__file"><Button disabled={busy} onClick={() => fileInput.current?.click()}>选择备份文件</Button>
        <input ref={fileInput} hidden aria-label="选择备份文件" type="file" accept=".json,application/json" disabled={busy} onChange={(event) => { void readFile(event.target.files?.[0]); event.target.value = '' }} />
      </div>
      {error ? <p role="alert">{error}</p> : null}
      {preview ? <>
        <dl className="session-backup__preview">
          <dt>文件</dt><dd>{fileName}</dd><dt>剧本</dt><dd>{scriptDisplayName(preview.scriptId)}</dd>
          <dt>人数</dt><dd>{preview.playerCount} 人</dd><dt>阶段</dt><dd>{phases}</dd>
          <dt>记录</dt><dd>{preview.timeline.length} 条</dd>
          <dt>夜晚草稿</dt><dd>{Object.values(preview.nightRuns).reduce((count, run) => count + Object.keys(run.drafts).length, 0)} 份</dd>
        </dl>
        <label className="session-backup__confirm"><input type="checkbox" checked={confirmed} disabled={busy} onChange={(event) => setConfirmed(event.target.checked)} />我确认替换当前对局，并保留恢复前备份。</label>
        <Button variant="danger" disabled={!confirmed || busy} onClick={() => { void restore() }}>{busy ? '正在恢复' : '确认恢复'}</Button>
      </> : null}
    </div>
  </Sheet>
}
