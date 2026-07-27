import type { SmartScriptPack } from '../../types'
import { hengXingBaDaoFirstNightOrder, hengXingBaDaoOtherNightOrder } from './night-orders'
import { hengXingBaDaoRoles } from './roles'
import { hengXingBaDaoSetupRules } from './setup-rules'
import { hengXingBaDaoSetupTemplates } from './setup-templates'

export const hengXingBaDaoSmartScriptPack = {
  scriptId: "heng-xing-ba-dao",
  displayName: "横行霸道",
  source: { author: "Manny", version: 'GStone edition 20754 / game 39438', url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20754_59933.json", contentHash: "sha256:3143c0f142a7d5ebd609934396a50339f2b662c0e9dce81768197ab34230899b", verifiedAt: "2026-07-22" },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: hengXingBaDaoRoles,
  nightOrders: { firstNight: hengXingBaDaoFirstNightOrder, otherNight: hengXingBaDaoOtherNightOrder },
  setupTemplates: hengXingBaDaoSetupTemplates,
  setupRules: hengXingBaDaoSetupRules,
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
