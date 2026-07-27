import type { SmartScriptPack } from '../../types'
import { guiJueYiXiangFirstNight, guiJueYiXiangOtherNight } from './night-orders'
import { guiJueYiXiangRoles } from './roles'
import { guiJueYiXiangSetupRules } from './setup-rules'
import { guiJueYiXiangSetupTemplates } from './setup-templates'

export const guiJueYiXiangSmartScriptPack = {
  scriptId: "gui-jue-yi-xiang",
  displayName: "诡谲异象（测试中）",
  source: { author: "", version: "GStone edition 20255 / game 36686", url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20255_23199.json", contentHash: "sha256:b999d9d8d9a375152a41286362c7496ed3b0d68fd1e09230fd18c048cc7ad2e3", verifiedAt: "2026-07-22" },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: guiJueYiXiangRoles,
  nightOrders: { firstNight: guiJueYiXiangFirstNight, otherNight: guiJueYiXiangOtherNight },
  setupTemplates: guiJueYiXiangSetupTemplates,
  setupRules: guiJueYiXiangSetupRules,
  knowledgeStatus: 'needs-review',
} as const satisfies SmartScriptPack
