import type { SmartScriptPack } from '../../types'
import { yuGaiMiZhangFirstNightOrder, yuGaiMiZhangOtherNightOrder } from './night-orders'
import { yuGaiMiZhangRoles } from './roles'
import { yuGaiMiZhangSetupRules } from './setup-rules'
import { yuGaiMiZhangSetupTemplates } from './setup-templates'

export const yuGaiMiZhangSmartScriptPack = {
  scriptId: "yu-gai-mi-zhang",
  displayName: "欲盖弥彰",
  source: { author: "Milk", version: 'GStone edition 20755 / game 39437', url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20755_59933.json", contentHash: "sha256:abd6bf76cb4565c25cc7d5feb3bac3eb79f06612c0f49121fed2dbba4e543c47", verifiedAt: "2026-07-22" },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: yuGaiMiZhangRoles,
  nightOrders: { firstNight: yuGaiMiZhangFirstNightOrder, otherNight: yuGaiMiZhangOtherNightOrder },
  setupTemplates: yuGaiMiZhangSetupTemplates,
  setupRules: yuGaiMiZhangSetupRules,
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
