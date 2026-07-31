import type { SmartScriptPack } from '../../types'
import { shengShiQiWenFirstNight, shengShiQiWenOtherNight } from './night-orders'
import { shengShiQiWenRoles } from './roles'
import { shengShiQiWenSetupRules } from './setup-rules'
import { shengShiQiWenSetupTemplates } from './setup-templates'

export const shengShiQiWenSmartScriptPack = {
  scriptId: "sheng-shi-qi-wen",
  displayName: "盛世奇闻（测试中）",
  source: { author: "", version: "GStone edition 20254 / game 36685", url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20254_23200.json", contentHash: "sha256:756e333f2ca244ce903e7f4a51e49bc089f8a0bba5c7c4551787f83617f0d4a3", verifiedAt: "2026-07-22" },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: shengShiQiWenRoles,
  nightOrders: { firstNight: shengShiQiWenFirstNight, otherNight: shengShiQiWenOtherNight },
  setupTemplates: shengShiQiWenSetupTemplates,
  setupRules: shengShiQiWenSetupRules,
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
