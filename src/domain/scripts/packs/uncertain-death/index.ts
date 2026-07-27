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
    url: 'https://www.botcscripts.com/script/68/1.0.1/download',
    contentHash: 'sha256:05d854f75fb7ea6821b111368ad2c9d55ee5b736cc44578eea1bb84e8b0d6e2c',
    verifiedAt: '2026-07-21',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: uncertainDeathRoles,
  nightOrders: {
    firstNight: uncertainDeathFirstNightOrder,
    otherNight: uncertainDeathOtherNightOrder,
  },
  setupTemplates: uncertainDeathSetupTemplates,
  setupRules: uncertainDeathSetupRules,
  knowledgeStatus: 'needs-review',
} satisfies SmartScriptPack
