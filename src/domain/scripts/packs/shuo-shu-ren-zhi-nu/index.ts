import type { SmartScriptPack } from '../../types'
import { shuoShuRenZhiNuFirstNight, shuoShuRenZhiNuOtherNight } from './night-orders'
import { shuoShuRenZhiNuRoles } from './roles'
import { shuoShuRenZhiNuSetupRules } from './setup-rules'
import { shuoShuRenZhiNuSetupTemplates } from './setup-templates'

export const shuoShuRenZhiNuSmartScriptPack = {
  scriptId: "shuo-shu-ren-zhi-nu",
  displayName: "说书人之怒",
  source: { author: "", version: "GStone edition 20287 / game 36809", url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20287_77439.json", contentHash: "sha256:6e26d3024bfd22e2268aa4713d718057a85ef4612956c4a5694c9a838939b0ca", verifiedAt: "2026-07-22" },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: shuoShuRenZhiNuRoles,
  nightOrders: { firstNight: shuoShuRenZhiNuFirstNight, otherNight: shuoShuRenZhiNuOtherNight },
  setupTemplates: shuoShuRenZhiNuSetupTemplates,
  setupRules: shuoShuRenZhiNuSetupRules,
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
