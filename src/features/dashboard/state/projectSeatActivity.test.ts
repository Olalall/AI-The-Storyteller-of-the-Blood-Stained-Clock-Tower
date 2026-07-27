import { describe, expect, it } from 'vitest'
import { createPrototypeGameSession } from '../../game-session/data/createPrototypeSession'
import { gameSessionReducer } from '../../game-session/state/sessionReducer'
import { projectSeatActivity } from './projectSeatActivity'

describe('projectSeatActivity', () => {
  it('filters structured night and vote facts for one seat without parsing free text', () => {
    const session = gameSessionReducer(createPrototypeGameSession(), {
      type: 'append-phase-entry',
      phaseKind: 'day',
      entry: {
        kind: 'vote_round',
        roundId: 'activity-vote',
        nominatorSeatId: 3,
        nomineeSeatId: 4,
        threshold: 6,
        raisedSeatIds: [2, 3, 4],
        ghostVoteSeatIds: [2],
      },
      input: { id: 'activity-vote-entry', createdAt: '2026-07-14T12:00:00.000Z' },
    })

    expect(projectSeatActivity(session, 3).some((entry) => entry.summary.includes('提名4号') && entry.summary.includes('本轮举手'))).toBe(true)
    expect(projectSeatActivity(session, 9).some((entry) => entry.summary.startsWith('被选为目标：'))).toBe(true)
  })

  it('filters structured day skills and public events by actor and related seats', () => {
    const withSkill = gameSessionReducer(createPrototypeGameSession(), {
      type: 'append-phase-entry',
      phaseKind: 'day',
      entry: {
        kind: 'day_action',
        category: 'skill',
        actorSeatId: 3,
        targetSeatIds: [5, 6],
        summary: '3号发动白天技能 → 5、6号',
        details: [],
      },
      input: { id: 'activity-day-skill', createdAt: '2026-07-14T12:02:00.000Z' },
    })
    const session = gameSessionReducer(withSkill, {
      type: 'append-phase-entry',
      phaseKind: 'day',
      entry: {
        kind: 'day_action',
        category: 'public_event',
        actorSeatId: null,
        targetSeatIds: [6],
        summary: '公开事件：6号公开声明',
        details: [],
      },
      input: { id: 'activity-public-event', createdAt: '2026-07-14T12:03:00.000Z' },
    })

    expect(projectSeatActivity(session, 3).some((entry) => entry.summary === '发动白天技能')).toBe(true)
    expect(projectSeatActivity(session, 5).some((entry) => entry.summary === '白天技能目标')).toBe(true)
    expect(projectSeatActivity(session, 6).some((entry) => entry.summary === '公开事件涉及')).toBe(true)
    expect(projectSeatActivity(session, 7).some((entry) => entry.summary.includes('白天技能') || entry.summary.includes('公开事件'))).toBe(false)
  })

  it('uses the latest day-action correction for current player activity while retaining audit history elsewhere', () => {
    const withOriginal = gameSessionReducer(createPrototypeGameSession(), {
      type: 'append-phase-entry',
      phaseKind: 'day',
      entry: {
        kind: 'day_action',
        category: 'skill',
        actorSeatId: 3,
        targetSeatIds: [5],
        summary: '3号发动白天技能 → 5号',
        details: [],
      },
      input: { id: 'activity-correction-original', createdAt: '2026-07-14T12:10:00.000Z' },
    })
    const corrected = gameSessionReducer(withOriginal, {
      type: 'append-correction',
      originalEntryId: 'activity-correction-original',
      entry: {
        kind: 'day_action',
        category: 'skill',
        actorSeatId: 3,
        targetSeatIds: [6],
        summary: '3号发动白天技能 → 6号',
        details: [],
        correctionReason: '目标座位看错',
      },
      input: { id: 'activity-correction-next', createdAt: '2026-07-14T12:11:00.000Z' },
    })

    expect(projectSeatActivity(corrected, 5).some((entry) => entry.summary === '白天技能目标')).toBe(false)
    expect(projectSeatActivity(corrected, 6).some((entry) => entry.summary === '白天技能目标')).toBe(true)
  })
})
