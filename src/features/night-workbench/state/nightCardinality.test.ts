import { describe, expect, it } from 'vitest'
import { parseSessionBackup } from '../../../services/session/sessionBackup'
import { createGameArchiveRecord } from '../../../services/archive/archiveService'
import { projectCurrentPlayerStates } from '../../game-session/state/projectors'
import type { AIResultAdvice } from '../types'
import { emptyWakeDraft, outcomeReady, roleInputsSatisfied, selectedTargetCount } from './projectWakeDraft'
import { canConfirmDraft } from './workbenchGuards'
import { actNight, projected } from './nightInformation.test-support'
import { cardinalitySession } from './nightCardinality.test-support'

function current(session: ReturnType<typeof cardinalitySession>) {
  const state = projected(session), item = state.queue.find(x => x.id === state.activeCursorId)!
  return { state, item, draft: state.drafts[item.id] ?? emptyWakeDraft() }
}
function held(session: ReturnType<typeof cardinalitySession>): AIResultAdvice {
  const { state, item, draft } = current(session)
  return { id: 'held-cardinality', adviceId: 'held-cardinality', kind: 'result', nightRunId: state.nightRunId, wakeItemId: item.id,
    contextRevision: state.revision, contextKey: state.contextKey, sourceDraftRevision: draft.draftRevision, knowledgeVersion: state.knowledgeVersion,
    status: 'answer', recommendedOutcomeId: 'record', summary: '待核对', facts: [], missing: [], journalDrafts: [], playerMessageDrafts: [], stateChangeDrafts: [], authorityWarnings: [], confidence: 'low' }
}

