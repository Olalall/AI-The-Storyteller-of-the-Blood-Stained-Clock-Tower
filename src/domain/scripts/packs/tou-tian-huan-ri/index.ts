import type { SmartScriptPack } from '../../types'
import { touTianHuanRiFirstNight, touTianHuanRiOtherNight } from './night-orders'
import { touTianHuanRiRoles } from './roles'
import { touTianHuanRiSetupRules } from './setup-rules'
import { touTianHuanRiSetupTemplates } from './setup-templates'

export const touTianHuanRiSmartScriptPack = {
  scriptId: "tou-tian-huan-ri",
  displayName: "偷天换日",
  source: { author: "TPI", version: 'GStone edition 20745 / game 39447', url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20745_59943.json", contentHash: 'sha256:222d0ffb78fc4d10eb9eafa085e4913b030f50e72953dd2abdcaf90f1748f044', verifiedAt: "2026-07-22" },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: touTianHuanRiRoles,
  nightOrders: { firstNight: touTianHuanRiFirstNight, otherNight: touTianHuanRiOtherNight },
  setupTemplates: touTianHuanRiSetupTemplates,
  setupRules: touTianHuanRiSetupRules,
  knowledgeStatus: 'needs-review',
} as const satisfies SmartScriptPack
