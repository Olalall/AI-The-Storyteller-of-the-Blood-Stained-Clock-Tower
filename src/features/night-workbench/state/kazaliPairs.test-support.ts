import { cardinalitySession } from './nightCardinality.test-support'
import { roleTeamByIdForScript } from '../../../domain/scripts'
import { projectCurrentAssignments } from '../../game-session/state/projectors'
import { gameSessionReducer } from '../../game-session/state/sessionReducer'
import { nightContextKey } from './gameSessionAdapter'
import { actNight, projected } from './nightInformation.test-support'
import { emptyWakeDraft } from './projectWakeDraft'

export function kazaliPairSession(count = 13, scriptId = 'punchy', otherNight = false) {
  let session = cardinalitySession(scriptId, 'kazali', count)
  if (!otherNight) return session
  const { item } = currentKazali(session)
  const teams = roleTeamByIdForScript(scriptId)
  const oldMinions = projectCurrentAssignments(session).filter((assignment) => teams[assignment.role.id] === 'minion').map((assignment) => assignment.seatId)
  const seats = [...oldMinions, ...Object.keys(session.seats).map(Number).filter((seat) => seat !== item.seatId && !oldMinions.includes(seat))]
  for (let index = 0; index < item.targetRoleChoiceCount!; index += 1) session = actNight(session, { type: 'target-role-choice', index, seatId: seats[index], roleId: item.roleChoices![index].id })
  session = actNight(actNight(session, { type: 'outcome', outcomeId: 'record' }), { type: 'confirm', advance: false })
  const record = projected(session).confirmedRecords[item.id].at(-1)!
  const at = new Date().toISOString()
  session = gameSessionReducer(session, { type: 'apply-kazali-allocation', nightRunId: session.activeNightRunId!, sourceEntryId: record.id, expectedContextKey: nightContextKey(session), confirmedAt: at })
  for (const wake of projected(session).queue) if (wake.progress !== 'confirmed') session = actNight(session, { type: 'skip-item', id: wake.id, reason: '隔离回归已应用首夜分配，其余技能不执行。' })
  session = gameSessionReducer(session, { type: 'close-active-night-run', nightRunId: session.activeNightRunId!, closedAt: at })
  session = gameSessionReducer(session, { type: 'open-phase-segment', phaseKind: 'day', createdAt: at })
  session = gameSessionReducer(session, { type: 'confirm-day-no-execution', daySegmentId: session.phaseSegments.at(-1)!.id, entryId: 'kazali-no-execution', confirmedAt: at })
  session = gameSessionReducer(session, { type: 'close-open-segment', phaseKind: 'day', closedAt: at })
  session = gameSessionReducer(session, { type: 'start-next-night-run' })
  const later = projected(session).queue.find((wake) => wake.roleId === 'kazali')!
  return actNight(actNight(session, { type: 'preview', id: later.id }), { type: 'activate-preview' })
}

export function currentKazali(session: ReturnType<typeof kazaliPairSession>) {
  const state = projected(session)
  const item = state.queue.find((entry) => entry.id === state.activeCursorId)!
  return { state, item, draft: state.drafts[item.id] ?? emptyWakeDraft() }
}

export function fillKazaliPairs(session: ReturnType<typeof kazaliPairSession>) {
  const item = currentKazali(session).item
  const seats = [6, 2, 4]
  for (let index = 0; index < item.targetRoleChoiceCount!; index += 1) {
    session = actNight(session, { type: 'target-role-choice', index, seatId: seats[index], roleId: item.roleChoices![index].id })
  }
  return session
}
