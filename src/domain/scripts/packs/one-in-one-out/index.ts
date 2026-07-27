import type { SmartScriptPack } from '../../types'
import { oneInOneOutFirstNightOrder, oneInOneOutOtherNightOrder } from './night-orders'
import { oneInOneOutRoles } from './roles'
import { oneInOneOutSetupRules } from './setup-rules'
import { oneInOneOutSetupTemplates } from './setup-templates'

export const oneInOneOutSmartScriptPack = {
  scriptId: 'one-in-one-out',
  displayName: '一进一出 / One in one out',
  source: {
    author: 'Baron von Klutz',
    version: 'TPI Recommended snapshot 2026-07-20',
    url: 'https://bloodontheclocktower.com/pages/custom-scripts',
    contentHash: 'sha256:87e2d275030590b6420a48da7426e56d5d3e7e5628b957ded192c89eeb46308a',
    verifiedAt: '2026-07-20',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: oneInOneOutRoles,
  nightOrders: {
    firstNight: oneInOneOutFirstNightOrder,
    otherNight: oneInOneOutOtherNightOrder,
  },
  setupTemplates: oneInOneOutSetupTemplates,
  setupRules: oneInOneOutSetupRules,
  knowledgeStatus: 'needs-review',
} satisfies SmartScriptPack
