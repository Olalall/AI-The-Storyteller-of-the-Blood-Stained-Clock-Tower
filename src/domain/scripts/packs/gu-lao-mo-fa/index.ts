import type { SmartScriptPack } from '../../types'
import { guLaoMoFaFirstNight, guLaoMoFaOtherNight } from './night-orders'
import { guLaoMoFaRoles } from './roles'
import { guLaoMoFaSetupRules } from './setup-rules'
import { guLaoMoFaSetupTemplates } from './setup-templates'

export const guLaoMoFaSmartScriptPack = {
  scriptId: 'gu-lao-mo-fa',
  displayName: '古老魔法',
  source: { author: 'Stellarium', version: 'GStone edition 21652 / game 43670', url: 'https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21652_03786.json', contentHash: 'sha256:2d2bc11a6b99f56ab6da5aec51c9a68797a955be7d4021a4263242db5bc46924', verifiedAt: '2026-07-22' },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: guLaoMoFaRoles,
  nightOrders: { firstNight: guLaoMoFaFirstNight, otherNight: guLaoMoFaOtherNight },
  setupTemplates: guLaoMoFaSetupTemplates,
  setupRules: guLaoMoFaSetupRules,
  demonBluffPolicy: { count: 3, eligibleTeams: ['townsfolk'], requireNotInPlay: true, summary: 'Use three not-in-play Townsfolk bluffs.' },
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
