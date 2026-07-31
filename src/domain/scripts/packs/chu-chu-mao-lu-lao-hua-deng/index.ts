import type { SmartScriptPack } from '../../types'
import { chuChuMaoLuLaoHuaDengFirstNight, chuChuMaoLuLaoHuaDengOtherNight } from './night-orders'
import { chuChuMaoLuLaoHuaDengRoles } from './roles'
import { chuChuMaoLuLaoHuaDengSetupRules } from './setup-rules'
import { chuChuMaoLuLaoHuaDengSetupTemplates } from './setup-templates'

export const chuChuMaoLuLaoHuaDengSmartScriptPack = {
  scriptId: 'chu-chu-mao-lu-lao-hua-deng',
  displayName: '初出茅庐（老华灯）',
  source: { author: '刘中奇', version: 'GStone edition 20723 / game 39389', url: 'https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20723_51891.json', contentHash: 'sha256:f00e5c089419461ed644735950f9f0cf03797d094ae4701368872e7e793a0ec6', verifiedAt: '2026-07-22' },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: chuChuMaoLuLaoHuaDengRoles,
  nightOrders: { firstNight: chuChuMaoLuLaoHuaDengFirstNight, otherNight: chuChuMaoLuLaoHuaDengOtherNight },
  setupTemplates: chuChuMaoLuLaoHuaDengSetupTemplates,
  setupRules: chuChuMaoLuLaoHuaDengSetupRules,
  demonBluffPolicy: { count: 3, eligibleTeams: ['townsfolk'], requireNotInPlay: true, summary: 'Use three not-in-play Townsfolk bluffs; avoid Drunk projection roles unless ST intentionally builds them.' },
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
