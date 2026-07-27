import type { SmartScriptPack } from '../../types'
import { liYuanCanMengFirstNightOrder, liYuanCanMengOtherNightOrder } from './night-orders'
import { liYuanCanMengRoles } from './roles'
import { liYuanCanMengSetupRules } from './setup-rules'
import { liYuanCanMengSetupTemplates } from './setup-templates'

export const liYuanCanMengSmartScriptPack = {
  scriptId: "li-yuan-can-meng",
  displayName: "梨园残梦",
  source: { author: "痴愚＆鸭镇、lei", version: 'GStone edition 21095 / game 41108', url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21095_69629.json", contentHash: "sha256:bca991074703b037c0d6c1e08404b3a5102fc51c7c4ecfedca37718530184e04", verifiedAt: '2026-07-22' },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: liYuanCanMengRoles,
  nightOrders: { firstNight: liYuanCanMengFirstNightOrder, otherNight: liYuanCanMengOtherNightOrder },
  setupTemplates: liYuanCanMengSetupTemplates,
  setupRules: liYuanCanMengSetupRules,
  demonBluffPolicy: {
    count: 3,
    eligibleTeams: ['townsfolk', 'outsider'],
    requireNotInPlay: true,
    summary: "3 个不同的未在场镇民或外来者角色。",
  },
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
