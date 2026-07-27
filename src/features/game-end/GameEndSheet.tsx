import { Archive, Download, RotateCcw, ShieldAlert, Trophy } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Sheet } from '../../components/ui/Sheet'
import type { GameSessionState } from '../game-session/types'
import {
  applyArchiveRuntimeSettings,
  archiveGame,
  archiveGameAsync,
  listArchives,
  listArchivesAsync,
  projectGameArchiveSession,
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

export function GameEndSheet({ open, onOpenChange, session, initialMode = 'end', onResetGame }: GameEndSheetProps) {
  const [mode, setMode] = useState<GameEndMode>(initialMode)
  const [winner, setWinner] = useState<Winner>('undecided')
  const [archiveRecord, setArchiveRecord] = useState<GameArchiveRecord | null>(null)
  const [archiveRecordMode, setArchiveRecordMode] = useState<ArchiveRuntimeMode>('local')
  const [archiveStorageMode, setArchiveStorageMode] = useState<ArchiveRuntimeMode>('local')
  const [archives, setArchives] = useState<GameArchiveRecord[]>([])
  const [selectedArchiveId, setSelectedArchiveId] = useState<string | null>(null)
  const [resetAcknowledged, setResetAcknowledged] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const summary = useMemo(() => projectGameArchiveSession(session), [session])

  const selectedArchive = archives.find((archive) => archive.id === selectedArchiveId) ?? archives[0] ?? null
  const archiveCreated = Boolean(archiveRecord)

  function setArchiveList(nextArchives: GameArchiveRecord[]) {
    setArchives(nextArchives)
    setSelectedArchiveId((current) => current && nextArchives.some((archive) => archive.id === current)
      ? current
      : nextArchives[0]?.id ?? null)
  }

  const loadArchives = useCallback(async () => {
    const settings = applyArchiveRuntimeSettings()
    setArchiveStorageMode(settings.mode)
    try {
      setArchiveList(await listArchivesAsync())
    } catch {
      resetAsyncArchiveAdapter()
      setArchiveStorageMode('local')
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
    setArchiveStorageMode(settings.mode)
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
      setArchiveStorageMode('local')
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

  function storageLabel(value: ArchiveRuntimeMode) {
    return value === 'http' ? '本地后端' : '本机浏览器'
  }

  function storageHint() {
    if (archiveRecord) return `已保存：${storageLabel(archiveRecordMode)}`
    return `当前：${storageLabel(archiveStorageMode)}`
  }

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="结束与复盘"
      description="归档 · 历史复盘 · 重置"
      contentClassName="sheet-content--game-end"
      presentation="page"
    >
      <div className="game-end">
        <header className="game-end__hero game-end__hero--compact">
          <div>
            <span>{mode === 'end' ? '本局收尾' : '历史对局'}</span>
            <h3>{mode === 'end' ? '结束对局' : '复盘系统'}</h3>
            <p>{mode === 'end' ? `${winnerLabels[winner]} · ${archiveCreated ? '已保存' : '待保存'}` : `${archives.length} 个归档`}</p>
          </div>
          <div className="game-end__mode-switch" role="tablist" aria-label="结束与复盘">
            <button type="button" className={mode === 'end' ? 'is-active' : ''} onClick={() => setMode('end')}>保存重置</button>
            <button type="button" className={mode === 'review' ? 'is-active' : ''} onClick={() => setMode('review')}>历史复盘</button>
          </div>
        </header>

        {mode === 'end' ? <section className="game-end__finish-card" aria-label="结束对局步骤">
          <div className="game-end__finish-step">
            <div className="game-end__finish-marker">1</div>
            <div className="game-end__finish-content">
              <div className="game-end__section-title">
                <span>选择结果</span>
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
            <div className="game-end__finish-marker">2</div>
            <div className="game-end__finish-content">
              <div className="game-end__section-title">
                <span>保存</span>
                <h4><Archive aria-hidden="true" />保存本局</h4>
              </div>
              <p className="game-end__panel-copy">保存胜方、配板、玩家状态、昼夜日志、投票和更正链。</p>
              <div className="game-end__storage-pill" aria-label="当前归档存储位置">
                <span>归档位置</span>
                <strong>{storageHint()}</strong>
              </div>
              <div className="game-end__stats game-end__stats--compact">
                <div><span>玩家</span><strong>{session.playerCount}</strong></div>
                <div><span>记录</span><strong>{summary.entries.length}</strong></div>
                <div><span>死亡</span><strong>{summary.dead}</strong></div>
              </div>
              <div className="game-end__actions">
                <Button variant="primary" disabled={busy} onClick={saveCurrentGame}><Archive aria-hidden="true" />{busy ? '保存中' : '保存本局'}</Button>
                <Button variant="secondary" disabled={busy} onClick={() => { void exportArchive() }}><Download aria-hidden="true" />导出备份</Button>
              </div>
              {notice ? <p className="game-end__notice" role="status">{notice}</p> : null}
            </div>
          </div>

          <div className="game-end__finish-step game-end__finish-step--danger">
            <div className="game-end__finish-marker">3</div>
            <div className="game-end__finish-content">
              <div className="game-end__section-title">
                <span>结束</span>
                <h4><RotateCcw aria-hidden="true" />重置游戏</h4>
              </div>
              <div className="game-end__reset-body">
                <ShieldAlert aria-hidden="true" />
                <div>
                  <strong>{archiveCreated ? '本局已保存' : '请先保存本局'}</strong>
                  <p>重置会关闭当前对局并回到空白新局；历史复盘仍保留。</p>
                </div>
              </div>
              <dl className="game-end__reset-impact" aria-label="重置影响范围">
                <div><dt>清空</dt><dd>玩家人数、座位、状态、昼夜、夜晚记录、白天记录、投票和当前草稿</dd></div>
                <div><dt>保留</dt><dd>历史归档、复盘记录、本机设置和脚本库</dd></div>
              </dl>
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

          <div className="game-end__finish-summary" aria-label="本局记录摘要">
            <span>本局记录</span>
            <strong>{summary.nightCount + summary.dayCount + summary.voteCount}</strong>
            <small>关键记录 · 夜晚{summary.nightCount} · 白天{summary.dayCount} · 投票{summary.voteCount} · 更正{summary.correctionCount}</small>
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
