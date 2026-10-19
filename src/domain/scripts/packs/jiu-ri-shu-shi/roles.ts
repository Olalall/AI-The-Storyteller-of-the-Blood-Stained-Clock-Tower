import { confirmedRoleFactsForScript } from '../../role-facts'
import type { SmartRoleDefinition } from '../../types'

export const jiuRiShuShiRoleIds = ["chef", "librarian", "investigator", "grandmother", "empath", "oracle", "flowergirl", "monk", "gambler", "slayer", "seamstress", "soldier", "ravenkeeper", "drunk", "barber", "klutz", "recluse", "poisoner", "godfather", "scarletwoman", "assassin", "imp", "vortox", "fanggu"] as const

const reusedRoles = [
  ...confirmedRoleFactsForScript(["chef", "librarian", "investigator", "grandmother", "empath", "oracle", "flowergirl", "monk", "gambler", "slayer", "seamstress", "soldier", "ravenkeeper", "drunk", "barber", "klutz", "recluse", "poisoner", "godfather", "scarletwoman", "assassin", "imp", "vortox", "fanggu"]),
]

export const jiuRiShuShiRoles: readonly SmartRoleDefinition[] = jiuRiShuShiRoleIds.map((id) => {
  const role = reusedRoles.find((candidate) => candidate.id === id)
  if (!role) throw new Error(`Missing verified jiu-ri-shu-shi role: ${id}`)
  return role
})
