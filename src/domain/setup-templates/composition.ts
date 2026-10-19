import { boundedSetupTransferForRole, inferModifierRoleId, isValidSetupCountChangeForRole, resolveSetupCountChanges } from './setupCountChanges'
import type { PlayerCount, SetupCountedTeam, SetupTemplate, SmartScriptPack } from '../scripts'
import { kazaliOpeningCounts } from './kazaliOpening'

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

export function expectedCompositionForTemplate(template: SetupTemplate, pack?: SmartScriptPack): TeamComposition {
  const base = baseCompositionForPlayerCount(template.playerCount)
  const kazali = pack && kazaliOpeningCounts(base, actualCompositionForTemplate(pack, template), template.roles,
    Object.fromEntries(pack.roles.map((role) => [role.id, role.team])))
  if (kazali) return kazali
  const changes = (template.setupAdjustments ?? []).map((adjustment) => ({
    delta: adjustment.compositionDelta,
    boundedTransfer: pack ? boundedSetupTransferForRole(inferModifierRoleId(adjustment.ruleId, pack), adjustment.compositionDelta) : undefined,
  }))
  return resolveSetupCountChanges(base, changes).counts
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
  const expected = expectedCompositionForTemplate(template, pack)
  const actual = actualCompositionForTemplate(pack, template)
  const invalidCountFacts = (template.setupAdjustments ?? []).filter((adjustment) =>
    !isValidSetupCountChangeForRole(inferModifierRoleId(adjustment.ruleId, pack), adjustment.compositionDelta))
  const problems = [...collectProblems(expected, actual), ...invalidCountFacts.map((adjustment) => `Invalid source-backed setup count change: ${adjustment.ruleId}`)]

  return {
    templateId: template.templateId,
    playerCount: template.playerCount,
    expected,
    actual,
    valid: problems.length === 0,
    problems,
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
