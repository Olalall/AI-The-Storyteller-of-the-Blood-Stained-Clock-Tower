import { describe, expect, it } from 'vitest'
import { getSmartScriptPack, roleSnapshotsForScript, roleTeamByIdForScript, smartScriptPacks } from '../../../domain/scripts'
import { createGameArchiveRecord } from '../../../services/archive/archiveService'
import { parseSessionBackup } from '../../../services/session/sessionBackup'
import { gameSessionStorageKey } from '../../../services/session/localSessionAdapter'
import { projectCurrentAssignments, projectCurrentPlayerStates } from '../../game-session/state/projectors'
import { gameSessionReducer } from '../../game-session/state/sessionReducer'
import type { AIResultAdvice, WakeDraft } from '../types'
import { currentKazali, fillKazaliPairs, kazaliPairSession } from './kazaliPairs.test-support'
import { actNight, projected } from './nightInformation.test-support'
import { applyOutcome, emptyWakeDraft, outcomeReady, targetRoleChoicesSatisfied } from './projectWakeDraft'
import { projectNightInteraction } from './projectNightInteraction'
import { canConfirmDraft } from './workbenchGuards'

function held(session: ReturnType<typeof kazaliPairSession>): AIResultAdvice {
  const { state, item, draft } = currentKazali(session)
  return { id: 'held-kazali', adviceId: 'held-kazali', kind: 'result', nightRunId: state.nightRunId, wakeItemId: item.id,
    contextRevision: state.revision, contextKey: state.contextKey, sourceDraftRevision: draft.draftRevision, knowledgeVersion: state.knowledgeVersion,
    status: 'answer', recommendedOutcomeId: 'record', summary: '爪牙分配草稿', facts: [], missing: [], journalDrafts: [], playerMessageDrafts: [], stateChangeDrafts: [], authorityWarnings: [], confidence: 'medium' }
}

