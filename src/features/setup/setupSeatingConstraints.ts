import type { RoleTeam } from '../../domain/scripts'
import type { SetupAssignment } from '../game-session/types'
import type { SetupLegalityCheck } from './types'

type RoleTeams = Readonly<Record<string, RoleTeam>>

/** Starting-seat facts only; never called for confirmed games or role changes. */
export function setupSeatingChecks(assignments: readonly SetupAssignment[], teams: RoleTeams): SetupLegalityCheck[] {
  const seats = [...assignments].sort((a, b) => a.seatId - b.seatId)
  const adjacent = (index: number) => [seats[(index + seats.length - 1) % seats.length], seats[(index + 1) % seats.length]]
  const checks: SetupLegalityCheck[] = []
  const marionettes = seats.filter((a) => a.role.id === 'marionette')
  if (marionettes.length) {
    const passed = seats.every((a, i) => a.role.id !== 'marionette' || adjacent(i).some((n) => teams[n.role.id] === 'demon'))
    checks.push({ id: 'marionette-neighbor', passed, status: passed ? 'pass' : 'fail',
      summary: '提线木偶与实际恶魔邻座', detail: passed ? '已按圆桌首尾相邻核对。' : '提线木偶没有直接邻接实际恶魔；特殊恶魔设置未完成时不能作为合法候选。',
      source: 'https://wiki.bloodontheclocktower.com/Marionette' })
  }
  const lords = seats.filter((a) => a.role.id === 'lordoftyphon')
  if (lords.length) {
    const evil = seats.map((a) => teams[a.role.id] === 'minion' || teams[a.role.id] === 'demon')
    const transitions = evil.filter((value, i) => value !== evil[(i + 1) % seats.length]).length
    const lordIndex = seats.findIndex((a) => a.role.id === 'lordoftyphon')
    const passed = lords.length === 1 && transitions === 2
      && adjacent(lordIndex).every((n) => teams[n.role.id] === 'minion' || teams[n.role.id] === 'demon')
    checks.push({ id: 'lordoftyphon-evil-line', passed, status: passed ? 'pass' : 'fail',
      summary: '堤丰开局邪恶角色连续且恶魔不在两端', detail: passed ? '爪牙和恶魔构成一个圆桌连续段，堤丰两侧均为邪恶角色。' : '爪牙和恶魔必须构成一个连续段，且堤丰两侧都有邪恶角色；当前席位无法满足。',
      source: 'https://wiki.bloodontheclocktower.com/Lord_of_Typhon' })
  }
  return checks
}

/** Preserve the experience-based preference, then fit only the two sourced seat restrictions. */
export function fitSetupSeating(
  preferred: SetupAssignment[], teams: RoleTeams, preferredSeatIds: readonly number[],
): SetupAssignment[] {
  if (setupSeatingChecks(preferred, teams).every((c) => c.passed)) return preferred
  const seats = preferred.map((a) => a.seatId).sort((a, b) => a - b)
  const rank = new Map(preferredSeatIds.map((id, index) => [id, index]))
  const preferenceOrder = [...preferred].sort((a, b) => rank.get(a.seatId)! - rank.get(b.seatId)!)
  const lords = preferred.filter((a) => a.role.id === 'lordoftyphon')
  const marionettes = preferred.filter((a) => a.role.id === 'marionette')
  // shortcut: shipped templates contain at most one of each; other multiplicities require manual setup.
  if (lords.length > 1 || marionettes.length > 1) return preferred
  let best = preferred
  let bestCost = Infinity

  function consider(fixed: ReadonlyMap<SetupAssignment, number>, evilSeats?: ReadonlySet<number>) {
    const output = [...fixed].map(([a, seatId]) => ({ ...a, seatId }))
    const used = new Set(fixed.values())
    for (const evilGroup of evilSeats ? [true, false] : [undefined]) {
      const roles = preferenceOrder.filter((a) => !fixed.has(a) && (evilGroup === undefined
        || (teams[a.role.id] === 'minion' || teams[a.role.id] === 'demon') === evilGroup))
      const available = preferredSeatIds.filter((id) => !used.has(id)
        && (evilGroup === undefined || evilSeats!.has(id) === evilGroup))
      if (roles.length !== available.length) return
      roles.forEach((a, i) => output.push({ ...a, seatId: available[i] }))
    }
    output.sort((a, b) => a.seatId - b.seatId)
    if (setupSeatingChecks(output, teams).some((c) => !c.passed)) return
    const cost = output.reduce((sum, a) => {
      const original = preferred.find((p) => p.role === a.role)!
      return sum + (rank.get(original.seatId)! - rank.get(a.seatId)!) ** 2
    }, 0)
    if (cost < bestCost) { best = output; bestCost = cost }
  }

  if (lords.length) {
    const evilCount = preferred.filter((a) => teams[a.role.id] === 'minion' || teams[a.role.id] === 'demon').length
    for (let start = 0; start < seats.length; start++) {
      const line = Array.from({ length: evilCount }, (_v, i) => seats[(start + i) % seats.length])
      for (let middle = 1; middle < line.length - 1; middle++) {
        const fixed = new Map([[lords[0], line[middle]]])
        if (!marionettes.length) consider(fixed, new Set(line))
        else for (const neighbor of [line[middle - 1], line[middle + 1]]) {
          consider(new Map([...fixed, [marionettes[0], neighbor]]), new Set(line))
        }
      }
    }
  } else {
    const marionette = marionettes[0]
    for (const demon of preferred.filter((a) => teams[a.role.id] === 'demon')) {
      const index = seats.indexOf(demon.seatId)
      for (const neighbor of [seats[(index + seats.length - 1) % seats.length], seats[(index + 1) % seats.length]]) {
        consider(new Map([[demon, demon.seatId], [marionette, neighbor]]))
      }
    }
  }
  return best
}
