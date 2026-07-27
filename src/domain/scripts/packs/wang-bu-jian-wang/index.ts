import type { SmartScriptPack } from '../../types'
import { wangBuJianWangFirstNight, wangBuJianWangOtherNight } from './night-orders'
import { wangBuJianWangRoles } from './roles'
import { wangBuJianWangSetupRules } from './setup-rules'
import { wangBuJianWangSetupTemplates } from './setup-templates'

export const wangBuJianWangSmartScriptPack = {
  scriptId: "wang-bu-jian-wang",
  displayName: "王不见王",
  source: { author: "Ekin", version: 'GStone edition 21493 / game 42787', url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21493_62907.json", contentHash: 'sha256:822d7f78995c902f81e68b9eb2ed9779bfb00d0bb1905abaa6ba84192b8329c8', verifiedAt: '2026-07-22' },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: wangBuJianWangRoles,
  nightOrders: { firstNight: wangBuJianWangFirstNight, otherNight: wangBuJianWangOtherNight },
  setupTemplates: wangBuJianWangSetupTemplates,
  setupRules: wangBuJianWangSetupRules,
  knowledgeStatus: 'needs-review',
} as const satisfies SmartScriptPack
