import { confirmedRoleFactsForScript } from '../../role-facts'
import type { SmartRoleDefinition } from '../../types'
import { tianTangHuaYuanRoles } from '../tian-tang-hua-yuan/roles'

export const paXingDuShiRoleIds = ["chef", "librarian", "washerwoman", "sailor", "chambermaid", "snakecharmer", "general", "flowergirl", "innkeeper", "undertaker", "philosopher", "fool", "tealady", "virgin", "drunk", "barber", "sweetheart", "saint", "klutz", "poisoner", "spy", "baron", "devilsadvocate", "psychopath", "alhadikhia"] as const

const reusedRoles = [
  ...confirmedRoleFactsForScript(["chef", "librarian", "washerwoman", "sailor", "chambermaid", "snakecharmer", "general", "flowergirl", "innkeeper", "undertaker", "philosopher", "fool", "tealady", "virgin", "drunk", "barber", "sweetheart", "saint", "klutz", "poisoner", "spy", "baron", "devilsadvocate", "psychopath"]),
  ...tianTangHuaYuanRoles.filter((role) => (["alhadikhia"] as readonly string[]).includes(role.id)),
]

export const paXingDuShiRoles: readonly SmartRoleDefinition[] = paXingDuShiRoleIds.map((id) => {
  const role = reusedRoles.find((candidate) => candidate.id === id)
  if (!role) throw new Error(`Missing verified pa-xing-du-shi role: ${id}`)
  return role
})
