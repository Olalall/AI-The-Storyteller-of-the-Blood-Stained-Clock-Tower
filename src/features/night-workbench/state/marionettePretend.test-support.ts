import { roleSnapshotsForScript } from '../../../domain/scripts'
import { createSmartScriptSetupSession } from '../../game-session/data/createPrototypeSession'
import { projectKazaliAllocation } from '../../game-session/state/applyKazaliAllocation'
import { gameSessionReducer } from '../../game-session/state/sessionReducer'
import type { GameSessionState } from '../../game-session/types'
import { nightContextKey } from './gameSessionAdapter'
import { actNight, projected } from './nightInformation.test-support'

export function focusNightItem(session: GameSessionState, id: string) {
  return actNight(actNight(session, { type: 'preview', id }), { type: 'activate-preview' })
}

export function marionetteOpening(shownRoleId = 'highpriestess') {
  const at = '2026-10-18T00:00:00Z', scriptId = 'devout-theists'
  const snapshots = roleSnapshotsForScript(scriptId)
  const ids = [shownRoleId, ...['chef', 'mathematician', 'amnesiac', 'pixie', 'noble', 'savant', 'fisherman'].filter((id) => id !== shownRoleId).slice(0, 5), 'kazali']
  let session = createSmartScriptSetupSession(scriptId, at, { playerCount: 7 })
  session = gameSessionReducer(session, { type: 'set-setup-draft', draft: { candidateId: 'marionette-pretend-opening', revision: 1, updatedAt: at,
    assignments: ids.map((id, index) => ({ seatId: index + 1, role: { ...snapshots.find((role) => role.id === id)! } })), demonBluffs: [] } })
  session = gameSessionReducer(session, { type: 'confirm-setup', id: 'marionette-pretend-setup', confirmedAt: at })
  return gameSessionReducer(session, { type: 'start-next-night-run' })
}

export function allocateMarionette(session: GameSessionState) {
  const kazali = projected(session).queue.find((item) => item.roleId === 'kazali')!
  session = focusNightItem(session, kazali.id)
  session = actNight(session, { type: 'target-role-choice', index: 0, seatId: 1, roleId: 'marionette' })
  session = actNight(actNight(session, { type: 'outcome', outcomeId: 'record' }), { type: 'confirm', advance: false })
  const plan = projectKazaliAllocation(session)!
  return gameSessionReducer(session, { type: 'apply-kazali-allocation', nightRunId: plan.run.id, sourceEntryId: plan.record!.id,
    expectedContextKey: nightContextKey(session), confirmedAt: new Date(Date.now() + 1000).toISOString() })
}

export function nextMarionetteNight(session: GameSessionState) {
  const at = new Date(Date.now() + 2000).toISOString()
  for (const item of projected(session).queue) if (item.progress !== 'confirmed') session = actNight(session, { type: 'skip-item', id: item.id, reason: '此回归仅执行木偶假装流程，其他技能不执行。' })
  session = gameSessionReducer(session, { type: 'close-active-night-run', nightRunId: session.activeNightRunId!, closedAt: at })
  session = gameSessionReducer(session, { type: 'open-phase-segment', phaseKind: 'day', createdAt: at })
  session = gameSessionReducer(session, { type: 'confirm-day-no-execution', daySegmentId: session.phaseSegments.at(-1)!.id, entryId: 'marionette-test-no-execution', confirmedAt: at })
  session = gameSessionReducer(session, { type: 'close-open-segment', phaseKind: 'day', closedAt: at })
  return gameSessionReducer(session, { type: 'start-next-night-run' })
}
