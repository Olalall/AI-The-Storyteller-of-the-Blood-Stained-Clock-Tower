import type { SmartScriptPack } from '../../types'
import { zhiShouZheTianFirstNight, zhiShouZheTianOtherNight } from './night-orders'
import { zhiShouZheTianRoles } from './roles'
import { zhiShouZheTianSetupRules } from './setup-rules'
import { zhiShouZheTianSetupTemplates } from './setup-templates'

export const zhiShouZheTianSmartScriptPack = {
  scriptId: "zhi-shou-zhe-tian",
  displayName: "只手遮天",
  source: { author: "", version: 'GStone edition 20514 / game 38024', url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20514_51630.json", contentHash: 'sha256:4238810a6fb68f2daa965e332d1be23dd5f61299b49bd179a6937dd2692e68d2', verifiedAt: "2026-07-22" },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: zhiShouZheTianRoles,
  nightOrders: { firstNight: zhiShouZheTianFirstNight, otherNight: zhiShouZheTianOtherNight },
  setupTemplates: zhiShouZheTianSetupTemplates,
  setupRules: zhiShouZheTianSetupRules,
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
