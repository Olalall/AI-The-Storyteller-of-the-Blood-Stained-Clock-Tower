import type { SmartScriptPack } from '../../types'
import { hideAndSeekFirstNightOrder, hideAndSeekOtherNightOrder } from './night-orders'
import { hideAndSeekRoles } from './roles'
import { hideAndSeekSetupRules } from './setup-rules'
import { hideAndSeekSetupTemplates } from './setup-templates'

export const hideAndSeekSmartScriptPack = {
  scriptId: 'hide-and-seek',
  displayName: '捉迷藏 / Hide & Seek',
  source: {
    author: 'Narninian and Zaba',
    version: 'TPI Recommended snapshot 2026-07-20',
    url: 'https://bloodontheclocktower.com/pages/custom-scripts',
    contentHash: 'sha256:d50e711952349f51adc87356c2a3a1e29991bc131b906a5c49a795fd50f9c823',
    verifiedAt: '2026-07-20',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: hideAndSeekRoles,
  nightOrders: {
    firstNight: hideAndSeekFirstNightOrder,
    otherNight: hideAndSeekOtherNightOrder,
  },
  setupTemplates: hideAndSeekSetupTemplates,
  setupRules: hideAndSeekSetupRules,
  knowledgeStatus: 'needs-review',
} satisfies SmartScriptPack
