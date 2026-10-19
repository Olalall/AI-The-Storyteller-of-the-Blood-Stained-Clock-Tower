import { useEffect, useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { Field } from '../../../components/ui/Field'
import { Sheet } from '../../../components/ui/Sheet'
import type { GameSessionState } from '../../game-session/types'
import type { GameSessionAction } from '../../game-session/state/sessionReducer'
import { projectCurrentPlayerStates } from '../../game-session/state/projectors'

export function SpecialExecution({ session, dispatch, disabled }: { session: GameSessionState; dispatch: React.Dispatch<GameSessionAction>; disabled: boolean }) {
  const [open, setOpen] = useState(false)
  const [seatId, setSeatId] = useState(0)
  const [reason, setReason] = useState('')
  const [causesDeath, setCausesDeath] = useState(true)
  const [submittedId, setSubmittedId] = useState('')
  useEffect(() => {
    if (submittedId && session.timeline.some((entry) => entry.id === submittedId)) { setOpen(false); setSubmittedId('') }
  }, [session.timeline, submittedId])
  const states = projectCurrentPlayerStates(session)
  function confirm() {
    if (!seatId || !reason.trim()) return
    const id = `special-execution-${crypto.randomUUID()}`
    setSubmittedId(id)
    dispatch({ type: 'confirm-day-execution', daySegmentId: session.phaseSegments.find((segment) => segment.kind === 'day' && !segment.closedAt)?.id ?? 'day-pending',
      nomineeSeatId: seatId, sourceRoundId: '', exceptionReason: reason, causesDeath,
      executionEntryId: id, playerStateEntryId: `${id}-state`, confirmedAt: new Date().toISOString() })
  }
  return <div className="day-special-execution">
    <Button disabled={disabled} onClick={() => { setOpen(true); setReason(''); setSeatId(0); setCausesDeath(true); setSubmittedId('') }}>记录特殊处决</Button>
    <Sheet open={open} onOpenChange={setOpen} title="记录特殊处决" description="由说书人确认能力或特殊情形，不按票面自动裁定。" presentation="page">
      <div className="day-vote-correction">
        <Field label="被处决座位"><select value={seatId} onChange={(event) => setSeatId(Number(event.target.value))}><option value="0">选择座位</option>{Object.values(session.seats).map((seat) => <option key={seat.seatId} value={seat.seatId}>{seat.seatId}号</option>)}</select></Field>
        <Field label="特殊处决原因"><textarea maxLength={500} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="例如：说书人确认贞洁者能力触发" /></Field>
        {seatId && states[seatId]?.life === 'alive' ? <label className="day-execution-death"><input type="checkbox" checked={causesDeath} onChange={(event) => setCausesDeath(event.target.checked)} />本次处决造成死亡</label> : null}
        <p>确认后追加处决与所需的死亡记录，占用今天的处决机会；清空未确认的本轮提名，不自动开始夜晚。</p>
        {submittedId ? <p role="status">尚未写入；请检查编辑权或今天是否已有处决，输入已保留。</p> : null}
        <Button variant="danger" disabled={disabled || !seatId || !reason.trim()} onClick={confirm}>确认特殊处决</Button>
      </div>
    </Sheet>
  </div>
}
