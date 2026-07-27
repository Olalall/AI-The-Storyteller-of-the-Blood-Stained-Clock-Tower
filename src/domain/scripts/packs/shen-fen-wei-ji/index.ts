import type { SmartScriptPack } from '../../types'
import { shenFenWeiJiFirstNight, shenFenWeiJiOtherNight } from './night-orders'
import { shenFenWeiJiRoles } from './roles'
import { shenFenWeiJiSetupRules } from './setup-rules'
import { shenFenWeiJiSetupTemplates } from './setup-templates'

export const shenFenWeiJiSmartScriptPack = {
  scriptId: "shen-fen-wei-ji",
  displayName: "身份危机",
  source: { author: "", version: "GStone edition 20285 / game 36806", url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20285_77381.json", contentHash: "sha256:627eeec710a42b9e23055b40a99f6759e7eb3647e607fb77cc76239ea9382a95", verifiedAt: "2026-07-22" },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: shenFenWeiJiRoles,
  nightOrders: { firstNight: shenFenWeiJiFirstNight, otherNight: shenFenWeiJiOtherNight },
  setupTemplates: shenFenWeiJiSetupTemplates,
  setupRules: shenFenWeiJiSetupRules,
  knowledgeStatus: 'needs-review',
} as const satisfies SmartScriptPack
