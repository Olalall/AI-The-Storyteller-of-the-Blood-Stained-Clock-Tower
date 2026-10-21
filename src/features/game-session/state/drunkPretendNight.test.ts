// Official Drunk: wake as the shown Townsfolk, without acquiring that ability.
// https://wiki.bloodontheclocktower.com/Drunk
import { describe, expect, it } from 'vitest'
import { getSmartScriptPack, roleSnapshotsForScript } from '../../../domain/scripts'
import { createSmartScriptSetupSession } from '../data/createPrototypeSession'
import { playerFacingIdentity } from '../../identity-deal/identityProjection'
import { parseSessionBackup } from '../../../services/session/sessionBackup'
import { actNight, projected } from '../../night-workbench/state/nightInformation.test-support'
import { focusNightItem, nextMarionetteNight } from '../../night-workbench/state/marionettePretend.test-support'
import { projectCurrentAssignments, projectCurrentPlayerStates } from './projectors'
import { gameSessionReducer } from './sessionReducer'
import { nightContextKey } from '../../night-workbench/state/gameSessionAdapter'
import { projectKazaliAllocation } from './applyKazaliAllocation'

const at = '2026-10-21T00:00:00.000Z'
function opening(shownRoleId?: string, scriptId = 'trouble-brewing', ids = ['washerwoman', 'investigator', 'slayer', 'ravenkeeper', 'soldier', 'drunk', 'poisoner', 'imp']) {
  const roles = roleSnapshotsForScript(scriptId)
  let session = createSmartScriptSetupSession(scriptId, at, { playerCount: ids.length })
  session = gameSessionReducer(session, { type: 'set-setup-draft', draft: {
    candidateId: 'drunk-pretend-regression', revision: 1, updatedAt: at,
    assignments: ids.map((id, index) => ({ seatId: index + 1, role: { ...roles.find((role) => role.id === id)! } })), demonBluffs: [],
  } })
  session = gameSessionReducer(session, { type: 'confirm-setup', id: 'drunk-setup', confirmedAt: at })
  if (shownRoleId) session = gameSessionReducer(session, { type: 'confirm-identity-presentation', seatId: 6, actualRoleId: 'drunk', shownRoleId, confirmedAt: at })
  session = gameSessionReducer(session, { type: 'start-next-night-run' })
  return gameSessionReducer(session, { type: 'open-phase-segment', phaseKind: 'night', createdAt: at })
}

