import type { SmartScriptPack } from '../../types'
import { quanMianSuQingFirstNight, quanMianSuQingOtherNight } from './night-orders'
import { quanMianSuQingRoles } from './roles'
import { quanMianSuQingSetupRules } from './setup-rules'
import { quanMianSuQingSetupTemplates } from './setup-templates'

export const quanMianSuQingSmartScriptPack = {
  scriptId: "quan-mian-su-qing",
  displayName: "全面肃清",
  source: { author: "Soup", version: 'GStone edition 20746 / game 39446', url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20746_59942.json", contentHash: 'sha256:f83b3c5e5a3c14912b36fcdc4f38bdf0aeddb673855b78c124838bd6f6cca807', verifiedAt: "2026-07-22" },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: quanMianSuQingRoles,
  nightOrders: { firstNight: quanMianSuQingFirstNight, otherNight: quanMianSuQingOtherNight },
  setupTemplates: quanMianSuQingSetupTemplates,
  setupRules: quanMianSuQingSetupRules,
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
