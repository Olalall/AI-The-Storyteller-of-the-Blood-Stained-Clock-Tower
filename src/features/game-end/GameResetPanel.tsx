import { RotateCcw, ShieldCheck } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { scriptDisplayName } from '../../domain/scripts'
import type { GameSessionState } from '../game-session/types'

interface GameResetPanelProps {
  session: GameSessionState
  nextScriptLabel: string | null
  busy: boolean
  notice: string | null
  onCancel: () => void
  onConfirm: () => void
  onExportBackup?: () => void
}

export function GameResetPanel({ session, nextScriptLabel, busy, notice, onCancel, onConfirm, onExportBackup }: GameResetPanelProps) {
  return <section className="game-end__finish-card game-end__reset" aria-label="重置确认">
    <div className="game-end__finish-step">
      <div className="game-end__finish-content">
        <div className="game-end__section-title"><h4><RotateCcw aria-hidden="true" />确定重置当前对局？</h4></div>
        <p>{scriptDisplayName(session.scriptId)} · {session.playerCount}人 · {session.timeline.length}条记录</p>
        <div className="game-end__reset-body">
          <ShieldCheck aria-hidden="true" />
          <div>
            <strong>自动留档成功后，才会清空当前局</strong>
            <p>人数、角色、昼夜进度和草稿将清空，已保存的历史复盘继续保留。不会通知玩家。</p>
            <p>需要找回本局时，可在“备份恢复”查看重置前备份。</p>
          </div>
        </div>
        {nextScriptLabel ? <p className="game-end__next-script">完成后进入“{nextScriptLabel}”的新局配板。</p> : null}
        {notice ? <p className="game-end__notice" role="status">{notice}</p> : null}
        <div className="game-end__actions">
          <Button variant="secondary" disabled={busy} onClick={onCancel}>{nextScriptLabel ? '返回选板' : '暂不重置'}</Button>
          {onExportBackup ? <Button variant="secondary" disabled={busy} onClick={onExportBackup}>导出当前对局</Button> : null}
          <Button variant="danger" disabled={busy} onClick={onConfirm}>{busy ? '正在留档并重置…' : '确认重置并开新局'}</Button>
        </div>
      </div>
    </div>
  </section>
}
