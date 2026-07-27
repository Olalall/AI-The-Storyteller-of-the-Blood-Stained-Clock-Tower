import type { SmartScriptPack } from '../../types'
import { anDuChenCangFirstNightOrder, anDuChenCangOtherNightOrder } from './night-orders'
import { anDuChenCangRoles } from './roles'
import { anDuChenCangSetupRules } from './setup-rules'
import { anDuChenCangSetupTemplates } from './setup-templates'
export const anDuChenCangSmartScriptPack = {
  scriptId: "an-du-chen-cang",
  displayName: "暗度陈仓",
  source: { author: '小猴子1', version: 'GStone edition 20705 / game 39316', url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20705_14196.json", contentHash: "sha256:cb73a1205b7295efa452a1cca1383a9e8bc74d558bae27fc1daba30562c4429a", verifiedAt: "2026-07-22" },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: anDuChenCangRoles,
  nightOrders: { firstNight: anDuChenCangFirstNightOrder, otherNight: anDuChenCangOtherNightOrder },
  setupTemplates: anDuChenCangSetupTemplates,
  setupRules: anDuChenCangSetupRules,
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
