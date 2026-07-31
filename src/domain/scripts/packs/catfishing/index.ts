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
    url: 'https://www.botcscripts.com/api/scripts/12578/json/',
    contentHash: 'sha256:7540d967a28eb257fee4a2be28805108f2f4d8e5b1da3bed2bcc1d07b0ab2689',
    verifiedAt: '2026-07-31',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: catfishingRoles,
  nightOrders: {
    firstNight: catfishingFirstNightOrder,
    otherNight: catfishingOtherNightOrder,
  },
  setupTemplates: catfishingSetupTemplates,
  setupRules: catfishingSetupRules,
  knowledgeStatus: 'confirmed',
} satisfies SmartScriptPack
