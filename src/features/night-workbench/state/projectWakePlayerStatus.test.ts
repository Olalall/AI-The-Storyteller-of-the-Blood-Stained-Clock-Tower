import { describe, expect, it } from 'vitest'
import { createPrototypeGameSession } from '../../game-session/data/createPrototypeSession'
import { projectCurrentPlayerStates } from '../../game-session/state/projectors'
import { gameSessionReducer } from '../../game-session/state/sessionReducer'
import { projectWakePlayerStatus } from './projectWakePlayerStatus'

describe('projectWakePlayerStatus', () => {
  it('reads the current GameSession player-state projection instead of the queue snapshot', () => {
    const session = createPrototypeGameSession()
    const item = session.nightRuns[session.activeNightRunId ?? ''].queue.find((candidate) => candidate.seatId === 4)
    if (!item) throw new Error('fixture is incomplete')
    const before = projectCurrentPlayerStates(session)[4]
    const changed = gameSessionReducer(session, {
      type: 'confirm-player-state-change',
      seatId: 4,
      expectedBefore: before,
      after: { ...before, drunk: true },
      segmentId: null,
      entryId: 'wake-status-4',
      confirmedAt: '2026-07-14T12:00:00.000Z',
      reason: '说书人手动更新状态',
    })

    expect(item.status.impairments).not.toContain('drunk')
    expect(projectWakePlayerStatus(changed, item).impairments).toContain('drunk')
  })
})
