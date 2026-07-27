import type { PlayerCount, SetupCountedTeam, SetupTemplate, SmartScriptPack } from '../scripts'

export interface TeamComposition {
  townsfolk: number
  outsider: number
  minion: number
  demon: number
}

export interface TemplateCompositionCheck {
  templateId: string
  playerCount: PlayerCount
  expected: TeamComposition
  actual: TeamComposition
  valid: boolean
  problems: readonly string[]
}

const baseCompositions: Record<PlayerCount, TeamComposition> = {
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

export function baseCompositionForPlayerCount(playerCount: PlayerCount): TeamComposition {
  return { ...baseCompositions[playerCount] }
}

export function expectedCompositionForTemplate(template: SetupTemplate): TeamComposition {
  return template.setupAdjustments?.reduce(
    (composition, adjustment) => applyCompositionDelta(composition, adjustment.compositionDelta),
    baseCompositionForPlayerCount(template.playerCount),
  ) ?? baseCompositionForPlayerCount(template.playerCount)
}

export function actualCompositionForTemplate(pack: SmartScriptPack, template: SetupTemplate): TeamComposition {
  const roleById = new Map(pack.roles.map((role) => [role.id, role]))
  return template.roles.reduce(
    (composition, roleId) => {
      const team = roleById.get(roleId)?.team
      if (team && isSetupCountedTeam(team)) composition[team] += 1
      return composition
    },
    { townsfolk: 0, outsider: 0, minion: 0, demon: 0 },
  )
}

export function validateTemplateComposition(pack: SmartScriptPack, template: SetupTemplate): TemplateCompositionCheck {
  const expected = expectedCompositionForTemplate(template)
  const actual = actualCompositionForTemplate(pack, template)
  const problems = collectProblems(expected, actual)

  return {
    templateId: template.templateId,
    playerCount: template.playerCount,
    expected,
    actual,
    valid: problems.length === 0,
    problems,
  }
}

function applyCompositionDelta(composition: TeamComposition, delta: Partial<Record<SetupCountedTeam, number>>) {
  return {
    townsfolk: composition.townsfolk + (delta.townsfolk ?? 0),
    outsider: composition.outsider + (delta.outsider ?? 0),
    minion: composition.minion + (delta.minion ?? 0),
    demon: composition.demon + (delta.demon ?? 0),
  }
}

function isSetupCountedTeam(team: string): team is SetupCountedTeam {
  return team === 'townsfolk' || team === 'outsider' || team === 'minion' || team === 'demon'
}

function collectProblems(expected: TeamComposition, actual: TeamComposition) {
  return (Object.keys(expected) as SetupCountedTeam[]).flatMap((team) => {
    if (expected[team] === actual[team]) return []
    return [`${team}: expected ${expected[team]}, got ${actual[team]}`]
  })
}
