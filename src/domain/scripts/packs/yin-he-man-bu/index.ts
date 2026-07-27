import type { SmartScriptPack } from '../../types'
import { yinHeManBuFirstNight, yinHeManBuOtherNight } from './night-orders'
import { yinHeManBuRoles } from './roles'
import { yinHeManBuSetupRules } from './setup-rules'
import { yinHeManBuSetupTemplates } from './setup-templates'

export const yinHeManBuSmartScriptPack = {
  scriptId: "yin-he-man-bu",
  displayName: "银河漫步",
  source: { author: "Ekin", version: "GStone edition 20761 / game 39431", url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20761_59924.json", contentHash: "sha256:edb443b035e3ceb1cd1dd2e9a6decc570369ef8eec5e17f6f3532122ad2f098c", verifiedAt: "2026-07-22" },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: yinHeManBuRoles,
  nightOrders: { firstNight: yinHeManBuFirstNight, otherNight: yinHeManBuOtherNight },
  setupTemplates: yinHeManBuSetupTemplates,
  setupRules: yinHeManBuSetupRules,
  knowledgeStatus: 'needs-review',
} as const satisfies SmartScriptPack
