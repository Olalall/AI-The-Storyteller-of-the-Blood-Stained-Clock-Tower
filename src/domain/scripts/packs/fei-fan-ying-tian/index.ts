import type { SmartScriptPack } from '../../types'
import { feiFanYingTianFirstNight, feiFanYingTianOtherNight } from './night-orders'
import { feiFanYingTianRoles } from './roles'
import { feiFanYingTianSetupRules } from './setup-rules'
import { feiFanYingTianSetupTemplates } from './setup-templates'

export const feiFanYingTianSmartScriptPack = {
  scriptId: "fei-fan-ying-tian",
  displayName: "沸反盈天",
  source: { author: "", version: 'GStone edition 20783 / game 39496', url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20783_90331.json", contentHash: 'sha256:8f67853940c9e36b4ea142426e5c4e51a5c671656f54939ff429b30745468900', verifiedAt: '2026-07-22' },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: feiFanYingTianRoles,
  nightOrders: { firstNight: feiFanYingTianFirstNight, otherNight: feiFanYingTianOtherNight },
  setupTemplates: feiFanYingTianSetupTemplates,
  setupRules: feiFanYingTianSetupRules,
  knowledgeStatus: 'needs-review',
} as const satisfies SmartScriptPack
