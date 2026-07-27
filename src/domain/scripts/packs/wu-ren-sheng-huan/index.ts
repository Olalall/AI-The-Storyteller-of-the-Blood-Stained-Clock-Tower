import type { SmartScriptPack } from '../../types'
import { wuRenShengHuanFirstNightOrder, wuRenShengHuanOtherNightOrder } from './night-orders'
import { wuRenShengHuanRoles } from './roles'
import { wuRenShengHuanSetupRules } from './setup-rules'
import { wuRenShengHuanSetupTemplates } from './setup-templates'

export const wuRenShengHuanSmartScriptPack = {
  scriptId: "wu-ren-sheng-huan",
  displayName: "无人生还",
  source: { author: "Aero", version: 'GStone edition 21222 / game 41550', url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21222_95006.json", contentHash: "sha256:424967d1c8999ba8c714e16ed4c922b56f2fe076897de7005a0c947fea808ce7", verifiedAt: '2026-07-22' },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: wuRenShengHuanRoles,
  nightOrders: { firstNight: wuRenShengHuanFirstNightOrder, otherNight: wuRenShengHuanOtherNightOrder },
  setupTemplates: wuRenShengHuanSetupTemplates,
  setupRules: wuRenShengHuanSetupRules,
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
