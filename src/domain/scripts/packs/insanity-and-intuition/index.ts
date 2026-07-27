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
    url: 'https://www.botcscripts.com/script/2128/1.2.0/download',
    contentHash: 'sha256:227279b78329fb27c3b2690503a0dc929f3db34073b8db8bb5b2b0005b63f399',
    verifiedAt: '2026-07-21',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: insanityAndIntuitionRoles,
  nightOrders: {
    firstNight: insanityAndIntuitionFirstNightOrder,
    otherNight: insanityAndIntuitionOtherNightOrder,
  },
  setupTemplates: insanityAndIntuitionSetupTemplates,
  setupRules: insanityAndIntuitionSetupRules,
  knowledgeStatus: 'needs-review',
} satisfies SmartScriptPack
