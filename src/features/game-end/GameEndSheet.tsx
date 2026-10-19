import { Archive, Download, Trophy } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
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
import { GameResetPanel } from './GameResetPanel'
import { archiveMatchesSnapshot, archiveSnapshotKey } from '../../services/archive/archiveSnapshot'
import { downloadSessionBackup } from '../../services/session/sessionBackup'
import './game-end.css'

interface GameEndSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  session: GameSessionState
  initialMode?: GameEndMode
  onResetGame: (expectedSession: GameSessionState) => Promise<void>
  nextScriptLabel?: string | null
}

export type GameEndMode = 'save' | 'reset' | 'review'

type Winner = GameWinner

function createCommandId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`
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

export function GameEndSheet({ open, onOpenChange, session, initialMode = 'save', onResetGame, nextScriptLabel = null }: GameEndSheetProps) {
  const [mode, setMode] = useState<GameEndMode>(initialMode)
  const [winner, setWinner] = useState<Winner>('undecided')
  const [archiveRecord, setArchiveRecord] = useState<GameArchiveRecord | null>(null)
  const archiveRecordMode = useRef<ArchiveRuntimeMode>('local')
  const [archives, setArchives] = useState<GameArchiveRecord[]>([])
  const [selectedArchiveId, setSelectedArchiveId] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [archiveSaveFailed, setArchiveSaveFailed] = useState(false)
  const resetting = useRef(false)

  const selectedArchive = archives.find((archive) => archive.id === selectedArchiveId) ?? archives[0] ?? null
  const snapshotKey = archiveSnapshotKey(session, winner)
  const latestSnapshot = useRef(snapshotKey)
  latestSnapshot.current = snapshotKey
  const saveCommand = useRef<{ snapshot: string; id: string } | null>(null)
  const archiveCreated = Boolean(archiveRecord && archiveMatchesSnapshot(archiveRecord, session, winner))

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
    setNotice(null)
    setArchiveSaveFailed(false)
    void loadArchives()
  }, [initialMode, loadArchives, open])

  useEffect(() => {
    setArchiveRecord(null)
  }, [snapshotKey])

  useEffect(() => { setWinner('undecided') }, [session.id])
  useEffect(() => {
    if (open && initialMode === 'reset' && !archiveCreated) setWinner('undecided')
  }, [open, initialMode, archiveCreated])

  function saveLocalArchive(commandId: string) {
    resetAsyncArchiveAdapter()
    const result = archiveGame({
      commandId,
      session,
      winner,
    })
    setArchiveRecord(result.archive)
    archiveRecordMode.current = 'local'
    setArchives(result.archives)
    setSelectedArchiveId(result.archive.id)
    return result.archive
  }

  async function saveCurrentGame(keepBusy = false) {
    setBusy(true)
    setArchiveSaveFailed(false)
    setNotice('正在保存本局')
    if (saveCommand.current?.snapshot !== snapshotKey) saveCommand.current = { snapshot: snapshotKey, id: createCommandId('archive') }
    const commandId = saveCommand.current.id
    const settings = applyArchiveRuntimeSettings()
    try {
      const result = await archiveGameAsync({
        commandId,
        session,
        winner,
      })
      setArchiveRecord(result.archive)
      archiveRecordMode.current = settings.mode
      setArchives(result.archives)
      setSelectedArchiveId(result.archive.id)
      setNotice(settings.mode === 'http' ? '本局已保存到本地后端' : '本局已保存到本机浏览器')
      return result.archive
    } catch {
      try {
        const fallback = saveLocalArchive(commandId)
        setNotice('本地后端不可用，已保存到本机浏览器')
        return fallback
      } catch {
        setArchiveSaveFailed(true)
        setNotice('保存失败，当前局未归档。请释放浏览器存储空间后重试，或先导出当前对局备份。')
        return null
      }
    } finally {
      if (!keepBusy) setBusy(false)
    }
  }

  function exportArchive(record: GameArchiveRecord) {
    try {
      downloadTextFile(`botc-archive-${record.id}.json`, JSON.stringify(record, null, 2))
      setNotice('归档JSON已导出')
    } catch { setNotice('导出失败，请重试。当前对局和已保存归档未改变。') }
  }

  function exportCurrentSession() {
    try {
      downloadSessionBackup(session)
      setNotice('当前对局备份已导出，当前局未结束。')
    } catch { setNotice('导出失败，请重试。当前对局和已保存归档未改变。') }
  }

  async function resetGameAfterSave() {
    if (resetting.current) return
    resetting.current = true
    setBusy(true)
    setNotice('正在自动保存本局')
    try {
      const target = archiveCreated ? archiveRecord : await saveCurrentGame(true)
      if (!target) return
      if (latestSnapshot.current !== snapshotKey) {
        setNotice('当前局已有变化，请重新确认重置；当前局未重置。')
        return
      }
      setNotice('正在校验备份并重置')
      const settings = archiveRecordMode.current === 'http' ? applyArchiveRuntimeSettings() : null
      if (settings?.mode !== 'http') resetAsyncArchiveAdapter()
      const command = {
        commandId: createCommandId('reset'), sessionId: session.id, archiveId: target.id,
        confirmReset: true, expectedSession: session, expectedWinner: winner,
      }
      const result = archiveRecordMode.current === 'http' ? await resetAfterArchiveAsync(command) : resetAfterArchive(command)
      if (!result.ok || latestSnapshot.current !== snapshotKey) {
        setArchiveRecord(null)
        saveCommand.current = null
        setNotice('归档校验失败或当前局已有变化，当前局未重置。再次确认会重新留档并核对。')
        return
      }
      await onResetGame(session)
    } catch (error) {
      setNotice(`重置未完成：${error instanceof Error ? error.message : '请检查连接和存储空间后重试。'} 当前局未清空。`)
    } finally { resetting.current = false; setBusy(false) }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'reset' ? '重置游戏' : mode === 'save' ? '保存本局' : '历史复盘'}
      description={mode === 'reset' ? '确认后自动留档，再开始新局' : mode === 'save' ? '保存记录，不结束或重置当前对局' : '查看已保存的对局'}
      contentClassName="sheet-content--game-end"
      presentation="page"
      dismissible={!busy}
    >
      <div className="game-end">
        {mode !== 'reset' ? <div className="game-end__mode-switch" role="tablist" aria-label="保存与复盘" onKeyDown={(event) => {
          if (busy || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
          event.preventDefault()
          const next = event.key === 'Home' ? 'save' : event.key === 'End' ? 'review' : mode === 'save' ? 'review' : 'save'
          setMode(next)
          event.currentTarget.querySelector<HTMLButtonElement>(`[data-mode="${next}"]`)?.focus()
        }}>
          <button type="button" role="tab" data-mode="save" tabIndex={mode === 'save' ? 0 : -1} aria-selected={mode === 'save'} disabled={busy} className={mode === 'save' ? 'is-active' : ''} onClick={() => setMode('save')}>保存本局</button>
          <button type="button" role="tab" data-mode="review" tabIndex={mode === 'review' ? 0 : -1} aria-selected={mode === 'review'} disabled={busy} className={mode === 'review' ? 'is-active' : ''} onClick={() => setMode('review')}>历史复盘</button>
        </div> : null}

        {mode === 'reset' ? <GameResetPanel session={session} nextScriptLabel={nextScriptLabel} busy={busy} notice={notice} onExportBackup={archiveSaveFailed ? exportCurrentSession : undefined} onCancel={() => onOpenChange(false)} onConfirm={() => { void resetGameAfterSave() }} /> : mode === 'save' ? <section className="game-end__finish-card" aria-label="保存本局">
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
                    disabled={busy}
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
                <Button variant="primary" disabled={busy} onClick={() => { void saveCurrentGame() }}><Archive aria-hidden="true" />{busy ? '保存中' : '保存本局'}</Button>
                <Button variant="secondary" disabled={busy} onClick={exportCurrentSession}><Download aria-hidden="true" />导出当前对局</Button>
              </div>
              {notice ? <p className="game-end__notice" role="status">{notice}</p> : null}
            </div>
          </div>

        </section> : <GameReviewPanel
          archives={archives}
          notice={notice}
          selectedArchive={selectedArchive}
          onSelectArchive={setSelectedArchiveId}
          onExportArchive={exportArchive}
          onStartArchive={() => setMode('save')}
        />}
      </div>
    </Sheet>
  )
}
