import { describe, expect, it } from 'vitest'
import { createPrototypeGameSession } from '../data/createPrototypeSession'
import { followupSource } from './followupSource'
import { gameSessionReducer } from './sessionReducer'

function fixture() {
  const session = createPrototypeGameSession()
  const original = session.timeline.find((entry) => entry.kind === 'night_action')!
  const correction1 = { ...original, id: 'correction-1', correctionOf: original.id, summary: '第一次更正' }
  const correction2 = { ...original, id: 'correction-2', correctionOf: correction1.id, summary: '第二次更正' }
  session.timeline.push(correction1, correction2)
  return { session, original, correction2 }
}
describe('followup source corrections', () => {
  it('follows multiple explicit corrections without changing the original source', () => {
    const { session, original, correction2 } = fixture()
    expect(followupSource(session, original.id)).toEqual({ original, latest: correction2, corrected: true })
    expect(followupSource(session, correction2.id)?.corrected).toBe(false)
    expect(followupSource(session, 'missing')).toBeNull()
    const wrongRun = { ...correction2, id: 'wrong-run', correctionOf: correction2.id, nightRunId: 'other-night' }
    session.timeline.push(wrongRun)
    expect(followupSource(session, original.id)?.latest.id).toBe(correction2.id)
  })
  it('rejects creating a task from a superseded source while allowing the latest record', () => {
    const { session, original, correction2 } = fixture()
    const action = { type: 'add-state-followup' as const, id: 'task', sourceEntryId: original.id, seatId: 1, note: '核对中毒', createdAt: '2026-09-08T08:00:00Z' }
    expect(gameSessionReducer(session, action)).toBe(session)
    const next = gameSessionReducer(session, { ...action, sourceEntryId: correction2.id })
    expect(next.stateFollowups?.[0].sourceEntryId).toBe(correction2.id)
    expect(next.timeline).toBe(session.timeline)
  })
  it('keeps existing pending and completed tasks attached to their historical source', () => {
    const { session, original } = fixture()
    session.stateFollowups = [{ id: 'old-task', sourceEntryId: original.id, seatId: 1, note: '核对死亡', createdAt: '2026-09-08T08:00:00Z', resolution: { kind: 'dismissed', at: '2026-09-08T08:01:00Z', reason: '无需变更' } }]
    const before = structuredClone(session)
    expect(followupSource(session, session.stateFollowups[0].sourceEntryId)?.corrected).toBe(true)
    expect(session).toEqual(before)
  })
})
