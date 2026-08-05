import { describe, expect, it } from 'vitest'
import { createPrototypeGameSession } from '../data/createPrototypeSession'
import { closeOpenSegment } from './timeline'
import { projectPhaseTrack, type PhaseNodeId } from './projectPhaseTrack'
import { gameSessionReducer } from './sessionReducer'

type Session = ReturnType<typeof createPrototypeGameSession>

function blank(): Session {
  return { ...createPrototypeGameSession(), phaseSegments: [], timeline: [] }
}

function open(session: Session, phaseKind: 'day' | 'night', createdAt: string) {
  return gameSessionReducer(session, { type: 'open-phase-segment', phaseKind, createdAt })
}

function statusOf(session: Session, id: PhaseNodeId) {
  return projectPhaseTrack(session).find((node) => node.id === id)?.status
}

describe('projectPhaseTrack', () => {
  it('exposes the six canonical nodes in wiki order', () => {
    expect(projectPhaseTrack(blank()).map((node) => node.id))
      .toEqual(['dusk', 'night', 'dawn', 'day', 'vote', 'execution'])
  })

  it('suggests dusk before anything has happened', () => {
    expect(statusOf(blank(), 'dusk')).toBe('suggest')
    expect(statusOf(blank(), 'night')).toBe('idle')
  })

  it('marks the open night and suggests dawn next', () => {
    const session = open(blank(), 'night', '2026-08-04T20:00:00.000Z')

    expect(statusOf(session, 'night')).toBe('open')
    expect(statusOf(session, 'dawn')).toBe('suggest')
    expect(projectPhaseTrack(session).find((node) => node.id === 'night')?.segmentLabel).toBeTruthy()
  })

  it('keeps both an open day and an open night visible instead of collapsing to one pointer', () => {
    // 昼夜段合同允许两个段同时开放，好让说书人按现场情况补记；轨道不得把它压成单一指针。
    const withNight = open(blank(), 'night', '2026-08-04T20:00:00.000Z')
    const both = open(withNight, 'day', '2026-08-04T21:00:00.000Z')

    expect(statusOf(both, 'night')).toBe('open')
    expect(statusOf(both, 'day')).toBe('open')
    // 建议落在最近开放的那一侧，但另一侧仍然是 open 而不是被清空。
    expect(statusOf(both, 'vote')).toBe('suggest')
  })

  it('walks the day through vote and execution', () => {
    const session = open(blank(), 'day', '2026-08-04T21:00:00.000Z')
    expect(statusOf(session, 'vote')).toBe('suggest')

    const dayId = session.phaseSegments.find((segment) => segment.kind === 'day')!.id
    const voted: Session = {
      ...session,
      timeline: [...session.timeline, {
        id: 'vote-1', kind: 'vote_round', segmentId: dayId, createdAt: '2026-08-04T21:05:00.000Z',
        confirmedBy: 'storyteller', roundId: 'r1', nominatorSeatId: 1, nomineeSeatId: 2,
        threshold: 6, raisedSeatIds: [1, 2, 3, 4, 5, 6], ghostVoteSeatIds: [],
      }],
    } as Session

    expect(statusOf(voted, 'vote')).toBe('open')
    expect(statusOf(voted, 'execution')).toBe('suggest')

    const executed: Session = {
      ...voted,
      timeline: [...voted.timeline, {
        id: 'exec-1', kind: 'execution', segmentId: dayId, createdAt: '2026-08-04T21:10:00.000Z',
        confirmedBy: 'storyteller', executedSeatId: 2, causedDeath: true,
      }],
    } as Session

    expect(statusOf(executed, 'vote')).toBe('done')
    expect(statusOf(executed, 'execution')).toBe('done')
  })

  it('never mutates the session it reads', () => {
    const session = open(blank(), 'night', '2026-08-04T20:00:00.000Z')
    const snapshot = JSON.stringify(session)

    projectPhaseTrack(session)
    projectPhaseTrack(session)

    expect(JSON.stringify(session)).toBe(snapshot)
  })

  it('falls back to suggesting the next dusk once every segment is closed', () => {
    const withNight = open(blank(), 'night', '2026-08-04T20:00:00.000Z')
    const closed = closeOpenSegment(withNight, 'night', '2026-08-04T20:30:00.000Z')

    expect(statusOf(closed, 'night')).toBe('done')
    expect(statusOf(closed, 'dusk')).toBe('suggest')
  })
})
