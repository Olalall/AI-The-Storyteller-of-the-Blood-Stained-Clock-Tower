import type { SmartScriptPack } from '../../types'
import { dengXiaHuiYingFirstNightOrder, dengXiaHuiYingOtherNightOrder } from './night-orders'
import { dengXiaHuiYingRoles } from './roles'
import { dengXiaHuiYingSetupRules } from './setup-rules'
import { dengXiaHuiYingSetupTemplates } from './setup-templates'

export const dengXiaHuiYingSmartScriptPack = {
  scriptId: "deng-xia-hui-ying",
  displayName: "灯下绘影",
  source: { author: "痴愚", version: 'GStone edition 21050 / game 40888', url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21050_74806.json", contentHash: "sha256:1076f63140106930e1d21914d2f109397033e4d5aa9d8d0da756ace8f5835a6c", verifiedAt: '2026-07-22' },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: dengXiaHuiYingRoles,
  nightOrders: { firstNight: dengXiaHuiYingFirstNightOrder, otherNight: dengXiaHuiYingOtherNightOrder },
  setupTemplates: dengXiaHuiYingSetupTemplates,
  setupRules: dengXiaHuiYingSetupRules,
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
