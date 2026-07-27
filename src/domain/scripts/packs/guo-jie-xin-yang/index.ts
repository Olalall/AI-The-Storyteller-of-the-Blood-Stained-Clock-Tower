import type { SmartScriptPack } from '../../types'
import { guoJieXinYangFirstNightOrder, guoJieXinYangOtherNightOrder } from './night-orders'
import { guoJieXinYangRoles } from './roles'
import { guoJieXinYangSetupRules } from './setup-rules'
import { guoJieXinYangSetupTemplates } from './setup-templates'

export const guoJieXinYangSmartScriptPack = {
  scriptId: "guo-jie-xin-yang",
  displayName: "过界信仰",
  source: { author: 'Zets', version: 'GStone edition 20006 / game 32346', url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20006_56104.json", contentHash: "sha256:aae3b5e90dc59df98998d6e0ee8f3a30bf64a859abc802e7c19e9d92389d197a", verifiedAt: "2026-07-22" },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: guoJieXinYangRoles,
  nightOrders: { firstNight: guoJieXinYangFirstNightOrder, otherNight: guoJieXinYangOtherNightOrder },
  setupTemplates: guoJieXinYangSetupTemplates,
  setupRules: guoJieXinYangSetupRules,
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
