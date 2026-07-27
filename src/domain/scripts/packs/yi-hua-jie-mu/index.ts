import type { SmartScriptPack } from '../../types'
import { yiHuaJieMuFirstNight, yiHuaJieMuOtherNight } from './night-orders'
import { yiHuaJieMuRoles } from './roles'
import { yiHuaJieMuSetupRules } from './setup-rules'
import { yiHuaJieMuSetupTemplates } from './setup-templates'

export const yiHuaJieMuSmartScriptPack = {
  scriptId: "yi-hua-jie-mu",
  displayName: "移花接木",
  source: { author: "刘中奇", version: 'GStone edition 21265 / game 41727', url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21265_94933.json", contentHash: 'sha256:9bbb3391e47daa2d60383a66c2bb2a1e3db97110131f1ee05e8c94285d88b3b4', verifiedAt: '2026-07-22' },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: yiHuaJieMuRoles,
  nightOrders: { firstNight: yiHuaJieMuFirstNight, otherNight: yiHuaJieMuOtherNight },
  setupTemplates: yiHuaJieMuSetupTemplates,
  setupRules: yiHuaJieMuSetupRules,
  knowledgeStatus: 'needs-review',
} as const satisfies SmartScriptPack
