import { confirmedRoleFactsForScript } from '../../role-facts'
import type { SmartRoleDefinition } from '../../types'
import { yuZheHuanYanRoles } from '../yu-zhe-huan-yan/roles'

export const huaWaiZhiMinRoleIds = ["noble", "librarian", "shugenja", "pixie", "general", "balloonist", "dreamer", "towncrier", "gossip", "amnesiac", "juggler", "seamstress", "soldier", "goon", "saint", "mutant", "drunk", "godfather", "widow", "assassin", "organgrinder", "pukka", "nodashii", "imp", "fanggu"] as const

const reusedRoles = [
  ...confirmedRoleFactsForScript(["noble", "librarian", "shugenja", "pixie", "general", "balloonist", "dreamer", "towncrier", "gossip", "amnesiac", "juggler", "seamstress", "soldier", "goon", "saint", "mutant", "drunk", "godfather", "widow", "assassin", "pukka", "nodashii", "imp", "fanggu"]),
  ...yuZheHuanYanRoles.filter((role) => role.id === "organgrinder"),
]

export const huaWaiZhiMinRoles: readonly SmartRoleDefinition[] = huaWaiZhiMinRoleIds.map((id) => {
  const role = reusedRoles.find((candidate) => candidate.id === id)
  if (!role) throw new Error(`Missing verified hua-wai-zhi-min role: ${id}`)
  return role
})
