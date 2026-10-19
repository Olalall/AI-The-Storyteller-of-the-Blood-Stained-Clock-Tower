import { AlertTriangle, Download, FileJson, Upload } from 'lucide-react'
import { useRef, useState, type ChangeEvent } from 'react'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { smartScriptRegistry } from '../../domain/scripts'
import { exportSessionJson, readSessionImportFile, type SessionImportResult } from '../../services/session'
import type { GameSessionState } from '../game-session/types'

interface SessionBackupSectionProps {
  session: GameSessionState
  onImportSession: (session: GameSessionState) => void
}

type ReadyImport = Extract<SessionImportResult, { ok: true }>

function displayScript(scriptId: string) {
  return smartScriptRegistry.get(scriptId)?.displayName ?? scriptId
}

function displayTime(value?: string) {
  if (!value) return '暂无记录时间'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

/** 导入分两步：先读文件并展示摘要，再由说书人确认整局替换。 */
export function SessionBackupSection({ session, onImportSession }: SessionBackupSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const selectionRevisionRef = useRef(0)
  const [candidate, setCandidate] = useState<ReadyImport | null>(null)
  const [fileName, setFileName] = useState('')
  const [message, setMessage] = useState<{ tone: 'success' | 'warning'; text: string } | null>(null)

  async function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const selectionRevision = selectionRevisionRef.current + 1
    selectionRevisionRef.current = selectionRevision
    const file = event.target.files?.[0]
    setCandidate(null)
    setMessage(null)
    setFileName(file?.name ?? '')
    if (!file) return
    const result = await readSessionImportFile(file)
    // 手机文件选择器和云盘读取可能很慢；只允许最后一次选择更新候选。
    if (selectionRevision !== selectionRevisionRef.current) return
    if (!result.ok) {
      setMessage({ tone: 'warning', text: result.message })
      return
    }
    setCandidate(result)
  }

  function confirmImport() {
    if (!candidate) return
    try {
      onImportSession(candidate.session)
    } catch (error) {
      setMessage({
        tone: 'warning',
        text: error instanceof Error ? error.message : '恢复失败；当前对局没有被替换。',
      })
      return
    }
    setCandidate(null)
    setMessage({ tone: 'success', text: '已恢复这份对局备份。' })
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <section className="ai-settings-card ai-settings-card--backup" aria-labelledby="session-backup-title">
      <div className="ai-settings-card__heading">
        <span><FileJson aria-hidden="true" />本机数据</span>
        <h3 id="session-backup-title">导出与恢复当前对局</h3>
      </div>

      <p className="session-backup__intro">存档默认保存在当前浏览器。换手机、清浏览器数据或重装前，先导出一份 JSON。</p>

      <div className="session-backup__actions">
        <Button type="button" variant="secondary" onClick={() => exportSessionJson(session)}>
          <Download aria-hidden="true" />导出当前对局
        </Button>
        <label className="ui-button ui-button--secondary session-backup__file-button">
          <Upload aria-hidden="true" />选择备份文件
          <input
            ref={inputRef}
            className="ui-visually-hidden"
            type="file"
            accept="application/json,.json"
            onChange={(event) => { void selectFile(event) }}
          />
        </label>
        {fileName ? <span className="session-backup__filename">{fileName}</span> : null}
      </div>

      {message ? <StatusBadge tone={message.tone}>{message.text}</StatusBadge> : null}

      {candidate ? (
        <div className="session-backup__preview" aria-label="待恢复对局摘要">
          <div className="session-backup__preview-head">
            <span><AlertTriangle aria-hidden="true" />恢复前确认</span>
            <StatusBadge tone="warning">尚未写入</StatusBadge>
          </div>
          <dl>
            <div><dt>板子</dt><dd>{displayScript(candidate.preview.scriptId)}</dd></div>
            <div><dt>玩家</dt><dd>{candidate.preview.playerCount} 人</dd></div>
            <div><dt>进度</dt><dd>{candidate.preview.phaseCount} 个昼夜段 · {candidate.preview.timelineCount} 条记录</dd></div>
            <div><dt>最近记录</dt><dd>{displayTime(candidate.preview.updatedAt)}</dd></div>
          </dl>
          <p>确认后会整份替换当前对局；页面会立即提供“撤销这次恢复”，选错文件可以回到恢复前。</p>
          <div className="session-backup__confirm-actions">
            <Button type="button" variant="ghost" onClick={() => setCandidate(null)}>取消</Button>
            <Button type="button" variant="danger" onClick={confirmImport}>确认恢复这份对局</Button>
          </div>
        </div>
      ) : null}
    </section>
  )
}
