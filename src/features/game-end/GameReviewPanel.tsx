import { Archive, Download } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import type { GameArchiveRecord } from '../../services/archive'
import { GameAIReviewPanel } from './GameAIReviewPanel'

interface GameReviewPanelProps {
  archives: GameArchiveRecord[]
  notice: string | null
  selectedArchive: GameArchiveRecord | null
  onSelectArchive: (archiveId: string) => void
  onExportArchive: (archive: GameArchiveRecord) => void
  onStartArchive: () => void
}

function formatArchiveTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatArchiveDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export function GameReviewPanel({
  archives,
  notice,
  selectedArchive,
  onSelectArchive,
  onExportArchive,
  onStartArchive,
}: GameReviewPanelProps) {
  const [dateFilter, setDateFilter] = useState('all')
  const archiveDates = useMemo(() => Array.from(new Set(archives.map((archive) => formatArchiveDate(archive.archivedAt)))), [archives])
  const visibleArchives = useMemo(() => dateFilter === 'all'
    ? archives
    : archives.filter((archive) => formatArchiveDate(archive.archivedAt) === dateFilter), [archives, dateFilter])

  useEffect(() => {
    if (!visibleArchives.length) return
    if (selectedArchive && visibleArchives.some((archive) => archive.id === selectedArchive.id)) return
    onSelectArchive(visibleArchives[0].id)
  }, [onSelectArchive, selectedArchive, visibleArchives])

  if (!archives.length) {
    return <section className="game-review" aria-label="历史复盘">
      <EmptyState
        className="game-review__empty"
        icon={<Archive aria-hidden="true" />}
        title="暂无历史归档"
        description="先保存本局，之后可在这里查看已保存的对局。"
      >
        {notice ? <p className="game-end__notice" role="status">{notice}</p> : null}
        <Button variant="primary" onClick={onStartArchive}>去归档本局</Button>
      </EmptyState>
    </section>
  }

  return <section className="game-review" aria-label="历史复盘">
    <div className="game-review__browser" aria-label="历史对局选择">
      <label className="game-review__filter">
        <span>选择日期</span>
        <select value={dateFilter} onChange={(event) => setDateFilter(event.target.value)}>
          <option value="all">全部日期</option>
          {archiveDates.map((date) => <option key={date} value={date}>{date}</option>)}
        </select>
      </label>
      <div className="game-review__list" aria-label="历史对局列表">
      {visibleArchives.map((archive) => (
        <button
          type="button"
          key={archive.id}
          className={archive.id === selectedArchive?.id ? 'is-selected' : ''}
          onClick={() => onSelectArchive(archive.id)}
        >
          <span>{formatArchiveTime(archive.archivedAt)}</span>
          <strong>{archive.scriptName}</strong>
          <small>{archive.winnerLabel} · {archive.summary.records}条记录</small>
        </button>
      ))}
      </div>
    </div>
    <article className="game-review__detail" aria-label="复盘内容">
      {notice ? <p className="game-end__notice" role="status">{notice}</p> : null}
      {selectedArchive ? <>
        <div className="game-end__actions">
          <Button variant="secondary" onClick={() => onExportArchive(selectedArchive)}><Download aria-hidden="true" />导出这局</Button>
        </div>
        <div className="game-review__result">
          <span>胜方</span>
          <strong>{selectedArchive.winnerLabel}</strong>
        </div>
        <div className="game-end__stats game-end__stats--compact">
          <div><span>玩家</span><strong>{selectedArchive.playerCount}</strong></div>
          <div><span>记录</span><strong>{selectedArchive.summary.records}</strong></div>
          <div><span>死亡</span><strong>{selectedArchive.summary.dead}</strong></div>
          <div><span>投票</span><strong>{selectedArchive.summary.votes}</strong></div>
        </div>
        <dl className="game-review__metrics">
          <div><dt>夜晚</dt><dd>{selectedArchive.summary.nightActions}条</dd></div>
          <div><dt>白天</dt><dd>{selectedArchive.summary.dayActions}条</dd></div>
          <div><dt>处决</dt><dd>{selectedArchive.summary.executions}次</dd></div>
          <div><dt>更正</dt><dd>{selectedArchive.summary.corrections}条</dd></div>
        </dl>
        <GameAIReviewPanel archive={selectedArchive} />
        <details className="game-review__log-section" key={selectedArchive.id} aria-label="当局日志信息">
          <summary className="game-ai-review__section-title">
            <span>当局日志</span>
            <small>{selectedArchive.timeline.length}条</small>
          </summary>
          <ol className="game-review__timeline">
          {selectedArchive.timeline.length ? selectedArchive.timeline.map((entry) => (
            <li key={entry.id}>
              <span>{entry.phaseLabel}</span>
              <strong>{entry.summary}</strong>
            </li>
          )) : <li><span>本局</span><strong>暂无记录</strong></li>}
          </ol>
        </details>
      </> : null}
    </article>
  </section>
}
