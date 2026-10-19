import { describe, expect, it } from 'vitest'
import { getSmartScriptPack, roleSnapshotsForScript, roleTeamByIdForScript } from '../../../domain/scripts'
import { parseSessionBackup } from '../../../services/session/sessionBackup'
import { createNightWorkbenchCommit, nightContextKey } from '../../night-workbench/state/gameSessionAdapter'
import { actNight, projected } from '../../night-workbench/state/nightInformation.test-support'
import { emptyWakeDraft } from '../../night-workbench/state/projectWakeDraft'
import { createSmartScriptSetupSession } from '../data/createPrototypeSession'
import type { GameSessionState } from '../types'
import { projectKazaliAllocation } from './applyKazaliAllocation'
import { projectCurrentAssignments, projectCurrentPlayerStates } from './projectors'
import { gameSessionReducer } from './sessionReducer'

const at = '2026-10-18T00:00:00.000Z'
const affected = [
  ['sheng-dan-ye-jing-hun', 7], ['one-in-one-out', 10], ['punchy', 13], ['devout-theists', 15],
  ['wu-he-you-zhi-xiang', 7], ['xin-kou-ci-huang', 10], ['wu-yin-cang-sheng', 13],
  ['ku-mu-feng-chun', 15], ['bai-zhou-wei-shi', 7], ['ji-meng-ta-xiang', 10], ['nuo-fu-jiu-xing', 13],
] as const

function opening(scriptId: string, count: number, initialMinion?: string) {
  const pack = getSmartScriptPack(scriptId), snapshots = roleSnapshotsForScript(scriptId)
  const firstIds = new Set(pack.nightOrders.firstNight.map((order) => order.roleId))
  const good = pack.roles.filter((role) => role.team === 'townsfolk' || role.team === 'outsider')
  const firstGood = good.find((role) => firstIds.has(role.id))!
  expect(firstGood, 'fixture needs a real first-night good ability to verify its cancellation').toBeDefined()
  const ids = [firstGood.id, ...good.filter((role) => role.id !== firstGood.id).map((role) => role.id)].slice(0, count - 1)
  if (initialMinion) ids[0] = initialMinion
  ids.push('kazali')
  let session = createSmartScriptSetupSession(scriptId, at, { playerCount: count })
  session = gameSessionReducer(session, { type: 'set-setup-draft', draft: {
    candidateId: 'manual-kazali-pre-minion-opening', revision: 1, updatedAt: at,
    assignments: ids.map((id, index) => ({ seatId: index + 1, role: { ...snapshots.find((role) => role.id === id)! } })),
    demonBluffs: snapshots.filter((role) => !ids.includes(role.id) && pack.roles.find((entry) => entry.id === role.id)?.team === 'townsfolk').slice(0, 3),
  } })
  session = gameSessionReducer(session, { type: 'confirm-setup', id: `${scriptId}-manual-setup`, confirmedAt: at })
  return gameSessionReducer(session, { type: 'start-next-night-run' })
}

function focus(session: GameSessionState, id: string) {
  return actNight(actNight(session, { type: 'preview', id }), { type: 'activate-preview' })
}

function record(session: GameSessionState, pairs: { seatId: number; roleId: string }[]) {
  const item = projected(session).queue.find((entry) => entry.roleId === 'kazali')!
  session = focus(session, item.id)
  for (const [index, pair] of pairs.entries()) session = actNight(session, { type: 'target-role-choice', index, ...pair })
  session = actNight(session, { type: 'outcome', outcomeId: 'record' })
  return actNight(session, { type: 'confirm', advance: false })
}

function apply(session: GameSessionState) {
  const plan = projectKazaliAllocation(session)!
  return gameSessionReducer(session, { type: 'apply-kazali-allocation', nightRunId: plan.run.id, sourceEntryId: plan.record!.id,
    expectedContextKey: nightContextKey(session), confirmedAt: new Date(Date.now() + 1000).toISOString() })
}

