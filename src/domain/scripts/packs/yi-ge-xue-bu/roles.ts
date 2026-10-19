import { confirmedRoleFactsForScript } from '../../role-facts'
import { baoMengMiTuanRoles } from '../bao-meng-mi-tuan/roles'
import type { RoleId, SmartRoleDefinition } from '../../types'

export const yiGeXueBuRoleIds = ['djinn', 'grandmother', 'sailor', 'chambermaid', 'exorcist', 'innkeeper', 'gambler', 'gossip', 'courtier', 'professor', 'minstrel', 'tealady', 'pacifist', 'fool', 'lunatic', 'goon', 'tinker', 'moonchild', 'boffin', 'godfather', 'assassin', 'devilsadvocate', 'zombuul', 'pukka', 'shabaloth', 'po'] as const

const extraRoleIds = new Set<RoleId>(['djinn'])
const byId = new Map<RoleId, SmartRoleDefinition>([
  ...confirmedRoleFactsForScript(yiGeXueBuRoleIds.filter((id) => !extraRoleIds.has(id))),
  ...[...baoMengMiTuanRoles].filter((role) => extraRoleIds.has(role.id)),
].map((role) => [role.id, role]))

export const yiGeXueBuRoles = yiGeXueBuRoleIds.map((id) => {
  const role = byId.get(id)
  if (!role) throw new Error(`Missing yi-ge-xue-bu role fact: ${id}`)
  return role
})
