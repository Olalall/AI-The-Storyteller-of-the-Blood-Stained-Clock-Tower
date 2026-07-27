import type { SmartScriptPack } from '../../types'
import { kuMuFengChunFirstNight, kuMuFengChunOtherNight } from './night-orders'
import { kuMuFengChunRoles } from './roles'
import { kuMuFengChunSetupRules } from './setup-rules'
import { kuMuFengChunSetupTemplates } from './setup-templates'

export const kuMuFengChunSmartScriptPack = {
  scriptId: "ku-mu-feng-chun",
  displayName: "枯木逢春",
  source: { author: "Cody", version: 'GStone edition 21365 / game 42067', url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21365_21069.json", contentHash: 'sha256:219a954bddff7d34db1947d630200fedb2e40e7475d809f20a435fc76943e810', verifiedAt: '2026-07-22' },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: kuMuFengChunRoles,
  nightOrders: { firstNight: kuMuFengChunFirstNight, otherNight: kuMuFengChunOtherNight },
  setupTemplates: kuMuFengChunSetupTemplates,
  setupRules: kuMuFengChunSetupRules,
  knowledgeStatus: 'needs-review',
} as const satisfies SmartScriptPack
