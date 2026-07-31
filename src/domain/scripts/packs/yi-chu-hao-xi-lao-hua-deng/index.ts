import type { SmartScriptPack } from '../../types'
import { yiChuHaoXiLaoHuaDengFirstNight, yiChuHaoXiLaoHuaDengOtherNight } from './night-orders'
import { yiChuHaoXiLaoHuaDengRoles } from './roles'
import { yiChuHaoXiLaoHuaDengSetupRules } from './setup-rules'
import { yiChuHaoXiLaoHuaDengSetupTemplates } from './setup-templates'

export const yiChuHaoXiLaoHuaDengSmartScriptPack = {
  scriptId: 'yi-chu-hao-xi-lao-hua-deng',
  displayName: '一出好戏（老华灯）',
  source: { author: '刘中奇', version: 'GStone edition 20722 / game 39388', url: 'https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20722_51832.json', contentHash: 'sha256:d8e42e8f8cbc2fe7104d09543c466cf4d2d9f5aa14708aa938882561f25cfe3d', verifiedAt: '2026-07-22' },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: yiChuHaoXiLaoHuaDengRoles,
  nightOrders: { firstNight: yiChuHaoXiLaoHuaDengFirstNight, otherNight: yiChuHaoXiLaoHuaDengOtherNight },
  setupTemplates: yiChuHaoXiLaoHuaDengSetupTemplates,
  setupRules: yiChuHaoXiLaoHuaDengSetupRules,
  demonBluffPolicy: { count: 3, eligibleTeams: ['townsfolk'], requireNotInPlay: true, summary: 'Use three not-in-play Townsfolk bluffs; avoid Atheist/Xi Zi unless ST intentionally builds that script.' },
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
