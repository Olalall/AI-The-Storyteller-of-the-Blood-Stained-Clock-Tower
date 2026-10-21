import { Hand } from 'lucide-react'
import { useId, useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { Field } from '../../../components/ui/Field'
import { SeatButton } from '../../../components/ui/SeatButton'
import type { GameSessionState, PlayerState } from '../../game-session/types'
import { canRecordGhostVotes, invalidGhostVoteSeats, normalizeDeadVotes } from '../state/ghostVotes'
import { canCompleteVoteRound, hasVoteRoundDraftContent, setVoteNominator, setVoteNominee, toggleRaisedVote, voteCount, type VoteRoundDraft } from '../state/voteRound'

interface Props {
  draft: VoteRoundDraft
  playerCount: number
  playerStates: Record<number, PlayerState>
  session: GameSessionState
  originalEntryId?: string
  disabled?: boolean
  /** 工作台分步展示时复用独立的 NominationStep；更正弹层仍完整展示。 */
  showNomination?: boolean
  onChange: (update: (current: VoteRoundDraft) => VoteRoundDraft) => void
  onRecord?: () => void
  onCancel?: () => void
}

export function DayVoteEditor({ draft, playerCount, playerStates, session, originalEntryId, disabled = false, showNomination = true, onChange, onRecord, onCancel }: Props) {
  const [target, setTarget] = useState<'nominator' | 'nominee'>('nominator')
  const id = useId()
  const aliveCount = Object.values(playerStates).filter((state) => state.life === 'alive').length
  const selectedVotes = new Set(draft.raisedSeatIds)
  const ghostVotes = new Set(draft.ghostVoteSeatIds)
  const conflicts = invalidGhostVoteSeats(session, draft, originalEntryId)
  const spentVotes = new Set(Array.from({ length: playerCount }, (_, index) => index + 1).filter((seatId) =>
    invalidGhostVoteSeats(session, { raisedSeatIds: [seatId], ghostVoteSeatIds: playerStates[seatId]?.life === 'dead' ? [seatId] : [] }, originalEntryId).includes(seatId)))
  const ready = draft.nominatorSeatId !== null && draft.nomineeSeatId !== null
  return <>
    {showNomination ? <Card className="day-card--nomination" eyebrow="步骤 1" eyebrowTone="info" title="选择提名" titleId={`${id}-nomination`} aria-labelledby={`${id}-nomination`}>
      <div className="day-selection-tabs" role="tablist" aria-label="选择提名对象">
        <button type="button" disabled={disabled} role="tab" aria-selected={target === 'nominator'} className={target === 'nominator' ? 'is-active' : ''} onClick={() => setTarget('nominator')}>提名人 · {draft.nominatorSeatId ? `${draft.nominatorSeatId}号` : '未选'}</button>
        <button type="button" disabled={disabled} role="tab" aria-selected={target === 'nominee'} className={target === 'nominee' ? 'is-active' : ''} onClick={() => setTarget('nominee')}>被提名人 · {draft.nomineeSeatId ? `${draft.nomineeSeatId}号` : '未选'}</button>
      </div>
      <div className="day-seat-grid" aria-label="提名座位">
        {Array.from({ length: playerCount }, (_, index) => index + 1).map((seatId) => <SeatButton
          key={seatId} seat={seatId} disabled={disabled} selected={seatId === (target === 'nominator' ? draft.nominatorSeatId : draft.nomineeSeatId)} dead={playerStates[seatId]?.life === 'dead'}
          onClick={() => onChange((current) => target === 'nominator' ? setVoteNominator(current, seatId) : setVoteNominee(current, seatId))}
          aria-label={`选择${seatId}号为${target === 'nominator' ? '提名人' : '被提名人'}`} />)}
      </div>
      {onCancel ? <Button variant="ghost" disabled={disabled || !hasVoteRoundDraftContent(draft)} onClick={() => { setTarget('nominator'); onCancel() }}>取消本轮提名</Button> : null}
    </Card> : null}
    <Card className="day-card--vote" eyebrow="步骤 2" eyebrowTone="info" title="记录举手" titleId={`${id}-vote`} aria-labelledby={`${id}-vote`}
      actions={<Field className="day-threshold" label="处决门槛" hint={`存活${aliveCount}人 · 建议${Math.max(1, Math.ceil(aliveCount / 2))}`}>
        <input type="number" disabled={disabled} min="1" max={playerCount} value={draft.threshold} onChange={(event) => onChange((current) => ({ ...current, threshold: Number(event.target.value) || 0 }))} />
      </Field>}>
      <p className={ready ? 'day-vote-target' : 'day-vote-target is-pending'}>{ready ? `${draft.nominatorSeatId}号提名 ${draft.nomineeSeatId}号` : '先选择提名双方'}</p>
      <div className="day-vote-grid" aria-label="本轮举手票">
        {Array.from({ length: playerCount }, (_, index) => index + 1).map((seatId) => <div className="day-vote-seat" key={seatId}>
          <SeatButton seat={seatId} disabled={disabled || (!selectedVotes.has(seatId) && spentVotes.has(seatId))} selected={selectedVotes.has(seatId)} dead={playerStates[seatId]?.life === 'dead'} onClick={() => onChange((current) => normalizeDeadVotes(session, toggleRaisedVote(current, seatId), originalEntryId))} aria-label={`${selectedVotes.has(seatId) ? '取消' : '记录'}${seatId}号举手`} />
          {!selectedVotes.has(seatId) && spentVotes.has(seatId) ? <span className="day-ghost-vote">死亡票已用</span> : null}
          {playerStates[seatId]?.life === 'dead' && selectedVotes.has(seatId) ? <span className="day-ghost-vote is-active">{ghostVotes.has(seatId) ? '死亡票' : '计入死亡票'}</span> : null}
        </div>)}
      </div>
      <p className="day-disabled-reason">死亡票按有效记录核对；已用的票不能再次举手。特殊能力恢复票权或额外投票，请用手工修正票数注明座位及依据。</p>
      {conflicts.length ? <p role="alert">{conflicts.join('、')}号的死亡票已用；请取消重复举手或更正原记录。</p> : null}
      <label className="day-execution-death"><input type="checkbox" disabled={disabled} checked={Boolean(draft.voteAdjustment)} onChange={(event) => onChange((current) => ({ ...current, voteAdjustment: event.target.checked ? { count: 0, reason: '' } : undefined }))} />手工修正票数</label>
      {draft.voteAdjustment ? <div className="day-vote-adjustment">
        <Field label="票数修正" hint="正数加票、负数减票；例如双票额外加 1，不自动判断角色。"><input aria-label="票数修正" type="number" disabled={disabled} min="-30" max="30" value={draft.voteAdjustment.count} onChange={(event) => onChange((current) => ({ ...current, voteAdjustment: { ...current.voteAdjustment!, count: Number(event.target.value) } }))} /></Field>
        <Field label="票数修正原因"><input disabled={disabled} maxLength={500} value={draft.voteAdjustment.reason} onChange={(event) => onChange((current) => ({ ...current, voteAdjustment: { ...current.voteAdjustment!, reason: event.target.value } }))} /></Field>
      </div> : null}
      <div className="day-vote-summary" aria-label={`举手${draft.raisedSeatIds.length}票，死亡票${draft.ghostVoteSeatIds.length}张，处决门槛${draft.threshold || '未设置'}`}><span>计入票数<strong>{voteCount(draft)}</strong></span><span>死亡票<strong>{draft.ghostVoteSeatIds.length}</strong></span><span>门槛<strong>{draft.threshold || '—'}</strong></span></div>
      {onRecord ? <Button variant="primary" onClick={onRecord} disabled={disabled || !canCompleteVoteRound(draft) || !canRecordGhostVotes(session, draft, originalEntryId)}><Hand aria-hidden="true" />记录本轮票型</Button> : null}
      {!ready ? <p className="day-disabled-reason">先选择提名双方</p> : null}
    </Card>
  </>
}

