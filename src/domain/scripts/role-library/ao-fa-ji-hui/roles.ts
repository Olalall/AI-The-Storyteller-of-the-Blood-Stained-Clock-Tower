import { confirmedRoleFactsForScript } from '../../role-facts'
import { jingHouJiaYinRoles } from '../jing-hou-jia-yin/roles'
import type { RoleId, SmartRoleDefinition } from '../../types'

export const aoFaJiHuiRoleIds = ['noble', 'grandmother', 'sailor', 'fortuneteller', 'towncrier', 'oracle', 'innkeeper', 'gossip', 'savant', 'fisherman', 'cannibal', 'ravenkeeper', 'tealady', 'drunk', 'tinker', 'recluse', 'hatter', 'godfather', 'poisoner', 'devilsadvocate', 'boffin', 'imp', 'ojo', 'po', 'vigormortis'] as const

const extraRoleIds = new Set<RoleId>(['hatter'])
const byId = new Map<RoleId, SmartRoleDefinition>([
  ...confirmedRoleFactsForScript(aoFaJiHuiRoleIds.filter((id) => !extraRoleIds.has(id))),
  ...[...jingHouJiaYinRoles].filter((role) => extraRoleIds.has(role.id)),
].map((role) => [role.id, role]))

export const aoFaJiHuiRoles = aoFaJiHuiRoleIds.map((id) => {
  const role = byId.get(id)
  if (!role) throw new Error(`Missing ao-fa-ji-hui role fact: ${id}`)
  return role
})
