import { beforeEach, describe, expect, it } from 'vitest'
import { createPrototypeGameSession } from '../game-session/data/createPrototypeSession'
import {
  buildRosterForPlayerCount,
  loadSetupRosterMemory,
  saveSetupRosterMemory,
  setupRosterMemoryKey,
} from './setupRosterMemory'

describe('setup roster memory', () => {
  beforeEach(() => window.localStorage.clear())

  it('stores only seat nickname and experience for the next blank setup', () => {
    const session = createPrototypeGameSession()
    session.seats[1] = { ...session.seats[1], nickname: '老玩家A', experience: 'veteran' }

    saveSetupRosterMemory(session, '2026-07-19T00:00:00.000Z')
    const raw = window.localStorage.getItem(setupRosterMemoryKey)
    const memory = loadSetupRosterMemory()
    const sevenRoster = buildRosterForPlayerCount(7, memory)

    expect(raw).toContain('老玩家A')
    expect(raw).not.toContain('setup_confirmed')
    expect(raw).not.toContain('timeline')
    expect(sevenRoster).toHaveLength(7)
    expect(sevenRoster[0]).toMatchObject({ seatId: 1, nickname: '老玩家A', experience: 'veteran' })
    expect(sevenRoster[6]).toMatchObject({ seatId: 7, nickname: '玩家7', experience: 'veteran' })
  })

  it('defaults missing memory to regular players', () => {
    expect(buildRosterForPlayerCount(7, null).every((seat) => seat.experience === 'regular')).toBe(true)
  })
})
