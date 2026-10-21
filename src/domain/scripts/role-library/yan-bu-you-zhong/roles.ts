import { confirmedRoleFactsForScript } from '../../role-facts'
import type { SmartRoleDefinition } from '../../types'
import { baoMengMiTuanRoles } from '../bao-meng-mi-tuan/roles'

export const yanBuYouZhongRoleIds = ["djinn", "shugenja", "pixie", "chambermaid", "balloonist", "highpriestess", "towncrier", "cannibal", "fisherman", "nightwatchman", "seamstress", "magician", "mayor", "amnesiac", "klutz", "lunatic", "drunk", "moonchild", "widow", "goblin", "cerenovus", "scarletwoman", "po", "yaggababble", "imp", "kazali"] as const

const reused = [
  ...confirmedRoleFactsForScript(["shugenja", "pixie", "chambermaid", "balloonist", "highpriestess", "towncrier", "cannibal", "fisherman", "nightwatchman", "seamstress", "magician", "mayor", "amnesiac", "klutz", "lunatic", "drunk", "moonchild", "widow", "goblin", "cerenovus", "scarletwoman", "po", "yaggababble", "imp", "kazali"]),
  ...baoMengMiTuanRoles.filter((role) => role.id === "djinn"),
]

export const yanBuYouZhongRoles: readonly SmartRoleDefinition[] = yanBuYouZhongRoleIds.map((id) => {
  const role = reused.find((entry) => entry.id === id)
  if (!role) throw new Error(`Missing verified yan-bu-you-zhong role: ${id}`)
  return role
})