describe('all eleven registered Kazali scripts use the real first-night allocation transaction', () => {
  it.each(affected)('%s at %i players preserves records and drafts while adding only applicable new Minion wakes', (scriptId, count) => {
    let session = opening(scriptId, count)
    const pack = getSmartScriptPack(scriptId), teams = roleTeamByIdForScript(scriptId)
    const firstIds = pack.nightOrders.firstNight.map((order) => order.roleId)
    const waking = [...new Set(firstIds.filter((id) => teams[id] === 'minion'))]
    const minions = [...waking, ...pack.roles.filter((role) => role.team === 'minion' && !waking.includes(role.id)).map((role) => role.id)]
    expect(waking.length, 'choose at least one real first-night Minion action').toBeGreaterThan(0)
    const required = count <= 9 ? 1 : count <= 12 ? 2 : 3
    const selected = minions.slice(0, required)
    const seats = Array.from({ length: required }, (_, index) => index + 1)
    const marionetteIndex = selected.indexOf('marionette')
    if (marionetteIndex > 0) [seats[0], seats[marionetteIndex]] = [seats[marionetteIndex], seats[0]]
    const pairs = selected.map((roleId, index) => ({ seatId: seats[index], roleId }))
    const priorAssignments = projectCurrentAssignments(session), states = projectCurrentPlayerStates(session)
    const oldWake = projected(session).queue.find((item) => item.seatId === 1)!
    session = focus(session, oldWake.id)
    session = actNight(session, { type: 'storyteller-context', value: '原角色尚未发动的旧草稿，换角后仍须保留。' })
    const oldDraft = structuredClone(projected(session).drafts[oldWake.id])
    session = record(session, pairs)
    const records = structuredClone(session.timeline)
    const source = projectKazaliAllocation(session)!.record!
    expect(projectCurrentAssignments(session)).toEqual(priorAssignments)
    expect(projectKazaliAllocation(session)!.blockedReason).toBe('')
    session = apply(session)
    expect(projectKazaliAllocation(session)!.isApplied).toBe(true)
    expect(session.timeline.slice(0, records.length)).toEqual(records)
    expect(projectCurrentPlayerStates(session)).toEqual(states)
    const run = projected(session)
    expect(run.drafts[oldWake.id]).toEqual(oldDraft)
    expect(run.queue.find((item) => item.id === oldWake.id)).toMatchObject({ progress: 'not_applicable', applicability: 'not_applicable' })
    for (const pair of pairs) {
      expect(projectCurrentAssignments(session).find((assignment) => assignment.seatId === pair.seatId)?.role.id).toBe(pair.roleId)
      const newWakes = run.queue.filter((item) => item.seatId === pair.seatId && item.roleId === pair.roleId && item.progress !== 'not_applicable' && item.interactionVersion !== 'marionette/pretend-v1')
      expect(newWakes).toHaveLength(firstIds.includes(pair.roleId) ? 1 : 0)
      if (newWakes.length) expect(newWakes[0].progress).toBe('pending')
    }
    const activeOrder = run.queue.filter((item) => item.progress !== 'not_applicable').map((item) => firstIds.indexOf(item.interactionVersion === 'marionette/pretend-v1'
      ? session.identityPresentations![item.seatId].shownRole.id : item.roleId))
    expect(activeOrder).toEqual(activeOrder.toSorted((left, right) => left - right))
    expect(session.timeline.filter((entry) => entry.kind === 'setup_changed' && entry.sourceNightActionId === source.id)).toHaveLength(required)
    expect(parseSessionBackup(JSON.stringify(session))).toEqual(session)
  })

  it('safely rejects moving a legacy preassigned Minion when its original good identity is unknown', () => {
    let session = opening('one-in-one-out', 7, 'poisoner')
    session = apply(record(session, [{ seatId: 1, roleId: 'poisoner' }]))
    expect(projectKazaliAllocation(session)!.isApplied).toBe(true)
    const item = projected(session).queue.find((entry) => entry.roleId === 'kazali')!
    session = focus(session, item.id)
    session = actNight(session, { type: 'begin-correction' })
    session = actNight(session, { type: 'target-role-choice', index: 0, seatId: 2 })
    session = actNight(actNight(session, { type: 'outcome', outcomeId: 'record' }), { type: 'confirm', advance: false })
    const before = JSON.stringify(session)
    expect(projectKazaliAllocation(session)!.blockedReason).not.toBe('')
    expect(apply(session)).toBe(session)
    expect(JSON.stringify(session)).toBe(before)
    expect(projectCurrentAssignments(session).filter((assignment) => roleTeamByIdForScript(session.scriptId)[assignment.role.id] === 'minion')).toHaveLength(1)
  })

  it('does not apply an old opening choice after the actual Kazali has changed character', () => {
    let session = record(opening('one-in-one-out', 7), [{ seatId: 1, roleId: 'poisoner' }])
    const snapshots = roleSnapshotsForScript(session.scriptId)
    session = gameSessionReducer(session, { type: 'append-setup-change', id: 'kazali-changed-away', createdAt: new Date(Date.now() + 500).toISOString(), seatId: 7,
      fromRole: snapshots.find((role) => role.id === 'kazali')!, toRole: snapshots.find((role) => role.id === 'imp')!, reason: '已由主持确认成为其他恶魔' })
    const before = JSON.stringify(session)
    expect(projectKazaliAllocation(session)!.blockedReason).not.toBe('')
    expect(apply(session)).toBe(session)
    expect(JSON.stringify(session)).toBe(before)
    expect(projectCurrentAssignments(session).find((assignment) => assignment.seatId === 7)?.role.id).toBe('imp')
  })

  it('does not invent a first-night wake for a selected Goblin that has no action on this script', () => {
    let session = record(opening('devout-theists', 7), [{ seatId: 1, roleId: 'goblin' }])
    expect(getSmartScriptPack(session.scriptId).nightOrders.firstNight.some((order) => order.roleId === 'goblin')).toBe(false)
    session = apply(session)
    expect(projectKazaliAllocation(session)!.isApplied).toBe(true)
    expect(projectCurrentAssignments(session).find((assignment) => assignment.seatId === 1)?.role.id).toBe('goblin')
    expect(projected(session).queue.some((item) => item.seatId === 1 && item.roleId === 'goblin')).toBe(false)
    expect(parseSessionBackup(JSON.stringify(session))).toEqual(session)
  })

  it('rejects a direct commit and both night-close entry points before allocation application', () => {
    const session = record(opening('one-in-one-out', 7), [{ seatId: 1, roleId: 'poisoner' }])
    const state = projected(session), kazali = state.queue.find((item) => item.roleId === 'kazali')!
    const later = state.queue.find((item) => item.orderIndex > kazali.orderIndex)!
    const forged = structuredClone(state)
    forged.confirmedRecords[later.id] = [{ id: 'bypass-first-night-allocation', wakeItemId: later.id, revision: 1, confirmedAt: at,
      snapshot: { ...emptyWakeDraft(), storytellerResult: '直接commit不应跳过分配守门。' } }]
    const command = createNightWorkbenchCommit(forged, { session, dispatchSession: () => {} })
    expect(gameSessionReducer(session, command)).toBe(session)
    expect(gameSessionReducer(session, { type: 'close-open-segment', phaseKind: 'night', closedAt: at })).toBe(session)
    const close = gameSessionReducer(session, { type: 'close-active-night-run', nightRunId: state.nightRunId, closedAt: at })
    expect(close.phaseSegments.find((segment) => segment.id === close.nightRuns[state.nightRunId].phaseSegmentId)?.closedAt).toBeUndefined()
    expect(close.timeline).toEqual(session.timeline)
  })

  it('keeps a confirmed old ability snapshot when a corrected allocation later restores that good character', () => {
    let session = opening('one-in-one-out', 7)
    const firstGood = projected(session).queue.find((item) => item.seatId === 1)!
    const run = session.nightRuns[session.activeNightRunId!]
    // A persisted old night can already contain a confirmed good action before this feature existed.
    run.queue.find((item) => item.id === firstGood.id)!.progress = 'confirmed'
    run.drafts[firstGood.id] = { ...emptyWakeDraft(), outcomeId: 'record', storytellerResult: '旧版本已确认的原善良技能。' }
    session = gameSessionReducer(session, { type: 'open-phase-segment', phaseKind: 'night', createdAt: at })
    session.timeline.push({ id: 'confirmed-old-good', kind: 'night_action', nightRunId: run.id, wakeItemId: firstGood.id, segmentId: session.nightRuns[run.id].phaseSegmentId,
      createdAt: at, confirmedBy: 'storyteller', summary: '旧版本已确认的原善良技能。', details: [], record: { revision: 1, snapshot: structuredClone(run.drafts[firstGood.id]) } })
    session = apply(record(session, [{ seatId: 1, roleId: 'poisoner' }]))
    const original = structuredClone(session.timeline.find((entry) => entry.id === 'confirmed-old-good'))
    const kazali = projected(session).queue.find((item) => item.roleId === 'kazali')!
    session = focus(session, kazali.id)
    session = actNight(session, { type: 'begin-correction' })
    session = actNight(session, { type: 'target-role-choice', index: 0, seatId: 2 })
    session = actNight(actNight(session, { type: 'outcome', outcomeId: 'record' }), { type: 'confirm', advance: false })
    session = apply(session)
    expect(session.timeline.find((entry) => entry.id === 'confirmed-old-good')).toEqual(original)
    expect(projected(session).queue.find((item) => item.id === firstGood.id)?.progress).toBe('confirmed')
    expect(projected(session).confirmedRecords[firstGood.id]).toHaveLength(1)
    expect(parseSessionBackup(JSON.stringify(session))).toEqual(session)
  })
})
