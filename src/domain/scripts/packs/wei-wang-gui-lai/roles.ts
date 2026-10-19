import { confirmedRoleFactsForScript } from '../../role-facts'
import type { SmartRoleDefinition } from '../../types'

export const weiWangGuiLaiRoleIds = ["noble", "grandmother", "pixie", "flowergirl", "gambler", "monk", "gossip", "amnesiac", "artist", "fisherman", "alchemist", "farmer", "cannibal", "mutant", "klutz", "drunk", "moonchild", "widow", "poisoner", "assassin", "baron", "vizier", "nodashii", "po", "vortox"] as const

const reusedRoles = [
  ...confirmedRoleFactsForScript(["noble", "grandmother", "pixie", "flowergirl", "gambler", "monk", "gossip", "amnesiac", "artist", "fisherman", "alchemist", "farmer", "cannibal", "mutant", "klutz", "drunk", "moonchild", "widow", "poisoner", "assassin", "baron", "vizier", "nodashii", "po", "vortox"]),
]

export const weiWangGuiLaiRoles: readonly SmartRoleDefinition[] = weiWangGuiLaiRoleIds.map((id) => {
  const role = reusedRoles.find((candidate) => candidate.id === id)
  if (!role) throw new Error(`Missing verified wei-wang-gui-lai role: ${id}`)
  return role
})
