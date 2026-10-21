import { confirmedRoleFactsForScript } from '../../role-facts'
import type { SmartRoleDefinition } from '../../types'
import { jingHouJiaYinRoles } from '../jing-hou-jia-yin/roles'
import { insanityAndIntuitionRoles } from '../insanity-and-intuition/roles'

export const fengMaoZhiYanRoleIds = ["alchemist", "hatter", "noble", "chef", "balloonist", "innkeeper", "flowergirl", "juggler", "courtier", "seamstress", "philosopher", "cannibal", "farmer", "poppygrower", "sweetheart", "drunk", "moonchild", "mutant", "harpy", "godfather", "assassin", "goblin", "ojo", "lleech", "vortox", "fanggu"] as const

const reused = [
  ...confirmedRoleFactsForScript(["alchemist", "noble", "chef", "balloonist", "innkeeper", "flowergirl", "juggler", "courtier", "seamstress", "philosopher", "cannibal", "farmer", "sweetheart", "drunk", "moonchild", "mutant", "harpy", "godfather", "assassin", "goblin", "ojo", "lleech", "vortox", "fanggu"]),
  ...jingHouJiaYinRoles.filter((role) => role.id === "hatter"),
  ...insanityAndIntuitionRoles.filter((role) => role.id === "poppygrower"),
]

export const fengMaoZhiYanRoles: readonly SmartRoleDefinition[] = fengMaoZhiYanRoleIds.map((id) => {
  const role = reused.find((entry) => entry.id === id)
  if (!role) throw new Error(`Missing verified feng-mao-zhi-yan role: ${id}`)
  return role
})
