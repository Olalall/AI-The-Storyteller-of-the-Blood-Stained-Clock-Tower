import { Archive, Download, RotateCcw, ShieldAlert, Trophy } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Sheet } from '../../components/ui/Sheet'
import type { GameSessionState } from '../game-session/types'
import {
  applyArchiveRuntimeSettings,
  archiveGame,
  archiveGameAsync,
  listArchives,
  listArchivesAsync,
  resetAfterArchive,
  resetAfterArchiveAsync,
  resetAsyncArchiveAdapter,
  winnerLabels,
  type ArchiveRuntimeMode,
  type GameArchiveRecord,
  type GameWinner,
} from '../../services/archive'
import { GameReviewPanel } from './GameReviewPanel'
import './game-end.css'

interface GameEndSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  session: GameSessionState
  initialMode?: GameEndMode
  onResetGame: () => void
  nextScriptLabel?: string | null
}

type GameEndMode = 'end' | 'review'

type Winner = GameWinner

function createCommandId(prefix: string) {
  return `${prefix}-${Date.now()}`
}

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function GameEndSheet({ open, onOpenChange, session, initialMode = 'end', onResetGame, nextScriptLabel = null }: GameEndSheetProps) {
  const [mode, setMode] = useState<GameEndMode>(initialMode)
  const [winner, setWinner] = useState<Winner>('undecided')
  const [archiveRecord, setArchiveRecord] = useState<GameArchiveRecord | null>(null)
  const [archiveRecordMode, setArchiveRecordMode] = useState<ArchiveRuntimeMode>('local')
  const [archives, setArchives] = useState<GameArchiveRecord[]>([])
  const [selectedArchiveId, setSelectedArchiveId] = useState<string | null>(null)
  const [resetAcknowledged, setResetAcknowledged] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const selectedArchive = archives.find((archive) => archive.id === selectedArchiveId) ?? archives[0] ?? null
  const archiveCreated = Boolean(archiveRecord)

  function setArchiveList(nextArchives: GameArchiveRecord[]) {
    setArchives(nextArchives)
    setSelectedArchiveId((current) => current && nextArchives.some((archive) => archive.id === current)
      ? current
      : nextArchives[0]?.id ?? null)
  }

  const loadArchives = useCallback(async () => {
    applyArchiveRuntimeSettings()
    try {
      setArchiveList(await listArchivesAsync())
    } catch {
      resetAsyncArchiveAdapter()
      setArchiveList(listArchives())
      setNotice('本地后端不可用，已显示本机归档')
    }
  }, [])

  useEffect(() => {
    if (!open) return
    setMode(initialMode)
    setBusy(false)
    setNotice(null)
    void loadArchives()
  }, [initialMode, loadArchives, open])

  useEffect(() => {
    setArchiveRecord(null)
    setResetAcknowledged(false)
  }, [session.id])

  function saveLocalArchive(commandId: string) {
    resetAsyncArchiveAdapter()
    const result = archiveGame({
      commandId,
      session,
      winner,
      archiveId: archiveRecord?.id,
    })
    setArchiveRecord(result.archive)
    setArchiveRecordMode('local')
    setArchives(result.archives)
    setSelectedArchiveId(result.archive.id)
    return result.archive
  }

  async function saveCurrentGame() {
    setBusy(true)
    setNotice('正在保存本局')
    const commandId = createCommandId('archive')
    const settings = applyArchiveRuntimeSettings()
    try {
      const result = await archiveGameAsync({
        commandId,
        session,
        winner,
        archiveId: archiveRecord?.id,
      })
      setArchiveRecord(result.archive)
      setArchiveRecordMode(settings.mode)
      setArchives(result.archives)
      setSelectedArchiveId(result.archive.id)
      setNotice(settings.mode === 'http' ? '本局已保存到本地后端' : '本局已保存到本机浏览器')
      return result.archive
    } catch {
      const fallback = saveLocalArchive(commandId)
      setNotice('本地后端不可用，已保存到本机浏览器')
      return fallback
    } finally {
      setBusy(false)
    }
  }

  async function exportArchive(record = archiveRecord ?? selectedArchive) {
    let target = record
    if (!target) {
      target = await saveCurrentGame()
    }
    if (!target) return
    downloadTextFile(`botc-archive-${target.id}.json`, JSON.stringify(target, null, 2))
    setNotice('归档JSON已导出')
  }

  async function resetGameAfterSave() {
    if (!archiveRecord || !resetAcknowledged) return
    setBusy(true)
    setNotice('正在校验归档')
    const settings = archiveRecordMode === 'http' ? applyArchiveRuntimeSettings() : null
    if (settings?.mode !== 'http') resetAsyncArchiveAdapter()
    const result = archiveRecordMode === 'http'
      ? await resetAfterArchiveAsync({
        commandId: createCommandId('reset'),
        sessionId: session.id,
        archiveId: archiveRecord.id,
        confirmReset: resetAcknowledged,
      })
      : resetAfterArchive({
        commandId: createCommandId('reset'),
        sessionId: session.id,
        archiveId: archiveRecord.id,
        confirmReset: resetAcknowledged,
      })
    setBusy(false)
    if (!result.ok) {
      setNotice('归档校验失败，当前局未重置')
      return
    }
    onResetGame()
  }

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'end' ? '重置游戏' : '历史复盘'}
      description={mode === 'end' ? '保存本局后开始新局' : '查看已保存的对局'}
      contentClassName="sheet-content--game-end"
      presentation="page"
    >
      <div className="game-end">
        <div className="game-end__mode-switch" role="tablist" aria-label="重置与复盘">
          <button type="button" className={mode === 'end' ? 'is-active' : ''} onClick={() => setMode('end')}>重置游戏</button>
          <button type="button" className={mode === 'review' ? 'is-active' : ''} onClick={() => setMode('review')}>历史复盘</button>
        </div>

        {mode === 'end' ? <section className="game-end__finish-card" aria-label="结束对局步骤">
          <div className="game-end__finish-step">
            <div className="game-end__finish-content">
              <div className="game-end__section-title">
                <h4><Trophy aria-hidden="true" />声明胜方</h4>
              </div>
              <div className="game-end__winner-grid" role="radiogroup" aria-label="胜方">
                {(Object.keys(winnerLabels) as Winner[]).map((option) => (
                  <button
                    type="button"
                    key={option}
                    role="radio"
                    aria-checked={winner === option}
                    className={winner === option ? 'is-selected' : ''}
                    onClick={() => setWinner(option)}
                  >
                    <strong>{winnerLabels[option]}</strong>
                    <small>{option === 'undecided' ? '先保存' : '说书人确认'}</small>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="game-end__finish-step">
            <div className="game-end__finish-content">
              <div className="game-end__section-title">
                <h4><Archive aria-hidden="true" />保存与下载</h4>
              </div>
              <div className="game-end__actions">
                <Button variant="primary" disabled={busy} onClick={saveCurrentGame}><Archive aria-hidden="true" />{busy ? '保存中' : '保存本局'}</Button>
                <Button variant="secondary" disabled={busy} onClick={() => { void exportArchive() }}><Download aria-hidden="true" />导出备份</Button>
              </div>
              {notice ? <p className="game-end__notice" role="status">{notice}</p> : null}
            </div>
          </div>

          <div className="game-end__finish-step game-end__finish-step--danger">
            <div className="game-end__finish-content">
              <div className="game-end__section-title">
                <h4><RotateCcw aria-hidden="true" />重置游戏</h4>
              </div>
              <div className="game-end__reset-body">
                <ShieldAlert aria-hidden="true" />
                <div>
                  <strong>{archiveCreated ? '本局已保存' : '请先保存本局'}</strong>
                  <p>重置会清空当前对局，已保存的复盘继续保留。</p>
                </div>
              </div>
              {nextScriptLabel ? <p className="game-end__next-script">重置完成后进入“{nextScriptLabel}”配板。</p> : null}
              <label className="game-end__confirm-line">
                <input type="checkbox" checked={resetAcknowledged} onChange={(event) => setResetAcknowledged(event.target.checked)} />
                <span>我已保存本局，确认重置游戏</span>
              </label>
              <div className="game-end__actions game-end__actions--end">
                <Button variant="danger" disabled={!archiveCreated || !resetAcknowledged || busy} onClick={resetGameAfterSave}>重置游戏</Button>
                <Button variant="ghost" onClick={() => setMode('review')}>查看复盘</Button>
              </div>
            </div>
          </div>
        </section> : <GameReviewPanel
          archives={archives}
          selectedArchive={selectedArchive}
          onSelectArchive={setSelectedArchiveId}
          onExportArchive={exportArchive}
          onStartArchive={() => setMode('end')}
        />}
      </div>
    </Sheet>
  )
}
