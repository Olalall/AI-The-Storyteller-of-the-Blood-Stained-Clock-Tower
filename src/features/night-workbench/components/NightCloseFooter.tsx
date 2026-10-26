import { useEffect, useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { Sheet } from '../../../components/ui/Sheet'
import type { GameSessionAction } from '../../game-session/state/sessionReducer'
import type { GameSessionState } from '../../game-session/types'
import type { WakeItem } from '../types'
import './night-close-checklist.css'
import { wakeShortLabel } from '../state/systemSteps'
import { projectKazaliAllocation } from '../../game-session/state/applyKazaliAllocation'
import { pendingPoppyRecognition, poppyRecognitionIncomplete } from '../../game-session/state/poppyRecognition'
import { nightContextKey } from '../state/gameSessionAdapter'

interface NightCloseFooterProps {
  session: GameSessionState
  dispatch: React.Dispatch<GameSessionAction>
  nightRunId: string
  queue: WakeItem[]
  concealed: boolean
  onPreview: (id: string) => void
  onSkip: (id: string, reason: string) => void
  onExit: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function NightCloseFooter({ session, dispatch, nightRunId, queue, concealed, onPreview, onSkip, onExit, open, onOpenChange }: NightCloseFooterProps) {
  const [localOpen, setLocalOpen] = useState(false)
  const confirming = open ?? localOpen
  const setConfirming = onOpenChange ?? setLocalOpen
  const [skipId, setSkipId] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const run = session.nightRuns[nightRunId]
  const segment = run?.phaseSegmentId ? session.phaseSegments.find((item) => item.id === run.phaseSegmentId) : undefined
  const allocation = projectKazaliAllocation(session)
  const allocationPending = allocation?.run.id === nightRunId && !allocation.isApplied
  const poppy = pendingPoppyRecognition(session)
  const poppyPending = poppy && !poppy.impairedAtDeath
  useEffect(() => {
    if (confirming && segment?.closedAt) { setConfirming(false); onExit() }
  }, [confirming, segment?.closedAt, onExit, setConfirming])
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
      <div><strong>{segment.label}</strong><span>{unresolved.length ? `还有${unresolved.length}项待处理` : '已处理完毕，可进入白天'}</span></div>
      <Button variant="secondary" onClick={() => setConfirming(true)}>夜晚收尾</Button>
    </footer>
    <Sheet open={confirming} onOpenChange={(open) => { setConfirming(open); setSkipId(null); setReason('') }} title={`结束${segment.label}，进入白天？`} description="确认已完成告知及状态更新。结束后保留所有夜晚记录，进入白天。">
      <div className="night-close-checklist">
        {allocationPending ? <p role="alert">请先确认并应用卡扎力首夜爪牙分配，再结束本夜。</p> : null}
        {poppyPending ? <div><p role="alert">罂粟已死亡，本夜还需要相认。</p><Button variant="secondary" onClick={() => {
          dispatch({ type: 'apply-poppy-recognition', expectedContextKey: nightContextKey(session) }); setConfirming(false)
        }}>补入相认步骤</Button></div> : null}
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
        <div className="night-close-checklist__actions"><Button variant="ghost" onClick={() => setConfirming(false)}>继续夜晚</Button><Button variant="primary" disabled={Boolean(skipId) || allocationPending || poppyRecognitionIncomplete(session) || Boolean(run.correctionItemId) || concealed} onClick={() => dispatch({ type: 'close-active-night-run', nightRunId, closedAt: new Date().toISOString() })}>确认结束，进入白天</Button></div>
      </div>
    </Sheet>
  </>
}
