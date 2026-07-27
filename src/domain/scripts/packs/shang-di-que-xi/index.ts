import type { SmartScriptPack } from '../../types'
import { shangDiQueXiFirstNightOrder, shangDiQueXiOtherNightOrder } from './night-orders'
import { shangDiQueXiRoles } from './roles'
import { shangDiQueXiSetupRules } from './setup-rules'
import { shangDiQueXiSetupTemplates } from './setup-templates'

export const shangDiQueXiSmartScriptPack = {
  scriptId: "shang-di-que-xi",
  displayName: "上帝缺席",
  source: { author: "", version: "GStone edition 20284 / game 36805", url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20284_77324.json", contentHash: "sha256:b63d687ab9f3532b9aab1bff3a34e63421170138da782933204689a322b80176", verifiedAt: "2026-07-22" },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: shangDiQueXiRoles,
  nightOrders: { firstNight: shangDiQueXiFirstNightOrder, otherNight: shangDiQueXiOtherNightOrder },
  setupTemplates: shangDiQueXiSetupTemplates,
  setupRules: shangDiQueXiSetupRules,
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
