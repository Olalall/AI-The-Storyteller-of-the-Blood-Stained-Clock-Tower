import type { SmartScriptPack } from '../../types'
import { baLuoZhiYeFirstNight, baLuoZhiYeOtherNight } from './night-orders'
import { baLuoZhiYeRoles } from './roles'
import { baLuoZhiYeSetupRules } from './setup-rules'
import { baLuoZhiYeSetupTemplates } from './setup-templates'

export const baLuoZhiYeSmartScriptPack = {
  scriptId: 'ba-luo-zhi-ye',
  displayName: '魃罗之夜',
  source: { author: 'Zets', version: 'GStone edition 21234 / game 41574', url: 'https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21234_32853.json', contentHash: 'sha256:7cfd7c804e28b32bb0f593ccf95d64bade2a8b695f12859f9ca4652a452d40bc', verifiedAt: '2026-07-22' },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: baLuoZhiYeRoles,
  nightOrders: { firstNight: baLuoZhiYeFirstNight, otherNight: baLuoZhiYeOtherNight },
  setupTemplates: baLuoZhiYeSetupTemplates,
  setupRules: baLuoZhiYeSetupRules,
  demonBluffPolicy: { count: 3, eligibleTeams: ['townsfolk'], requireNotInPlay: true, summary: 'Use three not-in-play Townsfolk bluffs; do not bluff Travelers or Fabled.' },
  knowledgeStatus: 'needs-review',
} as const satisfies SmartScriptPack
