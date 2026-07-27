import type { SmartScriptPack } from '../../types'
import { catfishingFirstNightOrder, catfishingOtherNightOrder } from './night-orders'
import { catfishingRoles } from './roles'
import { catfishingSetupRules } from './setup-rules'
import { catfishingSetupTemplates } from './setup-templates'

export const catfishingSmartScriptPack = {
  scriptId: 'catfishing',
  displayName: '瓦釜雷鸣 / Catfishing',
  source: {
    author: 'Emily',
    version: '11.1.1',
    url: 'https://www.botcscripts.com/script/3/11.1.1/download',
    contentHash: 'sha256:02664ff82e0ba47526d8cc00a77331f71b996299c9b6b2683728bc4d104b8d06',
    verifiedAt: '2026-07-19',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: catfishingRoles,
  nightOrders: {
    firstNight: catfishingFirstNightOrder,
    otherNight: catfishingOtherNightOrder,
  },
  setupTemplates: catfishingSetupTemplates,
  setupRules: catfishingSetupRules,
  knowledgeStatus: 'needs-review',
} satisfies SmartScriptPack
