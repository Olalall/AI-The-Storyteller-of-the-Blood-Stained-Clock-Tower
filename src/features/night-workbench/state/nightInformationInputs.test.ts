import { describe, expect, it } from 'vitest'
import { createPrototypeGameSession } from '../../game-session/data/createPrototypeSession'
import { projectCurrentPlayerStates } from '../../game-session/state/projectors'
import { parseSessionBackup } from '../../../services/session/sessionBackup'
import { createGameArchiveRecord } from '../../../services/archive/archiveService'
import type { AIResultAdvice } from '../types'
import { emptyWakeDraft, hasWakeDraftContent, roleInputsSatisfied } from './projectWakeDraft'
import { canConfirmDraft } from './workbenchGuards'
import { actNight, informationSession, projected } from './nightInformation.test-support'

function current(session: ReturnType<typeof informationSession>) {
  const state = projected(session)
  const item = state.queue.find((entry) => entry.id === state.activeCursorId)!
  return { state, item, draft: state.drafts[item.id] ?? emptyWakeDraft() }
}

function advice(session: ReturnType<typeof informationSession>): AIResultAdvice {
  const { state, item, draft } = current(session)
  return { id: 'held-advice', adviceId: 'held-advice', kind: 'result', nightRunId: state.nightRunId, wakeItemId: item.id,
    contextRevision: state.revision, contextKey: state.contextKey, sourceDraftRevision: draft.draftRevision, knowledgeVersion: state.knowledgeVersion,
    status: 'answer', recommendedOutcomeId: 'record', summary: '信息草稿', facts: [], missing: [], journalDrafts: [], playerMessageDrafts: [], stateChangeDrafts: [], authorityWarnings: [], confidence: 'medium' }
}

function completeDreamer() {
  let session = informationSession()
  for (const action of [{ type: 'target', seatId: 12 }, { type: 'role-choice', roleId: 'general' }, { type: 'second-role-choice', roleId: 'poisoner' }] as const) session = actNight(session, action)
  return session
}

