import { normalizeRoleId } from '../../../domain/scripts'
import type { GameSessionState } from '../types'
import { projectCurrentAssignments, projectCurrentPlayerStates } from './projectors'
import { createFirstNightSystemSteps } from './firstNightSystemSteps'
import { nightContextKey } from '../../night-workbench/state/gameSessionAdapter'

export function pendingPoppyRecognition(session: GameSessionState) {
  const run = session.activeNightRunId ? session.nightRuns[session.activeNightRunId] : undefined
  if (!run || run.privacyShielded || run.correctionItemId || session.phaseSegments.some(p => p.id === run.phaseSegmentId && p.closedAt)) return null
  const assignments = projectCurrentAssignments(session), states = projectCurrentPlayerStates(session)
  const poppy = assignments.find(a => normalizeRoleId(a.role.id) === 'poppygrower' && states[a.seatId]?.life === 'dead')
  if (!poppy) return null
  const death = session.timeline.findLast(e => e.kind === 'player_state_changed' && e.seatId === poppy.seatId && e.before.life === 'alive' && e.after.life === 'dead')
  if (!death || death.kind !== 'player_state_changed') return null
  const sourceId = `poppy-${death.id}`
  if (Object.values(session.nightRuns).some(r => r.queue.some(i => i.id.includes(sourceId)))) return null
  if (run.nightType === 'first' && run.queue.some(i => i.roleId === 'system-minion-info')) return null
  return { run, sourceId, seatId: poppy.seatId, impairedAtDeath: death.before.drunk || death.before.poisoned }
}

export function applyPoppyRecognition(session: GameSessionState, expectedContextKey: string) {
  const pending = pendingPoppyRecognition(session)
  if (!pending || pending.impairedAtDeath || expectedContextKey !== nightContextKey(session)) return session
  const { run, sourceId } = pending
  const steps = createFirstNightSystemSteps(session, projectCurrentAssignments(session), projectCurrentPlayerStates(session), `${run.id}-${sourceId}`, true)
  if (!steps.length) return session
  const queue = [...run.queue], activeIndex = Math.max(0, queue.findIndex(i => i.id === run.activeCursorId))
  const index = activeIndex + (['confirmed', 'skipped', 'not_applicable'].includes(queue[activeIndex]?.progress ?? '') ? 1 : 0)
  queue.splice(index, 0, ...steps)
  return { ...session, nightRuns: { ...session.nightRuns, [run.id]: { ...run, queue: queue.map((i, n) => ({ ...i, orderIndex: n + 1 })),
    revision: run.revision + 1, activeCursorId: steps[0].id, previewEntryId: steps[0].id, lastNotice: '已补入罂粟死亡后的相认核对；名单由说书人逐项确认。' } } }
}

export function poppyRecognitionIncomplete(session: GameSessionState) {
  const pending = pendingPoppyRecognition(session)
  if (pending && !pending.impairedAtDeath) return true
  const run = session.activeNightRunId ? session.nightRuns[session.activeNightRunId] : undefined
  return Boolean(run && !session.phaseSegments.some(p => p.id === run.phaseSegmentId && p.closedAt) && run.queue.some(i =>
    i.id.startsWith(`${run.id}-poppy-`) && i.systemStep && !['confirmed', 'skipped', 'not_applicable'].includes(i.progress)))
}
