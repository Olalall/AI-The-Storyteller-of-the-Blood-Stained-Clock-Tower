import type { SmartScriptPack } from '../../types'
import { insanityAndIntuitionFirstNightOrder, insanityAndIntuitionOtherNightOrder } from './night-orders'
import { insanityAndIntuitionRoles } from './roles'
import { insanityAndIntuitionSetupRules } from './setup-rules'
import { insanityAndIntuitionSetupTemplates } from './setup-templates'

export const insanityAndIntuitionSmartScriptPack = {
  scriptId: 'insanity-and-intuition',
  displayName: '疯狂与直觉 / Insanity and Intuition',
  source: {
    author: 'Sam',
    version: '1.2.0',
    url: 'https://www.botcscripts.com/api/scripts/3695/json/',
    contentHash: 'sha256:0cbfe67652eff77cf336c2d68532d0a87ae46ce44b9e873a93cde22a4d02de6f',
    verifiedAt: '2026-07-31',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: insanityAndIntuitionRoles,
  nightOrders: {
    firstNight: insanityAndIntuitionFirstNightOrder,
    otherNight: insanityAndIntuitionOtherNightOrder,
  },
  setupTemplates: insanityAndIntuitionSetupTemplates,
  setupRules: insanityAndIntuitionSetupRules,
  knowledgeStatus: 'confirmed',
} satisfies SmartScriptPack
