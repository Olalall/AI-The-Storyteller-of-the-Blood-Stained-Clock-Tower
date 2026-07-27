import type { SmartScriptPack } from '../../types'
import { huoShanJiaoTuanFirstNight, huoShanJiaoTuanOtherNight } from './night-orders'
import { huoShanJiaoTuanRoles } from './roles'
import { huoShanJiaoTuanSetupRules } from './setup-rules'
import { huoShanJiaoTuanSetupTemplates } from './setup-templates'

export const huoShanJiaoTuanSmartScriptPack = {
  scriptId: "huo-shan-jiao-tuan",
  displayName: "火山教团",
  source: { author: "Khinoe", version: 'GStone edition 20729 / game 39393', url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20729_52287.json", contentHash: 'sha256:8762cec1b585af2fc9314cfa31c38a46e32099d215ebcc8159ec0ae945bac3f1', verifiedAt: "2026-07-22" },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: huoShanJiaoTuanRoles,
  nightOrders: { firstNight: huoShanJiaoTuanFirstNight, otherNight: huoShanJiaoTuanOtherNight },
  setupTemplates: huoShanJiaoTuanSetupTemplates,
  setupRules: huoShanJiaoTuanSetupRules,
  knowledgeStatus: 'needs-review',
} as const satisfies SmartScriptPack
