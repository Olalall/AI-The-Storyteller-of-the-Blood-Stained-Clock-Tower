import type { SmartScriptPack } from '../../types'
import { mingDingZaiHuoFirstNightOrder, mingDingZaiHuoOtherNightOrder } from './night-orders'
import { mingDingZaiHuoRoles } from './roles'
import { mingDingZaiHuoSetupRules } from './setup-rules'
import { mingDingZaiHuoSetupTemplates } from './setup-templates'

export const mingDingZaiHuoSmartScriptPack = {
  scriptId: 'ming-ding-zai-huo',
  displayName: "命定灾祸",
  source: {
    author: "Stitchface & Bra1n",
    version: 'GStone edition 21223 / game 41551',
    url: 'https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21223_95006.json',
    contentHash: 'sha256:f68714b8ba3c5e99964793ade4762ca4bf1b413f9048e1e6f06bb975f6142683',
    verifiedAt: '2026-07-22',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: mingDingZaiHuoRoles,
  nightOrders: { firstNight: mingDingZaiHuoFirstNightOrder, otherNight: mingDingZaiHuoOtherNightOrder },
  setupTemplates: mingDingZaiHuoSetupTemplates,
  setupRules: mingDingZaiHuoSetupRules,
  demonBluffPolicy: {
    count: 3,
    eligibleTeams: ['townsfolk', 'outsider'],
    requireNotInPlay: true,
    summary: '3 out-of-play Townsfolk or Outsider bluffs; fate pointer, wound and blessing states remain storyteller-confirmed reminders.',
  },
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
