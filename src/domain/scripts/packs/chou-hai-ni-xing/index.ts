import type { SmartScriptPack } from '../../types'
import { chouHaiNiXingFirstNightOrder, chouHaiNiXingOtherNightOrder } from './night-orders'
import { chouHaiNiXingRoles } from './roles'
import { chouHaiNiXingSetupRules } from './setup-rules'
import { chouHaiNiXingSetupTemplates } from './setup-templates'

export const chouHaiNiXingSmartScriptPack = {
  scriptId: "chou-hai-ni-xing",
  displayName: "仇海溺行",
  source: {
    author: "Theo",
    version: "GStone edition 21086 / game 41101",
    url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21086_69601.json",
    contentHash: "sha256:28dda3d0141a34631580803abdbf90b32b39daae2b7ea9b89adfa3581dfc92ad",
    verifiedAt: '2026-07-21',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: chouHaiNiXingRoles,
  nightOrders: {
    firstNight: chouHaiNiXingFirstNightOrder,
    otherNight: chouHaiNiXingOtherNightOrder,
  },
  setupTemplates: chouHaiNiXingSetupTemplates,
  setupRules: chouHaiNiXingSetupRules,
  knowledgeStatus: 'needs-review',
} satisfies SmartScriptPack
