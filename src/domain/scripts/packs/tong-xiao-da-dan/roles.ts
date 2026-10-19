import { confirmedRoleFactsForScript } from '../../role-facts'
import type { SmartRoleDefinition } from '../../types'
import { douShiQiYuanLaoHuaDengRoles } from '../dou-shi-qi-yuan-lao-hua-deng/roles'

export const tongXiaoDaDanRoleIds = ["djinn", "steward", "knight", "king", "dreamer", "fortuneteller", "mathematician", "monk", "artist", "slayer", "seamstress", "sage", "cannibal", "magician", "butler", "sweetheart", "recluse", "lunatic", "baron", "scarletwoman", "widow", "marionette", "imp", "nodashii", "legion", "vortox"] as const

const reusedRoles = [
  ...confirmedRoleFactsForScript(["steward", "knight", "dreamer", "fortuneteller", "mathematician", "monk", "artist", "slayer", "seamstress", "sage", "cannibal", "magician", "butler", "sweetheart", "recluse", "lunatic", "baron", "scarletwoman", "widow", "marionette", "imp", "nodashii", "legion", "vortox"]),
  ...douShiQiYuanLaoHuaDengRoles.filter((role) => (["king", "djinn"] as readonly string[]).includes(role.id)),
]

export const tongXiaoDaDanRoles: readonly SmartRoleDefinition[] = tongXiaoDaDanRoleIds.map((id) => {
  const role = reusedRoles.find((candidate) => candidate.id === id)
  if (!role) throw new Error(`Missing verified tong-xiao-da-dan role: ${id}`)
  return role
})
