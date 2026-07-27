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
    url: 'https://www.botcscripts.com/script/2378/1.0.0/download',
    contentHash: 'sha256:dd5fea53947a5818eacc406e2fc09b3595815b3588567d7cc1b4d541acbe837d',
    verifiedAt: '2026-07-21',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: churchOfSpiesRoles,
  nightOrders: {
    firstNight: churchOfSpiesFirstNightOrder,
    otherNight: churchOfSpiesOtherNightOrder,
  },
  setupTemplates: churchOfSpiesSetupTemplates,
  setupRules: churchOfSpiesSetupRules,
  knowledgeStatus: 'needs-review',
} satisfies SmartScriptPack
