import type { SmartScriptPack } from '../../types'
import { jiuZhuanQianCengFirstNight, jiuZhuanQianCengOtherNight } from './night-orders'
import { jiuZhuanQianCengRoles } from './roles'
import { jiuZhuanQianCengSetupRules } from './setup-rules'
import { jiuZhuanQianCengSetupTemplates } from './setup-templates'

export const jiuZhuanQianCengSmartScriptPack = {
  scriptId: "jiu-zhuan-qian-ceng",
  displayName: "九转千层",
  source: { author: "Henrik", version: 'GStone edition 20744 / game 39448', url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20744_59952.json", contentHash: 'sha256:5cb45033a75468c0ed9957b86f5b73b5a8bd5301f891cefd1723eb3bd3a7dd81', verifiedAt: "2026-07-22" },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: jiuZhuanQianCengRoles,
  nightOrders: { firstNight: jiuZhuanQianCengFirstNight, otherNight: jiuZhuanQianCengOtherNight },
  setupTemplates: jiuZhuanQianCengSetupTemplates,
  setupRules: jiuZhuanQianCengSetupRules,
  knowledgeStatus: 'needs-review',
} as const satisfies SmartScriptPack
