import type { PlayerCount } from '../../domain/scripts'
import type { GameSessionState, PlayerExperience } from '../game-session/types'

export const setupRosterMemoryKey = 'botc-copilot-last-roster-v1'

export interface SetupRosterSeatInput {
  seatId: number
  nickname: string
  experience: PlayerExperience
}

export interface SetupRosterMemory {
  scriptId: string
  playerCount: number
  seats: SetupRosterSeatInput[]
  savedAt: string
}

export function supportedPlayerCounts(): PlayerCount[] {
  return [7, 8, 9, 10, 11, 12, 13, 14, 15]
}

export function isPlayerCount(value: number): value is PlayerCount {
  return supportedPlayerCounts().includes(value as PlayerCount)
}

export function saveSetupRosterMemory(session: GameSessionState, savedAt = new Date().toISOString()) {
  if (!canSaveRoster(session)) return
  writeRosterMemory({
    scriptId: session.scriptId,
    playerCount: session.playerCount,
    savedAt,
    seats: Object.values(session.seats)
      .sort((left, right) => left.seatId - right.seatId)
      .map((seat) => ({
        seatId: seat.seatId,
        nickname: seat.nickname || `玩家${seat.seatId}`,
        experience: seat.experience ?? 'regular',
      })),
  })
}

export function loadSetupRosterMemory(): SetupRosterMemory | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(setupRosterMemoryKey)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return isRosterMemory(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function buildRosterForPlayerCount(
  playerCount: PlayerCount,
  memory: SetupRosterMemory | null = loadSetupRosterMemory(),
): SetupRosterSeatInput[] {
  const rememberedBySeat = new Map((memory?.seats ?? []).map((seat) => [seat.seatId, seat]))
  return Array.from({ length: playerCount }, (_value, index) => {
    const seatId = index + 1
    const remembered = rememberedBySeat.get(seatId)
    return {
      seatId,
      nickname: remembered?.nickname?.trim() || `玩家${seatId}`,
      experience: remembered?.experience ?? 'regular',
    }
  })
}

function canSaveRoster(session: GameSessionState) {
  return isPlayerCount(session.playerCount) &&
    Object.keys(session.seats).length === session.playerCount &&
    session.scriptId === 'catfishing'
}

function writeRosterMemory(memory: SetupRosterMemory) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(setupRosterMemoryKey, JSON.stringify(memory))
}

function isRosterMemory(value: unknown): value is SetupRosterMemory {
  if (!value || typeof value !== 'object') return false
  const memory = value as Partial<SetupRosterMemory>
  return typeof memory.scriptId === 'string' &&
    typeof memory.playerCount === 'number' &&
    typeof memory.savedAt === 'string' &&
    Array.isArray(memory.seats) &&
    memory.seats.every((seat) => isRosterSeat(seat))
}

function isRosterSeat(value: unknown): value is SetupRosterSeatInput {
  if (!value || typeof value !== 'object') return false
  const seat = value as Partial<SetupRosterSeatInput>
  return typeof seat.seatId === 'number' &&
    typeof seat.nickname === 'string' &&
    (seat.experience === 'new' || seat.experience === 'regular' || seat.experience === 'veteran')
}
