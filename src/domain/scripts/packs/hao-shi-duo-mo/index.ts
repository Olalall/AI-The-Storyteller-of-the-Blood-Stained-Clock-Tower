import type { SmartScriptPack } from '../../types'
import { haoShiDuoMoFirstNight, haoShiDuoMoOtherNight } from './night-orders'
import { haoShiDuoMoRoles } from './roles'
import { haoShiDuoMoSetupRules } from './setup-rules'
import { haoShiDuoMoSetupTemplates } from './setup-templates'

export const haoShiDuoMoSmartScriptPack = {
  scriptId: "hao-shi-duo-mo",
  displayName: "好事多磨",
  source: { author: "TPI", version: "GStone edition 20749 / game 39443", url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20749_59939.json", contentHash: "sha256:2ad57e09ee5edc0523bea8979d42431922e09cbf68182cd0ad041320d98657a5", verifiedAt: "2026-07-22" },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: haoShiDuoMoRoles,
  nightOrders: { firstNight: haoShiDuoMoFirstNight, otherNight: haoShiDuoMoOtherNight },
  setupTemplates: haoShiDuoMoSetupTemplates,
  setupRules: haoShiDuoMoSetupRules,
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
