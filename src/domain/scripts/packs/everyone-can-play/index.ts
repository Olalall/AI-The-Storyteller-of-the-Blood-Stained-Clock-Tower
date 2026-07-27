import type { SmartScriptPack } from '../../types'
import { everyoneCanPlayFirstNightOrder, everyoneCanPlayOtherNightOrder } from './night-orders'
import { everyoneCanPlayRoles } from './roles'
import { everyoneCanPlaySetupRules } from './setup-rules'
import { everyoneCanPlaySetupTemplates } from './setup-templates'

export const everyoneCanPlaySmartScriptPack = {
  scriptId: 'everyone-can-play',
  displayName: '人人可玩 / Everyone Can Play',
  source: {
    author: 'Ben Burns',
    version: '1.0.2',
    url: 'https://botcscripts.com/script/1945/1.0.2/download',
    contentHash: 'sha256:acf6387ace9760b6eb07ac083aba61e12215973253cf55f2510fcb9e26e0880c',
    verifiedAt: '2026-07-21',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: everyoneCanPlayRoles,
  nightOrders: {
    firstNight: everyoneCanPlayFirstNightOrder,
    otherNight: everyoneCanPlayOtherNightOrder,
  },
  setupTemplates: everyoneCanPlaySetupTemplates,
  setupRules: everyoneCanPlaySetupRules,
  knowledgeStatus: 'needs-review',
} satisfies SmartScriptPack
