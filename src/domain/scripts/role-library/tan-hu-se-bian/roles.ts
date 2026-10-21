import { confirmedRoleFactsForScript } from '../../role-facts'
import type { SmartRoleDefinition } from '../../types'
import { baoMengMiTuanRoles } from '../bao-meng-mi-tuan/roles'
import { jingHouJiaYinRoles } from '../jing-hou-jia-yin/roles'
import { insanityAndIntuitionRoles } from '../insanity-and-intuition/roles'

export const tanHuSeBianRoleIds = ["djinn", "noble", "shugenja", "pixie", "highpriestess", "dreamer", "fortuneteller", "monk", "savant", "amnesiac", "slayer", "seamstress", "ravenkeeper", "cannibal", "goon", "mutant", "drunk", "hatter", "widow", "witch", "cerenovus", "scarletwoman", "boomdandy", "nodashii", "vortox", "kazali"] as const

const reused = [
  ...confirmedRoleFactsForScript(["noble", "shugenja", "pixie", "highpriestess", "dreamer", "fortuneteller", "monk", "savant", "amnesiac", "slayer", "seamstress", "ravenkeeper", "cannibal", "goon", "mutant", "drunk", "widow", "witch", "cerenovus", "scarletwoman", "nodashii", "vortox", "kazali"]),
  ...baoMengMiTuanRoles.filter((role) => role.id === "djinn"),
  ...jingHouJiaYinRoles.filter((role) => role.id === "hatter"),
  ...insanityAndIntuitionRoles.filter((role) => role.id === "boomdandy"),
]

export const tanHuSeBianRoles: readonly SmartRoleDefinition[] = tanHuSeBianRoleIds.map((id) => {
  const role = reused.find((entry) => entry.id === id)
  if (!role) throw new Error(`Missing verified tan-hu-se-bian role: ${id}`)
  return role
})
