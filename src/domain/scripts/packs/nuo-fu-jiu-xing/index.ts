import type { SmartScriptPack } from '../../types'
import { nuoFuJiuXingFirstNight, nuoFuJiuXingOtherNight } from './night-orders'
import { nuoFuJiuXingRoles } from './roles'
import { nuoFuJiuXingSetupRules } from './setup-rules'
import { nuoFuJiuXingSetupTemplates } from './setup-templates'

export const nuoFuJiuXingSmartScriptPack = {
  scriptId: "nuo-fu-jiu-xing",
  displayName: "懦夫救星",
  source: { author: "Cody", version: "GStone edition 21232 / game 41567", url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21232_78203.json", contentHash: 'sha256:69340c25aae5e3f6503b8210f5435a3eeccbcf92a11516157c6453cd44f11dcf', verifiedAt: "2026-07-22" },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: nuoFuJiuXingRoles,
  nightOrders: { firstNight: nuoFuJiuXingFirstNight, otherNight: nuoFuJiuXingOtherNight },
  setupTemplates: nuoFuJiuXingSetupTemplates,
  setupRules: nuoFuJiuXingSetupRules,
  knowledgeStatus: 'needs-review',
} as const satisfies SmartScriptPack
