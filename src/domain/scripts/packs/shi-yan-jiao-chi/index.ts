import type { SmartScriptPack } from '../../types'
import { shiYanJiaoChiFirstNightOrder, shiYanJiaoChiOtherNightOrder } from './night-orders'
import { shiYanJiaoChiRoles } from './roles'
import { shiYanJiaoChiSetupRules } from './setup-rules'
import { shiYanJiaoChiSetupTemplates } from './setup-templates'

export const shiYanJiaoChiSmartScriptPack = {
  scriptId: "shi-yan-jiao-chi",
  displayName: "势焰交炽",
  source: { author: "我不认出", version: 'GStone edition 21531 / game 42998', url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21531_71622.json", contentHash: 'sha256:e4284fb1045e416d1384aafca95e6e83fcc43cb3a2550910dee165a19f574ef9', verifiedAt: '2026-07-22' },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: shiYanJiaoChiRoles,
  nightOrders: { firstNight: shiYanJiaoChiFirstNightOrder, otherNight: shiYanJiaoChiOtherNightOrder },
  setupTemplates: shiYanJiaoChiSetupTemplates,
  setupRules: shiYanJiaoChiSetupRules,
  knowledgeStatus: 'needs-review',
} satisfies SmartScriptPack
