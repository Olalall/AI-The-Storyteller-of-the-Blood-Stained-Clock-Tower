import { beforeAll, describe, expect, it } from 'vitest'
import { loadSmartScriptPack, roleSnapshotsForScript } from '../../../domain/scripts'
import { createSmartScriptSetupSession } from '../data/createPrototypeSession'
import type { GameSessionState } from '../types'
import { createNextNightRun } from './createNextNightRun'
import { changedRoleNightItems } from './confirmNightRoleChange'
import { gameSessionReducer } from './sessionReducer'
import { sessionInitialNightState } from '../../night-workbench/state/gameSessionAdapter'
import { nightWorkbenchReducer } from '../../night-workbench/state/nightWorkbenchReducer'
import { applyAIOutcome, applyOutcome, emptyWakeDraft } from '../../night-workbench/state/projectWakeDraft'
import { canConfirmDraft } from '../../night-workbench/state/workbenchGuards'

const at = '2026-10-20T00:00:00.000Z'
beforeAll(() => loadSmartScriptPack('trouble-brewing'))

function fixture(scriptId = 'trouble-brewing', otherNight = false) {
  const roles = roleSnapshotsForScript(scriptId)
  let session = createSmartScriptSetupSession(scriptId, at, { playerCount: 7 })
  const ids = scriptId === 'trouble-brewing'
    ? ['soldier', 'spy', 'investigator', 'fortuneteller', 'monk', 'ravenkeeper', 'imp']
    : ['noble', 'gambler', 'dreamer', 'fortuneteller', 'balloonist', 'cerenovus', 'fanggu']
  session = gameSessionReducer(session, { type: 'set-setup-draft', draft: {
    candidateId: 'fortune-regression', revision: 1, updatedAt: at,
    assignments: ids.map((id, index) => ({ seatId: index + 1, role: roles.find((role) => role.id === id)! })), demonBluffs: [],
  } })
  session = gameSessionReducer(session, { type: 'confirm-setup', id: 'fortune-setup', confirmedAt: at })
  if (otherNight) session.phaseSegments = [{ id: 'night-1', kind: 'night', sequence: 1, label: '第1夜', createdAt: at, closedAt: at }]
  const run = createNextNightRun(session)!
  const item = run.queue.find((candidate) => candidate.roleId === 'fortuneteller')!
  run.activeCursorId = run.previewEntryId = item.id
  session.nightRuns = { [run.id]: run }
  session.activeNightRunId = run.id
  return { session, run, item }
}

function projected(session: GameSessionState) {
  const state = sessionInitialNightState({ session, dispatchSession: () => {} })!
  return { state, item: state.queue.find((entry) => entry.id === state.activeCursorId)! }
}

