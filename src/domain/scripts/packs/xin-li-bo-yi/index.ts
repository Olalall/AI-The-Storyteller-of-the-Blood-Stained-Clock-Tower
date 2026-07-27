import type { SmartScriptPack } from '../../types'
import { xinLiBoYiFirstNightOrder, xinLiBoYiOtherNightOrder } from './night-orders'
import { xinLiBoYiRoles } from './roles'
import { xinLiBoYiSetupRules } from './setup-rules'
import { xinLiBoYiSetupTemplates } from './setup-templates'

export const xinLiBoYiSmartScriptPack = {
  scriptId: "xin-li-bo-yi",
  displayName: "心理博弈",
  source: { author: "Habby", version: 'GStone edition 20751 / game 39441', url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20751_59935.json", contentHash: "sha256:e208bc31314b6faab9a17b6d74f5e93aa5ebba218fe9132402a46818ff1d2708", verifiedAt: "2026-07-22" },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: xinLiBoYiRoles,
  nightOrders: { firstNight: xinLiBoYiFirstNightOrder, otherNight: xinLiBoYiOtherNightOrder },
  setupTemplates: xinLiBoYiSetupTemplates,
  setupRules: xinLiBoYiSetupRules,
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
