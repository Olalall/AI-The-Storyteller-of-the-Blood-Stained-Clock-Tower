import type { SmartScriptPack } from '../../types'
import { chouShenNaJiFirstNightOrder, chouShenNaJiOtherNightOrder } from './night-orders'
import { chouShenNaJiRoles } from './roles'
import { chouShenNaJiSetupRules } from './setup-rules'
import { chouShenNaJiSetupTemplates } from './setup-templates'

export const chouShenNaJiSmartScriptPack = {
  scriptId: "chou-shen-na-ji",
  displayName: "酬神纳吉",
  source: { author: "痴愚", version: 'GStone edition 21007 / game 40588', url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21007_69642.json", contentHash: "sha256:340fec7f269e1a8ad080965e223778b81ea711e1b96a4c5c56e5821c16cc7f22", verifiedAt: '2026-07-22' },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: chouShenNaJiRoles,
  nightOrders: { firstNight: chouShenNaJiFirstNightOrder, otherNight: chouShenNaJiOtherNightOrder },
  setupTemplates: chouShenNaJiSetupTemplates,
  setupRules: chouShenNaJiSetupRules,
  demonBluffPolicy: {
    count: 3,
    eligibleTeams: ['townsfolk', 'outsider'],
    requireNotInPlay: true,
    summary: "3 个不同的未在场镇民或外来者角色。",
  },
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
