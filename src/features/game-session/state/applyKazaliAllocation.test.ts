import { describe, expect, it } from 'vitest'
import { getSmartScriptPack, roleSnapshotsForScript } from '../../../domain/scripts'
import { parseSessionBackup } from '../../../services/session/sessionBackup'
import { playerFacingIdentity } from '../../identity-deal/identityProjection'
import { actNight, projected } from '../../night-workbench/state/nightInformation.test-support'
import { createSmartScriptSetupSession } from '../data/createPrototypeSession'
import type { GameSessionState } from '../types'
import { nightContextKey } from '../../night-workbench/state/gameSessionAdapter'
import { projectKazaliAllocation } from './applyKazaliAllocation'
import { projectCurrentAssignments, projectCurrentPlayerStates } from './projectors'
import { gameSessionReducer } from './sessionReducer'

const at = '2026-10-18T00:00:00.000Z'
function sessionFor(scriptId = 'one-in-one-out', count = 13) {
  let session = createSmartScriptSetupSession(scriptId, at, { playerCount: count })
  const pack = getSmartScriptPack(scriptId), roles = roleSnapshotsForScript(scriptId)
  const good = pack.roles.filter((role) => role.team === 'townsfolk' || role.team === 'outsider').slice(0, count - 1)
  const roleIds = [...good.map((role) => role.id), 'kazali']
  session = gameSessionReducer(session, { type: 'set-setup-draft', draft: {
    candidateId: 'kazali-night-transaction', revision: 1, updatedAt: at,
    assignments: roleIds.map((id, index) => ({ seatId: index + 1, role: { ...roles.find((role) => role.id === id)! } })), demonBluffs: [],
  } })
  session = gameSessionReducer(session, { type: 'confirm-setup', id: 'kazali-setup', confirmedAt: at })
  return gameSessionReducer(session, { type: 'start-next-night-run' })
}
function focusKazali(session: GameSessionState) {
  const item = projected(session).queue.find((entry) => entry.roleId === 'kazali')!
  return actNight(actNight(session, { type: 'preview', id: item.id }), { type: 'activate-preview' })
}
function recordPairs(session: GameSessionState, pairs = [{ seatId: 1, roleId: 'poisoner' }, { seatId: 2, roleId: 'harpy' }, { seatId: 3, roleId: 'spy' }]) {
  session = focusKazali(session)
  for (const [index, pair] of pairs.entries()) session = actNight(session, { type: 'target-role-choice', index, ...pair })
  session = actNight(session, { type: 'outcome', outcomeId: 'record' })
  return actNight(session, { type: 'confirm', advance: false })
}
function apply(session: GameSessionState) {
  const plan = projectKazaliAllocation(session)!
  return gameSessionReducer(session, { type: 'apply-kazali-allocation', nightRunId: plan.run.id, sourceEntryId: plan.record!.id,
    expectedContextKey: nightContextKey(session), confirmedAt: new Date(Date.now() + 1000).toISOString() })
}

