import type { SmartScriptPack } from '../../types'
import { tongYanWuJiFirstNight, tongYanWuJiOtherNight } from './night-orders'
import { tongYanWuJiRoles } from './roles'
import { tongYanWuJiSetupRules } from './setup-rules'
import { tongYanWuJiSetupTemplates } from './setup-templates'

export const tongYanWuJiSmartScriptPack = {
  scriptId: 'tong-yan-wu-ji',
  displayName: '童言无忌',
  source: { author: 'Aaron', version: 'GStone edition 20946 / game 40257', url: 'https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20946_46814.json', contentHash: 'sha256:1fa9a250c28443fdf191650d76849fece7176f4445a2539aaa92eb3b4e6289c1', verifiedAt: '2026-07-22' },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: tongYanWuJiRoles,
  nightOrders: { firstNight: tongYanWuJiFirstNight, otherNight: tongYanWuJiOtherNight },
  setupTemplates: tongYanWuJiSetupTemplates,
  setupRules: tongYanWuJiSetupRules,
  demonBluffPolicy: { count: 3, eligibleTeams: ['townsfolk'], requireNotInPlay: true, summary: 'Use three not-in-play Townsfolk bluffs; do not bluff Fabled.' },
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
