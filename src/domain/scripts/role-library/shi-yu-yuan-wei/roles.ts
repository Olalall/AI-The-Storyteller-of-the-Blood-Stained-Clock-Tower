import { confirmedRoleFactsForScript } from '../../role-facts'
import { baoYueChuShengRoles } from '../bao-yue-chu-sheng/roles'
import type { RoleId, SmartRoleDefinition } from '../../types'

export const shiYuYuanWeiRoleIds = ['investigator', 'chef', 'empath', 'general', 'fortuneteller', 'oracle', 'monk', 'artist', 'slayer', 'huntsman', 'virgin', 'amnesiac', 'sage', 'recluse', 'damsel', 'drunk', 'barber', 'mezepheles', 'poisoner', 'harpy', 'baron', 'lilmonsta', 'imp', 'vigormortis', 'vortox'] as const

const extraRoleIds = new Set<RoleId>(['lilmonsta'])
const byId = new Map<RoleId, SmartRoleDefinition>([
  ...confirmedRoleFactsForScript(shiYuYuanWeiRoleIds.filter((id) => !extraRoleIds.has(id))),
  ...[...baoYueChuShengRoles].filter((role) => extraRoleIds.has(role.id)),
].map((role) => [role.id, role]))

export const shiYuYuanWeiRoles = shiYuYuanWeiRoleIds.map((id) => {
  const role = byId.get(id)
  if (!role) throw new Error(`Missing shi-yu-yuan-wei role fact: ${id}`)
  return role
})
