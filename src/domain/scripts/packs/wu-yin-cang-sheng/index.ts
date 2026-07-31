import type { SmartScriptPack } from '../../types'
import { wuYinCangShengFirstNight, wuYinCangShengOtherNight } from './night-orders'
import { wuYinCangShengRoles } from './roles'
import { wuYinCangShengSetupRules } from './setup-rules'
import { wuYinCangShengSetupTemplates } from './setup-templates'

export const wuYinCangShengSmartScriptPack = {
  scriptId: "wu-yin-cang-sheng",
  displayName: "雾隐苍生",
  source: { author: "新仔辣椒酱", version: 'GStone edition 21529 / game 42996', url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21529_04125.json", contentHash: 'sha256:82a7da8752a99d8ad0af28033db833457e66a1edcbbdc172df9f88011211e77d', verifiedAt: '2026-07-22' },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: wuYinCangShengRoles,
  nightOrders: { firstNight: wuYinCangShengFirstNight, otherNight: wuYinCangShengOtherNight },
  setupTemplates: wuYinCangShengSetupTemplates,
  setupRules: wuYinCangShengSetupRules,
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
