import { describe, expect, it } from 'vitest'
import { createPrototypeGameSession } from '../data/createPrototypeSession'
import { gameSessionReducer } from './sessionReducer'
import { projectCurrentPlayerStates } from './projectors'
import { parseSessionBackup } from '../../../services/session/sessionBackup'

function withTask() {
  const session = createPrototypeGameSession()
  const source = session.timeline.find((entry) => entry.kind === 'night_action')!
  return gameSessionReducer(session, { type: 'add-state-followup', id: 'task-1', sourceEntryId: source.id, seatId: 1, note: '核对中毒', createdAt: '2026-09-08T00:00:00Z' })
}
describe('manual state followups', () => {
  it('accepts confirmed sources only, preserves authoritative state, and survives backup', () => {
    const baseline = createPrototypeGameSession()
    const added = withTask()
    expect(added.timeline).toEqual(baseline.timeline)
    expect(projectCurrentPlayerStates(added)).toEqual(projectCurrentPlayerStates(baseline))
    expect(parseSessionBackup(JSON.stringify(added))).toEqual(added)
    expect(gameSessionReducer(baseline, { type: 'add-state-followup', id: 'bad', sourceEntryId: 'draft', seatId: 1, note: '死亡', createdAt: '' })).toBe(baseline)
    const broken = structuredClone(added)
    broken.stateFollowups![0].sourceEntryId = 'missing'
    expect(() => parseSessionBackup(JSON.stringify(broken))).toThrow()
  })
  it('completes the task atomically with an accepted state record, never on stale input', () => {
    const session = withTask()
    const before = projectCurrentPlayerStates(session)[1]
    const action = { type: 'confirm-player-state-change' as const, followupId: 'task-1', seatId: 1, expectedBefore: before, after: { ...before, poisoned: !before.poisoned }, segmentId: null, entryId: 'state-1', confirmedAt: '2026-09-08T00:01:00Z', reason: '说书人核对' }
    expect(gameSessionReducer(session, { ...action, expectedBefore: action.after })).toBe(session)
    expect(gameSessionReducer(session, { ...action, seatId: 2 })).toBe(session)
    const accepted = gameSessionReducer(session, action)
    expect(accepted.stateFollowups![0].resolution?.entryId).toBe('state-1')
    expect(projectCurrentPlayerStates(accepted)[1].poisoned).toBe(!before.poisoned)
    expect(gameSessionReducer(accepted, action)).toBe(accepted)
    expect(parseSessionBackup(JSON.stringify(accepted))).toEqual(accepted)
  })
  it('requires a reason to dismiss and retains the source without changing players', () => {
    const session = withTask()
    expect(gameSessionReducer(session, { type: 'dismiss-state-followup', id: 'task-1', reason: ' ', at: '' })).toBe(session)
    const next = gameSessionReducer(session, { type: 'dismiss-state-followup', id: 'task-1', reason: '保护生效，无需改变', at: '2026-09-08T00:01:00Z' })
    expect(next.stateFollowups![0].resolution?.kind).toBe('dismissed')
    expect(next.timeline).toBe(session.timeline)
  })
})
