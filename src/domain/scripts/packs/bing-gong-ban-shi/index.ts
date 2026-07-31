import type { SmartScriptPack } from '../../types'
import { bingGongBanShiFirstNightOrder, bingGongBanShiOtherNightOrder } from './night-orders'
import { bingGongBanShiRoles } from './roles'
import { bingGongBanShiSetupRules } from './setup-rules'
import { bingGongBanShiSetupTemplates } from './setup-templates'

export const bingGongBanShiSmartScriptPack = {
  scriptId: "bing-gong-ban-shi",
  displayName: "秉公办事",
  source: {
    author: "清清Jungle",
    version: "GStone edition 21097 / game 41110",
    url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21097_69653.json",
    contentHash: "sha256:e6ddad5ff318ef98a6f597bf34f0a8a8064675f250ff60b8c38a3f91b0e341ca",
    verifiedAt: "2026-07-21",
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: bingGongBanShiRoles,
  nightOrders: {
    firstNight: bingGongBanShiFirstNightOrder,
    otherNight: bingGongBanShiOtherNightOrder,
  },
  setupTemplates: bingGongBanShiSetupTemplates,
  setupRules: bingGongBanShiSetupRules,
  knowledgeStatus: 'confirmed',
} satisfies SmartScriptPack