describe('占卜师正式回答合同', () => {
  for (const scriptId of ['trouble-brewing', 'catfishing']) for (const otherNight of [false, true]) {
    it(`${scriptId} ${otherNight ? '后续夜' : '首夜'}必须有是/否，不能只记录目标`, () => {
      const { session, item } = fixture(scriptId, otherNight)
      expect(item.outcomeOptions.map((option) => option.id)).toContain('yes')
      expect(item.outcomeOptions.map((option) => option.id)).toContain('no')
      expect(item.outcomeOptions.map((option) => option.id)).not.toContain('record')
      const { state } = projected(session)
      const targetsOnly = { ...emptyWakeDraft(), targets: [1, 7] }
      expect(applyOutcome(item, targetsOnly, 'record')).toBe(targetsOnly)
      expect(canConfirmDraft(state, item, targetsOnly)).toBe(false)
      for (const [id, answer] of [['yes', '是。'], ['no', '否。']]) {
        const draft = applyOutcome(item, targetsOnly, id)
        expect(draft.informationGiven).toBe(answer)
        expect(draft.storytellerResult).toContain(`“${answer[0]}”`)
        expect(canConfirmDraft(state, item, draft)).toBe(true)
      }
    })
  }

  it('缺少第二个目标时不能选结果，选齐也不自动按真实恶魔决定回答', () => {
    const { item } = fixture()
    const incomplete = { ...emptyWakeDraft(), targets: [7] }
    expect(applyOutcome(item, incomplete, 'yes')).toBe(incomplete)
    const complete = { ...emptyWakeDraft(), targets: [1, 7], storytellerContext: '红鲱鱼与毒醉由主持核对' }
    expect(applyOutcome(item, complete, 'no')).toMatchObject({ outcomeId: 'no', informationGiven: '否。', storytellerContext: complete.storytellerContext })
    expect(complete.outcomeId).toBe('')
  })

  it('毒醉时仍允许主持明确给是或否，且确认只追加记录，不改玩家状态', () => {
    const { session } = fixture()
    session.initialPlayerStates[4] = { ...session.initialPlayerStates[4], poisoned: true, drunk: true }
    const { state, item } = projected(session)
    expect(item.status.impairments).toEqual(['poisoned', 'drunk'])
    const draft = applyOutcome(item, { ...emptyWakeDraft(), targets: [1, 7], storytellerContext: '本夜中毒，主持决定告知否' }, 'no')
    const confirmed = nightWorkbenchReducer({ ...state, drafts: { [item.id]: draft } }, { type: 'confirm', advance: false, at })
    expect(confirmed.confirmedRecords[item.id][0].snapshot).toEqual(draft)
    expect(confirmed.seatSnapshots).toEqual(state.seatSnapshots)
    expect(session.timeline).toHaveLength(1)
  })

  it('中途换成占卜师的当晚也提供正式回答', () => {
    const { session } = fixture('trouble-brewing', true)
    const [item] = changedRoleNightItems(session, 1, 'fortuneteller', 'changed-fortune')
    expect(item.seatId).toBe(1)
    expect(item.outcomeOptions.map((option) => option.id)).toEqual(['yes', 'no', 'skip'])
  })

  it('旧局未确认的通用结果失效，但保留目标与主持补充事实', () => {
    const { session, run, item } = fixture()
    item.outcomeOptions = [{ id: 'record', label: '记录结果', requiredInputs: ['targets'], resultTemplate: '{actor}记录：{targets}。' }]
    const draft = applyOutcome(item, { ...emptyWakeDraft(), targets: [1, 7], storytellerContext: '已核对红鲱鱼' }, 'record')
    run.drafts[item.id] = draft
    const before = structuredClone(session)
    const { state, item: current } = projected(session)
    expect(current.outcomeOptions.map((option) => option.id)).toEqual(['yes', 'no'])
    expect(state.drafts[item.id]).toMatchObject({ targets: [1, 7], storytellerContext: '已核对红鲱鱼', outcomeId: '', informationGiven: '', storytellerResult: '' })
    expect(canConfirmDraft(state, current, draft)).toBe(false)
    expect(session).toEqual(before)
  })

  it('旧局已确认记录不重写，更正要补明确回答并追加新快照', () => {
    const { session, run, item } = fixture()
    item.outcomeOptions = [{ id: 'record', label: '记录结果', requiredInputs: ['targets'], resultTemplate: '{actor}记录：{targets}。' }]
    const old = applyOutcome(item, { ...emptyWakeDraft(), targets: [1, 7] }, 'record')
    item.progress = 'confirmed'
    run.drafts[item.id] = old
    session.timeline.push({ id: 'old-record', kind: 'night_action', segmentId: 'night-1', createdAt: at, confirmedBy: 'storyteller', nightRunId: run.id, wakeItemId: item.id, summary: old.storytellerResult, details: [], record: { revision: 1, snapshot: old } })
    const before = structuredClone(session.timeline)
    const { state, item: current } = projected(session)
    expect(state.confirmedRecords[item.id][0].snapshot).toEqual(old)
    const correcting = nightWorkbenchReducer(state, { type: 'begin-correction', at })
    expect(canConfirmDraft(correcting, current, correcting.drafts[item.id])).toBe(false)
    const selected = nightWorkbenchReducer(correcting, { type: 'outcome', outcomeId: 'yes', at })
    const confirmed = nightWorkbenchReducer(selected, { type: 'confirm', advance: false, at })
    expect(confirmed.confirmedRecords[item.id]).toHaveLength(2)
    expect(confirmed.confirmedRecords[item.id][0].snapshot).toEqual(old)
    expect(confirmed.confirmedRecords[item.id][1]).toMatchObject({ correctionOf: 'old-record', snapshot: { informationGiven: '是。', outcomeId: 'yes' } })
    expect(session.timeline).toEqual(before)
  })

  it('AI候选仍走同一组正式回答；不允许旧record候选绕过', () => {
    const { session } = fixture()
    const { state, item } = projected(session)
    const targets = { ...emptyWakeDraft(), targets: [1, 7] }
    const advice = { adviceId: 'fortune-ai', contextRevision: state.revision, sourceDraftRevision: targets.draftRevision, knowledgeVersion: state.knowledgeVersion, contextKey: state.contextKey }
    expect(applyAIOutcome(item, targets, 'record', advice)).toBe(targets)
    const draft = applyAIOutcome(item, targets, 'no', advice)
    expect(draft).toMatchObject({ informationGiven: '否。', outputSource: { kind: 'ai', adviceId: 'fortune-ai' } })
    expect(canConfirmDraft(state, item, draft)).toBe(true)
    expect(session.timeline).toHaveLength(1)
  })
})
