import type { SmartScriptPack } from '../../types'
import { liBengLeHuaiFirstNightOrder, liBengLeHuaiOtherNightOrder } from './night-orders'
import { liBengLeHuaiRoles } from './roles'
import { liBengLeHuaiSetupRules } from './setup-rules'
import { liBengLeHuaiSetupTemplates } from './setup-templates'

export const liBengLeHuaiSmartScriptPack = {
  scriptId: 'li-beng-le-huai',
  displayName: "礼崩乐坏",
  source: {
    author: "摸鱼学徒",
    version: 'GStone edition 21219 / game 40256',
    url: 'https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21219_64086.json',
    contentHash: 'sha256:af0f4ab26df993c8f6d68c422e12c5a87c8d063d9d06d95d2bab171f65a2d985',
    verifiedAt: '2026-07-22',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: liBengLeHuaiRoles,
  nightOrders: { firstNight: liBengLeHuaiFirstNightOrder, otherNight: liBengLeHuaiOtherNightOrder },
  setupTemplates: liBengLeHuaiSetupTemplates,
  setupRules: liBengLeHuaiSetupRules,
  demonBluffPolicy: {
    count: 3,
    eligibleTeams: ['townsfolk', 'outsider'],
    requireNotInPlay: true,
    summary: "3 个不同的未在场镇民或外来者角色。",
  },
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
