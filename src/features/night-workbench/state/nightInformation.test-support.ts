import { roleSnapshotsForScript } from '../../../domain/scripts'
import { createSmartScriptSetupSession } from '../../game-session/data/createPrototypeSession'
import { gameSessionReducer } from '../../game-session/state/sessionReducer'
import type { GameSessionState } from '../../game-session/types'
import { sessionInitialNightState } from './gameSessionAdapter'
import type { NightWorkbenchAction } from './nightWorkbenchReducer'

export function informationSession(roleId = 'dreamer') {
  const roles = ['general', 'empath', 'dreamer', 'chef', 'investigator', 'banshee', 'librarian', 'fisherman', 'seamstress', 'drunk', 'barber', 'poisoner', 'harpy', 'spy', 'alhadikhia']
  const at = '2026-10-16T00:00:00.000Z'
  let session = createSmartScriptSetupSession('wang-bu-jian-wang', at, { playerCount: 15 })
  const snapshots = roleSnapshotsForScript(session.scriptId)
  const snapshot = (id: string) => ({ ...snapshots.find((role) => role.id === id)! })
  session = gameSessionReducer(session, { type: 'set-setup-draft', draft: {
    candidateId: 'information-input-regression', revision: 1, updatedAt: at,
    assignments: roles.map((id, index) => ({ seatId: index + 1, role: snapshot(id) })),
    demonBluffs: ['savant', 'alsaahir', 'plaguedoctor'].map(snapshot),
  } })
  session = gameSessionReducer(session, { type: 'confirm-setup', id: 'information-setup', confirmedAt: at })
  session = gameSessionReducer(session, { type: 'start-next-night-run' })
  const run = session.nightRuns[session.activeNightRunId!]
  const item = run.queue.find((entry) => entry.roleId === roleId)!
  return actNight(actNight(session, { type: 'preview', id: item.id }), { type: 'activate-preview' })
}

export function projected(session: GameSessionState) {
  return sessionInitialNightState({ session, dispatchSession: () => {} })!
}

export function actNight(session: GameSessionState, action: NightWorkbenchAction) {
  const state = projected(session)
  return gameSessionReducer(session, { type: 'night-workbench-action', nightRunId: state.nightRunId, expectedWakeItemId: state.previewEntryId, expectedActiveCursorId: state.activeCursorId, action })
}
