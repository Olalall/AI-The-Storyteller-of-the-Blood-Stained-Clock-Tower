import type { SmartScriptPack } from '../../types'
import { yingSuHuaKaiFirstNightOrder, yingSuHuaKaiOtherNightOrder } from './night-orders'
import { yingSuHuaKaiRoles } from './roles'
import { yingSuHuaKaiSetupRules } from './setup-rules'
import { yingSuHuaKaiSetupTemplates } from './setup-templates'

export const yingSuHuaKaiSmartScriptPack = {
  scriptId: "ying-su-hua-kai",
  displayName: "罂粟花开",
  source: { author: 'Dan', version: 'GStone edition 20005 / game 32345', url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20005_77222.json", contentHash: "sha256:8115ac32a50fcab7f93db0badc61a807a852d497568f995d4c5967c8d47d7305", verifiedAt: "2026-07-22" },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: yingSuHuaKaiRoles,
  nightOrders: { firstNight: yingSuHuaKaiFirstNightOrder, otherNight: yingSuHuaKaiOtherNightOrder },
  setupTemplates: yingSuHuaKaiSetupTemplates,
  setupRules: yingSuHuaKaiSetupRules,
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
