import type { SmartScriptPack } from '../../types'
import { yiYeYuLongWuFirstNight, yiYeYuLongWuOtherNight } from './night-orders'
import { yiYeYuLongWuRoles } from './roles'
import { yiYeYuLongWuSetupRules } from './setup-rules'
import { yiYeYuLongWuSetupTemplates } from './setup-templates'

export const yiYeYuLongWuSmartScriptPack = {
  scriptId: 'yi-ye-yu-long-wu',
  displayName: '一夜鱼龙舞',
  source: {
    author: '驯鹿&痴愚',
    version: 'GStone edition 20707 / game 39320',
    url: 'https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20707_14499.json',
    contentHash: 'sha256:586543e427e3cc065ad51b0ee2febe784de85058da5d60f83774c7a9b47b4ac1',
    verifiedAt: '2026-07-22',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: yiYeYuLongWuRoles,
  nightOrders: { firstNight: yiYeYuLongWuFirstNight, otherNight: yiYeYuLongWuOtherNight },
  setupTemplates: yiYeYuLongWuSetupTemplates,
  setupRules: yiYeYuLongWuSetupRules,
  demonBluffPolicy: {
    count: 3,
    eligibleTeams: ['townsfolk'],
    requireNotInPlay: true,
    summary: 'Use three not-in-play Townsfolk bluffs; do not bluff Travelers or Dragon Body.',
  },
  knowledgeStatus: 'needs-review',
} as const satisfies SmartScriptPack
