import type { SmartScriptPack } from '../../types'
import { siZuiChanHuiRiFirstNightOrder, siZuiChanHuiRiOtherNightOrder } from './night-orders'
import { siZuiChanHuiRiRoles } from './roles'
import { siZuiChanHuiRiSetupRules } from './setup-rules'
import { siZuiChanHuiRiSetupTemplates } from './setup-templates'

export const siZuiChanHuiRiSmartScriptPack = {
  scriptId: "si-zui-chan-hui-ri",
  displayName: "死罪忏悔日",
  source: { author: "Ben", version: "GStone edition 20001 / game 32705", url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20001_77217.json", contentHash: "sha256:5c514b72a58b8b9beacbf8da767760c34a73f3b3f1f9e36b63c8fe0b01c384c3", verifiedAt: "2026-07-22" },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: siZuiChanHuiRiRoles,
  nightOrders: { firstNight: siZuiChanHuiRiFirstNightOrder, otherNight: siZuiChanHuiRiOtherNightOrder },
  setupTemplates: siZuiChanHuiRiSetupTemplates,
  setupRules: siZuiChanHuiRiSetupRules,
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
