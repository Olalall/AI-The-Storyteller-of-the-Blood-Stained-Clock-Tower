import type { SmartScriptPack } from '../../types'
import { zhuoYueBiFangFirstNightOrder, zhuoYueBiFangOtherNightOrder } from './night-orders'
import { zhuoYueBiFangRoles } from './roles'
import { zhuoYueBiFangSetupRules } from './setup-rules'
import { zhuoYueBiFangSetupTemplates } from './setup-templates'

export const zhuoYueBiFangSmartScriptPack = {
  scriptId: "zhuo-yue-bi-fang",
  displayName: "浊月毕方",
  source: {
    author: "Lei的剧本钟楼",
    version: "GStone edition 21096 / game 41109",
    url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21096_69654.json",
    contentHash: "sha256:ffe246e86acbbd57f8c913d6ab04ac9798c2c80a34d9a8444ad60b73b3c7e18d",
    verifiedAt: '2026-07-21',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: zhuoYueBiFangRoles,
  nightOrders: {
    firstNight: zhuoYueBiFangFirstNightOrder,
    otherNight: zhuoYueBiFangOtherNightOrder,
  },
  setupTemplates: zhuoYueBiFangSetupTemplates,
  setupRules: zhuoYueBiFangSetupRules,
  knowledgeStatus: 'needs-review',
} satisfies SmartScriptPack
