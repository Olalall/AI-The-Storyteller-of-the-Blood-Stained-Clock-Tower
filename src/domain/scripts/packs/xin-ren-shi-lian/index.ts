import type { SmartScriptPack } from '../../types'
import { xinRenShiLianFirstNightOrder, xinRenShiLianOtherNightOrder } from './night-orders'
import { xinRenShiLianRoles } from './roles'
import { xinRenShiLianSetupRules } from './setup-rules'
import { xinRenShiLianSetupTemplates } from './setup-templates'

export const xinRenShiLianSmartScriptPack = {
  scriptId: "xin-ren-shi-lian",
  displayName: "信任试炼",
  source: { author: "Lei的剧本钟楼", version: 'GStone edition 21005 / game 40587', url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21005_69643.json", contentHash: "sha256:f603b4fa9757330b5f9865fa87dfacc7435232fc17f5804638ac1c31571f1d75", verifiedAt: '2026-07-22' },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: xinRenShiLianRoles,
  nightOrders: { firstNight: xinRenShiLianFirstNightOrder, otherNight: xinRenShiLianOtherNightOrder },
  setupTemplates: xinRenShiLianSetupTemplates,
  setupRules: xinRenShiLianSetupRules,
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