describe('Kazali paired first-night inputs', () => {
  it.each([
    [7, 'punchy', 1], [8, 'one-in-one-out', 1], [9, 'punchy', 1],
    [10, 'punchy', 2], [11, 'one-in-one-out', 2], [12, 'devout-theists', 2],
    [13, 'punchy', 3], [14, 'punchy', 3], [15, 'devout-theists', 3],
  ] as const)('requires %i-player normal Minion allocations from the real %s queue', (count, scriptId, expected) => {
    let session = kazaliPairSession(count, scriptId)
    const beforeAssignments = projectCurrentAssignments(session), beforeStates = projectCurrentPlayerStates(session)
    const beforeTimeline = structuredClone(session.timeline)
    const { item } = currentKazali(session)
    expect(item.targetRoleChoiceCount).toBe(expected)
    expect(item.targetCount).toBe(expected)
    expect(item.roleChoices!.map((role) => role.id)).toEqual(getSmartScriptPack(scriptId).roles.filter((role) => role.team === 'minion').map((role) => role.id))
    expect(item.outcomeOptions.map((option) => option.id)).toEqual(['record'])
    session = actNight(session, { type: 'outcome', outcomeId: 'record' })
    expect(currentKazali(session).draft.outcomeId).toBe('')
    session = fillKazaliPairs(session)
    session = actNight(session, { type: 'outcome', outcomeId: 'record' })
    const current = currentKazali(session)
    expect(current.draft.targets).toEqual([6, 2, 4].slice(0, expected))
    expect(current.draft.informationGiven).toBe('')
    expect(canConfirmDraft(current.state, current.item, current.draft)).toBe(true)
    expect(session.timeline).toEqual(beforeTimeline)
    session = actNight(session, { type: 'confirm', advance: false })
    expect(projectCurrentAssignments(session)).toEqual(beforeAssignments)
    expect(projectCurrentPlayerStates(session)).toEqual(beforeStates)
    expect(currentKazali(session).state.confirmedRecords[item.id].at(-1)?.snapshot.targetRoleChoices).toEqual(current.draft.targetRoleChoices)
    expect(parseSessionBackup(JSON.stringify(session))).toEqual(session)
    expect(createGameArchiveRecord({ session, winner: 'good' }).session).toEqual(session)
  })

  it('repairs form metadata for every affected registered script without mutating saved items', () => {
    const example = currentKazali(kazaliPairSession()).item
    const packs = smartScriptPacks.filter((pack) => pack.roles.some((role) => role.id === 'kazali'))
    expect(packs.length).toBeGreaterThanOrEqual(11)
    for (const pack of packs) {
      const old = { ...example, targetRoleChoiceCount: undefined, targetCount: 1, roleChoices: undefined }
      const before = structuredClone(old)
      const first = projectNightInteraction(old, pack.scriptId, { nightType: 'first', playerCount: 15 })
      const other = projectNightInteraction(old, pack.scriptId, { nightType: 'other', playerCount: 15 })
      expect(first.targetRoleChoiceCount).toBe(3)
      const teams = roleTeamByIdForScript(pack.scriptId)
      expect(first.roleChoices!.every((choice) => teams[choice.id] === 'minion')).toBe(true)
      expect(first.roleChoices!.length).toBeGreaterThanOrEqual(3)
      expect(other).toMatchObject({ targetCount: 1, targetRoleChoiceCount: undefined, roleChoices: undefined })
      expect(old).toEqual(before)
    }
  })

  it('rejects incomplete, duplicate, non-Minion, out-of-range or desynchronized pairs even for zero-input outcomes', () => {
    const { state, item, draft } = currentKazali(fillKazaliPairs(kazaliPairSession()))
    const choices = draft.targetRoleChoices!
    const malformed: WakeDraft[] = [
      { ...draft, targetRoleChoices: undefined }, { ...draft, targetRoleChoices: choices.slice(0, 2) },
      { ...draft, targetRoleChoices: choices.map((choice, index) => index === 1 ? { ...choice, roleId: '' } : choice) },
      { ...draft, targets: [6, 6, 4], targetRoleChoices: choices.map((choice, index) => index === 1 ? { ...choice, seatId: 6 } : choice) },
      { ...draft, targetRoleChoices: choices.map((choice, index) => index === 1 ? { ...choice, roleId: choices[0].roleId } : choice) },
      { ...draft, targetRoleChoices: choices.map((choice, index) => index === 1 ? { ...choice, roleId: 'steward' } : choice) },
      { ...draft, targets: [6, 14, 4], targetRoleChoices: choices.map((choice, index) => index === 1 ? { ...choice, seatId: 14 } : choice) },
      { ...draft, targets: [2, 6, 4] },
    ]
    for (const bad of malformed) {
      expect(targetRoleChoicesSatisfied(item, bad, state.playerCount)).toBe(false)
      expect(canConfirmDraft(state, item, { ...bad, outcomeId: 'record', storytellerResult: '伪造结果', outputSource: { kind: 'preset', templateId: 'record', specVersion: item.interactionVersion } })).toBe(false)
    }
    for (const id of ['skip', 'hold']) expect(outcomeReady({ id, label: id, requiredInputs: [], resultTemplate: '不发动' }, item, emptyWakeDraft())).toBe(false)
    const leaky = { ...item, outcomeOptions: [{ id: 'record', label: '记录结果', requiredInputs: [] as [], resultTemplate: '{targetRoles}', informationTemplate: '{targetRoles}' }] }
    expect(applyOutcome(leaky, draft, 'record').informationGiven).toBe('')
  })

  it.each(['seat', 'role'] as const)('invalidates adopted and in-flight AI when a paired %s changes', (field) => {
    let session = fillKazaliPairs(kazaliPairSession())
    const before = structuredClone(session.timeline), advice = held(session)
    session = actNight(session, { type: 'apply-ai-advice', advice })
    const oldRevision = currentKazali(session).draft.draftRevision
    session = actNight(session, { type: 'target-role-choice', index: 1, ...(field === 'seat' ? { seatId: 1 } : { roleId: currentKazali(session).item.roleChoices![3].id }) })
    expect(currentKazali(session).draft).toMatchObject({ draftRevision: oldRevision + 1, outcomeId: '', storytellerResult: '', informationGiven: '' })
    expect(currentKazali(session).draft.outputSource).toBeUndefined()
    session = actNight(session, { type: 'apply-ai-advice', advice })
    expect(projected(session).lastNotice).toBe('AI建议已失效')
    expect(session.timeline).toEqual(before)
    const expected = currentKazali(session).draft.targetRoleChoices!.map((choice) => choice.seatId)
    expect(currentKazali(session).draft.targets).toEqual(expected)
  })

  it('blocks a ten-player imported draft that refers to an eleventh seat despite otherwise valid pairs', () => {
    const session = fillKazaliPairs(kazaliPairSession(10))
    const { state, item, draft } = currentKazali(session)
    const imported: WakeDraft = { ...draft, targets: [6, 11], targetRoleChoices: [draft.targetRoleChoices![0], { seatId: 11, roleId: draft.targetRoleChoices![1].roleId }],
      outcomeId: 'record', storytellerResult: '导入的越界选择', outputSource: { kind: 'preset', templateId: 'record', specVersion: item.interactionVersion } }
    expect(targetRoleChoicesSatisfied(item, imported, 10)).toBe(false)
    expect(canConfirmDraft(state, item, imported)).toBe(false)
  })

  it('rejects invalid or readonly edits without changing the draft or record', () => {
    let session = fillKazaliPairs(kazaliPairSession())
    const same = currentKazali(session).draft.targetRoleChoices![0]
    for (const action of [
      { type: 'target-role-choice', index: 0, ...same }, { type: 'target-role-choice', index: -1, seatId: 1 },
      { type: 'target-role-choice', index: 3, seatId: 1 }, { type: 'target-role-choice', index: 0, seatId: 14 },
      { type: 'target-role-choice', index: 0, roleId: 'kazali' }, { type: 'target-role-choice', index: 0, seatId: 2 },
      { type: 'target-role-choice', index: 0, roleId: currentKazali(session).draft.targetRoleChoices![1].roleId },
      { type: 'target', seatId: 1 }, { type: 'role-choice', roleId: 'harpy' },
    ] as const) expect(actNight(session, action)).toBe(session)
    session = actNight(actNight(session, { type: 'outcome', outcomeId: 'record' }), { type: 'confirm', advance: false })
    expect(actNight(session, { type: 'target-role-choice', index: 0, seatId: 1 })).toBe(session)
    const original = structuredClone(currentKazali(session).state.confirmedRecords[currentKazali(session).item.id][0])
    session = actNight(session, { type: 'begin-correction' })
    session = actNight(session, { type: 'target-role-choice', index: 0, seatId: 1 })
    session = actNight(actNight(session, { type: 'outcome', outcomeId: 'record' }), { type: 'confirm', advance: false })
    const records = currentKazali(session).state.confirmedRecords[currentKazali(session).item.id]
    expect(records).toHaveLength(2)
    expect(records[0]).toEqual(original)
    expect(records[1]).toMatchObject({ correctionOf: original.id, snapshot: { targets: [1, 2, 4] } })
  })

  it('roundtrips an old confirmed single-target snapshot without migration, while a correction needs all new pairs', () => {
    let session = kazaliPairSession()
    session = gameSessionReducer(session, { type: 'open-phase-segment', phaseKind: 'night', createdAt: '2026-10-18T00:00:00Z' })
    const run = session.nightRuns[session.activeNightRunId!], item = run.queue.find((entry) => entry.roleId === 'kazali')!
    const legacy: WakeDraft = { ...emptyWakeDraft(), targets: [2], roleChoice: 'harpy', outcomeId: 'record', playerChoice: '旧单人选择', storytellerResult: '旧首夜已记录。' }
    delete item.targetRoleChoiceCount
    item.targetCount = 1
    item.roleChoices = roleSnapshotsForScript(session.scriptId).map((role) => ({ id: role.id, label: role.name }))
    item.progress = 'confirmed'
    run.drafts[item.id] = structuredClone(legacy)
    session.timeline.push({ id: `${item.id}-record-1`, kind: 'night_action', nightRunId: run.id, wakeItemId: item.id, segmentId: run.phaseSegmentId, createdAt: '2026-10-18T00:00:01Z', confirmedBy: 'storyteller', summary: legacy.storytellerResult, details: [], record: { revision: 1, snapshot: structuredClone(legacy) } })
    const raw = JSON.stringify(session), restored = parseSessionBackup(raw)
    expect(JSON.stringify(restored)).toBe(raw)
    expect(projected(restored).confirmedRecords[item.id][0].snapshot).toEqual(legacy)
    expect(JSON.stringify(restored)).toBe(raw)
    session = actNight(restored, { type: 'begin-correction' })
    expect(canConfirmDraft(currentKazali(session).state, currentKazali(session).item, currentKazali(session).draft)).toBe(false)
    expect(session.timeline).toEqual(restored.timeline)
  })

  it('accepts a partial saved row, rejects malformed fields and orphan allocation sources before touching storage', () => {
    let session = kazaliPairSession(7)
    session = actNight(session, { type: 'target-role-choice', index: 0, seatId: 2 })
    expect(currentKazali(session).draft.targetRoleChoices).toEqual([{ seatId: 2, roleId: '' }])
    expect(parseSessionBackup(JSON.stringify(session))).toEqual(session)
    const { item } = currentKazali(session)
    localStorage.setItem(gameSessionStorageKey, 'untouched')
    for (const bad of [null, {}, [null], [{ seatId: -1, roleId: '' }], [{ seatId: 2.1, roleId: '' }], [{ seatId: 8, roleId: 'harpy' }], [{ seatId: 2, roleId: 'x'.repeat(101) }], Array(4).fill({ seatId: 0, roleId: '' })]) {
      const broken = structuredClone(session)
      Object.assign(broken.nightRuns[broken.activeNightRunId!].drafts[item.id], { targetRoleChoices: bad })
      expect(() => parseSessionBackup(JSON.stringify(broken))).toThrow()
      expect(localStorage.getItem(gameSessionStorageKey)).toBe('untouched')
    }
    const roles = roleSnapshotsForScript(session.scriptId)
    const source = { id: 'orphan-source', kind: 'setup_changed' as const, segmentId: null, createdAt: '2026-10-18T00:00:00Z', confirmedBy: 'storyteller' as const, baseSetupId: 'setup', originNightRunId: session.activeNightRunId!, sourceNightActionId: 'does-not-exist', seatId: 2, fromRole: roles[0], toRole: roles[1], reason: '孤儿来源', effectiveFrom: 'future_workbenches' as const }
    expect(() => parseSessionBackup(JSON.stringify({ ...session, timeline: [...session.timeline, source] }))).toThrow()
  })

  it('keeps a single attack target and no Minion choice on the actual later-night queue', () => {
    let session = kazaliPairSession(7, 'punchy', true)
    const { item } = currentKazali(session)
    const assignments = projectCurrentAssignments(session), states = projectCurrentPlayerStates(session)
    expect(item).toMatchObject({ targetCount: 1, targetRoleChoiceCount: undefined, roleChoices: undefined })
    session = actNight(session, { type: 'target', seatId: 2 })
    session = actNight(session, { type: 'outcome', outcomeId: 'record' })
    expect(canConfirmDraft(currentKazali(session).state, item, currentKazali(session).draft)).toBe(true)
    expect(currentKazali(session).draft.storytellerResult).toContain('攻击2号')
    expect(currentKazali(session).draft.targetRoleChoices).toBeUndefined()
    session = actNight(session, { type: 'confirm', advance: false })
    expect(projectCurrentAssignments(session)).toEqual(assignments)
    expect(projectCurrentPlayerStates(session)).toEqual(states)
  })
})
