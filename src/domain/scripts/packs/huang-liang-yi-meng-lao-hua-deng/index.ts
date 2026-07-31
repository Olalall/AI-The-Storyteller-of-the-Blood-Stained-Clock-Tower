import type { SmartScriptPack } from '../../types'
import { huangLiangYiMengLaoHuaDengFirstNight, huangLiangYiMengLaoHuaDengOtherNight } from './night-orders'
import { huangLiangYiMengLaoHuaDengRoles } from './roles'
import { huangLiangYiMengLaoHuaDengSetupRules } from './setup-rules'
import { huangLiangYiMengLaoHuaDengSetupTemplates } from './setup-templates'

export const huangLiangYiMengLaoHuaDengSmartScriptPack = {
  scriptId: 'huang-liang-yi-meng-lao-hua-deng',
  displayName: '黄粱一梦',
  source: { author: 'dd', version: 'GStone edition 20709 / game 39326', url: 'https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20709_15947.json', contentHash: 'sha256:fd3564ecc8a20be34b049873590d5e75beaa085e64445c8bae3f3104e5448350', verifiedAt: '2026-07-22' },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: huangLiangYiMengLaoHuaDengRoles,
  nightOrders: { firstNight: huangLiangYiMengLaoHuaDengFirstNight, otherNight: huangLiangYiMengLaoHuaDengOtherNight },
  setupTemplates: huangLiangYiMengLaoHuaDengSetupTemplates,
  setupRules: huangLiangYiMengLaoHuaDengSetupRules,
  demonBluffPolicy: { count: 3, eligibleTeams: ['townsfolk'], requireNotInPlay: true, summary: 'Use three not-in-play Townsfolk bluffs; do not bluff Fabled.' },
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
