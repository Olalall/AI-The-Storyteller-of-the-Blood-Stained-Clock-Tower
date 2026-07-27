import type { SmartScriptPack } from '../../types'
import { guDaoJiuWenFirstNightOrder, guDaoJiuWenOtherNightOrder } from './night-orders'
import { guDaoJiuWenRoles } from './roles'
import { guDaoJiuWenSetupRules } from './setup-rules'
import { guDaoJiuWenSetupTemplates } from './setup-templates'

export const guDaoJiuWenSmartScriptPack = {
  scriptId: 'gu-dao-jiu-wen',
  displayName: "古道酒温",
  source: {
    author: "陌上叶",
    version: 'GStone edition 21225 / game 41552',
    url: 'https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21225_32856.json',
    contentHash: 'sha256:00a14a1b84973c1fb8625febb0ce3c190f2c73b26f065715486ae30052e81b92',
    verifiedAt: '2026-07-22',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: guDaoJiuWenRoles,
  nightOrders: { firstNight: guDaoJiuWenFirstNightOrder, otherNight: guDaoJiuWenOtherNightOrder },
  setupTemplates: guDaoJiuWenSetupTemplates,
  setupRules: guDaoJiuWenSetupRules,
  demonBluffPolicy: {
    count: 3,
    eligibleTeams: ['townsfolk', 'outsider'],
    requireNotInPlay: true,
    summary: '3 out-of-play Townsfolk or Outsider bluffs; hidden identity and special setup paths remain storyteller-confirmed reminders.',
  },
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
