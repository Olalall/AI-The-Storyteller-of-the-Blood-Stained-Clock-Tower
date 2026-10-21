import { confirmedRoleFactsForScript } from '../../role-facts'
import type { SmartRoleDefinition } from '../../types'
import { baoMengMiTuanRoles } from '../bao-meng-mi-tuan/roles'

export const zhuiFengZhuRiRoleIds = ["grandmother", "chef", "fortuneteller", "chambermaid", "flowergirl", "oracle", "gambler", "slayer", "seamstress", "tealady", "juggler", "ravenkeeper", "fool", "barber", "saint", "drunk", "klutz", "scarletwoman", "godfather", "devilsadvocate", "assassin", "vortox", "po", "pukka", "fanggu", "djinn"] as const

const reusedRoles = [
  ...confirmedRoleFactsForScript(["grandmother", "chef", "fortuneteller", "chambermaid", "flowergirl", "oracle", "gambler", "slayer", "seamstress", "tealady", "juggler", "ravenkeeper", "fool", "barber", "saint", "drunk", "klutz", "scarletwoman", "godfather", "devilsadvocate", "assassin", "vortox", "po", "pukka", "fanggu"]),
  ...baoMengMiTuanRoles.filter((role) => role.id === "djinn"),
]

export const zhuiFengZhuRiRoles: readonly SmartRoleDefinition[] = zhuiFengZhuRiRoleIds.map((id) => {
  const role = reusedRoles.find((candidate) => candidate.id === id)
  if (!role) throw new Error(`Missing verified zhui-feng-zhu-ri role: ${id}`)
  return role
})
