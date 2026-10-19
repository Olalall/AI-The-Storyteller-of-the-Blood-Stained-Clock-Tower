import { getSmartScriptPack } from '../../../domain/scripts'
import { createSmartScriptSetupSession } from '../../game-session/data/createPrototypeSession'
import { gameSessionReducer } from '../../game-session/state/sessionReducer'
import { createSmartScriptSetupCandidates } from '../../setup/smartScriptSetupCandidates'
import { createSetupDraftFromCandidate } from '../../setup/setupDraft'
import { actNight, projected } from './nightInformation.test-support'

function phaseClock(session: ReturnType<typeof createSmartScriptSetupSession>) {
  let timestamp = Math.max(Date.parse('2026-10-16T10:00:00.000Z'),
    ...session.phaseSegments.flatMap((segment) => [Date.parse(segment.createdAt), Date.parse(segment.closedAt ?? segment.createdAt)]),
    ...session.timeline.map((entry) => Date.parse(entry.createdAt)))
  return () => new Date(++timestamp).toISOString()
}

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
    const nextAt = phaseClock(session)
    session = gameSessionReducer(session, { type: 'close-active-night-run', nightRunId: session.activeNightRunId!, closedAt: nextAt() })
    session = gameSessionReducer(session, { type: 'open-phase-segment', phaseKind: 'day', createdAt: nextAt() })
    session = gameSessionReducer(session, { type: 'confirm-day-no-execution', daySegmentId: session.phaseSegments.at(-1)!.id, entryId: 'cardinality-no-execution', confirmedAt: nextAt() })
    session = gameSessionReducer(session, { type: 'close-open-segment', phaseKind: 'day', closedAt: nextAt() })
    session = gameSessionReducer(session, { type: 'start-next-night-run' })
  }
  const item = projected(session).queue.find((entry) => entry.roleId === roleId)
  if (!item) throw new Error(`Missing production wake: ${scriptId}/${roleId}`)
  return actNight(actNight(session, { type: 'preview', id: item.id }), { type: 'activate-preview' })
}

/** Complete actual phase commands while keeping every confirmed record and run reference. */
export function nextCardinalityNight(session: ReturnType<typeof cardinalitySession>, roleId: string) {
  const nextAt = phaseClock(session)
  session = gameSessionReducer(session, { type: 'open-phase-segment', phaseKind: 'night', createdAt: nextAt() })
  for (const item of projected(session).queue) {
    if (!['confirmed', 'skipped', 'not_applicable'].includes(item.progress)) {
      session = actNight(session, { type: 'skip-item', id: item.id, reason: '隔离回归不执行其他技能。' })
    }
  }
  const previousRunId = session.activeNightRunId!
  session = gameSessionReducer(session, { type: 'close-active-night-run', nightRunId: previousRunId, closedAt: nextAt() })
  session = gameSessionReducer(session, { type: 'open-phase-segment', phaseKind: 'day', createdAt: nextAt() })
  session = gameSessionReducer(session, { type: 'confirm-day-no-execution', daySegmentId: session.phaseSegments.at(-1)!.id, entryId: `${previousRunId}-no-execution`, confirmedAt: nextAt() })
  session = gameSessionReducer(session, { type: 'close-open-segment', phaseKind: 'day', closedAt: nextAt() })
  session = gameSessionReducer(session, { type: 'start-next-night-run' })
  const item = projected(session).queue.find((entry) => entry.roleId === roleId)!
  return actNight(actNight(session, { type: 'preview', id: item.id }), { type: 'activate-preview' })
}
