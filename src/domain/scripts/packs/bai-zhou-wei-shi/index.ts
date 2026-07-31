import type { SmartScriptPack } from '../../types'
import { baiZhouWeiShiFirstNight, baiZhouWeiShiOtherNight } from './night-orders'
import { baiZhouWeiShiRoles } from './roles'
import { baiZhouWeiShiSetupRules } from './setup-rules'
import { baiZhouWeiShiSetupTemplates } from './setup-templates'

export const baiZhouWeiShiSmartScriptPack = {
  scriptId: "bai-zhou-wei-shi",
  displayName: "白昼为市",
  source: { author: "寒水", version: 'GStone edition 21285 / game 41747', url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21285_26731.json", contentHash: 'sha256:fe227f4a0f84c11988524c39fdf76038f0fc7922c8e90a8fb07da30e379df27a', verifiedAt: '2026-07-22' },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: baiZhouWeiShiRoles,
  nightOrders: { firstNight: baiZhouWeiShiFirstNight, otherNight: baiZhouWeiShiOtherNight },
  setupTemplates: baiZhouWeiShiSetupTemplates,
  setupRules: baiZhouWeiShiSetupRules,
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
