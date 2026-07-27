import type { SmartScriptPack } from '../../types'
import { yaoWuYinXinFirstNightOrder, yaoWuYinXinOtherNightOrder } from './night-orders'
import { yaoWuYinXinRoles } from './roles'
import { yaoWuYinXinSetupRules } from './setup-rules'
import { yaoWuYinXinSetupTemplates } from './setup-templates'

export const yaoWuYinXinSmartScriptPack = {
  scriptId: "yao-wu-yin-xin",
  displayName: "杳无音信",
  source: { author: "OJ", version: 'GStone edition 20753 / game 39439', url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20753_59934.json", contentHash: "sha256:13a59bdd0d3561ad90725defcfdbe1b2b07ff3cec30a471a518b1423b5394a69", verifiedAt: "2026-07-22" },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: yaoWuYinXinRoles,
  nightOrders: { firstNight: yaoWuYinXinFirstNightOrder, otherNight: yaoWuYinXinOtherNightOrder },
  setupTemplates: yaoWuYinXinSetupTemplates,
  setupRules: yaoWuYinXinSetupRules,
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
