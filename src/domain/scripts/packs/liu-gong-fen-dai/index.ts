import type { SmartScriptPack } from '../../types'
import { liuGongFenDaiFirstNightOrder, liuGongFenDaiOtherNightOrder } from './night-orders'
import { liuGongFenDaiRoles } from './roles'
import { liuGongFenDaiSetupRules } from './setup-rules'
import { liuGongFenDaiSetupTemplates } from './setup-templates'

export const liuGongFenDaiSmartScriptPack = {
  scriptId: "liu-gong-fen-dai",
  displayName: "六宫粉黛",
  source: { author: "驯鹿", version: 'GStone edition 20950 / game 40255', url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20950_46806.json", contentHash: "sha256:1f3db312adda11b99ddee61096e4c7519aa25ab5ca742d8bfdf5bfc93f2b8a17", verifiedAt: '2026-07-22' },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: liuGongFenDaiRoles,
  nightOrders: { firstNight: liuGongFenDaiFirstNightOrder, otherNight: liuGongFenDaiOtherNightOrder },
  setupTemplates: liuGongFenDaiSetupTemplates,
  setupRules: liuGongFenDaiSetupRules,
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
