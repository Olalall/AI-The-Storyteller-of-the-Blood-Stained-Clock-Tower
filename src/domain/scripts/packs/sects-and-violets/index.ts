import type { SmartScriptPack } from '../../types'
import { sectsAndVioletsFirstNightOrder, sectsAndVioletsOtherNightOrder } from './night-orders'
import { sectsAndVioletsRoles } from './roles'
import { sectsAndVioletsSetupRules } from './setup-rules'
import { sectsAndVioletsSetupTemplates } from './setup-templates'

export const sectsAndVioletsSmartScriptPack = {
  scriptId: 'sects-and-violets',
  displayName: '梦殒春宵 / Sects & Violets',
  source: {
    author: 'The Pandemonium Institute',
    version: 'official edition data 2026-07-20',
    url: 'https://release.botc.app/resources/data/roles.json',
    contentHash: 'sha256:3b02f7bd81d30d2e866a8cb1ca14486f01d2a73a62da62ac17bff6f0438b3656',
    verifiedAt: '2026-07-20',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: sectsAndVioletsRoles,
  nightOrders: {
    firstNight: sectsAndVioletsFirstNightOrder,
    otherNight: sectsAndVioletsOtherNightOrder,
  },
  setupTemplates: sectsAndVioletsSetupTemplates,
  setupRules: sectsAndVioletsSetupRules,
  knowledgeStatus: 'confirmed',
} satisfies SmartScriptPack