describe('registered script night input cardinalities', () => {
  it.each([
    ['da-quan-zai-wo', 'shabaloth', 8, true, [1, 2]],
    ['wen-wu-shuang-quan', 'shabaloth', 10, true, [1, 2]],
    ['zui-ge-luan-wu', 'noble', 7, false, [1, 2, 3]],
    ['bao-meng-mi-tuan', 'noble', 7, false, [1, 2, 3]],
    ['hu-du-zhi-zheng', 'preacher', 7, false, [1]],
    ['nan-nan-di-yu', 'chambermaid', 7, false, [1, 2]],
    ['huo-shan-jiao-tuan', 'lleech', 7, false, [1]],
    ['huo-shan-jiao-tuan', 'lleech', 7, true, [1]],
    ['wu-yin-cang-sheng', 'highpriestess', 7, false, [1]],
  ] as const)('%s/%s retains every required target through the actual queue and reducer', (script, role, count, other, wanted) => {
    let session = cardinalitySession(script, role, count, other)
    const targets = Object.keys(session.seats).map(Number).filter(id => id !== current(session).item.seatId).slice(0, wanted.length)
    const authority = structuredClone(session.timeline)
    for (const seatId of targets) session = actNight(session, { type: 'target', seatId })
    expect(current(session).draft.targets).toEqual(targets)
    expect(current(session).item.targetCount).toBe(targets.length)
    session = actNight(session, { type: 'outcome', outcomeId: 'record' })
    expect(canConfirmDraft(current(session).state, current(session).item, current(session).draft)).toBe(true)
    expect(session.timeline).toEqual(authority)
    for (const seatId of targets) expect(current(session).draft.storytellerResult).toContain(`${seatId}号`)
  })

  it.each([['bad-moon-rising', 8], ['bao-yue-chu-sheng', 10], ['wei-ni-du-zun', 7]] as const)('%s Po explicitly records zero, one or three targets without inferring charge', (script, count) => {
    let session = cardinalitySession(script, 'po', count, true)
    const authority = projectCurrentPlayerStates(session)
    expect(current(session).item.allowedTargetCounts).toEqual([0, 1, 3])
    session = actNight(session, { type: 'outcome', outcomeId: 'record' })
    expect(current(session).draft.outcomeId).toBe('')
    for (const size of [0, 1, 3]) {
      session = actNight(session, { type: 'target-count-choice', count: size })
      for (let seatId = 1; seatId <= size; seatId++) session = actNight(session, { type: 'target', seatId })
      expect(current(session).draft.targets).toHaveLength(size)
      expect(selectedTargetCount(current(session).item, current(session).draft)).toBe(size)
      session = actNight(session, { type: 'outcome', outcomeId: 'record' })
      expect(canConfirmDraft(current(session).state, current(session).item, current(session).draft)).toBe(true)
      if (!size) expect(current(session).draft.storytellerResult).toContain('不选择玩家')
      session = actNight(session, { type: 'clear-draft' })
    }
    expect(projectCurrentPlayerStates(session)).toEqual(authority)
  })

  it('changing Po mode invalidates adopted/in-flight AI and persists the explicit zero choice', () => {
    let session = cardinalitySession('bad-moon-rising', 'po', 8, true)
    session = actNight(session, { type: 'target-count-choice', count: 1 })
    session = actNight(session, { type: 'target', seatId: 2 })
    const old = held(session)
    session = actNight(session, { type: 'apply-ai-advice', advice: old })
    expect(current(session).draft.outputSource?.kind).toBe('ai')
    session = actNight(session, { type: 'target-count-choice', count: 0 })
    session = actNight(session, { type: 'apply-ai-advice', advice: old })
    expect(projected(session).lastNotice).toBe('AI建议已失效')
    expect(current(session).draft).toMatchObject({ targetCountChoice: 0, targets: [], outcomeId: '' })
    session = actNight(session, { type: 'outcome', outcomeId: 'record' })
    session = actNight(session, { type: 'confirm', advance: false })
    expect(current(session).state.confirmedRecords[current(session).item.id].at(-1)?.snapshot.targetCountChoice).toBe(0)
    expect(parseSessionBackup(JSON.stringify(session))).toEqual(session)
  })

  it('Yinyangshi requires four distinct alternating good/evil roles and preserves all four facts', () => {
    let session = cardinalitySession('ji-meng-ta-xiang', 'yinyangshi', 7)
    const authority = projectCurrentPlayerStates(session)
    expect(current(session).item.roleCount).toBe(4)
    session = actNight(session, { type: 'role-choice', roleId: 'dreamer' })
    session = actNight(session, { type: 'second-role-choice', roleId: 'assassin' })
    const old = held(session)
    session = actNight(session, { type: 'additional-role-choice', index: 0, roleId: 'dreamer' })
    session = actNight(session, { type: 'additional-role-choice', index: 1, roleId: 'cerenovus' })
    expect(roleInputsSatisfied(current(session).item, current(session).draft)).toBe(false)
    session = actNight(session, { type: 'additional-role-choice', index: 0, roleId: 'empath' })
    expect(roleInputsSatisfied(current(session).item, current(session).draft)).toBe(true)
    session = actNight(session, { type: 'apply-ai-advice', advice: old })
    expect(projected(session).lastNotice).toBe('AI建议已失效')
    session = actNight(session, { type: 'outcome', outcomeId: 'record' })
    expect(current(session).draft.informationGiven).toBe('筑梦师 / 刺客 / 共情者 / 洗脑师')
    session = actNight(session, { type: 'confirm', advance: false })
    expect(projectCurrentPlayerStates(session)).toEqual(authority)
    const saved = parseSessionBackup(JSON.stringify(session))
    expect(saved).toEqual(session)
    expect(createGameArchiveRecord({ session: saved, winner: 'good' }).session).toEqual(session)
  })

  it('legacy queues project corrected inputs while preserving order, cursor and existing snapshots', () => {
    const session = cardinalitySession('zui-ge-luan-wu', 'noble', 7)
    const run = session.nightRuns[session.activeNightRunId!], item = run.queue.find(x => x.roleId === 'noble')!
    item.targetCount = 2
    run.drafts[item.id] = { ...emptyWakeDraft(), targets: [1, 2], storytellerResult: '旧主持已经记录的文本。' }
    const before = structuredClone(session)
    expect(current(session).item.targetCount).toBe(3)
    expect(current(session).draft.storytellerResult).toBe('旧主持已经记录的文本。')
    expect(outcomeReady(current(session).item.outcomeOptions[0], current(session).item, current(session).draft)).toBe(false)
    expect(projected(session).queue.map(x => x.id)).toEqual(run.queue.map(x => x.id))
    expect(projected(session).activeCursorId).toBe(run.activeCursorId)
    expect(session).toEqual(before)
  })

  it('legacy Organ Grinder choices record sobriety without changing authoritative impairments', () => {
    let session = cardinalitySession('yu-zhe-huan-yan', 'organgrinder', 7)
    const before = projectCurrentPlayerStates(session)
    expect(current(session).item.outcomeOptions.map(x => x.id)).toEqual(['choose-drunk', 'choose-sober'])
    session = actNight(session, { type: 'outcome', outcomeId: 'choose-drunk' })
    session = actNight(session, { type: 'confirm', advance: false })
    expect(current(session).draft.storytellerResult).toContain('选择醉酒')
    expect(projectCurrentPlayerStates(session)).toEqual(before)
  })

  it('rejects malformed optional choices while accepting old backups with all new fields absent', () => {
    let session = cardinalitySession('bad-moon-rising', 'po', 8, true)
    expect(parseSessionBackup(JSON.stringify(session))).toEqual(session)
    session = actNight(session, { type: 'target-count-choice', count: 0 })
    for (const patch of [{ targetCountChoice: '0' }, { targetCountChoice: 2 }, { additionalRoleChoices: ['a', 'b', 'c'] }, { additionalRoleChoices: [1] }]) {
      const broken = structuredClone(session)
      Object.assign(broken.nightRuns[broken.activeNightRunId!].drafts[current(session).item.id], patch)
      expect(() => parseSessionBackup(JSON.stringify(broken))).toThrow()
    }
  })
})
