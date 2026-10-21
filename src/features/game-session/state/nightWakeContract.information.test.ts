import { describe, expect, it } from 'vitest'
import { projectNightResultContract } from './nightWakeContract'
import { actNight, informationSession, projected } from '../../night-workbench/state/nightInformation.test-support'
import { applyAIOutcome, applyOutcome, emptyWakeDraft, outcomeReady } from '../../night-workbench/state/projectWakeDraft'
import { canConfirmDraft } from '../../night-workbench/state/workbenchGuards'
import { projectCurrentPlayerStates } from './projectors'
import { parseSessionBackup } from '../../../services/session/sessionBackup'
import { createNightWorkbenchCommit } from '../../night-workbench/state/gameSessionAdapter'
import { gameSessionReducer } from './sessionReducer'
import type { NightActionEntry } from '../types'

function current(session: ReturnType<typeof informationSession>) {
  const state = projected(session)
  const item = state.queue.find((entry) => entry.id === state.activeCursorId)!
  return { state, item, draft: state.drafts[item.id] ?? emptyWakeDraft() }
}

describe('正式夜间信息录入', () => {
  it('图书管理员可以明确告知没有外来者，清掉原二目标和角色，不改变局面', () => {
    let session = informationSession('librarian')
    const states = projectCurrentPlayerStates(session)
    session = actNight(actNight(session, { type: 'target', seatId: 1 }), { type: 'target', seatId: 10 })
    session = actNight(session, { type: 'role-choice', roleId: 'drunk' })
    const normal = current(session)
    expect(outcomeReady(normal.item.outcomeOptions.find((option) => option.id === 'record')!, normal.item, normal.draft)).toBe(true)
    session = actNight(session, { type: 'outcome', outcomeId: 'no-outsiders' })
    const { state, item, draft } = current(session)
    expect(draft).toMatchObject({ targets: [], roleChoice: '', outcomeId: 'no-outsiders', informationGiven: '没有外来者。' })
    expect(canConfirmDraft(state, item, draft)).toBe(true)
    expect(canConfirmDraft(state, item, { ...draft, targets: [1, 10], roleChoice: 'drunk' })).toBe(false)
    session = actNight(session, { type: 'confirm', advance: false })
    expect(projectCurrentPlayerStates(session)).toEqual(states)
    expect(parseSessionBackup(JSON.stringify(session))).toEqual(session)
    const original = structuredClone(current(session).state.confirmedRecords[item.id][0])
    session = actNight(session, { type: 'begin-correction' })
    session = actNight(actNight(session, { type: 'target', seatId: 1 }), { type: 'target', seatId: 10 })
    session = actNight(session, { type: 'role-choice', roleId: 'drunk' })
    expect(current(session).draft).toMatchObject({ outcomeId: '', informationGiven: '' })
    session = actNight(session, { type: 'outcome', outcomeId: 'record' })
    session = actNight(session, { type: 'confirm', advance: false })
    const records = current(session).state.confirmedRecords[item.id]
    expect(records).toHaveLength(2)
    expect(records[0]).toEqual(original)
    expect(records[1]).toMatchObject({ correctionOf: original.id, snapshot: { targets: [1, 10], roleChoice: 'drunk' } })
  })

  it.each(['chef', 'empath', 'mathematician', 'oracle', 'chambermaid'])('%s必须填写合法正式数字，不能只写已记录或通过AI绕过', (roleId) => {
    const seed = current(informationSession('chef')).item
    const item = projectNightResultContract({ ...seed, roleId, targetCount: roleId === 'chambermaid' ? 2 : 0 }, 7)
    const option = item.outcomeOptions.find((entry) => entry.id === 'record')!
    const targets = roleId === 'chambermaid' ? [2, 3] : []
    for (const value of ['', '-1', '1.5', '8', 'NaN']) {
      const draft = { ...emptyWakeDraft(), targets, informationGiven: value }
      expect(outcomeReady(option, item, draft)).toBe(false)
      expect(applyAIOutcome(item, draft, 'record', { adviceId: 'invalid', contextRevision: 1, sourceDraftRevision: 0, knowledgeVersion: 'test' })).toBe(draft)
    }
    const draft = applyOutcome(item, { ...emptyWakeDraft(), targets, informationGiven: '0' }, 'record')
    expect(draft).toMatchObject({ outcomeId: 'record', informationGiven: '0' })
    expect(draft.storytellerResult).toContain('0')
    if (roleId === 'empath' || roleId === 'chambermaid') expect(outcomeReady(option, item, { ...draft, informationGiven: '3' })).toBe(false)
  })

  it('数字手填会作废旧候选；毒醉仍由主持选择错误答案，确认和恢复不改权威状态', () => {
    let session = informationSession('chef')
    const { item } = current(session)
    session.initialPlayerStates[item.seatId].poisoned = true
    const before = projectCurrentPlayerStates(session)
    session = actNight(session, { type: 'information', value: '2' })
    session = actNight(session, { type: 'outcome', outcomeId: 'record' })
    expect(current(session).draft).toMatchObject({ informationGiven: '2', outcomeId: 'record' })
    session = actNight(session, { type: 'information', value: '0' })
    expect(current(session).draft).toMatchObject({ informationGiven: '0', outcomeId: '', storytellerResult: '' })
    session = actNight(session, { type: 'outcome', outcomeId: 'record' })
    session = actNight(session, { type: 'confirm', advance: false })
    expect(current(session).state.confirmedRecords[item.id][0].snapshot.informationGiven).toBe('0')
    expect(projectCurrentPlayerStates(session)).toEqual(before)
    expect(parseSessionBackup(JSON.stringify(session))).toEqual(session)
  })

  it.each(['towncrier', 'flowergirl', 'seamstress', 'villageidiot'])('%s使用主持明确选定的信息，不根据实际阵营自动推算', (roleId) => {
    const seed = current(informationSession('chef')).item
    const targetCount = roleId === 'seamstress' ? 2 : roleId === 'villageidiot' ? 1 : 0
    const item = projectNightResultContract({ ...seed, roleId, targetCount }, 7)
    const ids = roleId === 'villageidiot' ? ['good', 'evil'] : ['yes', 'no']
    for (const id of ids) {
      const draft = applyOutcome(item, { ...emptyWakeDraft(), targets: [2, 3].slice(0, targetCount) }, id)
      expect(draft.outcomeId).toBe(id)
      expect(draft.informationGiven).toBeTruthy()
    }
    expect(item.outcomeOptions.some((option) => option.id === 'record')).toBe(false)
  })

  it('酒鬼假神谕者保留真实身份与假能力版本，仍提供手填数字', () => {
    const seed = current(informationSession('chef')).item
    const item = projectNightResultContract({ ...seed, roleId: 'drunk', interactionVersion: 'drunk/pretend-oracle-v1' }, 7)
    expect(item.roleId).toBe('drunk')
    expect(item.interactionVersion).toBe('drunk/pretend-oracle-v1')
    expect(applyOutcome(item, { ...emptyWakeDraft(), informationGiven: '2' }, 'record').informationGiven).toBe('2')
    expect(outcomeReady(item.outcomeOptions[0], item, emptyWakeDraft())).toBe(false)
  })

  it.each(['', '1.5', '3'])('直接提交或历史更正也不能绕过共情者数字约束：%s', (value) => {
    let session = informationSession('empath')
    session = actNight(session, { type: 'information', value: '1' })
    session = actNight(actNight(session, { type: 'outcome', outcomeId: 'record' }), { type: 'confirm', advance: false })
    const entry = session.timeline.findLast((item): item is NightActionEntry => item.kind === 'night_action')!
    const snapshot = { ...entry.record.snapshot, informationGiven: value }
    const { state } = current(session)
    const commit = createNightWorkbenchCommit(state, { session, dispatchSession: () => {} })
    commit.records.push({ ...state.confirmedRecords[state.activeCursorId][0], id: 'invalid-number', correctionOf: entry.id, revision: 2, snapshot })
    expect(gameSessionReducer(session, commit)).toBe(session)
    expect(gameSessionReducer(session, { type: 'append-correction', originalEntryId: entry.id,
      entry: { ...entry, record: { revision: 2, snapshot }, correctionReason: '不能以直接命令绕过校验' }, input: { id: 'invalid-history', createdAt: '2026-10-21T00:00:00.000Z' } })).toBe(session)
  })

  it('旧已确认的无数字记录仍可恢复，旧未确认通用草稿需要重新填写答案', () => {
    let session = informationSession('chef')
    const { item } = current(session)
    const run = session.nightRuns[session.activeNightRunId!]
    const legacy = { ...emptyWakeDraft(), outcomeId: 'record', storytellerResult: '厨师本夜已记录。', outputSource: { kind: 'preset' as const, templateId: 'record', specVersion: 'legacy' } }
    run.queue.find((candidate) => candidate.id === item.id)!.outcomeOptions = [{ id: 'record', label: '已记录', requiredInputs: [], resultTemplate: '{actor}本夜已记录。' }]
    delete run.queue.find((candidate) => candidate.id === item.id)!.informationInput
    run.drafts[item.id] = legacy
    expect(current(session).draft.outcomeId).toBe('')
    run.queue.find((candidate) => candidate.id === item.id)!.progress = 'confirmed'
    session.timeline.push({ id: 'legacy-chef', kind: 'night_action', segmentId: run.phaseSegmentId, createdAt: '2026-10-16T00:00:00.000Z', confirmedBy: 'storyteller', nightRunId: run.id, wakeItemId: item.id, summary: legacy.storytellerResult, details: [], record: { revision: 1, snapshot: legacy } })
    expect(parseSessionBackup(JSON.stringify(session))).toEqual(session)
    expect(current(session).state.confirmedRecords[item.id][0].snapshot).toEqual(legacy)
  })
})
