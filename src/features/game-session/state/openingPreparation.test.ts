import { describe, expect, it } from 'vitest'
import { createSmartScriptSetupSession } from '../data/createPrototypeSession'
import { roleSnapshotsForScript } from '../../../domain/scripts'
import { openingAssignmentKey, openingPreparationIssues } from './openingPreparation'
import { projectAbilityGrants } from './abilityChanges'
import { projectCurrentPlayerStates } from './projectors'
import { gameSessionReducer } from './sessionReducer'
import { createNextNightRun } from './createNextNightRun'
import { createFirstNightSystemSteps } from './firstNightSystemSteps'
import { sessionInitialNightState, nightContextKey } from '../../night-workbench/state/gameSessionAdapter'
import { emptyWakeDraft, outcomeReady } from '../../night-workbench/state/projectWakeDraft'
import { parseSessionBackup } from '../../../services/session/sessionBackup'
import { actNight, projected } from '../../night-workbench/state/nightInformation.test-support'
import { pendingPoppyRecognition, poppyRecognitionIncomplete } from './poppyRecognition'
import type { OpeningChoice } from '../model/openingTypes'

const AT = '2026-10-01T12:00:00.000Z'
const scriptId = 'shuo-shu-ren-zhi-nu'
// 独立构造的合成测试局；不包含用户的实际对局、座位或昵称。
function draftSession() {
  const roles = roleSnapshotsForScript(scriptId)
  const ids = ['alchemist', 'savant', 'lunatic', 'cerenovus', 'puzzlemaster', 'mathematician', 'magician', 'pixie', 'amnesiac', 'mezepheles', 'poppygrower', 'vortex']
  const base = createSmartScriptSetupSession(scriptId, AT, { playerCount: 12, seats: ids.map((_, i) => ({ seatId: i + 1, experience: 'regular' as const })) })
  const assignments = ids.map((id, i) => ({ seatId: i + 1, role: roles.find(r => r.id === id)! }))
  return { ...base, setupDraft: { candidateId: 'synthetic-opening', revision: 1, assignments, demonBluffs: roles.filter(r => ['monk', 'philosopher', 'cannibal'].includes(r.id)), updatedAt: AT, openingChoices: [] as OpeningChoice[] } }
}
function choices(): OpeningChoice[] {
  return [
    { seatId: 1, roleId: 'alchemist', chosenRoleId: 'cerenovus' },
    { seatId: 3, roleId: 'lunatic', chosenRoleId: 'vortex', minionSeatIds: [2, 5], bluffRoleIds: ['savant', 'magician', 'monk'] },
    { seatId: 5, roleId: 'puzzlemaster', targetSeatId: 2 },
    { seatId: 8, roleId: 'pixie', targetSeatId: 2, sourceRoleId: 'savant', chosenRoleId: 'monk' },
    { seatId: 9, roleId: 'amnesiac', text: '每晚得知一个座位区间的信息；反馈由说书人记录。' },
    { seatId: 10, roleId: 'mezepheles', text: '合成关键词' },
  ]
}
function prepared() {
  const base = draftSession()
  return gameSessionReducer({ ...base, setupDraft: { ...base.setupDraft, openingChoices: choices() } }, { type: 'confirm-setup', id: 'setup-synthetic', confirmedAt: AT })
}
describe('秘密开局准备与首夜交接', () => {
  it('rejects incomplete new preparation atomically and retains the draft', () => {
    const base = draftSession()
    expect(openingPreparationIssues(scriptId, base.setupDraft.assignments, [])).toHaveLength(6)
    expect(gameSessionReducer(base, { type: 'confirm-setup', id: 'setup-synthetic', confirmedAt: AT })).toBe(base)
  })
  it('confirms targets, role knowledge, false identity and inherited ability together', () => {
    const session = prepared()
    expect(session.setupDraft).toBeNull()
    expect(session.openingPreparations?.[0].choices).toEqual(choices())
    expect(projectCurrentPlayerStates(session)[2].drunk).toBe(true)
    expect(projectCurrentPlayerStates(session)[2].markers[0].sourceRoleId).toBe('puzzlemaster')
    expect(projectAbilityGrants(session)[0].abilityRole?.id).toBe('cerenovus')
    expect(session.identityPresentations?.[3].shownRole.id).toBe('vortex')
    const run = createNextNightRun(session)!
    expect(run.queue.filter(i => i.abilitySource?.sourceRoleId === 'alchemist').length).toBeGreaterThan(0)
    expect(run.queue.find(i => i.roleId === 'pixie')?.hostConfirmation?.expectedRoleIds).toContain('monk')
    expect(run.queue.find(i => i.roleId === 'pixie')?.hostConfirmation?.expectedRoleIds).not.toContain('savant')
    expect(run.queue.find(i => i.roleId === 'lunatic')?.systemStep?.infoTokens.join(' ')).toContain('博学者')
    expect(run.queue.find(i => i.roleId === 'system-demon-info')?.systemStep?.bluffCount).toBe(3)
    expect(run.queue.find(i => i.roleId === 'system-demon-info')?.systemStep?.checks.map(c => c.id)).toContain('real-demon-knows-lunatic')
    expect(parseSessionBackup(JSON.stringify(session)).openingPreparations).toEqual(session.openingPreparations)
  })
  it('requires the right fake Minion count and a separate real Pixie source while permitting false shown roles', () => {
    const assignments = draftSession().setupDraft.assignments
    expect(openingPreparationIssues(scriptId, assignments, choices())).toEqual([])
    expect(openingPreparationIssues(scriptId, assignments, choices().map(c => c.roleId === 'lunatic' ? { ...c, minionSeatIds: [2] } : c)).join('')).toContain('2名')
    expect(openingPreparationIssues(scriptId, assignments, choices().map(c => c.roleId === 'pixie' ? { ...c, targetSeatId: 4 } : c)).join('')).toContain('在场')
  })
  it('never reapplies preparation or overwrites a played game', () => {
    const session = prepared(), p = session.openingPreparations![0]
    expect(gameSessionReducer(session, { type: 'confirm-opening-preparation', preparation: { ...p, id: 'other' }, expectedContextKey: nightContextKey(session) })).toBe(session)
    const old = draftSession(), confirmed = gameSessionReducer({ ...old, setupDraft: { ...old.setupDraft, openingChoices: undefined } }, { type: 'confirm-setup', id: 'legacy', confirmedAt: AT })
    const run = createNextNightRun(confirmed)!
    const started = { ...confirmed, activeNightRunId: run.id, nightRuns: { [run.id]: run } }
    expect(gameSessionReducer(started, { type: 'confirm-opening-preparation', preparation: { ...p, setupId: 'legacy', assignmentKey: openingAssignmentKey(old.setupDraft.assignments) }, expectedContextKey: nightContextKey(started) })).toBe(started)
  })
  it('separates actual recipients from Magician candidates, and ignores impaired Poppy/Magician', () => {
    const session = prepared(), assignments = draftSession().setupDraft.assignments
    const states = projectCurrentPlayerStates(session)
    states[11].drunk = true
    const steps = createFirstNightSystemSteps(session, assignments, states, 'synthetic')
    expect(steps[0].systemStep?.minionLabels.every(s => !s.startsWith('7号'))).toBe(true)
    expect(steps[0].systemStep?.pointedDemonLabels?.some(s => s.startsWith('7号'))).toBe(true)
    expect(steps[1].systemStep?.pointedMinionLabels?.some(s => s.startsWith('7号'))).toBe(true)
    states[7].poisoned = true
    expect(createFirstNightSystemSteps(session, assignments, states, 'synthetic')[0].systemStep?.pointedDemonLabels).toBeUndefined()
  })
  it('places fake Demon action first and blocks the real Demon until choices are confirmed and disclosed', () => {
    const base = prepared()
    const other = { ...base, phaseSegments: [{ id: 'n1', kind: 'night' as const, sequence: 1, label: '第1夜', createdAt: AT, closedAt: AT }] }
    const run = createNextNightRun(other)!
    const session = { ...other, activeNightRunId: run.id, nightRuns: { [run.id]: run } }
    const state = sessionInitialNightState({ session, dispatchSession: () => {} })!
    const fake = state.queue.find(i => i.roleId === 'lunatic')!, demon = state.queue.find(i => i.roleId === 'vortex')!
    expect(state.queue.indexOf(fake)).toBeLessThan(state.queue.indexOf(demon))
    expect(fake.targetCount).toBe(1)
    expect(fake.aiAdviceEnabled).toBe(false)
    expect(demon.hostConfirmation?.blockedReason).toBeTruthy()
    const draft = { ...emptyWakeDraft(), targets: [7] }
    expect(demon.outcomeOptions.every(o => !outcomeReady(o, demon, draft))).toBe(true)
    let acted = actNight(actNight(session, { type: 'preview', id: fake.id }), { type: 'activate-preview' })
    acted = actNight(acted, { type: 'target', seatId: 7 })
    acted = actNight(acted, { type: 'outcome', outcomeId: 'record' })
    acted = actNight(acted, { type: 'confirm', advance: false })
    const informed = projected(acted).queue.find(i => i.id === demon.id)!
    expect(informed.hostConfirmation?.blockedReason).toBeUndefined()
    expect(informed.hostConfirmation?.summary).toContain('7号')
    const acknowledged = { ...draft, systemChecks: [informed.hostConfirmation!.checkId] }
    expect(informed.outcomeOptions.some(o => outcomeReady(o, informed, acknowledged))).toBe(true)
    expect(projectCurrentPlayerStates(acted)).toEqual(projectCurrentPlayerStates(session))
    acted = actNight(acted, { type: 'begin-correction' })
    acted = actNight(acted, { type: 'target', seatId: 7 })
    acted = actNight(acted, { type: 'target', seatId: 4 })
    acted = actNight(acted, { type: 'outcome', outcomeId: 'record' })
    acted = actNight(acted, { type: 'confirm', advance: false })
    const corrected = projected(acted).queue.find(i => i.id === demon.id)!
    expect(corrected.hostConfirmation?.summary).toContain('4号')
    expect(corrected.hostConfirmation?.checkId).not.toBe(informed.hostConfirmation?.checkId)
    expect(corrected.outcomeOptions.every(o => !outcomeReady(o, corrected, acknowledged))).toBe(true)
    expect(parseSessionBackup(JSON.stringify(acted))).toEqual(acted)
  })
  it('adds recognition in the same night after healthy Poppy death, with Magician and no new bluffs', () => {
    let session = gameSessionReducer(prepared(), { type: 'start-next-night-run' })
    session = gameSessionReducer(session, { type: 'open-phase-segment', phaseKind: 'night', createdAt: AT })
    const before = projectCurrentPlayerStates(session)[11]
    session = gameSessionReducer(session, { type: 'confirm-player-state-change', seatId: 11, expectedBefore: before, after: { ...before, life: 'dead' }, segmentId: session.phaseSegments.at(-1)!.id, entryId: 'poppy-death', confirmedAt: '2026-10-01T12:00:01.000Z', reason: '合成测试：说书人确认死亡' })
    expect(pendingPoppyRecognition(session)?.impairedAtDeath).toBe(false)
    expect(gameSessionReducer(session, { type: 'open-phase-segment', phaseKind: 'day', createdAt: '2026-10-01T12:00:02.000Z' })).toBe(session)
    const applied = gameSessionReducer(session, { type: 'apply-poppy-recognition', expectedContextKey: nightContextKey(session) })
    const steps = applied.nightRuns[applied.activeNightRunId!].queue.filter(i => i.id.includes('poppy-poppy-death'))
    expect(steps).toHaveLength(2)
    expect(steps[0].systemStep?.pointedDemonLabels?.some(s => s.startsWith('7号'))).toBe(true)
    expect(steps[1].systemStep?.pointedMinionLabels?.some(s => s.startsWith('7号'))).toBe(true)
    expect(steps[1].systemStep?.bluffCount).toBeUndefined()
    expect(applied.timeline).toEqual(session.timeline)
    expect(gameSessionReducer(applied, { type: 'apply-poppy-recognition', expectedContextKey: nightContextKey(applied) })).toBe(applied)
    expect(poppyRecognitionIncomplete(applied)).toBe(true)
    const attempted = gameSessionReducer(applied, { type: 'close-active-night-run', nightRunId: applied.activeNightRunId!, closedAt: '2026-10-01T12:00:02.000Z' })
    expect(attempted.phaseSegments.at(-1)?.closedAt).toBeUndefined()
    let resumed = applied
    const originalActive = session.nightRuns[session.activeNightRunId!].activeCursorId
    for (const step of steps) {
      for (const check of step.systemStep!.checks) resumed = actNight(resumed, { type: 'system-check', checkId: check.id })
      resumed = actNight(resumed, { type: 'outcome', outcomeId: step.outcomeOptions[0].id })
      resumed = actNight(resumed, { type: 'confirm', advance: true })
    }
    expect(projected(resumed).activeCursorId).toBe(originalActive)
  })
  it('rechecks Pixie information after Vortox impairment and keeps the actual source independent from false information', () => {
    let session = gameSessionReducer(prepared(), { type: 'start-next-night-run' })
    let item = projected(session).queue.find(i => i.roleId === 'pixie')!
    const acknowledged = { ...emptyWakeDraft(), roleChoice: 'savant', systemChecks: [item.hostConfirmation!.checkId] }
    expect(item.outcomeOptions.every(o => !outcomeReady(o, item, acknowledged))).toBe(true)
    expect(item.outcomeOptions.some(o => outcomeReady(o, item, { ...acknowledged, roleChoice: 'monk' }))).toBe(true)
    session = actNight(actNight(session, { type: 'preview', id: item.id }), { type: 'activate-preview' })
    session = actNight(session, { type: 'system-check', checkId: item.hostConfirmation!.checkId })
    session = actNight(session, { type: 'outcome', outcomeId: 'record' })
    session = actNight(session, { type: 'confirm', advance: false })
    expect(session.timeline.findLast(e => e.kind === 'night_action')?.roleId).toBe('pixie')
    for (const seatId of [2, 4]) {
      const before = projectCurrentPlayerStates(session)[seatId]
      session = gameSessionReducer(session, { type: 'confirm-player-state-change', seatId, expectedBefore: before, after: { ...before, life: 'dead' }, segmentId: null, entryId: `death-${seatId}`, confirmedAt: new Date().toISOString(), reason: '合成来源判定回归' })
    }
    const action = { type: 'confirm-ability-change' as const, sourceSeatId: 8, sourceRoleId: 'pixie', seatId: 8, expectedRoleId: 'pixie', roleId: 'savant', timing: 'tonight' as const,
      reason: '已人工核对疯狂、实际标记与假信息', id: 'pixie-gain', expectedContextKey: nightContextKey(session), confirmedAt: new Date().toISOString() }
    expect(gameSessionReducer(session, { ...action, triggerSeatId: 4, informationMismatchReviewed: true })).toBe(session)
    expect(gameSessionReducer(session, { ...action, triggerSeatId: 2 })).toBe(session)
    const gained = gameSessionReducer(session, { ...action, triggerSeatId: 2, informationMismatchReviewed: true })
    expect(projectAbilityGrants(gained).find(g => g.sourceRoleId === 'pixie')?.abilityRole?.id).toBe('savant')
    expect(projectCurrentPlayerStates(gained)[2].drunk).toBe(true)
    const vortex = projectCurrentPlayerStates(session)[12]
    session = gameSessionReducer(session, { type: 'confirm-player-state-change', seatId: 12, expectedBefore: vortex, after: { ...vortex, poisoned: true }, segmentId: null, entryId: 'vortex-poison', confirmedAt: new Date().toISOString(), reason: '合成信息状态复核' })
    session = actNight(session, { type: 'begin-correction' })
    item = projected(session).queue.find(i => i.roleId === 'pixie')!
    expect(item.hostConfirmation?.expectedRoleIds).toEqual(['savant'])
    expect(item.hostConfirmation?.checkId).not.toBe(acknowledged.systemChecks[0])
  })
})
