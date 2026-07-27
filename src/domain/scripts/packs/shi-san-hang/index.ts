import type { SmartScriptPack } from '../../types'
import { shiSanHangFirstNightOrder, shiSanHangOtherNightOrder } from './night-orders'
import { shiSanHangRoles } from './roles'
import { shiSanHangSetupRules } from './setup-rules'
import { shiSanHangSetupTemplates } from './setup-templates'

export const shiSanHangSmartScriptPack = {
  scriptId: "shi-san-hang",
  displayName: "十三行",
  source: { author: "Lei的剧本钟楼", version: "GStone edition 21286 / game 41748", url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21286_26817.json", contentHash: "sha256:4537cee40664d86345fa1b20af1858768df3be233db1d41081e184dece91f0e5", verifiedAt: '2026-07-21' },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: shiSanHangRoles,
  nightOrders: { firstNight: shiSanHangFirstNightOrder, otherNight: shiSanHangOtherNightOrder },
  setupTemplates: shiSanHangSetupTemplates,
  setupRules: shiSanHangSetupRules,
  knowledgeStatus: 'needs-review',
} satisfies SmartScriptPack
