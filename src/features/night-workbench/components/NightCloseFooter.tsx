import { AlertTriangle, Check, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../../components/ui/Button'
import type { GameSessionAction } from '../../game-session/state/sessionReducer'
import type { GameSessionState } from '../../game-session/types'

interface NightCloseFooterProps {
  session: GameSessionState
  dispatch: React.Dispatch<GameSessionAction>
  nightRunId: string
  unresolvedCount: number
  onExit: () => void
}

export function NightCloseFooter({ session, dispatch, nightRunId, unresolvedCount, onExit }: NightCloseFooterProps) {
  const [confirming, setConfirming] = useState(false)
  const run = session.nightRuns[nightRunId]
  const segment = run?.phaseSegmentId ? session.phaseSegments.find((item) => item.id === run.phaseSegmentId) : undefined
  if (!segment || segment.closedAt) return null

  if (confirming) {
    return (
      <section className="night-close-confirm" aria-live="polite">
        <div><AlertTriangle aria-hidden="true" /><div><strong>关闭{segment.label}？</strong><span>只关闭本夜记录，不会进入白天。</span>{unresolvedCount ? <small>还有{unresolvedCount}项未处理，可取消后继续。</small> : null}</div></div>
        <div><Button variant="ghost" onClick={() => setConfirming(false)}><X aria-hidden="true" />取消</Button><Button variant="danger" onClick={() => { dispatch({ type: 'close-active-night-run', nightRunId, closedAt: new Date().toISOString() }); onExit() }}><Check aria-hidden="true" />确认关闭</Button></div>
      </section>
    )
  }

  return (
    <footer className="night-close-footer">
      <div><strong>{segment.label}</strong><span>关闭前检查未处理项</span></div>
      <Button variant="secondary" onClick={() => setConfirming(true)}>检查并关闭</Button>
    </footer>
  )
}
