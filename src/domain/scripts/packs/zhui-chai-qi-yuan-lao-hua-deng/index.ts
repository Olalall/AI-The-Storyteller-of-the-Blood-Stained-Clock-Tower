import type { SmartScriptPack } from '../../types'
import { zhuiChaiQiYuanLaoHuaDengFirstNight, zhuiChaiQiYuanLaoHuaDengOtherNight } from './night-orders'
import { zhuiChaiQiYuanLaoHuaDengRoles } from './roles'
import { zhuiChaiQiYuanLaoHuaDengSetupRules } from './setup-rules'
import { zhuiChaiQiYuanLaoHuaDengSetupTemplates } from './setup-templates'

export const zhuiChaiQiYuanLaoHuaDengSmartScriptPack = {
  scriptId: 'zhui-chai-qi-yuan-lao-hua-deng',
  displayName: "追钗奇缘（老华灯）",
  source: {
    author: "鸭镇",
    version: 'GStone edition 20730 / game 39392',
    url: 'https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20730_52285.json',
    contentHash: 'sha256:01b45df6526338eccc06ee94ef771a4daaae2d8d33ddd2a88f2f4f1e719a2551',
    verifiedAt: '2026-07-22',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: zhuiChaiQiYuanLaoHuaDengRoles,
  nightOrders: { firstNight: zhuiChaiQiYuanLaoHuaDengFirstNight, otherNight: zhuiChaiQiYuanLaoHuaDengOtherNight },
  setupTemplates: zhuiChaiQiYuanLaoHuaDengSetupTemplates,
  setupRules: zhuiChaiQiYuanLaoHuaDengSetupRules,
  demonBluffPolicy: { count: 3, eligibleTeams: ['townsfolk'], requireNotInPlay: true, summary: 'Use not-in-play Townsfolk bluffs; avoid setup-modifier roles unless storyteller intentionally hand-adjusts.' },
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
