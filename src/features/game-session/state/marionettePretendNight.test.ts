import { describe, expect, it } from 'vitest'
import { getSmartScriptPack } from '../../../domain/scripts'
import { parseSessionBackup } from '../../../services/session/sessionBackup'
import { playerFacingIdentity } from '../../identity-deal/identityProjection'
import { actNight, projected } from '../../night-workbench/state/nightInformation.test-support'
import { allocateMarionette, focusNightItem, marionetteOpening, nextMarionetteNight } from '../../night-workbench/state/marionettePretend.test-support'
import { emptyWakeDraft } from '../../night-workbench/state/projectWakeDraft'
import type { GameSessionState } from '../types'
import { projectCurrentAssignments, projectCurrentPlayerStates } from './projectors'
import { gameSessionReducer } from './sessionReducer'

function fakeReminder(session: GameSessionState, shownRoleId: string, expected: boolean) {
  const state = projected(session)
  const fake = state.queue.filter((item) => item.seatId === 1 && item.interactionVersion === 'marionette/pretend-v1')
  expect(fake).toHaveLength(expected ? 1 : 0)
  if (!expected) return session
  const item = fake[0]
  expect(item).toMatchObject({ roleId: 'marionette', targetCount: 0, roleChoices: undefined, roleCount: undefined, targetRoleChoiceCount: undefined })
  expect(item.id).not.toBe(`${state.nightRunId}-marionette-1`)
  expect(item.id).not.toBe(`${state.nightRunId}-${shownRoleId}-1`)
  expect(item.outcomeOptions).toHaveLength(1)
  expect(item.outcomeOptions[0]).toMatchObject({ id: 'record', requiredInputs: [] })
  expect(item.outcomeOptions[0].informationTemplate).toBeUndefined()
  expect(item.storytellerPrompt).toMatch(/假装/)
  expect(item.storytellerPrompt).toMatch(/不生效|不执行/)
  const orders = getSmartScriptPack(session.scriptId).nightOrders[state.nightType === 'first' ? 'firstNight' : 'otherNight']
  const expectedPosition = orders.findIndex((entry) => entry.roleId === shownRoleId)
  const fakePosition = state.queue.findIndex((entry) => entry.id === item.id)
  for (const [index, other] of state.queue.entries()) {
    if (other.progress === 'not_applicable' || other.interactionVersion === 'marionette/pretend-v1') continue
    const position = orders.findIndex((entry) => entry.roleId === other.roleId)
    if (position < expectedPosition) expect(index).toBeLessThan(fakePosition)
    if (position > expectedPosition) expect(index).toBeGreaterThan(fakePosition)
  }
  const assignments = projectCurrentAssignments(session), statuses = projectCurrentPlayerStates(session)
  const identity = playerFacingIdentity(session, 1), oldTimeline = structuredClone(session.timeline)
  session = focusNightItem(session, item.id)
  session = actNight(session, { type: 'target', seatId: 2 })
  expect(projected(session).drafts[item.id]?.targets ?? []).toEqual([])
  session = actNight(session, { type: 'outcome', outcomeId: 'record' })
  const draft = projected(session).drafts[item.id]
  expect(draft).toMatchObject({ targets: [], roleChoice: '', informationGiven: '' })
  expect(draft.targetRoleChoices).toBeUndefined()
  expect(draft.storytellerResult).toMatch(/假装流程/)
  expect(draft.storytellerResult).toMatch(/无真实效果/)
  session = actNight(session, { type: 'confirm', advance: false })
  expect(projected(session).confirmedRecords[item.id]).toHaveLength(1)
  expect(projectCurrentAssignments(session)).toEqual(assignments)
  expect(projectCurrentPlayerStates(session)).toEqual(statuses)
  expect(playerFacingIdentity(session, 1)).toEqual(identity)
  expect(identity.role?.id).toBe(shownRoleId)
  expect(session.timeline.slice(0, oldTimeline.length)).toEqual(oldTimeline)
  expect(parseSessionBackup(JSON.stringify(session))).toEqual(session)
  return session
}

