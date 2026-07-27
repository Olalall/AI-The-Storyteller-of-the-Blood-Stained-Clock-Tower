import type { SmartScriptPack } from '../../types'
import { weiNiDuZunFirstNight, weiNiDuZunOtherNight } from './night-orders'
import { weiNiDuZunRoles } from './roles'
import { weiNiDuZunSetupRules } from './setup-rules'
import { weiNiDuZunSetupTemplates } from './setup-templates'

export const weiNiDuZunSmartScriptPack = {
  scriptId: 'wei-ni-du-zun',
  displayName: "唯你独尊",
  source: {
    author: "苏通染",
    version: 'GStone edition 20770 / game 39464',
    url: 'https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20770_61012.json',
    contentHash: 'sha256:df85e0e63d8b7853cfc86e0702729d9e3154dfee111e4da02657aa33279f0bd5',
    verifiedAt: '2026-07-22',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: weiNiDuZunRoles,
  nightOrders: { firstNight: weiNiDuZunFirstNight, otherNight: weiNiDuZunOtherNight },
  setupTemplates: weiNiDuZunSetupTemplates,
  setupRules: weiNiDuZunSetupRules,
  demonBluffPolicy: { count: 3, eligibleTeams: ['townsfolk'], requireNotInPlay: true, summary: 'Use not-in-play Townsfolk bluffs; hidden setup and fabled roles are reminders only.' },
  knowledgeStatus: 'needs-review',
} as const satisfies SmartScriptPack
