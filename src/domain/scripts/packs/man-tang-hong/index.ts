import type { SmartScriptPack } from '../../types'
import { manTangHongFirstNight, manTangHongOtherNight } from './night-orders'
import { manTangHongRoles } from './roles'
import { manTangHongSetupRules } from './setup-rules'
import { manTangHongSetupTemplates } from './setup-templates'

export const manTangHongSmartScriptPack = {
  scriptId: "man-tang-hong",
  displayName: "满堂红",
  source: { author: "Sui染钟楼", version: "GStone edition 21264 / game 41726", url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21264_94932.json", contentHash: 'sha256:02e9b0b0559b4d5e755fd0e324e54c8aa5fa73d2d497b732e6ef75c5baeaa05f', verifiedAt: "2026-07-22" },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: manTangHongRoles,
  nightOrders: { firstNight: manTangHongFirstNight, otherNight: manTangHongOtherNight },
  setupTemplates: manTangHongSetupTemplates,
  setupRules: manTangHongSetupRules,
  knowledgeStatus: 'needs-review',
} as const satisfies SmartScriptPack
