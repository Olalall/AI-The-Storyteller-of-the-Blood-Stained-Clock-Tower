import type { SmartScriptPack } from '../../types'
import { niuZhuanQianKunFirstNight, niuZhuanQianKunOtherNight } from './night-orders'
import { niuZhuanQianKunRoles } from './roles'
import { niuZhuanQianKunSetupRules } from './setup-rules'
import { niuZhuanQianKunSetupTemplates } from './setup-templates'

export const niuZhuanQianKunSmartScriptPack = {
  scriptId: 'niu-zhuan-qian-kun',
  displayName: "扭转乾坤",
  source: {
    author: "面哥&苏通染&馈馈",
    version: 'GStone edition 20768 / game 39462',
    url: 'https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20768_60983.json',
    contentHash: 'sha256:db75793c58d8678f614a8f6aa2d990485c5e46aebe538b1ed1e566a8bd2543a0',
    verifiedAt: '2026-07-22',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: niuZhuanQianKunRoles,
  nightOrders: { firstNight: niuZhuanQianKunFirstNight, otherNight: niuZhuanQianKunOtherNight },
  setupTemplates: niuZhuanQianKunSetupTemplates,
  setupRules: niuZhuanQianKunSetupRules,
  demonBluffPolicy: { count: 3, eligibleTeams: ['townsfolk'], requireNotInPlay: true, summary: 'Use not-in-play Townsfolk bluffs; avoid setup/duplicate roles unless storyteller intentionally hand-adjusts.' },
  knowledgeStatus: 'needs-review',
} as const satisfies SmartScriptPack
