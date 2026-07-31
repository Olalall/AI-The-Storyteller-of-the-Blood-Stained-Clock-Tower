import type { SmartScriptPack } from '../../types'
import { xiaoErShangJiuFirstNight, xiaoErShangJiuOtherNight } from './night-orders'
import { xiaoErShangJiuRoles } from './roles'
import { xiaoErShangJiuSetupRules } from './setup-rules'
import { xiaoErShangJiuSetupTemplates } from './setup-templates'

export const xiaoErShangJiuSmartScriptPack = {
  scriptId: 'xiao-er-shang-jiu',
  displayName: '小二，上酒！',
  source: { author: '刘中奇', version: 'GStone edition 21589 / game 43373', url: 'https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21589_64333.json', contentHash: 'sha256:21d1f9c11c95d3150b183f409cb62bd83346d5caa15042ce346a32f0a8c37390', verifiedAt: '2026-07-22' },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: xiaoErShangJiuRoles,
  nightOrders: { firstNight: xiaoErShangJiuFirstNight, otherNight: xiaoErShangJiuOtherNight },
  setupTemplates: xiaoErShangJiuSetupTemplates,
  setupRules: xiaoErShangJiuSetupRules,
  demonBluffPolicy: { count: 3, eligibleTeams: ['townsfolk'], requireNotInPlay: true, summary: 'Use three not-in-play Townsfolk bluffs; do not bluff Travelers.' },
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
