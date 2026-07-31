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
    url: 'https://www.botcscripts.com/api/scripts/6670/json/',
    contentHash: 'sha256:0dc9c76e31a2de5dc3b1038de16aac854f263e3134bdadead2607d0709e2eb35',
    verifiedAt: '2026-07-31',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: everyoneCanPlayRoles,
  nightOrders: {
    firstNight: everyoneCanPlayFirstNightOrder,
    otherNight: everyoneCanPlayOtherNightOrder,
  },
  setupTemplates: everyoneCanPlaySetupTemplates,
  setupRules: everyoneCanPlaySetupRules,
  knowledgeStatus: 'confirmed',
} satisfies SmartScriptPack
