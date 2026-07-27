import type { SmartScriptPack } from '../../types'
import { huYanLuanYuFirstNight, huYanLuanYuOtherNight } from './night-orders'
import { huYanLuanYuRoles } from './roles'
import { huYanLuanYuSetupRules } from './setup-rules'
import { huYanLuanYuSetupTemplates } from './setup-templates'

export const huYanLuanYuSmartScriptPack = {
  scriptId: "hu-yan-luan-yu",
  displayName: "胡言乱语",
  source: { author: "刘中奇", version: 'GStone edition 21266 / game 41728', url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21266_81492.json", contentHash: 'sha256:cdbca64798fabca08e25147875ddf9456a3503ed06455dd3a870d8a668104237', verifiedAt: '2026-07-22' },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: huYanLuanYuRoles,
  nightOrders: { firstNight: huYanLuanYuFirstNight, otherNight: huYanLuanYuOtherNight },
  setupTemplates: huYanLuanYuSetupTemplates,
  setupRules: huYanLuanYuSetupRules,
  knowledgeStatus: 'needs-review',
} as const satisfies SmartScriptPack
