import type { SmartScriptPack } from '../../types'
import { baoMengMiTuanFirstNight, baoMengMiTuanOtherNight } from './night-orders'
import { baoMengMiTuanRoles } from './roles'
import { baoMengMiTuanSetupRules } from './setup-rules'
import { baoMengMiTuanSetupTemplates } from './setup-templates'

export const baoMengMiTuanSmartScriptPack = {
  scriptId: "bao-meng-mi-tuan",
  displayName: "宝梦谜团",
  source: { author: "Chiz", version: 'GStone edition 20727 / game 39394', url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20727_52288.json", contentHash: 'sha256:ae0069938104af40ca1b8b9bfc842293c15e68e212b0c93a5014d23bbe40486f', verifiedAt: "2026-07-22" },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: baoMengMiTuanRoles,
  nightOrders: { firstNight: baoMengMiTuanFirstNight, otherNight: baoMengMiTuanOtherNight },
  setupTemplates: baoMengMiTuanSetupTemplates,
  setupRules: baoMengMiTuanSetupRules,
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
