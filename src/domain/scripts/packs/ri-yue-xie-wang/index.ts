import type { SmartScriptPack } from '../../types'
import { riYueXieWangFirstNight, riYueXieWangOtherNight } from './night-orders'
import { riYueXieWangRoles } from './roles'
import { riYueXieWangSetupRules } from './setup-rules'
import { riYueXieWangSetupTemplates } from './setup-templates'

export const riYueXieWangSmartScriptPack = {
  scriptId: "ri-yue-xie-wang",
  displayName: "日月偕亡",
  source: { author: "闻人", version: 'GStone edition 21530 / game 42997', url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21530_04126.json", contentHash: 'sha256:51a82d06313ee171f3ead5735e2fc9590515af0a6224fb3b3615de65f5eda864', verifiedAt: '2026-07-22' },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: riYueXieWangRoles,
  nightOrders: { firstNight: riYueXieWangFirstNight, otherNight: riYueXieWangOtherNight },
  setupTemplates: riYueXieWangSetupTemplates,
  setupRules: riYueXieWangSetupRules,
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
