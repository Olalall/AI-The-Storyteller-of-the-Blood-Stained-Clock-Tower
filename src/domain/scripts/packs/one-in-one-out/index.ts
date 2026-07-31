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
    url: 'https://script.bloodontheclocktower.com/?script=H4sIAAAAAAAACpWSQU7EMAxFr1J53RN0CSvEggMghEzrJqaJHTnOoBnE3RFiBEvMMtLzj%2FN%2BHt%2BBN1jguZIjzIDDsxoscIOmMp1Upvsy%2FAIzCFaCBR6EJpZJhSYdDjO8FNWtO9pdxUS3akarswosoPIdqV3NYdmxdJrBz%2B0raB%2BlwMd8XaA7vaFtMEPK2n%2FhxiK0XY8%2F9CGcsgfhzCk3Y%2BpOvQdnTlwKJuKNNXpNFzxozWiVLDiyq%2FkQciolPKOGa6EgXFWOIIpVqDOu0dW5Z7KKErVDWLtbvIH9PyJXFOEXLFGHyaIGk2r0iUZrGT0avNkId9OUu0rYRkZr52gvYbLShVqmQtEGD7xg4SDMtUXLe9XwF5KURlgEG7vufFL7S8nTJ74mOs83BQAA',
    contentHash: 'sha256:87e2d275030590b6420a48da7426e56d5d3e7e5628b957ded192c89eeb46308a',
    verifiedAt: '2026-07-31',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: oneInOneOutRoles,
  nightOrders: {
    firstNight: oneInOneOutFirstNightOrder,
    otherNight: oneInOneOutOtherNightOrder,
  },
  setupTemplates: oneInOneOutSetupTemplates,
  setupRules: oneInOneOutSetupRules,
  knowledgeStatus: 'confirmed',
} satisfies SmartScriptPack
