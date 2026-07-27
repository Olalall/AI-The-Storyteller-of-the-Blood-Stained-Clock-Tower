import { ArrowLeft, BookOpenText, ChevronRight, PencilLine } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Sheet } from '../../components/ui/Sheet'
import { StatusBadge } from '../../components/ui/StatusBadge'
import type { GameSessionAction } from '../game-session/state/sessionReducer'
import {
  filterTimelineHistory,
  projectCorrectionChain,
  projectTimelineHistory,
  type TimelineHistoryCategory,
  type TimelineHistoryEntry,
  type TimelineHistoryFilters,
} from '../game-session/state/projectTimelineHistory'
import type { GameSessionState, TimelineEntry } from '../game-session/types'
import type { PhaseTimelineEntryInput } from '../game-session/state/timeline'
import { TimelineHistoryCorrectionEditor } from './TimelineHistoryCorrectionEditor'
import './history.css'

interface TimelineHistorySheetProps {
  session: GameSessionState
  dispatch: React.Dispatch<GameSessionAction>
  onOpenPlayerStatus?: (seatId: number) => void
  onOpenDayWorkbench?: () => void
  onOpenSetup?: () => void
}

const initialFilters: TimelineHistoryFilters = { phaseKey: 'all', seatId: null, category: 'all' }

const categoryOptions: Array<{ value: TimelineHistoryCategory | 'all'; label: string }> = [
  { value: 'all', label: '全部类型' },
  { value: 'night_action', label: '夜间行动' },
  { value: 'day_skill', label: '白天技能' },
  { value: 'public_event', label: '公开事件' },
  { value: 'vote_round', label: '投票' },
  { value: 'execution', label: '日终' },
  { value: 'player_state', label: '状态' },
  { value: 'role_change', label: '角色调整' },
  { value: 'setup', label: '配板' },
]

function isEditableEntry(entry: TimelineEntry): entry is Extract<TimelineEntry, { kind: 'night_action' | 'day_action' }> {
  return entry.kind === 'night_action' || entry.kind === 'day_action'
}

function correctionId(originalEntryId: string) {
  const suffix = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
  return `correction-${originalEntryId}-${suffix}`
}

function groupEntries(entries: TimelineHistoryEntry[]) {
  return entries.reduce<Array<{ phaseKey: string; phaseLabel: string; entries: TimelineHistoryEntry[] }>>((groups, entry) => {
    const existing = groups.find((group) => group.phaseKey === entry.phaseKey)
    if (existing) existing.entries.push(entry)
    else groups.push({ phaseKey: entry.phaseKey, phaseLabel: entry.phaseLabel, entries: [entry] })
    return groups
  }, [])
}

