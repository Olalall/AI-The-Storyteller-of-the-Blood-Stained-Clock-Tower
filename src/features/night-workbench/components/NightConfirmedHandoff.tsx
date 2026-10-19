import { StateFollowupSheet } from '../../game-session/components/StateFollowupSheet'
import type { NightWorkbenchSessionBinding } from '../state/gameSessionAdapter'
import './night-confirmed-handoff.css'
import { KazaliAllocationHandoff } from './KazaliAllocationHandoff'

export function NightConfirmedHandoff({ binding }: { binding: NightWorkbenchSessionBinding }) {
  const { session, dispatchSession } = binding
  const run = session.activeNightRunId ? session.nightRuns[session.activeNightRunId] : undefined
  const latest = session.timeline.findLast((entry) => entry.kind === 'night_action' && entry.nightRunId === run?.id)
  if (!run || run.privacyShielded || latest?.kind !== 'night_action') return null
  const item = run.queue.find((entry) => entry.id === latest.wakeItemId)
  return <section className="night-confirmed-handoff" aria-label="夜晚确认后待办">
    <span>最近确认 · {item ? `${item.seatId}号 ${item.roleName}` : '夜晚记录'}{latest.correctionOf ? ' · 更正' : ''}</span>
    <KazaliAllocationHandoff binding={binding} />
    <StateFollowupSheet session={session} dispatch={dispatchSession} suggestedSourceId={latest.id} />
  </section>
}
