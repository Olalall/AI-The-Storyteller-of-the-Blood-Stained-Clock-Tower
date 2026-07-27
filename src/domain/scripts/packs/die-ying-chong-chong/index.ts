import type { SmartScriptPack } from '../../types'
import { dieYingChongChongFirstNightOrder, dieYingChongChongOtherNightOrder } from './night-orders'
import { dieYingChongChongRoles } from './roles'
import { dieYingChongChongSetupRules } from './setup-rules'
import { dieYingChongChongSetupTemplates } from './setup-templates'

export const dieYingChongChongSmartScriptPack = {
  scriptId: 'die-ying-chong-chong',
  displayName: "谍影重重",
  source: {
    author: "emptyset",
    version: 'GStone edition 21221 / game 39410',
    url: 'https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21221_32861.json',
    contentHash: 'sha256:ac24d8ba6de769fb59287fa3fc141d610ab9f21c694978de8241064fe49b4762',
    verifiedAt: '2026-07-22',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: dieYingChongChongRoles,
  nightOrders: { firstNight: dieYingChongChongFirstNightOrder, otherNight: dieYingChongChongOtherNightOrder },
  setupTemplates: dieYingChongChongSetupTemplates,
  setupRules: dieYingChongChongSetupRules,
  demonBluffPolicy: {
    count: 3,
    eligibleTeams: ['townsfolk', 'outsider'],
    requireNotInPlay: false,
    summary: 'Default UI still shows 3 bluffs; Agent may require the storyteller to prepare four bluffs with two in-play roles.',
  },
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
