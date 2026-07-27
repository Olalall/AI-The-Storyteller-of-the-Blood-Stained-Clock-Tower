import { describe, expect, it } from 'vitest'
import { emptyWakeDraft } from '../../night-workbench/state/projectWakeDraft'
import type { GameSessionState, NightActionEntry } from '../types'
import { closeOpenSegment, appendCorrection, appendPhaseEntry } from './timeline'

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

function nightAction(summary: string): Omit<NightActionEntry, 'id' | 'segmentId' | 'createdAt' | 'confirmedBy' | 'correctionOf'> {
  return {
    kind: 'night_action',
    nightRunId: 'night-run-1',
    wakeItemId: 'wake-1',
    summary,
    details: [],
    record: { revision: 1, snapshot: emptyWakeDraft() },
  }
}

describe('timeline append contract', () => {
  it('lazily creates a night only on the first confirmed night record', () => {
    const first = appendPhaseEntry(session(), 'night', nightAction('第一项'), {
      id: 'night-entry-1',
      createdAt: '2026-07-13T00:00:00.000Z',
    })
    const second = appendPhaseEntry(first.state, 'night', nightAction('第二项'), {
      id: 'night-entry-2',
      createdAt: '2026-07-13T00:01:00.000Z',
    })

    expect(first.createdSegment).toBe(true)
    expect(first.segmentId).toBe('night-1')
    expect(second.createdSegment).toBe(false)
    expect(second.entry.segmentId).toBe('night-1')
  })

  it('allows an open day record beside an open night record', () => {
    const night = appendPhaseEntry(session(), 'night', nightAction('夜间记录'), {
      id: 'night-entry-1',
      createdAt: '2026-07-13T00:00:00.000Z',
    })
    const day = appendPhaseEntry(night.state, 'day', {
      kind: 'day_action',
      category: 'public_event',
      actorSeatId: null,
      targetSeatIds: [],
      summary: '公开事件已记录',
      details: [],
    }, {
      id: 'day-entry-1',
      createdAt: '2026-07-13T00:01:00.000Z',
    })

    expect(day.segmentId).toBe('day-1')
    expect(day.state.phaseSegments.filter((segment) => !segment.closedAt)).toHaveLength(2)
  })

  it('keeps a correction on the original closed night without reopening or renumbering it', () => {
    const first = appendPhaseEntry(session(), 'night', nightAction('原记录'), {
      id: 'night-entry-1',
      createdAt: '2026-07-13T00:00:00.000Z',
    })
    const closed = closeOpenSegment(first.state, 'night', '2026-07-13T01:00:00.000Z')
    const correction = appendCorrection(closed, 'night-entry-1', nightAction('更正记录'), {
      id: 'night-entry-2',
      createdAt: '2026-07-13T02:00:00.000Z',
    })

    expect(correction).not.toBeNull()
    expect(correction?.createdSegment).toBe(false)
    expect(correction?.entry.segmentId).toBe('night-1')
    expect(correction?.entry.correctionOf).toBe('night-entry-1')
    expect(correction?.state.phaseSegments).toHaveLength(1)
    expect(correction?.state.phaseSegments[0].closedAt).toBe('2026-07-13T01:00:00.000Z')
  })

  it('allows a linear correction chain but rejects duplicate ids and forks', () => {
    const first = appendPhaseEntry(session(), 'night', nightAction('原记录'), {
      id: 'night-entry-1',
      createdAt: '2026-07-13T00:00:00.000Z',
    })
    const second = appendCorrection(first.state, 'night-entry-1', nightAction('第一次更正'), {
      id: 'night-entry-2',
      createdAt: '2026-07-13T00:01:00.000Z',
    })
    if (!second) throw new Error('first correction should be accepted')

    const chained = appendCorrection(second.state, 'night-entry-2', nightAction('第二次更正'), {
      id: 'night-entry-3',
      createdAt: '2026-07-13T00:02:00.000Z',
    })

    expect(chained?.entry.correctionOf).toBe('night-entry-2')
    expect(appendCorrection(second.state, 'night-entry-1', nightAction('分叉更正'), {
      id: 'night-entry-fork',
      createdAt: '2026-07-13T00:02:00.000Z',
    })).toBeNull()
    expect(appendCorrection(second.state, 'night-entry-2', nightAction('重复ID'), {
      id: 'night-entry-2',
      createdAt: '2026-07-13T00:02:00.000Z',
    })).toBeNull()
  })
})