describe('Drunk pretend wakes share the shown Townsfolk night timing and input', () => {
  it.each([['chef', true, false], ['empath', true, true], ['monk', false, true], ['mayor', false, false]] as const)(
    '%s uses the source first and other night sheets', (shown, first, other) => {
      let session = opening(shown)
      for (const expected of [first, other]) {
        const state = projected(session)
        const fake = state.queue.filter((item) => item.seatId === 6)
        expect(fake).toHaveLength(expected ? 1 : 0)
        if (expected) {
          expect(fake[0]).toMatchObject({ roleId: 'drunk', interactionVersion: `drunk/pretend-${shown}-v1` })
          expect(fake[0].storytellerPrompt).toMatch(/无真实效果|不生效/)
          const orders = getSmartScriptPack(session.scriptId).nightOrders[state.nightType === 'first' ? 'firstNight' : 'otherNight']
          const rank = orders.find((item) => item.roleId === shown)!.order
          for (const [index, item] of state.queue.entries()) {
            if (item.systemStep || item.id === fake[0].id) continue
            const otherRank = orders.find((order) => order.roleId === item.roleId)?.order
            if (otherRank !== undefined && otherRank < rank) expect(index).toBeLessThan(state.queue.indexOf(fake[0]))
            if (otherRank !== undefined && otherRank > rank) expect(index).toBeGreaterThan(state.queue.indexOf(fake[0]))
          }
          if (shown === 'monk') expect(fake[0].targetCount).toBe(1)
        }
        expect(projectCurrentAssignments(session).find((item) => item.seatId === 6)?.role.id).toBe('drunk')
        expect(playerFacingIdentity(session, 6).role?.id).toBe(shown)
        session = nextMarionetteNight(session)
      }
    },
  )

  it('records only pretend inputs without changing roles, life or poison and keeps backup compatibility', () => {
    let session = nextMarionetteNight(opening('monk'))
    const fake = projected(session).queue.find((item) => item.seatId === 6)!
    const states = projectCurrentPlayerStates(session), assignments = projectCurrentAssignments(session), timeline = structuredClone(session.timeline)
    session = focusNightItem(session, fake.id)
    session = actNight(session, { type: 'target', seatId: 3 })
    session = actNight(session, { type: 'outcome', outcomeId: 'record' })
    session = actNight(session, { type: 'confirm', advance: false })
    expect(projected(session).confirmedRecords[fake.id]).toHaveLength(1)
    expect(session.timeline.at(-1)).toMatchObject({ kind: 'night_action', roleId: 'drunk', actorSeatId: 6 })
    expect(projectCurrentAssignments(session)).toEqual(assignments)
    expect(projectCurrentPlayerStates(session)).toEqual(states)
    expect(session.timeline.slice(0, timeline.length)).toEqual(timeline)
    expect(playerFacingIdentity(session, 6).role?.id).toBe('monk')
    expect(parseSessionBackup(JSON.stringify(session))).toEqual(session)
  })

  it('does not guess an unconfirmed shown identity or rewrite existing saved night queues', () => {
    const session = opening(), before = structuredClone(session)
    expect(projected(session).queue.filter((item) => item.seatId === 6)).toHaveLength(0)
    expect(session).toEqual(before)
    expect(parseSessionBackup(JSON.stringify(session))).toEqual(session)
  })

  it.each(['chef', 'empath'])('records the shown %s numeric information under the real Drunk identity', (shown) => {
    let session = opening(shown)
    const item = projected(session).queue.find((item) => item.seatId === 6)!
    expect(item.informationInput).toMatchObject({ kind: 'number', minimum: 0 })
    session = focusNightItem(session, item.id)
    const states = projectCurrentPlayerStates(session), roles = projectCurrentAssignments(session)
    session = actNight(session, { type: 'information', value: '1' })
    session = actNight(session, { type: 'outcome', outcomeId: 'record' })
    session = actNight(session, { type: 'confirm', advance: false })
    expect(projected(session).confirmedRecords[item.id].at(-1)?.snapshot.informationGiven).toBe('1')
    expect(session.timeline.at(-1)).toMatchObject({ kind: 'night_action', roleId: 'drunk' })
    expect(projectCurrentPlayerStates(session)).toEqual(states)
    expect(projectCurrentAssignments(session)).toEqual(roles)
    expect(playerFacingIdentity(session, 6).role?.id).toBe(shown)
    expect(parseSessionBackup(JSON.stringify(session))).toEqual(session)
  })

  it('keeps a Drunk shown Oracle in the later-night queue after Kazali assigns the new Minion', () => {
    let session = opening('oracle', 'one-in-one-out', ['steward', 'knight', 'seamstress', 'farmer', 'snakecharmer', 'drunk', 'kazali'])
    const kazali = projected(session).queue.find((item) => item.roleId === 'kazali')!
    session = focusNightItem(session, kazali.id)
    session = actNight(session, { type: 'target-role-choice', index: 0, seatId: 5, roleId: 'poisoner' })
    session = actNight(actNight(session, { type: 'outcome', outcomeId: 'record' }), { type: 'confirm', advance: false })
    const plan = projectKazaliAllocation(session)!
    session = gameSessionReducer(session, { type: 'apply-kazali-allocation', nightRunId: plan.run.id, sourceEntryId: plan.record!.id,
      expectedContextKey: nightContextKey(session), confirmedAt: new Date(Date.now() + 1000).toISOString() })
    expect(projectKazaliAllocation(session)?.isApplied).toBe(true)
    expect(projected(session).queue.some((item) => item.seatId === 6 && !item.systemStep)).toBe(false)
    session = nextMarionetteNight(session)
    const state = projected(session), item = state.queue.find((item) => item.seatId === 6)!
    expect(item).toMatchObject({ roleId: 'drunk', interactionVersion: 'drunk/pretend-oracle-v1', informationInput: { kind: 'number' } })
    expect(state.queue.indexOf(item)).toBeGreaterThan(state.queue.findIndex((item) => item.roleId === 'kazali'))
    expect(state.queue.find((item) => item.roleId === 'poisoner')?.seatId).toBe(5)
    expect(state.queue.some((item) => item.roleId === 'snakecharmer')).toBe(false)
    expect(parseSessionBackup(JSON.stringify(session))).toEqual(session)
  })

  it('retains the shown first-night position when Kazali rebuilds an unaffected Drunk reminder', () => {
    let session = opening('highpriestess', 'one-in-one-out', ['steward', 'knight', 'seamstress', 'farmer', 'snakecharmer', 'drunk', 'kazali'])
    const original = projected(session).queue.find((item) => item.seatId === 6)!
    const kazali = projected(session).queue.find((item) => item.roleId === 'kazali')!
    session = focusNightItem(session, kazali.id)
    session = actNight(session, { type: 'target-role-choice', index: 0, seatId: 5, roleId: 'poisoner' })
    session = actNight(actNight(session, { type: 'outcome', outcomeId: 'record' }), { type: 'confirm', advance: false })
    const plan = projectKazaliAllocation(session)!
    session = gameSessionReducer(session, { type: 'apply-kazali-allocation', nightRunId: plan.run.id, sourceEntryId: plan.record!.id,
      expectedContextKey: nightContextKey(session), confirmedAt: new Date(Date.now() + 1000).toISOString() })
    const queue = projected(session).queue.filter((item) => item.progress !== 'not_applicable' && !item.systemStep)
    expect(queue.filter((item) => item.id === original.id)).toHaveLength(1)
    const ranks = new Map(getSmartScriptPack(session.scriptId).nightOrders.firstNight.map((item) => [item.roleId, item.order]))
    const order = queue.map((item) => ranks.get(item.seatId === 6 ? 'highpriestess' : item.roleId)!)
    expect(order).toEqual(order.toSorted((a, b) => a - b))
  })

  it('inserts a newly gained later ability after the earlier shown Drunk wake', () => {
    let session = opening('oracle', 'one-in-one-out', ['steward', 'knight', 'seamstress', 'farmer', 'snakecharmer', 'drunk', 'imp'])
    session = nextMarionetteNight(session)
    const before = structuredClone(session.timeline), run = session.nightRuns[session.activeNightRunId!]
    session = gameSessionReducer(session, { type: 'confirm-night-role-change', nightRunId: run.id, seatId: 4,
      roleId: 'spy', expectedRoleId: 'farmer', expectedContextKey: nightContextKey(session), expectedRevision: run.revision,
      id: 'explicit-new-spy', timing: 'tonight', reason: 'gameplay', confirmedAt: new Date(Date.now() + 3000).toISOString() })
    const queue = projected(session).queue.filter((item) => item.progress !== 'not_applicable')
    const drunk = queue.findIndex((item) => item.interactionVersion === 'drunk/pretend-oracle-v1')
    const spy = queue.findIndex((item) => item.seatId === 4 && item.roleId === 'spy')
    expect(drunk).toBeGreaterThanOrEqual(0)
    expect(spy).toBeGreaterThan(drunk)
    expect(session.timeline.slice(0, before.length)).toEqual(before)
  })
})
