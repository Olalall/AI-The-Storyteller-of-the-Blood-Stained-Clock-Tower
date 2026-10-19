// Isolated production-reducer acceptance draft; no AI, no production writes.
import { describe, expect, it } from 'vitest'
import { changedRoleNightItems } from './confirmNightRoleChange'
import { gameSessionReducer } from './sessionReducer'
import type { GameSessionAction } from './sessionActions'
import { projectCurrentAssignments, projectCurrentPlayerStates } from './projectors'
import type { GameSessionState } from '../types'
import { createNightWorkbenchCommit, nightContextKey } from '../../night-workbench/state/gameSessionAdapter'
import { actNight, projected } from '../../night-workbench/state/nightInformation.test-support'
import { nightWorkbenchReducer } from '../../night-workbench/state/nightWorkbenchReducer'
import { canConfirmDraft } from '../../night-workbench/state/workbenchGuards'
import { emptyWakeDraft } from '../../night-workbench/state/projectWakeDraft'
import { parseSessionBackup } from '../../../services/session/sessionBackup'
import { focusLleechWake, lleechFirstNightFixture, lleechLaterNightFixture } from './lleechInitial.test-support'

type Change = Extract<GameSessionAction, { type: 'confirm-night-role-change' }>
function change(session: GameSessionState, overrides: Partial<Change> = {}): Change {
  const run = session.nightRuns[session.activeNightRunId!]
  return { type: 'confirm-night-role-change', nightRunId: run.id, seatId: 12, expectedRoleId: 'vortox', roleId: 'lleech', timing: 'initial', reason: 'gameplay',
    id: 'hatter-new-lleech-initial', expectedContextKey: nightContextKey(session), expectedRevision: run.revision,
    confirmedAt: new Date(Date.now() + 1000).toISOString(), ...overrides }
}
function initial(session: GameSessionState) {
  return projected(session).queue.find((item) => item.seatId === 12 && item.roleId === 'lleech')!
}
function withInitial() {
  const before = lleechLaterNightFixture(), after = gameSessionReducer(before, change(before))
  expect(after).not.toBe(before)
  return { before, after }
}
function readyForHost(session: GameSessionState, seatId: number) {
  session = focusLleechWake(session, initial(session).id)
  return actNight(actNight(session, { type: 'target', seatId }), { type: 'outcome', outcomeId: initial(session).outcomeOptions[0].id })
}

