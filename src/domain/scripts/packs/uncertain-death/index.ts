import type { SmartScriptPack } from '../../types'
import { uncertainDeathFirstNightOrder, uncertainDeathOtherNightOrder } from './night-orders'
import { uncertainDeathRoles } from './roles'
import { uncertainDeathSetupRules } from './setup-rules'
import { uncertainDeathSetupTemplates } from './setup-templates'

export const uncertainDeathSmartScriptPack = {
  scriptId: 'uncertain-death',
  displayName: '未定之死 / Uncertain Death',
  source: {
    author: 'Ekin',
    version: '1.0.1',
    url: 'https://www.botcscripts.com/api/scripts/344/json/',
    contentHash: 'sha256:ead01f20e15e2516209092a555addf0528778178806784647584c9ae59d10d30',
    verifiedAt: '2026-07-31',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: uncertainDeathRoles,
  nightOrders: {
    firstNight: uncertainDeathFirstNightOrder,
    otherNight: uncertainDeathOtherNightOrder,
  },
  setupTemplates: uncertainDeathSetupTemplates,
  setupRules: uncertainDeathSetupRules,
  knowledgeStatus: 'confirmed',
} satisfies SmartScriptPack
