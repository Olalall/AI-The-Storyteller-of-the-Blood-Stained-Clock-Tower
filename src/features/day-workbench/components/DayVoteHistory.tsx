import { useEffect, useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { Sheet } from '../../../components/ui/Sheet'
import { Field } from '../../../components/ui/Field'
import type { GameSessionState, VoteRoundEntry } from '../../game-session/types'
import type { GameSessionAction } from '../../game-session/state/sessionReducer'
import { projectEffectiveTimelineEntries } from '../../game-session/state/projectTimelineHistory'
import { canRecordGhostVotes, votePlayerStates } from '../state/ghostVotes'
import { canCompleteVoteRound, voteCount, type VoteRoundDraft } from '../state/voteRound'
import { DayVoteEditor } from './DayVoteEditor'
import { nominationIssues } from '../state/nominationRules'

export function DayVoteHistory({ session, dispatch, disabled }: { session: GameSessionState; dispatch: React.Dispatch<GameSessionAction>; disabled: boolean }) {
  const [editing, setEditing] = useState<{ entry: VoteRoundEntry; voided: boolean } | null>(null)
  const [draft, setDraft] = useState<VoteRoundDraft | null>(null)
  const [reason, setReason] = useState('')
  const [submittedId, setSubmittedId] = useState('')
  const rounds = projectEffectiveTimelineEntries(session.timeline).filter((entry): entry is VoteRoundEntry => entry.kind === 'vote_round')
  useEffect(() => {
    if (submittedId && session.timeline.some((entry) => entry.id === submittedId)) { setEditing(null); setSubmittedId('') }
  }, [session.timeline, submittedId])
  function edit(entry: VoteRoundEntry, voided: boolean) {
    setEditing({ entry, voided })
    setDraft({ ...entry, segmentId: entry.segmentId ?? 'day-pending', raisedSeatIds: [...entry.raisedSeatIds], ghostVoteSeatIds: [...entry.ghostVoteSeatIds], ...(entry.voteAdjustment ? { voteAdjustment: { ...entry.voteAdjustment } } : {}) })
    setReason('')
    setSubmittedId('')
  }
  function confirm() {
    if (!editing || !draft || !reason.trim()) return
    const id = `vote-revision-${crypto.randomUUID()}`
    setSubmittedId(id)
    dispatch({ type: 'revise-vote-round', originalEntryId: editing.entry.id, draft, voided: editing.voided, reason,
      input: { id, createdAt: new Date().toISOString() } })
  }
  return <details className="day-vote-history">
    <summary>票型记录与更正（{rounds.length}轮）</summary>
    {rounds.map((entry) => <article key={entry.id}>
      <strong>{session.phaseSegments.find((segment) => segment.id === entry.segmentId)?.label} · {entry.nominatorSeatId}号提名{entry.nomineeSeatId}号 · {voteCount(entry)}票{entry.voided ? ' · 已撤销' : ''}</strong>
      <small>记录 ID：{entry.id}{entry.correctionReason ? ` · 更正原因：${entry.correctionReason}` : ''}</small>
      <div><Button disabled={disabled} onClick={() => edit(entry, false)}>更正票型</Button><Button variant="ghost" disabled={disabled || entry.voided} onClick={() => edit(entry, true)}>撤销票型</Button></div>
    </article>)}
    <Sheet open={Boolean(editing)} onOpenChange={(open) => { if (!open) setEditing(null) }} title={editing?.voided ? '撤销票型' : '更正票型'} description="原记录保留；会更新有效票面，不改已确认的处决或玩家状态。" presentation="page">
      {editing && draft ? <div className="day-vote-correction">
        <p>原记录：{editing.entry.nominatorSeatId}号提名{editing.entry.nomineeSeatId}号 · {voteCount(editing.entry)}票［{editing.entry.id}］</p>
        {!editing.voided ? <DayVoteEditor draft={draft} playerCount={session.playerCount} playerStates={votePlayerStates(session, editing.entry.id)} session={session} originalEntryId={editing.entry.id} onChange={(update) => setDraft((current) => current ? update(current) : current)} /> : null}
        <Field label={editing.voided ? '撤销原因' : '更正原因'}><textarea maxLength={500} value={reason} onChange={(event) => setReason(event.target.value)} /></Field>
        {submittedId ? <p role="status">尚未写入；请检查编辑权或记录是否已有新版本，输入已保留。</p> : null}
        <Button variant={editing.voided ? 'danger' : 'primary'} disabled={disabled || !reason.trim() || (!editing.voided && (!canCompleteVoteRound(draft) || Boolean(nominationIssues(session, draft, editing.entry.id).length) || !canRecordGhostVotes(session, draft, editing.entry.id)))} onClick={confirm}>{editing.voided ? '确认撤销票型' : '确认更正票型'}</Button>
      </div> : null}
    </Sheet>
  </details>
}
