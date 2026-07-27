import type { SmartScriptPack } from '../../types'
import { lunarEclipseFirstNightOrder, lunarEclipseOtherNightOrder } from './night-orders'
import { lunarEclipseRoles } from './roles'
import { lunarEclipseSetupRules } from './setup-rules'
import { lunarEclipseSetupTemplates } from './setup-templates'

export const lunarEclipseSmartScriptPack = {
  scriptId: 'lunar-eclipse',
  displayName: '月食 / Lunar Eclipse',
  source: {
    author: 'Ekin',
    version: 'TPI Recommended snapshot 2026-07-20',
    url: 'https://bloodontheclocktower.com/pages/custom-scripts',
    contentHash: 'sha256:070cb29f3835ee8b19312a6a7d19fe163cb1db3661d679c50f1d6296cbfcbe95',
    verifiedAt: '2026-07-20',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: lunarEclipseRoles,
  nightOrders: {
    firstNight: lunarEclipseFirstNightOrder,
    otherNight: lunarEclipseOtherNightOrder,
  },
  setupTemplates: lunarEclipseSetupTemplates,
  setupRules: lunarEclipseSetupRules,
  knowledgeStatus: 'needs-review',
} satisfies SmartScriptPack
