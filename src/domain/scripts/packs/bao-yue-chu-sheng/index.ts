import type { SmartScriptPack } from '../../types'
import { baoYueChuShengFirstNight, baoYueChuShengOtherNight } from './night-orders'
import { baoYueChuShengRoles } from './roles'
import { baoYueChuShengSetupRules } from './setup-rules'
import { baoYueChuShengSetupTemplates } from './setup-templates'

export const baoYueChuShengSmartScriptPack = {
  scriptId: "bao-yue-chu-sheng",
  displayName: "宝月初升",
  source: { author: "Chiz", version: 'GStone edition 20726 / game 39395', url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20726_52289.json", contentHash: 'sha256:73a0d102934967b66a455b6d8f5e012bcfb9fbd720efc38c2340240a7d7a7893', verifiedAt: "2026-07-22" },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: baoYueChuShengRoles,
  nightOrders: { firstNight: baoYueChuShengFirstNight, otherNight: baoYueChuShengOtherNight },
  setupTemplates: baoYueChuShengSetupTemplates,
  setupRules: baoYueChuShengSetupRules,
  knowledgeStatus: 'needs-review',
} as const satisfies SmartScriptPack
