import type { SmartScriptPack } from '../../types'
import { manTianGuoHaiFirstNightOrder, manTianGuoHaiOtherNightOrder } from './night-orders'
import { manTianGuoHaiRoles } from './roles'
import { manTianGuoHaiSetupRules } from './setup-rules'
import { manTianGuoHaiSetupTemplates } from './setup-templates'

export const manTianGuoHaiSmartScriptPack = {
  scriptId: "man-tian-guo-hai",
  displayName: "瞒天过海",
  source: { author: "Lau", version: 'GStone edition 20757 / game 39435', url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20757_59931.json", contentHash: "sha256:48542895c7172cde5dda9a88f0ac8600e8a4a17f29a3a4c410070a5c174af841", verifiedAt: "2026-07-22" },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: manTianGuoHaiRoles,
  nightOrders: { firstNight: manTianGuoHaiFirstNightOrder, otherNight: manTianGuoHaiOtherNightOrder },
  setupTemplates: manTianGuoHaiSetupTemplates,
  setupRules: manTianGuoHaiSetupRules,
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
