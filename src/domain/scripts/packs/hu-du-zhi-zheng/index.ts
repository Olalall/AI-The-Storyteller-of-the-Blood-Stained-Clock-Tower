import type { SmartScriptPack } from '../../types'
import { huDuZhiZhengFirstNightOrder, huDuZhiZhengOtherNightOrder } from './night-orders'
import { huDuZhiZhengRoles } from './roles'
import { huDuZhiZhengSetupRules } from './setup-rules'
import { huDuZhiZhengSetupTemplates } from './setup-templates'

export const huDuZhiZhengSmartScriptPack = {
  scriptId: "hu-du-zhi-zheng",
  displayName: "护犊之征",
  source: {
    author: "Jamhot",
    version: "GStone edition 20943 / game 40259",
    url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20943_46831.json",
    contentHash: "sha256:1a2a4c25ac2cf7acb604462005954daab5157e3168b01c15e61a93c251d2ae4a",
    verifiedAt: '2026-07-21',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: huDuZhiZhengRoles,
  nightOrders: { firstNight: huDuZhiZhengFirstNightOrder, otherNight: huDuZhiZhengOtherNightOrder },
  setupTemplates: huDuZhiZhengSetupTemplates,
  setupRules: huDuZhiZhengSetupRules,
  knowledgeStatus: 'confirmed',
} satisfies SmartScriptPack
