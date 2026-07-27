import type { SmartScriptPack } from '../../types'
import { longZhongJinQueFirstNightOrder, longZhongJinQueOtherNightOrder } from './night-orders'
import { longZhongJinQueRoles } from './roles'
import { longZhongJinQueSetupRules } from './setup-rules'
import { longZhongJinQueSetupTemplates } from './setup-templates'

export const longZhongJinQueSmartScriptPack = {
  scriptId: 'long-zhong-jin-que',
  displayName: "笼中金雀",
  source: {
    author: "Luis S",
    version: 'GStone edition 20947 / game 40264',
    url: 'https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20947_46831.json',
    contentHash: 'sha256:4422b1aab0f24afe598fd30b476f8471431b460a36d174bd66fa8fd269b4d0e3',
    verifiedAt: '2026-07-22',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: longZhongJinQueRoles,
  nightOrders: { firstNight: longZhongJinQueFirstNightOrder, otherNight: longZhongJinQueOtherNightOrder },
  setupTemplates: longZhongJinQueSetupTemplates,
  setupRules: longZhongJinQueSetupRules,
  demonBluffPolicy: {
    count: 3,
    eligibleTeams: ['townsfolk', 'outsider'],
    requireNotInPlay: true,
    summary: '3 out-of-play Townsfolk or Outsider bluffs; setup-changing hidden roles remain storyteller-confirmed reminders.',
  },
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
