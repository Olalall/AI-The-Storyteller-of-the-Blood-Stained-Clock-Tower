import type { TeamCounts } from './types'

/**
 * 标准 7—15 人阵营数量。剧本中的开局修正必须在此基础上显式增减，
 * 不能把 12 人常量复制到候选或 UI 里。
 */
export const baseDistributionByPlayerCount: Readonly<Record<number, TeamCounts>> = {
  7: { townsfolk: 5, outsider: 0, minion: 1, demon: 1 },
  8: { townsfolk: 5, outsider: 1, minion: 1, demon: 1 },
  9: { townsfolk: 5, outsider: 2, minion: 1, demon: 1 },
  10: { townsfolk: 7, outsider: 0, minion: 2, demon: 1 },
  11: { townsfolk: 7, outsider: 1, minion: 2, demon: 1 },
  12: { townsfolk: 7, outsider: 2, minion: 2, demon: 1 },
  13: { townsfolk: 9, outsider: 0, minion: 3, demon: 1 },
  14: { townsfolk: 9, outsider: 1, minion: 3, demon: 1 },
  15: { townsfolk: 9, outsider: 2, minion: 3, demon: 1 },
}

export function baseDistributionFor(playerCount: number): TeamCounts | null {
  const counts = baseDistributionByPlayerCount[playerCount]
  return counts ? { ...counts } : null
}

export function emptyTeamCounts(): TeamCounts {
  return { townsfolk: 0, outsider: 0, minion: 0, demon: 0 }
}
