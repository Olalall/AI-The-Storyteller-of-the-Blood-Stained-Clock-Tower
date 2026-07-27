import type { SmartScriptPack } from '../../types'
import { lanXieJieQuFirstNightOrder, lanXieJieQuOtherNightOrder } from './night-orders'
import { lanXieJieQuRoles } from './roles'
import { lanXieJieQuSetupRules } from './setup-rules'
import { lanXieJieQuSetupTemplates } from './setup-templates'

export const lanXieJieQuSmartScriptPack = {
  scriptId: "lan-xie-jie-qu",
  displayName: "蓝榭街区",
  source: { author: "TPI", version: 'GStone edition 20758 / game 39434', url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20758_59930.json", contentHash: "sha256:7964badba754c80e54378eac7670c6f7e5c3be4d547476dca58ea0d9f9417aa2", verifiedAt: "2026-07-22" },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: lanXieJieQuRoles,
  nightOrders: { firstNight: lanXieJieQuFirstNightOrder, otherNight: lanXieJieQuOtherNightOrder },
  setupTemplates: lanXieJieQuSetupTemplates,
  setupRules: lanXieJieQuSetupRules,
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
