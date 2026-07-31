import type { SmartScriptPack } from '../../types'
import { muSeCunZhuangFirstNight, muSeCunZhuangOtherNight } from './night-orders'
import { muSeCunZhuangRoles } from './roles'
import { muSeCunZhuangSetupRules } from './setup-rules'
import { muSeCunZhuangSetupTemplates } from './setup-templates'

export const muSeCunZhuangSmartScriptPack = {
  scriptId: 'mu-se-cun-zhuang',
  displayName: '暮色村庄',
  source: { author: '调和师', version: 'GStone edition 21247 / game 41638', url: 'https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21247_33087.json', contentHash: 'sha256:54c163464d9765d5504ff9f1f69e9c5ea2d929eb1c6233b59d48393bb6f7ec3b', verifiedAt: '2026-07-22' },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: muSeCunZhuangRoles,
  nightOrders: { firstNight: muSeCunZhuangFirstNight, otherNight: muSeCunZhuangOtherNight },
  setupTemplates: muSeCunZhuangSetupTemplates,
  setupRules: muSeCunZhuangSetupRules,
  demonBluffPolicy: { count: 3, eligibleTeams: ['townsfolk'], requireNotInPlay: true, summary: 'Use three not-in-play Townsfolk bluffs; do not bluff Travelers or Fabled.' },
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
