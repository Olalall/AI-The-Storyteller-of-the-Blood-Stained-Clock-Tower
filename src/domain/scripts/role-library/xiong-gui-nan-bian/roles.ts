import { confirmedRoleFactsForScript } from '../../role-facts'
import type { SmartRoleDefinition } from '../../types'
import { jingHouJiaYinRoles } from '../jing-hou-jia-yin/roles'

export const xiongGuiNanBianRoleIds = ["investigator", "knight", "empath", "chambermaid", "balloonist", "monk", "seamstress", "nightwatchman", "philosopher", "slayer", "gossip", "savant", "ravenkeeper", "drunk", "tinker", "golem", "hatter", "scarletwoman", "godfather", "witch", "cerenovus", "harpy", "yaggababble", "shabaloth", "nodashii"] as const

const reusedRoles = [
  ...confirmedRoleFactsForScript(["investigator", "knight", "empath", "chambermaid", "balloonist", "monk", "seamstress", "nightwatchman", "philosopher", "slayer", "gossip", "savant", "ravenkeeper", "drunk", "tinker", "golem", "scarletwoman", "godfather", "witch", "cerenovus", "harpy", "yaggababble", "shabaloth", "nodashii"]),
  ...jingHouJiaYinRoles.filter((role) => role.id === "hatter"),
]

export const xiongGuiNanBianRoles: readonly SmartRoleDefinition[] = xiongGuiNanBianRoleIds.map((id) => {
  const role = reusedRoles.find((candidate) => candidate.id === id)
  if (!role) throw new Error(`Missing verified xiong-gui-nan-bian role: ${id}`)
  return role
})
