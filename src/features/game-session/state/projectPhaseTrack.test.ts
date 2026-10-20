import { describe, expect, it } from 'vitest'
import { createPrototypeGameSession } from '../data/createPrototypeSession'
import { closeOpenSegment } from './timeline'
import { projectPhaseTrack, type PhaseNodeId } from './projectPhaseTrack'
import { gameSessionReducer } from './sessionReducer'

type Session = ReturnType<typeof createPrototypeGameSession>

function blank(): Session {
  const session = createPrototypeGameSession()
  const run = session.nightRuns[session.activeNightRunId!]
  return { ...session, phaseSegments: [], timeline: [], nightRuns: { [run.id]: { ...run, phaseSegmentId: null } } }
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

  it('suggests dawn after closing the first night without opening day or returning to dusk', () => {
    const withNight = open(blank(), 'night', '2026-08-04T20:00:00.000Z')
    const closed = closeOpenSegment(withNight, 'night', '2026-08-04T20:30:00.000Z')

    expect(statusOf(closed, 'night')).toBe('done')
    expect(statusOf(closed, 'dawn')).toBe('suggest')
    expect(statusOf(closed, 'dusk')).toBe('done')
    expect(closed.phaseSegments.filter((segment) => segment.kind === 'day')).toEqual([])
  })

  it('suggests dusk after closing a day and dawn again after the following night', () => {
    const night = closeOpenSegment(open(blank(), 'night', '2026-08-04T20:00:00.000Z'), 'night', '2026-08-04T20:30:00.000Z')
    const day = closeOpenSegment(open(night, 'day', '2026-08-04T21:00:00.000Z'), 'day', '2026-08-04T21:30:00.000Z')
    expect(statusOf(day, 'dusk')).toBe('suggest')
    expect(statusOf(day, 'dawn')).toBe('done')
    const nextNight = closeOpenSegment(open(day, 'night', '2026-08-05T20:00:00.000Z'), 'night', '2026-08-05T20:30:00.000Z')
    expect(statusOf(nextNight, 'dawn')).toBe('suggest')
    expect(statusOf(nextNight, 'dusk')).toBe('done')
  })

  it('uses appended phase order when a device clock moves backward', () => {
    const night = closeOpenSegment(open(blank(), 'night', '2026-08-05T20:00:00.000Z'), 'night', '2026-08-05T20:30:00.000Z')
    const day = closeOpenSegment(open(night, 'day', '2026-08-04T21:00:00.000Z'), 'day', '2026-08-04T21:30:00.000Z')
    expect(statusOf(day, 'dusk')).toBe('suggest')
    const nextNight = closeOpenSegment(open(day, 'night', '2026-08-03T20:00:00.000Z'), 'night', '2026-08-03T20:30:00.000Z')
    expect(statusOf(nextNight, 'dawn')).toBe('suggest')
  })
})

describe('交接卡所在节点由主持台指定', () => {
  it('marks dawn as open while the deck sits on the dawn card', () => {
    // 关完夜后没有任何开放段，只看 session 会误判成「该进下一个黄昏」。
    const withNight = open(blank(), 'night', '2026-08-04T20:00:00.000Z')
    const closed = closeOpenSegment(withNight, 'night', '2026-08-04T20:30:00.000Z')

    expect(statusOf(closed, 'dawn')).toBe('suggest')

    const onDawn = projectPhaseTrack(closed, 'dawn')
    expect(onDawn.find((node) => node.id === 'dawn')?.status).toBe('open')
    expect(onDawn.filter((node) => node.status === 'suggest')).toHaveLength(0)
  })

  it('leaves night and day nodes to the segments even when a node is given', () => {
    const session = open(blank(), 'night', '2026-08-04T20:00:00.000Z')
    expect(projectPhaseTrack(session, 'night').find((node) => node.id === 'night')?.status).toBe('open')
  })
})
