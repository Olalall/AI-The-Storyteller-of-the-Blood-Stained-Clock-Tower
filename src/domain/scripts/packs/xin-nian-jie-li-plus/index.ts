import type { SmartScriptPack } from '../../types'
import { xinNianJieLiPlusFirstNightOrder, xinNianJieLiPlusOtherNightOrder } from './night-orders'
import { xinNianJieLiPlusRoles } from './roles'
import { xinNianJieLiPlusSetupRules } from './setup-rules'
import { xinNianJieLiPlusSetupTemplates } from './setup-templates'

export const xinNianJieLiPlusSmartScriptPack = {
  scriptId: 'xin-nian-jie-li-plus',
  displayName: "信念解离 +",
  source: {
    author: "Cake & David L",
    version: 'GStone edition 21220 / game 41549',
    url: 'https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21220_32861.json',
    contentHash: 'sha256:5dffd3b3cf38d01025742fdcdbf0de256375a04dcb7ba68090c7711bb1947dcc',
    verifiedAt: '2026-07-22',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: xinNianJieLiPlusRoles,
  nightOrders: { firstNight: xinNianJieLiPlusFirstNightOrder, otherNight: xinNianJieLiPlusOtherNightOrder },
  setupTemplates: xinNianJieLiPlusSetupTemplates,
  setupRules: xinNianJieLiPlusSetupRules,
  demonBluffPolicy: {
    count: 3,
    eligibleTeams: ['townsfolk', 'outsider'],
    requireNotInPlay: true,
    summary: '3 out-of-play Townsfolk or Outsider bluffs; Fabled and duplicate-Demon paths are never bluffs.',
  },
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
