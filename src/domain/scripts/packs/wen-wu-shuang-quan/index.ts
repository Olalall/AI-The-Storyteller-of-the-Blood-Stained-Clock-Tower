import type { SmartScriptPack } from '../../types'
import { wenWuShuangQuanFirstNightOrder, wenWuShuangQuanOtherNightOrder } from './night-orders'
import { wenWuShuangQuanRoles } from './roles'
import { wenWuShuangQuanSetupRules } from './setup-rules'
import { wenWuShuangQuanSetupTemplates } from './setup-templates'

export const wenWuShuangQuanSmartScriptPack = {
  scriptId: "wen-wu-shuang-quan",
  displayName: "文武双全",
  source: { author: "晓辰", version: "GStone edition 20908 / game 40144", url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20908_17210.json", contentHash: "sha256:0704a881838a7f382d59c42a74cdee3def27604e8a608ef04eee56b60f3c56c8", verifiedAt: '2026-07-21' },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: wenWuShuangQuanRoles,
  nightOrders: { firstNight: wenWuShuangQuanFirstNightOrder, otherNight: wenWuShuangQuanOtherNightOrder },
  setupTemplates: wenWuShuangQuanSetupTemplates,
  setupRules: wenWuShuangQuanSetupRules,
  knowledgeStatus: 'confirmed',
} satisfies SmartScriptPack
