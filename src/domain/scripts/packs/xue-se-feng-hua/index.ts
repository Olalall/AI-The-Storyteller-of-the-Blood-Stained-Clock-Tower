import type { SmartScriptPack } from '../../types'
import { xueSeFengHuaFirstNightOrder, xueSeFengHuaOtherNightOrder } from './night-orders'
import { xueSeFengHuaRoles } from './roles'
import { xueSeFengHuaSetupRules } from './setup-rules'
import { xueSeFengHuaSetupTemplates } from './setup-templates'

export const xueSeFengHuaSmartScriptPack = {
  scriptId: 'xue-se-feng-hua',
  displayName: "血色风华",
  source: {
    author: '???',
    version: 'GStone edition 21099 / game 41111',
    url: 'https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21099_69681.json',
    contentHash: 'sha256:762a5e8d1712573ddbcd493ca3eb7efdf3fcf7d55b41a087c6ac1d36387720e7',
    verifiedAt: '2026-07-22',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: xueSeFengHuaRoles,
  nightOrders: { firstNight: xueSeFengHuaFirstNightOrder, otherNight: xueSeFengHuaOtherNightOrder },
  setupTemplates: xueSeFengHuaSetupTemplates,
  setupRules: xueSeFengHuaSetupRules,
  demonBluffPolicy: {
    count: 3,
    eligibleTeams: ['townsfolk', 'outsider'],
    requireNotInPlay: true,
    summary: "3 个不同的未在场镇民或外来者角色。",
  },
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