function timeLabel(value: string) {
  return new Date(value).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function TimelineHistorySheet({
  session,
  dispatch,
  onOpenPlayerStatus,
  onOpenDayWorkbench,
  onOpenSetup,
}: TimelineHistorySheetProps) {
  const [open, setOpen] = useState(false)
  const [filters, setFilters] = useState<TimelineHistoryFilters>(initialFilters)
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null)
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const entries = useMemo(() => projectTimelineHistory(session), [session])
  const filteredEntries = useMemo(() => filterTimelineHistory(entries, filters), [entries, filters])
  const selected = selectedEntryId ? entries.find((entry) => entry.id === selectedEntryId) : undefined
  const editing = editingEntryId ? entries.find((entry) => entry.id === editingEntryId) : undefined
  const phaseOptions = useMemo(() => {
    const seen = new Set<string>()
    return entries.filter((entry) => !seen.has(entry.phaseKey) && Boolean(seen.add(entry.phaseKey)))
      .map((entry) => ({ value: entry.phaseKey, label: entry.phaseLabel }))
  }, [entries])
  const hasFilters = filters.phaseKey !== 'all' || filters.seatId !== null || filters.category !== 'all'

  useEffect(() => {
    if (selectedEntryId && !entries.some((entry) => entry.id === selectedEntryId)) setSelectedEntryId(null)
  }, [entries, selectedEntryId])

  function onOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) {
      setFilters(initialFilters)
      setSelectedEntryId(null)
      setEditingEntryId(null)
      setNotice('')
    }
  }

  function appendCorrection(entry: PhaseTimelineEntryInput) {
    if (!editing || !isEditableEntry(editing.source)) return
    const id = correctionId(editing.id)
    dispatch({
      type: 'append-correction',
      originalEntryId: editing.id,
      entry,
      input: { id, createdAt: new Date().toISOString() },
    })
    setEditingEntryId(null)
    setSelectedEntryId(id)
    setNotice('更正已追加到原昼夜。')
  }

  function openRecord(entry: TimelineHistoryEntry) {
    setNotice('')
    if (entry.canCorrect && isEditableEntry(entry.source)) {
      setSelectedEntryId(null)
      setEditingEntryId(entry.id)
      return
    }
    setEditingEntryId(null)
    setSelectedEntryId(entry.id)
  }

  function navigateFromHistory(callback?: () => void) {
    if (!callback) return
    onOpenChange(false)
    callback()
  }

  const title = editing ? '更正记录' : selected ? '记录详情' : '日记'
  const description = editing
    ? '原记录保留；不会改变昼夜或发送信息。'
    : selected
      ? `${selected.phaseLabel} · ${selected.categoryLabel}`
      : `共${entries.length}条 · 只读回放与追加更正`

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      contentClassName="sheet-content--timeline-history"
      presentation="page"
      trigger={<Button variant="secondary" compact><BookOpenText aria-hidden="true" />日记</Button>}
    >
      {editing && isEditableEntry(editing.source) ? <TimelineHistoryCorrectionEditor
        entry={editing.source}
        session={session}
        onCancel={() => setEditingEntryId(null)}
        onConfirm={appendCorrection}
      /> : selected ? <TimelineHistoryDetail
        entry={selected}
        chain={projectCorrectionChain(entries, selected.id)}
        onBack={() => setSelectedEntryId(null)}
        onSelect={openRecord}
        onOpenPlayerStatus={(seatId) => navigateFromHistory(() => onOpenPlayerStatus?.(seatId))}
        onOpenDayWorkbench={() => navigateFromHistory(onOpenDayWorkbench)}
        onOpenSetup={() => navigateFromHistory(onOpenSetup)}
      /> : <div className="timeline-history">
        <div className="timeline-history__filters" aria-label="日记筛选">
          <label>昼夜<select aria-label="筛选昼夜" value={filters.phaseKey} onChange={(event) => setFilters((current) => ({ ...current, phaseKey: event.target.value }))}>
            <option value="all">全部昼夜</option>
            {phaseOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select></label>
          <label>玩家<select aria-label="筛选玩家" value={filters.seatId ?? 'all'} onChange={(event) => setFilters((current) => ({ ...current, seatId: event.target.value === 'all' ? null : Number(event.target.value) }))}>
            <option value="all">全部玩家</option>
            {Array.from({ length: session.playerCount }, (_value, index) => <option key={index + 1} value={index + 1}>{index + 1}号</option>)}
          </select></label>
          <label>类型<select aria-label="筛选类型" value={filters.category} onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value as TimelineHistoryCategory | 'all' }))}>
            {categoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select></label>
        </div>
        {hasFilters ? <Button variant="ghost" compact className="timeline-history__clear" onClick={() => setFilters(initialFilters)}>清除筛选</Button> : null}
        {notice ? <p className="timeline-history__notice" role="status">{notice}</p> : null}
        {filteredEntries.length ? <div className="timeline-history__groups">
          {groupEntries(filteredEntries).map((group) => <section key={group.phaseKey} className="timeline-history__group">
            <h3>{group.phaseLabel}<span>{group.entries.length}条</span></h3>
            <ol>
              {group.entries.map((entry) => <li key={entry.id}><button type="button" className={`timeline-history__entry ${entry.canCorrect ? 'timeline-history__entry--editable' : ''}`} aria-label={recordActionLabel(entry)} onClick={() => openRecord(entry)}>
                <span className="timeline-history__entry-main"><strong>{entry.summary}</strong><small>{timeLabel(entry.createdAt)} · {entry.categoryLabel}{entry.canCorrect ? ' · 可更正' : ''}</small></span>
                <span className="timeline-history__entry-status">
                  {entry.isSuperseded ? <StatusBadge tone="neutral">已更正</StatusBadge> : null}
                  {entry.isCorrection ? <StatusBadge tone="warning">更正</StatusBadge> : null}
                </span>
                {entry.canCorrect ? <PencilLine aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}
              </button></li>)}
            </ol>
          </section>)}
        </div> : <div className="timeline-history__empty">没有符合筛选的记录。</div>}
      </div>}
    </Sheet>
  )
}

