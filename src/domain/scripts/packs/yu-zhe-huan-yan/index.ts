import type { SmartScriptPack } from '../../types'
import { yuZheHuanYanFirstNight, yuZheHuanYanOtherNight } from './night-orders'
import { yuZheHuanYanRoles } from './roles'
import { yuZheHuanYanSetupRules } from './setup-rules'
import { yuZheHuanYanSetupTemplates } from './setup-templates'

export const yuZheHuanYanSmartScriptPack = {
  scriptId: "yu-zhe-huan-yan",
  displayName: "愚者欢宴",
  source: { author: "", version: 'GStone edition 20438 / game 37700', url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20438_58690.json", contentHash: 'sha256:4571db2ca9cfb548f5357a82e87a05a7c29b128678d43d4be427aa444b897e06', verifiedAt: "2026-07-22" },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: yuZheHuanYanRoles,
  nightOrders: { firstNight: yuZheHuanYanFirstNight, otherNight: yuZheHuanYanOtherNight },
  setupTemplates: yuZheHuanYanSetupTemplates,
  setupRules: yuZheHuanYanSetupRules,
  knowledgeStatus: 'needs-review',
} as const satisfies SmartScriptPack
