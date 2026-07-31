import type { SmartScriptPack } from '../../types'
import { tuiBaiCanJuFirstNight, tuiBaiCanJuOtherNight } from './night-orders'
import { tuiBaiCanJuRoles } from './roles'
import { tuiBaiCanJuSetupRules } from './setup-rules'
import { tuiBaiCanJuSetupTemplates } from './setup-templates'

export const tuiBaiCanJuSmartScriptPack = {
  scriptId: "tui-bai-can-ju",
  displayName: "颓败残局",
  source: { author: "Subdog&Sionar", version: "GStone edition 21233 / game 41573", url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21233_32855.json", contentHash: "sha256:46081acf6345af84282789aabeb4c82cc2390268c06479f82321d8c82e1f3fd6", verifiedAt: "2026-07-22" },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: tuiBaiCanJuRoles,
  nightOrders: { firstNight: tuiBaiCanJuFirstNight, otherNight: tuiBaiCanJuOtherNight },
  setupTemplates: tuiBaiCanJuSetupTemplates,
  setupRules: tuiBaiCanJuSetupRules,
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
