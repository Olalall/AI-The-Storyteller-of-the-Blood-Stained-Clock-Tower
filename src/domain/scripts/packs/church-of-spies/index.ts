import type { SmartScriptPack } from '../../types'
import { churchOfSpiesFirstNightOrder, churchOfSpiesOtherNightOrder } from './night-orders'
import { churchOfSpiesRoles } from './roles'
import { churchOfSpiesSetupRules } from './setup-rules'
import { churchOfSpiesSetupTemplates } from './setup-templates'

export const churchOfSpiesSmartScriptPack = {
  scriptId: 'church-of-spies',
  displayName: '间谍教堂 / Church of Spies',
  source: {
    author: 'Andrew Nathenson',
    version: '1.0.0',
    url: 'https://www.botcscripts.com/api/scripts/4156/json/',
    contentHash: 'sha256:e5f565d2db1ab4ff5c4485bbf5ba84fb33829a18c53b8f081e87be6d8609a5cc',
    verifiedAt: '2026-07-31',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: churchOfSpiesRoles,
  nightOrders: {
    firstNight: churchOfSpiesFirstNightOrder,
    otherNight: churchOfSpiesOtherNightOrder,
  },
  setupTemplates: churchOfSpiesSetupTemplates,
  setupRules: churchOfSpiesSetupRules,
  knowledgeStatus: 'confirmed',
} satisfies SmartScriptPack
