import { getSmartScriptPack } from '../../../domain/scripts'
import { createSmartScriptSetupSession } from '../../game-session/data/createPrototypeSession'
import { gameSessionReducer } from '../../game-session/state/sessionReducer'
import { createSmartScriptSetupCandidates } from '../../setup/smartScriptSetupCandidates'
import { createSetupDraftFromCandidate } from '../../setup/setupDraft'
import { actNight, projected } from './nightInformation.test-support'

/** Real registered setup templates and phase reducers; no injected queue or model. */
export function cardinalitySession(scriptId: string, roleId: string, playerCount: number, otherNight = false) {
  const at = '2026-10-16T10:00:00.000Z'
  let session = createSmartScriptSetupSession(scriptId, at, { playerCount })
  const profiles = Object.values(session.seats)
  const candidates = createSmartScriptSetupCandidates(scriptId, profiles, { seed: `cardinality-${scriptId}`, count: getSmartScriptPack(scriptId).setupTemplates.length })
  const candidate = candidates.find((entry) => entry.assignments.some((a) => a.role.id === roleId))
  if (!candidate) throw new Error(`Missing legal fixture: ${scriptId}/${roleId}`)
  session = gameSessionReducer(session, { type: 'set-setup-draft', draft: createSetupDraftFromCandidate(candidate, at) })
  session = gameSessionReducer(session, { type: 'confirm-setup', id: 'cardinality-setup', confirmedAt: at })
  session = gameSessionReducer(session, { type: 'start-next-night-run' })
  if (otherNight) {
    session = gameSessionReducer(session, { type: 'open-phase-segment', phaseKind: 'night', createdAt: at })
    for (const item of projected(session).queue) session = actNight(session, { type: 'skip-item', id: item.id, reason: '隔离回归不执行首夜技能。' })
    session = gameSessionReducer(session, { type: 'close-active-night-run', nightRunId: session.activeNightRunId!, closedAt: at })
    session = gameSessionReducer(session, { type: 'open-phase-segment', phaseKind: 'day', createdAt: at })
    session = gameSessionReducer(session, { type: 'confirm-day-no-execution', daySegmentId: session.phaseSegments.at(-1)!.id, entryId: 'cardinality-no-execution', confirmedAt: at })
    session = gameSessionReducer(session, { type: 'close-open-segment', phaseKind: 'day', closedAt: at })
    session = gameSessionReducer(session, { type: 'start-next-night-run' })
  }
  const item = projected(session).queue.find((entry) => entry.roleId === roleId)
  if (!item) throw new Error(`Missing production wake: ${scriptId}/${roleId}`)
  return actNight(actNight(session, { type: 'preview', id: item.id }), { type: 'activate-preview' })
}
