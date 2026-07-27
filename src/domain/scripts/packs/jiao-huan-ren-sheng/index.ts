import type { SmartScriptPack } from '../../types'
import { jiaoHuanRenShengFirstNight, jiaoHuanRenShengOtherNight } from './night-orders'
import { jiaoHuanRenShengRoles } from './roles'
import { jiaoHuanRenShengSetupRules } from './setup-rules'
import { jiaoHuanRenShengSetupTemplates } from './setup-templates'

export const jiaoHuanRenShengSmartScriptPack = {
  scriptId: "jiao-huan-ren-sheng",
  displayName: "交换人生",
  source: { author: "靶子", version: "GStone edition 21227 / game 41554", url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21227_64421.json", contentHash: "sha256:5a8ffe9462255b6792c66e4c1267d26936c215b185cf37c613e51293e5380716", verifiedAt: "2026-07-22" },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: jiaoHuanRenShengRoles,
  nightOrders: { firstNight: jiaoHuanRenShengFirstNight, otherNight: jiaoHuanRenShengOtherNight },
  setupTemplates: jiaoHuanRenShengSetupTemplates,
  setupRules: jiaoHuanRenShengSetupRules,
  knowledgeStatus: 'needs-review',
} as const satisfies SmartScriptPack
