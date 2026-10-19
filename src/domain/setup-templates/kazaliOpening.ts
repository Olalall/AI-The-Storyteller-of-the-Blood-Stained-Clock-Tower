import type { SetupCountedTeam } from '../scripts/types'

type Counts = Record<SetupCountedTeam, number>

/** Kazali's initial bag has no Minions; confirmed legacy bags retain their old count contract. */
export function kazaliOpeningCounts(
  base: Counts,
  actual: Counts,
  roleIds: readonly string[],
  teams: Readonly<Record<string, string>>,
  sourceRoleIds?: readonly string[],
): Counts | null {
  const source = sourceRoleIds ?? roleIds
  if (!source.includes('kazali') || (sourceRoleIds !== undefined && source.some((id) => teams[id] === 'minion'))) return null
  // Confirmed opening sources survive later explicit character changes; never reinterpret an old bag.
  const minion = sourceRoleIds === undefined ? 0 : actual.minion
  const total = Object.values(base).reduce((sum, count) => sum + count, 0)
  return { townsfolk: total - 1 - actual.outsider - minion, outsider: actual.outsider, minion, demon: 1 }
}
