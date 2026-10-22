import { useState } from 'react'
import type { Dispatch } from 'react'
import { Button } from '../../../components/ui/Button'
import { Sheet } from '../../../components/ui/Sheet'
import { PlayerStatusOverlay } from '../../dashboard/components/PlayerStatusOverlay'
import type { GameSessionState } from '../types'
import type { GameSessionAction } from '../state/sessionActions'
import { FollowupSourceDetails } from './FollowupSourceDetails'
import { createFollowupId } from '../state/createFollowupId'
import { followupSource } from '../state/followupSource'
import '../../night-workbench/components/night-close-checklist.css'

export function StateFollowupSheet({ session, dispatch, suggestedSourceId }: { session: GameSessionState; dispatch: Dispatch<GameSessionAction>; suggestedSourceId?: string }) {
  const [adding, setAdding] = useState(false)
  const [open, setOpen] = useState(false)
  const [sourceId, setSourceId] = useState('')
  const [seatId, setSeatId] = useState('')
  const [note, setNote] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [dismissId, setDismissId] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const tasks = session.stateFollowups ?? []
  const pending = tasks.filter((task) => !task.resolution)
  const records = session.timeline.filter((entry) => entry.kind === 'night_action').slice().reverse()
  const source = records.find((entry) => entry.id === sourceId)
  const sourceIsCurrent = Boolean(source && !followupSource(session, source.id)?.corrected)
  const correctedCount = tasks.filter((task) => followupSource(session, task.sourceEntryId)?.corrected).length
  const editing = tasks.find((task) => task.id === editingId)
  const concealed = Boolean(session.activeNightRunId && session.nightRuns[session.activeNightRunId]?.privacyShielded)
  const sourceLabel = (id: string) => {
    const record = records.find((entry) => entry.id === id)
    return record ? `${session.phaseSegments.find((phase) => phase.id === record.segmentId)?.label ?? '夜晚'} · ${record.summary}` : '来源记录不可用'
  }
  function changeOpen(next: boolean) {
    if (next && suggestedSourceId) {
      if (sourceId !== suggestedSourceId) { setNote(''); setSeatId('') }
      setSourceId(suggestedSourceId)
      setAdding(true)
    }
    setOpen(next)
  }
  return <>
    <Sheet open={open && !editingId} onOpenChange={changeOpen} title="状态待办" description="从已确认夜晚记录添加；更新玩家状态仍需单独确认。" trigger={<Button variant="ghost" compact aria-label={suggestedSourceId ? '添加状态待办' : `状态待办${pending.length ? ` ${pending.length}` : ''}`} title="核对夜间记录涉及的玩家状态">{suggestedSourceId ? '添加状态待办' : <>待办{pending.length ? <span aria-hidden="true"> {pending.length}</span> : null}</>}</Button>}>
      <div className="night-close-checklist">
        {concealed ? <p>遮蔽中，请先退出遮蔽再查看状态待办。</p> : <>
          <p>夜间记录已确认，但还要核对死亡、中毒或醉酒时，可以在这里留一条提醒。添加待办不会改变玩家状态；处理时仍需你确认。换角色或继承能力请使用对应入口。</p>
          <strong>待处理 {pending.length}</strong>
          {correctedCount ? <p className="followup-source-warning">{correctedCount}项待办的来源有更正（含已处理项）。</p> : null}
          <ul aria-label="状态待办清单">{pending.map((task) => <li key={task.id}>
            <strong>{task.seatId}号 · {task.note}</strong>
            <FollowupSourceDetails session={session} sourceEntryId={task.sourceEntryId} />
            <div><Button variant="secondary" onClick={() => setEditingId(task.id)}>处理状态</Button><Button variant="ghost" onClick={() => { setDismissId(task.id); setReason('') }}>无需变更</Button></div>
            {dismissId === task.id ? <form onSubmit={(event) => { event.preventDefault(); if (!reason.trim()) return; dispatch({ type: 'dismiss-state-followup', id: task.id, reason, at: new Date().toISOString() }); setDismissId(null) }}>
              <label>无需变更原因<input maxLength={200} value={reason} onChange={(event) => setReason(event.target.value)} /></label><Button type="submit" disabled={!reason.trim()}>确认无需变更</Button>
            </form> : null}
          </li>)}</ul>
          <details open={adding} onToggle={(event) => setAdding(event.currentTarget.open)}><summary>添加状态待办</summary>
            <form onSubmit={(event) => { event.preventDefault(); if (!source || !sourceIsCurrent || !seatId || !note.trim()) return; dispatch({ type: 'add-state-followup', id: createFollowupId(), sourceEntryId: source.id, seatId: Number(seatId), note, createdAt: new Date().toISOString() }); setNote(''); setSeatId(''); setAdding(false) }}>
              <label>已确认记录<select value={sourceId} onChange={(event) => setSourceId(event.target.value)}><option value="">选择来源记录</option>{records.map((entry) => <option key={entry.id} value={entry.id} disabled={Boolean(followupSource(session, entry.id)?.corrected)}>{followupSource(session, entry.id)?.corrected ? '已更正 · ' : ''}{sourceLabel(entry.id)}</option>)}</select></label>
              {source ? <FollowupSourceDetails session={session} sourceEntryId={source.id} /> : null}
              {source && !sourceIsCurrent ? <p className="followup-source-warning">请选择最新更正记录后再添加。</p> : null}
              <label>待处理玩家<select value={seatId} onChange={(event) => setSeatId(event.target.value)}><option value="">选择座位</option>{Object.values(session.seats).map((seat) => <option key={seat.seatId} value={seat.seatId}>{seat.seatId}号 {seat.nickname}</option>)}</select></label>
              <label>待办内容<input value={note} maxLength={200} placeholder="例如：核对死亡或中毒状态" onChange={(event) => setNote(event.target.value)} /></label>
              <Button type="submit" disabled={!sourceIsCurrent || !seatId || !note.trim()}>确认添加待办</Button>
            </form>
          </details>
          {tasks.some((task) => task.resolution) ? <details><summary>已处理 {tasks.length - pending.length}</summary><ul>{tasks.filter((task) => task.resolution).map((task) => <li key={task.id}><strong>{task.seatId}号 · {task.note}</strong><span>{task.resolution?.kind === 'applied' ? '已更新状态' : '无需变更'} · {task.resolution?.reason}</span><FollowupSourceDetails session={session} sourceEntryId={task.sourceEntryId} /></li>)}</ul></details> : null}
        </>}
      </div>
    </Sheet>
    {editing && !concealed ? <PlayerStatusOverlay seatId={editing.seatId} session={session} dispatch={dispatch} followupId={editing.resolution ? undefined : editing.id} onOpenChange={(next) => { if (!next) setEditingId(null) }} /> : null}
  </>
}
