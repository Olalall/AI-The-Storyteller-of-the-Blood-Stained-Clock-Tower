import { describe, expect, it } from 'vitest'
import { createEmptyGameSession } from '../data/createPrototypeSession'
import { gameSessionReducer } from './sessionReducer'

const seats = Array.from({ length: 12 }, (_value, index) => ({
  seatId: index + 1,
  nickname: `玩家${index + 1}`,
  experience: 'regular' as const,
}))

describe('setup session board switch', () => {
  it('replaces an unconfirmed setup shell with the explicitly selected board', () => {
    const first = gameSessionReducer(createEmptyGameSession(), {
      type: 'start-setup-session',
      scriptId: 'catfishing',
      playerCount: 12,
      seats,
      createdAt: '2026-09-02T00:00:00.000Z',
    })
    const switched = gameSessionReducer(first, {
      type: 'start-setup-session',
      scriptId: 'trouble-brewing',
      playerCount: 12,
      seats,
      createdAt: '2026-09-02T00:01:00.000Z',
    })

    expect(switched.scriptId).toBe('trouble-brewing')
    expect(switched.playerCount).toBe(12)
    expect(switched.timeline).toHaveLength(0)
  })
})