describe('Lleech-only initial ability phase after a later-night Hatter change', () => {
  it('adds one host initialization rather than an extra attack after the old Demon already acted', () => {
    const { before, after } = withInitial(), item = initial(after)
    const oldDemon = projected(before).queue.find((entry) => entry.seatId === 12 && entry.roleId === 'vortox')!
    expect(oldDemon.progress).toBe('confirmed')
    expect(before.timeline.some((entry) => entry.kind === 'night_action' && entry.wakeItemId.includes('hatter-9'))).toBe(true)
    expect(projected(after).nightType).toBe('other')
    expect(item).toMatchObject({ abilityPhase: 'initial', targetCount: 1, progress: 'pending' })
    expect(item.roleChoices).toBeUndefined()
    expect(item.targetRoleChoiceCount).toBeUndefined()
    expect(`${item.targetLabel} ${item.ability} ${item.storytellerPrompt}`).toMatch(/宿主|存活/)
    expect(item.outcomeOptions.map((option) => option.resultTemplate).join(' ')).not.toMatch(/攻击\{target|击杀\{target/)
    expect(after.nightRuns[after.activeNightRunId!].queue.filter((entry) => entry.seatId === 12 && entry.roleId === 'lleech')).toHaveLength(1)
    expect(projected(after).queue.find((entry) => entry.id === oldDemon.id)).toEqual(oldDemon)
    expect(after.timeline.slice(0, before.timeline.length)).toEqual(before.timeline)
    expect(projectCurrentAssignments(after).find((entry) => entry.seatId === 12)?.role.id).toBe('lleech')
    expect(projectCurrentPlayerStates(after)).toEqual(projectCurrentPlayerStates(before))
    expect(after.timeline.filter((entry) => entry.kind === 'setup_confirmed')).toEqual(before.timeline.filter((entry) => entry.kind === 'setup_confirmed'))
  })

  it('records a living host and preserves history, setup, life, poison and drunkenness', () => {
    let { before, after } = withInitial()
    const stateBefore = projectCurrentPlayerStates(after), history = structuredClone(after.timeline)
    after = readyForHost(after, 1)
    const state = projected(after), item = initial(after), draft = state.drafts[item.id]
    expect(canConfirmDraft(state, item, draft)).toBe(true)
    expect(draft.targets).toEqual([1])
    expect(draft.storytellerResult).toContain('宿主')
    expect(draft.storytellerResult).not.toMatch(/攻击1号|击杀1号/)
    expect(draft.informationGiven).toBe('')
    after = actNight(after, { type: 'confirm', advance: false })
    const record = after.timeline.findLast((entry) => entry.kind === 'night_action')!
    expect(record.kind === 'night_action' ? record.wakeItemId : '').toBe(item.id)
    if (record.kind === 'night_action') expect(record.record.snapshot.targets).toEqual([1])
    expect(after.timeline.slice(0, history.length)).toEqual(history)
    expect(projectCurrentPlayerStates(after)).toEqual(stateBefore)
    expect(projectCurrentPlayerStates(after)[3]).toMatchObject({ poisoned: true, drunk: true })
    expect(after.initialPlayerStates).toEqual(before.initialPlayerStates)
    expect(after.timeline.filter((entry) => entry.kind === 'player_state_changed')).toEqual(before.timeline.filter((entry) => entry.kind === 'player_state_changed'))
    expect(after.timeline.filter((entry) => entry.kind === 'setup_confirmed')).toHaveLength(1)
    expect(after.nightRuns[after.activeNightRunId!].queue.filter((entry) => entry.roleId === 'lleech')).toHaveLength(1)
  })

  it('cannot confirm an empty or dead host, including imported draft contents', () => {
    let { after } = withInitial()
    after = focusLleechWake(after, initial(after).id)
    let state = projected(after), item = initial(after)
    expect(canConfirmDraft(state, item, state.drafts[item.id] ?? emptyWakeDraft())).toBe(false)
    expect(item.outcomeOptions.some((option) => ['skip', 'hold'].includes(option.id))).toBe(false)
    after = readyForHost(after, 9)
    state = projected(after); item = initial(after)
    expect(projectCurrentPlayerStates(after)[9].life).toBe('dead')
    expect(canConfirmDraft(state, item, state.drafts[item.id] ?? emptyWakeDraft())).toBe(false)
    const priorTimeline = structuredClone(after.timeline)
    after = actNight(after, { type: 'confirm', advance: false })
    expect(after.timeline).toEqual(priorTimeline)
    const forged = structuredClone(after), run = forged.nightRuns[forged.activeNightRunId!]
    run.drafts[item.id] = { ...emptyWakeDraft(), targets: [9], outcomeId: item.outcomeOptions[0].id, storytellerResult: '12号痢蛭选择9号为宿主。', outputSource: { kind: 'preset', templateId: item.outcomeOptions[0].id, specVersion: item.interactionVersion } }
    const restored = parseSessionBackup(JSON.stringify(forged)), restoredState = projected(restored)
    expect(canConfirmDraft(restoredState, initial(restored), restoredState.drafts[item.id])).toBe(false)
  })

  it('rechecks host life immediately before confirmation and refuses a direct-commit bypass', () => {
    let { after } = withInitial()
    after = readyForHost(after, 1)
    const oldState = projected(after), item = initial(after)
    const localConfirmed = nightWorkbenchReducer(oldState, { type: 'confirm', advance: false })
    expect(localConfirmed.confirmedRecords[item.id]).toHaveLength(1)
    const host = projectCurrentPlayerStates(after)[1]
    after = gameSessionReducer(after, { type: 'confirm-player-state-change', seatId: 1, expectedBefore: host, after: { ...host, life: 'dead' },
      segmentId: after.nightRuns[after.activeNightRunId!].phaseSegmentId, entryId: 'host-died-before-confirm', confirmedAt: new Date(Date.now() + 2000).toISOString(), reason: '主持核对宿主选择后已死亡。' })
    const state = projected(after)
    expect(canConfirmDraft(state, initial(after), state.drafts[item.id])).toBe(false)
    const priorTimeline = structuredClone(after.timeline)
    const refused = actNight(after, { type: 'confirm', advance: false })
    expect(refused.timeline).toEqual(priorTimeline)
    expect(gameSessionReducer(after, createNightWorkbenchCommit(localConfirmed, { session: after, dispatchSession: () => {} }))).toBe(after)
  })

  it('retains initial phase across backup refresh while keeping the global night type as other', () => {
    let { after } = withInitial()
    after = readyForHost(after, 1)
    const before = structuredClone(after), restored = parseSessionBackup(JSON.stringify(after)), item = initial(restored)
    expect(restored).toEqual(before)
    expect(restored.nightRuns[restored.activeNightRunId!].nightType).toBe('other')
    expect(item.abilityPhase).toBe('initial')
    expect(item.outcomeOptions.map((option) => option.resultTemplate).join(' ')).not.toMatch(/攻击\{target|击杀\{target/)
    expect(projected(restored).drafts[item.id].targets).toEqual([1])
    const confirmed = actNight(restored, { type: 'confirm', advance: false })
    expect(parseSessionBackup(JSON.stringify(confirmed))).toEqual(confirmed)
    expect(projected(confirmed).queue.find((entry) => entry.id === item.id)?.abilityPhase).toBe('initial')
    expect(projected(confirmed).queue.filter((entry) => entry.roleId === 'lleech')).toHaveLength(1)
  })

  it('rejects an empty or multiple-host direct commit even when all supplied seats are alive', () => {
    let { after } = withInitial()
    after = readyForHost(after, 1)
    const local = nightWorkbenchReducer(projected(after), { type: 'confirm', advance: false }), item = initial(after)
    for (const targets of [[], [1, 2], [1, 1]]) {
      const commit = createNightWorkbenchCommit(local, { session: after, dispatchSession: () => {} })
      commit.records = commit.records.map((record) => record.wakeItemId === item.id ? { ...record, snapshot: { ...record.snapshot, targets } } : record)
      expect(gameSessionReducer(after, commit)).toBe(after)
    }
  })

  it('allows the initial command only for Lleech on an other night, without broadening other roles', () => {
    const first = lleechFirstNightFixture(), other = lleechLaterNightFixture()
    expect(gameSessionReducer(first, change(first))).toBe(first)
    expect(gameSessionReducer(other, change(other, { roleId: 'ojo' }))).toBe(other)
    expect(gameSessionReducer(other, change(other, { roleId: 'chef' }))).toBe(other)
    expect(changedRoleNightItems(other, 12, 'lleech', 'initial-preview', 'initial')).toHaveLength(1)
    expect(changedRoleNightItems(other, 12, 'ojo', 'invalid-initial-preview', 'initial')).toHaveLength(0)
    expect(changedRoleNightItems(other, 12, 'chef', 'invalid-chef-initial-preview', 'initial')).toHaveLength(0)
    const after = gameSessionReducer(other, change(other))
    expect(gameSessionReducer(after, change(after, { expectedRoleId: 'lleech', id: 'repeat-initial' }))).toBe(after)
  })
})
