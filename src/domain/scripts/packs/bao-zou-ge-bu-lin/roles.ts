import { confirmedRoleFactsForScript } from '../../role-facts'
import type { SmartRoleDefinition } from '../../types'
import { douShiQiYuanLaoHuaDengRoles } from '../dou-shi-qi-yuan-lao-hua-deng/roles'
import { xinKouCiHuangRoles } from '../xin-kou-ci-huang/roles'

export const baoZouGeBuLinRoleIds = ["djinn", "investigator", "clockmaker", "balloonist", "gambler", "towncrier", "seamstress", "juggler", "alsaahir", "philosopher", "tealady", "fool", "banshee", "gossip", "golem", "recluse", "ogre", "drunk", "goblin", "witch", "devilsadvocate", "widow", "cerenovus", "fanggu", "yaggababble", "vortox"] as const

const reusedRoles = [
  ...confirmedRoleFactsForScript(["investigator", "clockmaker", "balloonist", "gambler", "towncrier", "seamstress", "juggler", "alsaahir", "philosopher", "tealady", "fool", "gossip", "golem", "recluse", "ogre", "drunk", "goblin", "witch", "devilsadvocate", "widow", "cerenovus", "fanggu", "yaggababble", "vortox"]),
  ...douShiQiYuanLaoHuaDengRoles.filter((role) => (["djinn"] as readonly string[]).includes(role.id)),
  ...xinKouCiHuangRoles.filter((role) => (["banshee"] as readonly string[]).includes(role.id)),
]

export const baoZouGeBuLinRoles: readonly SmartRoleDefinition[] = baoZouGeBuLinRoleIds.map((id) => {
  const role = reusedRoles.find((candidate) => candidate.id === id)
  if (!role) throw new Error(`Missing verified bao-zou-ge-bu-lin role: ${id}`)
  return role
})
