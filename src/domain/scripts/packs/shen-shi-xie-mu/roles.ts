import { confirmedRoleFactsForScript } from '../../role-facts'
import { baoMengMiTuanRoles } from '../bao-meng-mi-tuan/roles'
import { jingHouJiaYinRoles } from '../jing-hou-jia-yin/roles'
import type { RoleId, SmartRoleDefinition } from '../../types'

export const shenShiXieMuRoleIds = ['alchemist', 'bountyhunter', 'chef', 'sailor', 'empath', 'fortuneteller', 'preacher', 'innkeeper', 'savant', 'courtier', 'seamstress', 'nightwatchman', 'ravenkeeper', 'sweetheart', 'drunk', 'recluse', 'hatter', 'harpy', 'assassin', 'poisoner', 'devilsadvocate', 'ojo', 'lleech', 'vortox', 'po', 'sentinel'] as const

const extraRoleIds = new Set<RoleId>(['bountyhunter', 'hatter', 'sentinel'])
const byId = new Map<RoleId, SmartRoleDefinition>([
  ...confirmedRoleFactsForScript(shenShiXieMuRoleIds.filter((id) => !extraRoleIds.has(id))),
  ...[...baoMengMiTuanRoles, ...jingHouJiaYinRoles].filter((role) => extraRoleIds.has(role.id)),
].map((role) => [role.id, role]))

export const shenShiXieMuRoles = shenShiXieMuRoleIds.map((id) => {
  const role = byId.get(id)
  if (!role) throw new Error(`Missing shen-shi-xie-mu role fact: ${id}`)
  return role
})
