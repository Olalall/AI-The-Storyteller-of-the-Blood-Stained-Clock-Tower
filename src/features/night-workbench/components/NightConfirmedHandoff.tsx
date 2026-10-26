import { StateFollowupSheet } from '../../game-session/components/StateFollowupSheet'
import { AbilityChangeSheet } from '../../game-session/components/AbilityChangeSheet'
import type { NightWorkbenchSessionBinding } from '../state/gameSessionAdapter'
import './night-confirmed-handoff.css'
import { KazaliAllocationHandoff } from './KazaliAllocationHandoff'
import { wakeShortLabel } from '../state/systemSteps'
import { projectAbilityGrants } from '../../game-session/state/abilityChanges'

export function NightConfirmedHandoff({ binding }: { binding: NightWorkbenchSessionBinding }) {
  const { session, dispatchSession } = binding
  const run = session.activeNightRunId ? session.nightRuns[session.activeNightRunId] : undefined
  const latest = session.timeline.findLast((entry) => entry.kind === 'night_action' && entry.nightRunId === run?.id)
  if (!run || run.privacyShielded || latest?.kind !== 'night_action') return null
  const item = run.queue.find((entry) => entry.id === latest.wakeItemId)
  const abilityAlreadyPrepared = projectAbilityGrants(session).some(g => g.sourceSeatId === item?.seatId && g.sourceRoleId === item?.roleId && g.abilityRole?.id === latest.record.snapshot.roleChoice)
  return <section className="night-confirmed-handoff" aria-label="夜晚确认后待办">
    <span>最近确认 · {item ? item.seatId === 0 || item.interactionVersion === 'legion/collective-night-v1' ? wakeShortLabel(item) : `${item.seatId}号 ${item.roleName}` : '夜晚记录'}{latest.correctionOf ? ' · 更正' : ''}</span>
    <KazaliAllocationHandoff binding={binding} />
    {abilityAlreadyPrepared ? <span>能力已登记，已在相应夜序处理；不需要再次授予。</span> : item && ['philosopher', 'alchemist', 'boffin'].includes(item.roleId) && latest.record.snapshot.roleChoice ? <AbilityChangeSheet session={session} dispatch={dispatchSession} suggestedSourceId={latest.id} /> : null}
    <StateFollowupSheet session={session} dispatch={dispatchSession} suggestedSourceId={latest.id} />
  </section>
}
