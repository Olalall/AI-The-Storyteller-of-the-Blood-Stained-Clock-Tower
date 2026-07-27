import type { SmartScriptPack } from '../../types'
import { shengRiYanHuiFirstNightOrder, shengRiYanHuiOtherNightOrder } from './night-orders'
import { shengRiYanHuiRoles } from './roles'
import { shengRiYanHuiSetupRules } from './setup-rules'
import { shengRiYanHuiSetupTemplates } from './setup-templates'

export const shengRiYanHuiSmartScriptPack = {
  scriptId: "sheng-ri-yan-hui",
  displayName: "生日宴会！",
  source: { author: "TPI", version: 'GStone edition 20756 / game 39436', url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20756_59931.json", contentHash: "sha256:8fcf5a525879f75f451f2243f75499479f73481d1c2da667040f291b6f1e99f0", verifiedAt: "2026-07-22" },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: shengRiYanHuiRoles,
  nightOrders: { firstNight: shengRiYanHuiFirstNightOrder, otherNight: shengRiYanHuiOtherNightOrder },
  setupTemplates: shengRiYanHuiSetupTemplates,
  setupRules: shengRiYanHuiSetupRules,
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
