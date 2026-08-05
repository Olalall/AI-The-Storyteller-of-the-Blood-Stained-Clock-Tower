import { describe, expect, it } from 'vitest'
import { createPrototypeGameSession } from '../game-session/data/createPrototypeSession'
import { gameSessionReducer } from '../game-session/state/sessionReducer'
import { closeOpenSegment } from '../game-session/state/timeline'
import { deckNodeForSession, isFirstNight, latestNightSegmentId, nextDayLabel, nextNightLabel } from './deckNode'

type Session = ReturnType<typeof createPrototypeGameSession>

function blank(): Session {
  return { ...createPrototypeGameSession(), phaseSegments: [], timeline: [] }
}

function open(session: Session, phaseKind: 'day' | 'night', createdAt: string) {
  return gameSessionReducer(session, { type: 'open-phase-segment', phaseKind, createdAt })
}

describe('deckNodeForSession', () => {
  it('starts at dusk when nothing is open', () => {
    expect(deckNodeForSession(blank())).toBe('dusk')
    expect(isFirstNight(blank())).toBe(true)
  })

  it('restores the open night or day instead of resetting the deck', () => {
    expect(deckNodeForSession(open(blank(), 'night', '2026-08-04T20:00:00.000Z'))).toBe('night')
    expect(deckNodeForSession(open(blank(), 'day', '2026-08-04T09:00:00.000Z'))).toBe('day')
  })

  it('prefers the later segment when a day and a night are both open', () => {
    const withDay = open(blank(), 'day', '2026-08-04T09:00:00.000Z')
    expect(deckNodeForSession(open(withDay, 'night', '2026-08-04T20:00:00.000Z'))).toBe('night')
  })

  it('lands back on dusk after everything is closed', () => {
    const withNight = open(blank(), 'night', '2026-08-04T20:00:00.000Z')
    expect(deckNodeForSession(closeOpenSegment(withNight, 'night', '2026-08-04T20:30:00.000Z'))).toBe('dusk')
  })

  it('never mutates the session', () => {
    const session = open(blank(), 'night', '2026-08-04T20:00:00.000Z')
    const snapshot = JSON.stringify(session)
    deckNodeForSession(session)
    latestNightSegmentId(session)
    expect(JSON.stringify(session)).toBe(snapshot)
  })
})

describe('相位标签', () => {
  it('counts the next night and day when none is open', () => {
    const session = blank()
    expect(nextNightLabel(session)).toBe('第1夜')
    expect(nextDayLabel(session)).toBe('第1天')
  })

  it('reuses the open segment label instead of counting past it', () => {
    const withNight = open(blank(), 'night', '2026-08-04T20:00:00.000Z')
    expect(nextNightLabel(withNight)).toBe(withNight.phaseSegments[0].label)
    expect(isFirstNight(withNight)).toBe(false)
  })

  it('points at the most recent night for the dawn diff', () => {
    const first = open(blank(), 'night', '2026-08-04T20:00:00.000Z')
    const closed = closeOpenSegment(first, 'night', '2026-08-04T20:30:00.000Z')
    const second = open(closed, 'night', '2026-08-05T20:00:00.000Z')
    const latest = second.phaseSegments.filter((segment) => segment.kind === 'night').at(-1)
    expect(latestNightSegmentId(second)).toBe(latest?.id)
  })
})
