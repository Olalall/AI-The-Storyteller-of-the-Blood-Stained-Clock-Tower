import type { SmartScriptPack } from '../../types'
import { gaiTouHuanMianFirstNight, gaiTouHuanMianOtherNight } from './night-orders'
import { gaiTouHuanMianRoles } from './roles'
import { gaiTouHuanMianSetupRules } from './setup-rules'
import { gaiTouHuanMianSetupTemplates } from './setup-templates'

export const gaiTouHuanMianSmartScriptPack = {
  scriptId: 'gai-tou-huan-mian',
  displayName: "改头换面",
  source: {
    author: "苏通染",
    version: 'GStone edition 20769 / game 39463',
    url: 'https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20769_61005.json',
    contentHash: 'sha256:d7833ff494f68c1819ee9ae7c2841c2e3a5b2d8a153d9301e522ba871352c05f',
    verifiedAt: '2026-07-22',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: gaiTouHuanMianRoles,
  nightOrders: { firstNight: gaiTouHuanMianFirstNight, otherNight: gaiTouHuanMianOtherNight },
  setupTemplates: gaiTouHuanMianSetupTemplates,
  setupRules: gaiTouHuanMianSetupRules,
  demonBluffPolicy: { count: 3, eligibleTeams: ['townsfolk'], requireNotInPlay: true, summary: 'Use not-in-play Townsfolk bluffs; setup and hidden-information roles are bluff-only unless storyteller hand-adjusts.' },
  knowledgeStatus: 'needs-review',
} as const satisfies SmartScriptPack
