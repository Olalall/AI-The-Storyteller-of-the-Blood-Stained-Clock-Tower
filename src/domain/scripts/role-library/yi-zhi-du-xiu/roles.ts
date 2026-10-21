import { confirmedRoleFactsForScript } from '../../role-facts'
import type { SmartRoleDefinition } from '../../types'
import { xinKouCiHuangRoles } from '../xin-kou-ci-huang/roles'

export const yiZhiDuXiuRoleIds = ["pixie", "shugenja", "chef", "balloonist", "general", "mathematician", "innkeeper", "flowergirl", "savant", "fisherman", "amnesiac", "cannibal", "ravenkeeper", "recluse", "drunk", "butler", "mutant", "spy", "poisoner", "scarletwoman", "harpy", "marionette", "vigormortis", "legion", "lordoftyphon"] as const

const reusedRoles = [
  ...confirmedRoleFactsForScript(["pixie", "shugenja", "chef", "balloonist", "general", "mathematician", "innkeeper", "flowergirl", "savant", "fisherman", "amnesiac", "cannibal", "ravenkeeper", "recluse", "drunk", "butler", "mutant", "spy", "poisoner", "scarletwoman", "harpy", "marionette", "vigormortis", "legion"]),
  ...xinKouCiHuangRoles.filter((role) => (["lordoftyphon"] as readonly string[]).includes(role.id)),
]

export const yiZhiDuXiuRoles: readonly SmartRoleDefinition[] = yiZhiDuXiuRoleIds.map((id) => {
  const role = reusedRoles.find((candidate) => candidate.id === id)
  if (!role) throw new Error(`Missing verified yi-zhi-du-xiu role: ${id}`)
  return role
})
