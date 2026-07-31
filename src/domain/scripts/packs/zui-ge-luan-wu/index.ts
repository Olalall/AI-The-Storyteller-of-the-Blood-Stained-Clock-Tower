import type { SmartScriptPack } from '../../types'
import { zuiGeLuanWuFirstNight, zuiGeLuanWuOtherNight } from './night-orders'
import { zuiGeLuanWuRoles } from './roles'
import { zuiGeLuanWuSetupRules } from './setup-rules'
import { zuiGeLuanWuSetupTemplates } from './setup-templates'

export const zuiGeLuanWuSmartScriptPack = {
  scriptId: "zui-ge-luan-wu",
  displayName: "醉歌乱舞",
  source: { author: "TPI", version: "GStone edition 20760 / game 39433", url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20760_59924.json", contentHash: "sha256:1d1b6109849cce24c4b48e0dbb4564900d65f13b8f3e588710d5d60f0915f08e", verifiedAt: "2026-07-22" },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: zuiGeLuanWuRoles,
  nightOrders: { firstNight: zuiGeLuanWuFirstNight, otherNight: zuiGeLuanWuOtherNight },
  setupTemplates: zuiGeLuanWuSetupTemplates,
  setupRules: zuiGeLuanWuSetupRules,
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