describe('night information inputs and confirmed supporting facts', () => {
  it.each(['librarian', 'investigator'])('%s retains both information targets through the production session reducer', (roleId) => {
    let session = informationSession(roleId)
    const before = structuredClone(session.timeline)
    session = actNight(actNight(session, { type: 'target', seatId: 10 }), { type: 'target', seatId: 1 })
    const { item, draft } = current(session)
    expect(item.targetCount).toBe(2)
    expect(item.targetKind).toBe('storyteller_info')
    expect(draft.targets).toEqual([10, 1])
    expect(session.timeline).toEqual(before)
  })

  it('requires a good and an evil role, then records/reveals both without changing authority states', () => {
    let session = informationSession()
    const before = projectCurrentPlayerStates(session)
    session = actNight(actNight(session, { type: 'target', seatId: 12 }), { type: 'role-choice', roleId: 'general' })
    expect(roleInputsSatisfied(current(session).item, current(session).draft)).toBe(false)
    session = actNight(session, { type: 'second-role-choice', roleId: 'chef' })
    expect(roleInputsSatisfied(current(session).item, current(session).draft)).toBe(false)
    session = actNight(session, { type: 'outcome', outcomeId: 'record' })
    expect(current(session).draft.outcomeId).toBe('')
    session = actNight(session, { type: 'second-role-choice', roleId: 'poisoner' })
    session = actNight(session, { type: 'outcome', outcomeId: 'record' })
    const { state, item, draft } = current(session)
    expect(canConfirmDraft(state, item, draft)).toBe(true)
    expect(draft.storytellerResult).toContain('将军 / 投毒者')
    expect(draft.informationGiven).toBe('将军 / 投毒者')
    session = actNight(session, { type: 'confirm', advance: false })
    expect(projectCurrentPlayerStates(session)).toEqual(before)
    expect(projected(session).confirmedRecords[item.id].at(-1)?.snapshot.secondRoleChoice).toBe('poisoner')
  })

  it('projects legacy metadata without rewriting stored order, cursor, drafts or confirmed facts', () => {
    const session = createPrototypeGameSession()
    const run = session.nightRuns[session.activeNightRunId!]
    const dreamer = run.queue.find((item) => item.roleId === 'dreamer')!
    delete dreamer.roleCount
    delete dreamer.roleChoices
    const first = run.queue[0]
    first.roleId = 'investigator'
    first.targetCount = 1
    const before = structuredClone(session)
    const state = projected(session)
    expect(state.queue.find((item) => item.id === first.id)?.targetCount).toBe(2)
    expect(state.queue.find((item) => item.id === dreamer.id)).toMatchObject({ roleCount: 2 })
    expect(state.queue.find((item) => item.id === dreamer.id)?.roleChoices?.some((choice) => choice.alignment === 'good')).toBe(true)
    expect(state.queue.map((item) => item.id)).toEqual(run.queue.map((item) => item.id))
    expect(state.activeCursorId).toBe(run.activeCursorId)
    expect(state.drafts).toEqual(run.drafts)
    expect(session).toEqual(before)
    expect(parseSessionBackup(JSON.stringify(session))).toEqual(session)
  })

  it('saving checked context persists, invalidates in-flight/adopted AI and requires a fresh explicit result', () => {
    let session = completeDreamer()
    const held = advice(session)
    const originalFacts = structuredClone(session.timeline)
    const beforeState = projectCurrentPlayerStates(session)
    session = actNight(session, { type: 'apply-ai-advice', advice: held })
    expect(current(session).draft.outputSource?.kind).toBe('ai')
    const previousRevision = current(session).draft.draftRevision
    session = actNight(session, { type: 'storyteller-context', value: '  12号当前邪恶；已核对无误登记。  ' })
    expect(current(session).draft).toMatchObject({ storytellerContext: '12号当前邪恶；已核对无误登记。', draftRevision: previousRevision + 1, outcomeId: '' })
    expect(current(session).draft.outputSource).toBeUndefined()
    expect(hasWakeDraftContent(current(session).draft)).toBe(true)
    session = actNight(session, { type: 'apply-ai-advice', advice: held })
    expect(projected(session).lastNotice).toBe('AI建议已失效')
    expect(current(session).draft.outcomeId).toBe('')
    expect(session.timeline).toEqual(originalFacts)
    expect(projectCurrentPlayerStates(session)).toEqual(beforeState)
    session = actNight(session, { type: 'outcome', outcomeId: 'record' })
    session = actNight(session, { type: 'confirm', advance: false })
    const itemId = current(session).item.id
    const snapshot = projected(session).confirmedRecords[itemId].at(-1)!.snapshot
    expect(snapshot.storytellerContext).toBe('12号当前邪恶；已核对无误登记。')
    const restored = parseSessionBackup(JSON.stringify(session))
    expect(restored).toEqual(session)
    expect(createGameArchiveRecord({ session: restored, winner: 'good' }).session).toEqual(session)
    expect(session.timeline.at(-1)).toMatchObject({ details: expect.arrayContaining(['说书人已核对：12号当前邪恶；已核对无误登记。']) })
    expect(actNight(session, { type: 'storyteller-context', value: '不能改旧确认' })).toBe(session)
    const original = structuredClone(projected(session).confirmedRecords[itemId][0])
    session = actNight(session, { type: 'begin-correction' })
    session = actNight(session, { type: 'storyteller-context', value: '更正：12号有误登记，已重新核对。' })
    session = actNight(session, { type: 'outcome', outcomeId: 'record' })
    session = actNight(session, { type: 'confirm', advance: false })
    const records = projected(session).confirmedRecords[itemId]
    expect(records).toHaveLength(2)
    expect(records[0]).toEqual(original)
    expect(records[1]).toMatchObject({ correctionOf: original.id, snapshot: { storytellerContext: '更正：12号有误登记，已重新核对。' } })
  })

  it('changing the second information role rejects an older AI response while retaining both latest choices', () => {
    let session = completeDreamer()
    const held = advice(session)
    session = actNight(session, { type: 'second-role-choice', roleId: 'harpy' })
    session = actNight(session, { type: 'apply-ai-advice', advice: held })
    expect(projected(session).lastNotice).toBe('AI建议已失效')
    expect(current(session).draft).toMatchObject({ roleChoice: 'general', secondRoleChoice: 'harpy', outcomeId: '' })
  })

  it('rejects an AI response requested before newly checked facts were saved', () => {
    let session = completeDreamer()
    const held = advice(session)
    session = actNight(session, { type: 'storyteller-context', value: '12号已变为善良，不能沿用开局阵营。' })
    session = actNight(session, { type: 'apply-ai-advice', advice: held })
    expect(projected(session).lastNotice).toBe('AI建议已失效')
    expect(current(session).draft).toMatchObject({ storytellerContext: '12号已变为善良，不能沿用开局阵营。', outcomeId: '' })
    expect(current(session).draft.outputSource).toBeUndefined()
  })

  it('bounds supporting facts and rejects malformed new backup fields while preserving old optional absence', () => {
    let session = completeDreamer()
    session = actNight(session, { type: 'storyteller-context', value: '事'.repeat(1001) })
    expect(current(session).draft.storytellerContext).toHaveLength(1000)
    expect(parseSessionBackup(JSON.stringify(session))).toEqual(session)
    const itemId = current(session).item.id
    for (const patch of [{ secondRoleChoice: 1 }, { storytellerContext: [] }, { storytellerContext: '事'.repeat(1001) }]) {
      const broken = structuredClone(session)
      Object.assign(broken.nightRuns[broken.activeNightRunId!].drafts[itemId], patch)
      expect(() => parseSessionBackup(JSON.stringify(broken))).toThrow()
    }
  })
})
