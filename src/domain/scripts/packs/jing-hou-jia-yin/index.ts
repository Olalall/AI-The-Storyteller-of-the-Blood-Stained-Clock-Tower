import type { SmartScriptPack } from '../../types'
import { jingHouJiaYinFirstNight, jingHouJiaYinOtherNight } from './night-orders'
import { jingHouJiaYinRoles } from './roles'
import { jingHouJiaYinSetupRules } from './setup-rules'
import { jingHouJiaYinSetupTemplates } from './setup-templates'

export const jingHouJiaYinSmartScriptPack = {
  scriptId: "jing-hou-jia-yin",
  displayName: "静候佳音",
  source: { author: "Richard Black&花曲", version: 'GStone edition 21489 / game 42784', url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21489_56657.json", contentHash: 'sha256:8b647260757e5a78781c454a5916c06129db2ac5a8f6f47b78bf69dc3ba260a5', verifiedAt: '2026-07-22' },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: jingHouJiaYinRoles,
  nightOrders: { firstNight: jingHouJiaYinFirstNight, otherNight: jingHouJiaYinOtherNight },
  setupTemplates: jingHouJiaYinSetupTemplates,
  setupRules: jingHouJiaYinSetupRules,
  knowledgeStatus: 'needs-review',
} as const satisfies SmartScriptPack
