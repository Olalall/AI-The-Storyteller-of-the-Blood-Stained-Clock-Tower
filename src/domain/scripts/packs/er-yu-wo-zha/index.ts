import type { SmartScriptPack } from '../../types'
import { erYuWoZhaFirstNightOrder, erYuWoZhaOtherNightOrder } from './night-orders'
import { erYuWoZhaRoles } from './roles'
import { erYuWoZhaSetupRules } from './setup-rules'
import { erYuWoZhaSetupTemplates } from './setup-templates'

export const erYuWoZhaSmartScriptPack = {
  scriptId: "er-yu-wo-zha",
  displayName: "尔虞我诈",
  source: { author: "TPI", version: 'GStone edition 20750 / game 39442', url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20750_59938.json", contentHash: "sha256:7f808685e84f16b77b34a486fcf2548efbc5ef9feaa9215010ff563d742aca63", verifiedAt: "2026-07-22" },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: erYuWoZhaRoles,
  nightOrders: { firstNight: erYuWoZhaFirstNightOrder, otherNight: erYuWoZhaOtherNightOrder },
  setupTemplates: erYuWoZhaSetupTemplates,
  setupRules: erYuWoZhaSetupRules,
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
