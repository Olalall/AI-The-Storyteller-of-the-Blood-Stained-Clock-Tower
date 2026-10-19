import { describe, expect, it } from 'vitest'
import { createPrototypeGameSession } from '../../features/game-session/data/createPrototypeSession'
import { parseSessionBackup } from './sessionBackup'
import { gameSessionStorageKey } from './localSessionAdapter'

describe('session backup import', () => {
  it('preserves the entire current session, including records, cursors and drafts', () => {
    const session = createPrototypeGameSession()
    expect(parseSessionBackup(JSON.stringify(session))).toEqual(session)
  })
  it('rejects malformed optional day-skill context before it can reach record rendering', () => {
    const session = createPrototypeGameSession()
    const raw = { ...session, timeline: [...session.timeline, {
      id: 'broken-day', kind: 'day_action', segmentId: null, createdAt: '2026-09-08T00:00:00Z', confirmedBy: 'storyteller',
      category: 'skill', actorSeatId: 1, targetSeatIds: [], summary: '', details: [], skillContext: {},
    }] }
    expect(() => parseSessionBackup(JSON.stringify(raw))).toThrow()
  })
  it('preserves adjusted, withdrawn votes and special execution reasons, rejecting invalid optional day fields', () => {
    const session = createPrototypeGameSession()
    const round = { id: 'adjusted-vote', kind: 'vote_round' as const, roundId: 'round', segmentId: 'night-3', createdAt: '2026-10-16T00:00:00Z', confirmedBy: 'storyteller' as const,
      nominatorSeatId: 1, nomineeSeatId: 2, threshold: 4, raisedSeatIds: [1], ghostVoteSeatIds: [], voteAdjustment: { count: 2, reason: '特殊能力' }, voided: true }
    session.timeline.push(round, { id: 'special-execution', kind: 'execution', segmentId: 'night-3', createdAt: round.createdAt, confirmedBy: 'storyteller', executedSeatId: 2, causedDeath: false, exceptionReason: '特殊能力即时处决' })
    session.dayVoteDraft = { segmentId: 'day-pending', nominatorSeatId: null, nomineeSeatId: null, threshold: 4, raisedSeatIds: [], ghostVoteSeatIds: [], voteAdjustment: { count: 1, reason: '说书人修正' } }
    expect(parseSessionBackup(JSON.stringify(session))).toEqual(session)
    for (const broken of [
      { ...round, voteAdjustment: { count: -2, reason: '结果不能小于零' } },
      { ...round, voteAdjustment: { count: 2, reason: '' } },
      { ...round, voided: 'yes' },
      { ...session.timeline.at(-1), exceptionReason: 123 },
    ]) expect(() => parseSessionBackup(JSON.stringify({ ...session, timeline: [...session.timeline.slice(0, -2), broken] }))).toThrow()
  })
  it.each([
    (s: ReturnType<typeof createPrototypeGameSession>) => { s.schemaVersion = 2 as 1 },
    (s: ReturnType<typeof createPrototypeGameSession>) => { s.scriptId = 'not-installed' },
    (s: ReturnType<typeof createPrototypeGameSession>) => { s.playerCount = 2 },
    (s: ReturnType<typeof createPrototypeGameSession>) => { s.activeNightRunId = 'missing' },
    (s: ReturnType<typeof createPrototypeGameSession>) => { s.nightRuns[s.activeNightRunId!].activeCursorId = 'missing' },
    (s: ReturnType<typeof createPrototypeGameSession>) => { s.timeline.push({ ...s.timeline[0] }) },
    (s: ReturnType<typeof createPrototypeGameSession>) => { s.timeline[0].segmentId = 'missing' },
  ])('rejects incomplete or incompatible input without touching storage', (mutate) => {
    localStorage.setItem(gameSessionStorageKey, 'untouched')
    const session = createPrototypeGameSession()
    mutate(session)
    expect(() => parseSessionBackup(JSON.stringify(session))).toThrow()
    expect(localStorage.getItem(gameSessionStorageKey)).toBe('untouched')
  })
})
