import type { SmartScriptPack } from '../../types'
import { nanNanDiYuFirstNightOrder, nanNanDiYuOtherNightOrder } from './night-orders'
import { nanNanDiYuRoles } from './roles'
import { nanNanDiYuSetupRules } from './setup-rules'
import { nanNanDiYuSetupTemplates } from './setup-templates'

export const nanNanDiYuSmartScriptPack = {
  scriptId: "nan-nan-di-yu",
  displayName: "喃喃低语",
  source: {
    author: "驯鹿",
    version: "GStone edition 20949 / game 40265",
    url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20949_46831.json",
    contentHash: "sha256:1cb225d789548d3fd49fff3ab50c7d8d09eaa10670239da503d01e882966f3d5",
    verifiedAt: '2026-07-21',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: nanNanDiYuRoles,
  nightOrders: {
    firstNight: nanNanDiYuFirstNightOrder,
    otherNight: nanNanDiYuOtherNightOrder,
  },
  setupTemplates: nanNanDiYuSetupTemplates,
  setupRules: nanNanDiYuSetupRules,
  knowledgeStatus: 'needs-review',
} satisfies SmartScriptPack
