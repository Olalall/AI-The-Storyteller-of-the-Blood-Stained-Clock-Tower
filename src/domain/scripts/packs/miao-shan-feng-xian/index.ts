import type { SmartScriptPack } from '../../types'
import { miaoShanFengXianFirstNightOrder, miaoShanFengXianOtherNightOrder } from './night-orders'
import { miaoShanFengXianRoles } from './roles'
import { miaoShanFengXianSetupRules } from './setup-rules'
import { miaoShanFengXianSetupTemplates } from './setup-templates'

export const miaoShanFengXianSmartScriptPack = {
  scriptId: "miao-shan-feng-xian",
  displayName: "妙山封仙",
  source: { author: "Jams", version: "GStone edition 20941 / game 40258", url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20941_46818.json", contentHash: "sha256:0ac51f9b9b4b9ef27f06ce219cf378ecbf4516a3f5b1267e945343a84d5d152f", verifiedAt: '2026-07-21' },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: miaoShanFengXianRoles,
  nightOrders: { firstNight: miaoShanFengXianFirstNightOrder, otherNight: miaoShanFengXianOtherNightOrder },
  setupTemplates: miaoShanFengXianSetupTemplates,
  setupRules: miaoShanFengXianSetupRules,
  knowledgeStatus: 'needs-review',
} satisfies SmartScriptPack
