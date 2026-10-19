import { confirmedRoleFactsForScript } from '../../role-facts'
import type { SmartRoleDefinition } from '../../types'
import { douShiQiYuanLaoHuaDengRoles } from '../dou-shi-qi-yuan-lao-hua-deng/roles'

export const longZhengHuDouRoleIds = ["librarian", "balloonist", "chambermaid", "monk", "ravenkeeper", "philosopher", "huntsman", "tealady", "courtier", "slayer", "sailor", "undertaker", "fisherman", "damsel", "drunk", "recluse", "moonchild", "klutz", "godfather", "devilsadvocate", "poisoner", "pithag", "pukka", "po", "fanggu", "djinn"] as const

const reusedRoles = [
  ...confirmedRoleFactsForScript(["librarian", "balloonist", "chambermaid", "monk", "ravenkeeper", "philosopher", "huntsman", "tealady", "courtier", "slayer", "sailor", "undertaker", "fisherman", "damsel", "drunk", "recluse", "moonchild", "klutz", "godfather", "devilsadvocate", "poisoner", "pithag", "pukka", "po", "fanggu"]),
  ...douShiQiYuanLaoHuaDengRoles.filter((role) => (["djinn"] as readonly string[]).includes(role.id)),
]

export const longZhengHuDouRoles: readonly SmartRoleDefinition[] = longZhengHuDouRoleIds.map((id) => {
  const role = reusedRoles.find((candidate) => candidate.id === id)
  if (!role) throw new Error(`Missing verified long-zheng-hu-dou role: ${id}`)
  return role
})
