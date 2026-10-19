import { describe, expect, it } from 'vitest'
import { createEmptyGameSession, createPrototypeGameSession } from '../../game-session/data/createPrototypeSession'
import { gameSessionReducer } from '../../game-session/state/sessionReducer'
import { sessionInitialNightState } from './gameSessionAdapter'

describe('session night projection', () => {
  it('does not substitute a sample night or open a phase when the session has no night run', () => {
    const session = createEmptyGameSession()
    expect(sessionInitialNightState({ session, dispatchSession: () => undefined })).toBeNull()
    expect(gameSessionReducer(session, { type: 'open-phase-segment', phaseKind: 'night', createdAt: new Date().toISOString() })).toBe(session)
  })

  it.each(['missing', 'script', 'player-count', 'cursor', 'preview', 'empty-queue', 'missing-segment'])(
    'stops on a %s night binding without changing the stored run', (fault) => {
      const session = createPrototypeGameSession()
      const run = session.nightRuns[session.activeNightRunId!]
      if (fault === 'missing') session.activeNightRunId = 'missing-night'
      if (fault === 'script') run.scriptId = 'trouble-brewing'
      if (fault === 'player-count') run.playerCount = 7
      if (fault === 'cursor') run.activeCursorId = 'missing-item'
      if (fault === 'preview') run.previewEntryId = 'missing-item'
      if (fault === 'empty-queue') run.queue = []
      if (fault === 'missing-segment') run.phaseSegmentId = 'missing-segment'
      const before = structuredClone(session)

      expect(sessionInitialNightState({ session, dispatchSession: () => undefined })).toBeNull()
      expect(gameSessionReducer(session, { type: 'open-phase-segment', phaseKind: 'night', createdAt: new Date().toISOString() })).toBe(session)
      expect(session).toEqual(before)
    },
  )
})