describe('Marionette keeps the shown good character pretend workflow without acquiring its ability', () => {
  it.each([
    ['highpriestess', true, true], ['chef', true, false], ['flowergirl', false, true], ['fisherman', false, false],
  ] as const)('respects both source night sheets for a shown %s', (shownRole, first, other) => {
    let session = marionetteOpening(shownRole)
    const old = projected(session).queue.find((item) => item.seatId === 1 && item.roleId === shownRole)
    const oldQueue = structuredClone(session.nightRuns[session.activeNightRunId!].queue)
    session = allocateMarionette(session)
    expect(projectCurrentAssignments(session).find((assignment) => assignment.seatId === 1)?.role.id).toBe('marionette')
    if (old) expect(projected(session).queue.find((item) => item.id === old.id)).toMatchObject({ progress: 'not_applicable', applicability: 'not_applicable' })
    const setupReminder = projected(session).queue.filter((item) => item.seatId === 1 && item.roleId === 'marionette' && item.interactionVersion !== 'marionette/pretend-v1')
    expect(setupReminder).toHaveLength(1)
    expect(setupReminder[0].interactionVersion).toBe('marionette/setup-v1')
    expect(setupReminder[0].ability).toMatch(/恶魔/)
    expect(setupReminder[0].ability).toMatch(/不.{0,15}唤醒木偶/)
    session = fakeReminder(session, shownRole, first)
    const oldRunId = session.activeNightRunId!, firstRun = structuredClone(session.nightRuns[oldRunId])
    session = nextMarionetteNight(session)
    expect(projected(session).nightType).toBe('other')
    session = fakeReminder(session, shownRole, other)
    expect(session.nightRuns[oldRunId].queue).toEqual(firstRun.queue.map((item) => ['confirmed', 'not_applicable', 'skipped'].includes(item.progress) ? item : { ...item, progress: 'skipped', reason: '此回归仅执行木偶假装流程，其他技能不执行。' }))
    if (old) expect(oldQueue.find((item) => item.seatId === 1)?.roleId).toBe(shownRole)
    expect(projected(session).queue.some((item) => item.seatId === 1 && item.roleId === shownRole)).toBe(false)
  })

  it('preserves an already-confirmed old good ability rather than rewriting it into a pretend record', () => {
    let session = marionetteOpening()
    session = gameSessionReducer(session, { type: 'open-phase-segment', phaseKind: 'night', createdAt: '2026-10-18T00:00:00Z' })
    const run = session.nightRuns[session.activeNightRunId!], old = run.queue.find((item) => item.seatId === 1 && item.roleId === 'highpriestess')!
    old.progress = 'confirmed'
    const snapshot = { ...emptyWakeDraft(), outcomeId: 'record', storytellerResult: '旧版本已记录的女祭司信息。', informationGiven: '旧玩家信息' }
    run.drafts[old.id] = snapshot
    session.timeline.push({ id: 'old-highpriestess-record', kind: 'night_action', nightRunId: run.id, wakeItemId: old.id, segmentId: run.phaseSegmentId,
      createdAt: '2026-10-18T00:00:00Z', confirmedBy: 'storyteller', summary: snapshot.storytellerResult, details: [], record: { revision: 1, snapshot: structuredClone(snapshot) } })
    const before = structuredClone(session.timeline)
    session = allocateMarionette(session)
    expect(session.timeline.slice(0, before.length)).toEqual(before)
    expect(projected(session).queue.find((item) => item.id === old.id)?.progress).toBe('confirmed')
    expect(projected(session).confirmedRecords[old.id][0].snapshot).toEqual(snapshot)
    expect(projected(session).queue.filter((item) => item.interactionVersion === 'marionette/pretend-v1')).toHaveLength(1)
    expect(parseSessionBackup(JSON.stringify(session))).toEqual(session)
  })
})
