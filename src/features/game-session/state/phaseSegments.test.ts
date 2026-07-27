import { describe, expect, it } from 'vitest'
import type { GameSessionState } from '../types'
import { closePhaseSegment, getOrCreateOpenSegment } from './phaseSegments'

function session(): GameSessionState {
  return {
    schemaVersion: 1,
    id: 'session-test',
    scriptId: 'catfishing',
    playerCount: 12,
    knowledgeVersion: 'test',
    seats: {},
    initialPlayerStates: {},
    phaseSegments: [],
    timeline: [],
    dayVoteDraft: null,
    dayActionDraft: null,
    setupDraft: null,
    nightRuns: {},
    activeNightRunId: null,
  }
}

describe('phase segments', () => {
  it('keeps repeated night records in the same open night', () => {
    const first = getOrCreateOpenSegment(session(), 'night', '2026-07-13T00:00:00.000Z')
    const second = getOrCreateOpenSegment(first.state, 'night', '2026-07-13T00:01:00.000Z')

    expect(first.segment.label).toBe('第1夜')
    expect(second.created).toBe(false)
    expect(second.segment.id).toBe(first.segment.id)
  })

  it('allows day and night segments to coexist with coherent labels', () => {
    const night = getOrCreateOpenSegment(session(), 'night', '2026-07-13T00:00:00.000Z')
    const day = getOrCreateOpenSegment(night.state, 'day', '2026-07-13T00:01:00.000Z')

    expect(day.segment.label).toBe('第1天')
    expect(day.state.phaseSegments).toHaveLength(2)
    expect(day.state.phaseSegments.every((segment) => !segment.closedAt)).toBe(true)
  })

  it('continues the day label from an existing night snapshot', () => {
    const thirdNight: GameSessionState = {
      ...session(),
      phaseSegments: [{ id: 'night-3', kind: 'night', sequence: 3, label: '第3夜', createdAt: '2026-07-13T00:00:00.000Z' }],
    }
    const day = getOrCreateOpenSegment(thirdNight, 'day', '2026-07-13T00:01:00.000Z')

    expect(day.segment.label).toBe('第3天')
  })

  it('creates the next night only after the current night is explicitly closed', () => {
    const first = getOrCreateOpenSegment(session(), 'night', '2026-07-13T00:00:00.000Z')
    const closed = closePhaseSegment(first.state, first.segment.id, '2026-07-13T01:00:00.000Z')
    const second = getOrCreateOpenSegment(closed, 'night', '2026-07-13T01:01:00.000Z')

    expect(second.segment.label).toBe('第2夜')
  })
})
