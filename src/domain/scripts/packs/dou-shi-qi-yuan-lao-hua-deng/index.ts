import type { SmartScriptPack } from '../../types'
import { douShiQiYuanLaoHuaDengFirstNight, douShiQiYuanLaoHuaDengOtherNight } from './night-orders'
import { douShiQiYuanLaoHuaDengRoles } from './roles'
import { douShiQiYuanLaoHuaDengSetupRules } from './setup-rules'
import { douShiQiYuanLaoHuaDengSetupTemplates } from './setup-templates'

export const douShiQiYuanLaoHuaDengSmartScriptPack = {
  scriptId: 'dou-shi-qi-yuan-lao-hua-deng',
  displayName: '窦氏奇冤（老华灯）',
  source: { author: '周六有染小队', version: 'GStone edition 20721 / game 39387', url: 'https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20721_51523.json', contentHash: 'sha256:8d1bceb51afacb5482ccc601119550a03ae23044ae4217dad8fa2cfd68845e4e', verifiedAt: '2026-07-22' },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: douShiQiYuanLaoHuaDengRoles,
  nightOrders: { firstNight: douShiQiYuanLaoHuaDengFirstNight, otherNight: douShiQiYuanLaoHuaDengOtherNight },
  setupTemplates: douShiQiYuanLaoHuaDengSetupTemplates,
  setupRules: douShiQiYuanLaoHuaDengSetupRules,
  demonBluffPolicy: { count: 3, eligibleTeams: ['townsfolk'], requireNotInPlay: true, summary: 'Use three not-in-play Townsfolk bluffs; do not bluff Travelers or Fabled.' },
  knowledgeStatus: 'needs-review',
} as const satisfies SmartScriptPack
