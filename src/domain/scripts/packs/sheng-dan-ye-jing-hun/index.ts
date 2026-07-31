import type { SmartScriptPack } from '../../types'
import { shengDanYeJingHunFirstNight, shengDanYeJingHunOtherNight } from './night-orders'
import { shengDanYeJingHunRoles } from './roles'
import { shengDanYeJingHunSetupRules } from './setup-rules'
import { shengDanYeJingHunSetupTemplates } from './setup-templates'

export const shengDanYeJingHunSmartScriptPack = {
  scriptId: "sheng-dan-ye-jing-hun",
  displayName: "圣诞夜惊魂",
  source: { author: "Lei的剧本钟楼", version: "GStone edition 21229 / game 41556", url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21229_95005.json", contentHash: "sha256:ac28f4bd2828f00386ad14d3854e919065a4de474365c410830bb48ee8e19b18", verifiedAt: "2026-07-22" },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: shengDanYeJingHunRoles,
  nightOrders: { firstNight: shengDanYeJingHunFirstNight, otherNight: shengDanYeJingHunOtherNight },
  setupTemplates: shengDanYeJingHunSetupTemplates,
  setupRules: shengDanYeJingHunSetupRules,
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
