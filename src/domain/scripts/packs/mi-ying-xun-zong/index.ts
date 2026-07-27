import type { SmartScriptPack } from '../../types'
import { miYingXunZongFirstNight, miYingXunZongOtherNight } from './night-orders'
import { miYingXunZongRoles } from './roles'
import { miYingXunZongSetupRules } from './setup-rules'
import { miYingXunZongSetupTemplates } from './setup-templates'

export const miYingXunZongSmartScriptPack = {
  scriptId: "mi-ying-xun-zong",
  displayName: "觅影寻踪",
  source: { author: "Narninian & Zaba", version: "GStone edition 20759 / game 39432", url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20759_59924.json", contentHash: "sha256:4a44da87af812886d77d55628a4b1f169e98ed1116df511e0e9bae5067191a61", verifiedAt: "2026-07-22" },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: miYingXunZongRoles,
  nightOrders: { firstNight: miYingXunZongFirstNight, otherNight: miYingXunZongOtherNight },
  setupTemplates: miYingXunZongSetupTemplates,
  setupRules: miYingXunZongSetupRules,
  knowledgeStatus: 'needs-review',
} as const satisfies SmartScriptPack