interface TimelineHistoryDetailProps {
  entry: TimelineHistoryEntry
  chain: TimelineHistoryEntry[]
  onBack: () => void
  onSelect: (entry: TimelineHistoryEntry) => void
  onOpenPlayerStatus: (seatId: number) => void
  onOpenDayWorkbench: () => void
  onOpenSetup: () => void
}

function TimelineHistoryDetail({
  entry,
  chain,
  onBack,
  onSelect,
  onOpenPlayerStatus,
  onOpenDayWorkbench,
  onOpenSetup,
}: TimelineHistoryDetailProps) {
  const followupAction = historyFollowupAction(entry)
  return <div className="timeline-history__detail">
    <button type="button" className="timeline-history__back" onClick={onBack}><ArrowLeft aria-hidden="true" />全部记录</button>
    <section className="timeline-history__detail-card">
      <div className="timeline-history__detail-heading"><div><span>{entry.phaseLabel} · {entry.categoryLabel}</span><h3>{entry.summary}</h3></div>{entry.isSuperseded ? <StatusBadge tone="neutral">已更正</StatusBadge> : entry.isCorrection ? <StatusBadge tone="warning">更正</StatusBadge> : <StatusBadge tone="success">当前</StatusBadge>}</div>
      <ul>{entry.details.length ? entry.details.map((detail) => <li key={detail}>{detail}</li>) : <li>没有补充内容。</li>}</ul>
      {followupAction ? <Button
        variant="secondary"
        className="timeline-history__followup"
        onClick={() => {
          if (followupAction.kind === 'player') onOpenPlayerStatus(followupAction.seatId)
          else if (followupAction.kind === 'day') onOpenDayWorkbench()
          else onOpenSetup()
        }}
      >
        <PencilLine aria-hidden="true" />{followupAction.label}
      </Button> : null}
    </section>
    {chain.length > 1 ? <section className="timeline-history__chain"><h3>更正链</h3><ol>{chain.map((item) => <li key={item.id}><button type="button" className={item.id === entry.id ? 'is-current' : ''} onClick={() => onSelect(item)}><span>{item.isCorrection ? '更正' : '原记录'}</span><strong>{item.summary}</strong></button></li>)}</ol></section> : null}
    {entry.correctionHelp ? <p className="timeline-history__help">{entry.correctionHelp}</p> : null}
  </div>
}

function historyFollowupAction(entry: TimelineHistoryEntry) {
  const source = entry.source
  if (source.kind === 'player_state_changed') {
    return { kind: 'player' as const, seatId: source.seatId, label: `更正${source.seatId}号状态` }
  }
  if (source.kind === 'vote_round') return { kind: 'day' as const, label: '回白天改票型' }
  if (source.kind === 'execution' || source.kind === 'no_execution') return { kind: 'day' as const, label: '回白天改日终' }
  if (source.kind === 'setup_confirmed' || source.kind === 'setup_changed') return { kind: 'setup' as const, label: '打开配板调整' }
  return null
}

function recordActionLabel(entry: TimelineHistoryEntry) {
  if (entry.canCorrect) {
    const action = entry.isCorrection ? '继续更正' : '更正'
    return `${action}${entry.phaseLabel}的${entry.categoryLabel}记录：${entry.summary}。将打开更正表单，原记录保留。`
  }
  if (entry.isSuperseded) return `查看已更正的原记录：${entry.summary}。`
  return `查看${entry.categoryLabel}记录：${entry.summary}${entry.correctionHelp ? `。${entry.correctionHelp}` : ''}`
}