describe('Kazali explicitly applies first-night roles and the same-night queue', () => {
  it('records without changing authority; explicit application inserts new Minions in source order and disables replaced roles', () => {
    let session = sessionFor()
    const assignments = projectCurrentAssignments(session), statuses = projectCurrentPlayerStates(session)
    session = recordPairs(session)
    expect(projectCurrentAssignments(session)).toEqual(assignments)
    const records = structuredClone(session.timeline.filter((entry) => entry.kind === 'night_action'))
    session = apply(session)
    expect(projectCurrentAssignments(session).slice(0, 3).map((entry) => entry.role.id)).toEqual(['poisoner', 'harpy', 'spy'])
    expect(projectCurrentPlayerStates(session)).toEqual(statuses)
    expect(session.timeline.filter((entry) => entry.kind === 'night_action')).toEqual(records)
    const run = projected(session)
    const live = run.queue.filter((item) => item.progress !== 'not_applicable')
    expect(live.filter((item) => ['poisoner', 'harpy', 'spy'].includes(item.roleId)).map((item) => item.roleId)).toEqual(['poisoner', 'harpy', 'spy'])
    const sourceOrder = getSmartScriptPack(session.scriptId).nightOrders.firstNight
    expect(live.map((item) => sourceOrder.find((order) => order.roleId === item.roleId)!.order)).toEqual(live.map((item) => sourceOrder.find((order) => order.roleId === item.roleId)!.order).toSorted((a, b) => a - b))
    for (const assignment of assignments.slice(0, 3)) {
      const replaced = run.queue.find((item) => item.seatId === assignment.seatId && item.roleId === assignment.role.id)
      if (replaced) expect(replaced.progress).toBe('not_applicable')
    }
    expect(run.queue.find((item) => item.id === run.activeCursorId)?.roleId).toBe('poisoner')
    session = actNight(session, { type: 'target', seatId: 4 })
    session = actNight(session, { type: 'outcome', outcomeId: 'record' })
    session = actNight(session, { type: 'confirm', advance: false })
    expect(projected(session).queue.find((item) => item.roleId === 'poisoner')?.progress).toBe('confirmed')
    expect(parseSessionBackup(JSON.stringify(session))).toEqual(session)
  })

  it('does not let later skills settle or the night close before the allocation is applied', () => {
    let session = recordPairs(sessionFor())
    const run = projected(session), oldItem = run.queue.find((item) => item.seatId === 1 && item.roleId !== 'kazali')!
    session = actNight(actNight(session, { type: 'preview', id: oldItem.id }), { type: 'activate-preview' })
    const count = session.timeline.length
    session = actNight(session, { type: 'target', seatId: 5 })
    session = actNight(session, { type: 'outcome', outcomeId: 'record' })
    session = actNight(session, { type: 'confirm', advance: false })
    expect(session.timeline).toHaveLength(count)
    expect(projected(session).lastNotice).toContain('先确认并应用')
    session = gameSessionReducer(session, { type: 'close-active-night-run', nightRunId: run.nightRunId, closedAt: at })
    expect(session.phaseSegments.find((segment) => segment.id === session.nightRuns[run.nightRunId].phaseSegmentId)?.closedAt).toBeUndefined()
  })

  it('is idempotent and rejects stale context or a non-latest source record', () => {
    const session = recordPairs(sessionFor()), plan = projectKazaliAllocation(session)!
    const stale = gameSessionReducer(session, { type: 'apply-kazali-allocation', nightRunId: plan.run.id, sourceEntryId: plan.record!.id, expectedContextKey: 'stale', confirmedAt: at })
    expect(stale).toBe(session)
    const applied = apply(session)
    expect(apply(applied)).toBe(applied)
  })

  it('keeps the original good identity private when a neighboring player becomes Marionette', () => {
    let session = sessionFor('devout-theists', 7)
    const before = projectCurrentAssignments(session).find((entry) => entry.seatId === 1)!.role
    session = recordPairs(session, [{ seatId: 1, roleId: 'marionette' }])
    session = apply(session)
    expect(projectCurrentAssignments(session).find((entry) => entry.seatId === 1)?.role.id).toBe('marionette')
    expect(playerFacingIdentity(session, 1).role).toEqual(before)
    expect(projected(session).queue.filter((item) => item.seatId === 1 && item.roleId === before.id && item.progress !== 'not_applicable')).toEqual([])
  })

  it('rejects a non-neighbor Marionette without partial role or queue changes', () => {
    const session = recordPairs(sessionFor('devout-theists', 7), [{ seatId: 3, roleId: 'marionette' }])
    expect(projectKazaliAllocation(session)?.blockedReason).toContain('相邻')
    expect(apply(session)).toBe(session)
  })

  it('applies a corrected distribution without erasing old records and restores the unchosen good player', () => {
    let session = apply(recordPairs(sessionFor()))
    const before = structuredClone(session.timeline)
    session = focusKazali(session)
    session = actNight(session, { type: 'begin-correction' })
    session = actNight(session, { type: 'target-role-choice', index: 0, seatId: 4 })
    session = actNight(session, { type: 'outcome', outcomeId: 'record' })
    session = actNight(session, { type: 'confirm', advance: false })
    expect(projectKazaliAllocation(session)?.isApplied).toBe(false)
    session = apply(session)
    expect(projectCurrentAssignments(session).find((entry) => entry.seatId === 1)?.role.id).toBe('steward')
    expect(projectCurrentAssignments(session).find((entry) => entry.seatId === 4)?.role.id).toBe('poisoner')
    expect(session.timeline.slice(0, before.length)).toEqual(before)
    expect(projected(session).queue.find((item) => item.roleId === 'poisoner' && item.seatId === 1)?.progress).toBe('not_applicable')
    expect(projected(session).queue.find((item) => item.roleId === 'steward' && item.seatId === 1)?.progress).toBe('pending')
  })
})
