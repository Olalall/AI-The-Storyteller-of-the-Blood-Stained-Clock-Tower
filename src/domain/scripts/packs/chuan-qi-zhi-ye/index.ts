import type { SmartScriptPack } from '../../types'
import { chuanQiZhiYeFirstNight, chuanQiZhiYeOtherNight } from './night-orders'
import { chuanQiZhiYeRoles } from './roles'
import { chuanQiZhiYeSetupRules } from './setup-rules'
import { chuanQiZhiYeSetupTemplates } from './setup-templates'

export const chuanQiZhiYeSmartScriptPack = {
  scriptId: "chuan-qi-zhi-ye",
  displayName: "传奇之夜",
  source: { author: "Sui", version: "GStone edition 20771 / game 39467", url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20771_78762.json", contentHash: "sha256:cc4c9bb6509aed6544f4cd7964ebb93bf092a5f6f31b57c0dca7913c7aeecb1d", verifiedAt: "2026-07-22" },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: chuanQiZhiYeRoles,
  nightOrders: { firstNight: chuanQiZhiYeFirstNight, otherNight: chuanQiZhiYeOtherNight },
  setupTemplates: chuanQiZhiYeSetupTemplates,
  setupRules: chuanQiZhiYeSetupRules,
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
