import type { SmartScriptPack } from '../../types'
import { xianXiangHuanShengFirstNightOrder, xianXiangHuanShengOtherNightOrder } from './night-orders'
import { xianXiangHuanShengRoles } from './roles'
import { xianXiangHuanShengSetupRules } from './setup-rules'
import { xianXiangHuanShengSetupTemplates } from './setup-templates'

export const xianXiangHuanShengSmartScriptPack = {
  scriptId: "xian-xiang-huan-sheng",
  displayName: "险象环生",
  source: { author: "Zets", version: 'GStone edition 20004 / game 32342', url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20004_77413.json", contentHash: "sha256:c79b41548a6737825911eac8c5244f972310ec8eeaad78bf13a4c926d98a5997", verifiedAt: "2026-07-22" },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: xianXiangHuanShengRoles,
  nightOrders: { firstNight: xianXiangHuanShengFirstNightOrder, otherNight: xianXiangHuanShengOtherNightOrder },
  setupTemplates: xianXiangHuanShengSetupTemplates,
  setupRules: xianXiangHuanShengSetupRules,
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
