import { useEffect, useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { Sheet } from '../../../components/ui/Sheet'
import type { GameSessionAction } from '../../game-session/state/sessionReducer'
import type { GameSessionState } from '../../game-session/types'
import type { WakeItem } from '../types'
import './night-close-checklist.css'
import { wakeShortLabel } from '../state/systemSteps'
import { projectKazaliAllocation } from '../../game-session/state/applyKazaliAllocation'

interface NightCloseFooterProps {
  session: GameSessionState
  dispatch: React.Dispatch<GameSessionAction>
  nightRunId: string
  queue: WakeItem[]
  concealed: boolean
  onPreview: (id: string) => void
  onSkip: (id: string, reason: string) => void
  onExit: () => void
}

export function NightCloseFooter({ session, dispatch, nightRunId, queue, concealed, onPreview, onSkip, onExit }: NightCloseFooterProps) {
  const [confirming, setConfirming] = useState(false)
  const [skipId, setSkipId] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const run = session.nightRuns[nightRunId]
  const segment = run?.phaseSegmentId ? session.phaseSegments.find((item) => item.id === run.phaseSegmentId) : undefined
  const allocation = projectKazaliAllocation(session)
  const allocationPending = allocation?.run.id === nightRunId && !allocation.isApplied
  useEffect(() => {
    if (confirming && segment?.closedAt) { setConfirming(false); onExit() }
  }, [confirming, segment?.closedAt, onExit])
  if (!segment || segment.closedAt) return null
  const unresolved = queue.filter((item) => !['confirmed', 'not_applicable', 'skipped'].includes(item.progress))
  const pendingStateCount = (session.stateFollowups ?? []).filter((task) => !task.resolution).length
  const skipped = queue.filter((item) => item.progress === 'skipped')
  const label = (item: WakeItem) => item.seatId === 0 || item.interactionVersion === 'legion/collective-night-v1' ? wakeShortLabel(item, concealed) : concealed ? `${item.seatId}号角色` : `${item.seatId}号 ${item.roleName}`
  function preview(id: string) {
    setConfirming(false)
    setSkipId(null)
    onPreview(id)
    requestAnimationFrame(() => document.querySelector('.night-content-grid')?.scrollIntoView({ block: 'start' }))
  }
  return <>
    <footer className="night-close-footer">
      <div><strong>{segment.label}</strong><span>关闭前检查未处理项</span></div>
      <Button variant="secondary" onClick={() => setConfirming(true)}>检查并关闭</Button>
    </footer>
    <Sheet open={confirming} onOpenChange={(open) => { setConfirming(open); setSkipId(null); setReason('') }} title={`关闭${segment.label}？`} description="只关闭本夜记录，不会进入白天。">
      <div className="night-close-checklist">
        {allocationPending ? <p role="alert">请先确认并应用卡扎力首夜爪牙分配，再结束本夜。</p> : null}
        {pendingStateCount ? <p>还有{pendingStateCount}项状态待办，可取消后从顶部“状态待办”处理。关闭本夜会保留待办。</p> : null}
        <strong>{unresolved.length ? `还有${unresolved.length}项未处理` : '夜序已检查完毕'}</strong>
        <ul aria-label="未处理夜序">{unresolved.map((item) => <li key={item.id}>
          <div><strong>{label(item)}</strong><span>{item.progress === 'deferred' ? '已暂缓' : item.applicability === 'needs_review' ? '待核对' : '待处理'}</span></div>
          <div><Button variant="secondary" onClick={() => preview(item.id)}>查看{wakeShortLabel(item, concealed)}</Button><Button variant="ghost" disabled={Boolean(run.correctionItemId)} onClick={() => { setSkipId(item.id); setReason('') }}>本夜不处理</Button></div>
          {skipId === item.id ? <form onSubmit={(event) => { event.preventDefault(); if (reason.trim()) { onSkip(item.id, reason); setSkipId(null); setReason('') } }}>
            <label>不处理原因<input value={reason} maxLength={200} onChange={(event) => setReason(event.target.value)} /></label>
            <Button type="submit" variant="secondary" disabled={!reason.trim() || concealed}>确认不处理</Button>
            {concealed ? <small>请先退出遮蔽，再确认不处理。</small> : null}
          </form> : null}
        </li>)}</ul>
        {skipped.length ? <details><summary>本夜不处理 {skipped.length} 项</summary><ul>{skipped.map((item) => <li key={item.id}><strong>{label(item)}</strong><span>{concealed ? '原因已隐藏' : item.reason}</span><Button variant="ghost" onClick={() => preview(item.id)}>查看{wakeShortLabel(item, concealed)}</Button></li>)}</ul></details> : null}
        {unresolved.length ? <p>可返回继续处理；直接关闭会保留以上未处理状态。</p> : null}
        <div className="night-close-checklist__actions"><Button variant="ghost" onClick={() => setConfirming(false)}>取消</Button><Button variant="danger" disabled={Boolean(skipId) || allocationPending} onClick={() => dispatch({ type: 'close-active-night-run', nightRunId, closedAt: new Date().toISOString() })}>确认关闭</Button></div>
      </div>
    </Sheet>
  </>
}
