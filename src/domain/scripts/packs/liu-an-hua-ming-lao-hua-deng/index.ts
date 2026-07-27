import type { SmartScriptPack } from '../../types'
import { liuAnHuaMingLaoHuaDengFirstNight, liuAnHuaMingLaoHuaDengOtherNight } from './night-orders'
import { liuAnHuaMingLaoHuaDengRoles } from './roles'
import { liuAnHuaMingLaoHuaDengSetupRules } from './setup-rules'
import { liuAnHuaMingLaoHuaDengSetupTemplates } from './setup-templates'

export const liuAnHuaMingLaoHuaDengSmartScriptPack = {
  scriptId: 'liu-an-hua-ming-lao-hua-deng',
  displayName: "柳暗花明（老华灯）",
  source: {
    author: "爱4宝宝",
    version: 'GStone edition 20772 / game 39466',
    url: 'https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20772_61174.json',
    contentHash: 'sha256:f8447f29a882606496b4800d8b01ad0e805bd6378b8aa115bd287643f9af623a',
    verifiedAt: '2026-07-22',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: liuAnHuaMingLaoHuaDengRoles,
  nightOrders: { firstNight: liuAnHuaMingLaoHuaDengFirstNight, otherNight: liuAnHuaMingLaoHuaDengOtherNight },
  setupTemplates: liuAnHuaMingLaoHuaDengSetupTemplates,
  setupRules: liuAnHuaMingLaoHuaDengSetupRules,
  demonBluffPolicy: { count: 3, eligibleTeams: ['townsfolk'], requireNotInPlay: true, summary: 'Use not-in-play Townsfolk bluffs; setup modifiers stay storyteller-confirmed.' },
  knowledgeStatus: 'needs-review',
} as const satisfies SmartScriptPack
