import type { SmartScriptPack } from '../../types'
import { daQuanZaiWoFirstNightOrder, daQuanZaiWoOtherNightOrder } from './night-orders'
import { daQuanZaiWoRoles } from './roles'
import { daQuanZaiWoSetupRules } from './setup-rules'
import { daQuanZaiWoSetupTemplates } from './setup-templates'

export const daQuanZaiWoSmartScriptPack = {
  scriptId: "da-quan-zai-wo",
  displayName: "大权在握",
  source: { author: "TPI", version: 'GStone edition 20748 / game 39444', url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20748_59940.json", contentHash: "sha256:11e225e196b7e2edc77bb6c7a67d3cc75ec9538c3abae4273f2f2b049f9e3950", verifiedAt: "2026-07-22" },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: daQuanZaiWoRoles,
  nightOrders: { firstNight: daQuanZaiWoFirstNightOrder, otherNight: daQuanZaiWoOtherNightOrder },
  setupTemplates: daQuanZaiWoSetupTemplates,
  setupRules: daQuanZaiWoSetupRules,
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
