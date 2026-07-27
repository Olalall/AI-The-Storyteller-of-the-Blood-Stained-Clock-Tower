import type { SmartScriptPack } from '../../types'
import { aGrimmChorusFirstNightOrder, aGrimmChorusOtherNightOrder } from './night-orders'
import { aGrimmChorusRoles } from './roles'
import { aGrimmChorusSetupRules } from './setup-rules'
import { aGrimmChorusSetupTemplates } from './setup-templates'

export const aGrimmChorusSmartScriptPack = {
  scriptId: 'a-grimm-chorus',
  displayName: '格林合唱 / A Grimm Chorus',
  source: {
    author: 'Zets；TPI 页面当前列为 Lachlan',
    version: 'TPI Recommended snapshot 2026-07-20',
    url: 'https://bloodontheclocktower.com/pages/custom-scripts',
    contentHash: 'sha256:1700a2c15bba5d993f429b6f5d9e5715aeb0dd2cfb0fc2d495078ec9d3dfb22d',
    verifiedAt: '2026-07-20',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: aGrimmChorusRoles,
  nightOrders: {
    firstNight: aGrimmChorusFirstNightOrder,
    otherNight: aGrimmChorusOtherNightOrder,
  },
  setupTemplates: aGrimmChorusSetupTemplates,
  setupRules: aGrimmChorusSetupRules,
  knowledgeStatus: 'needs-review',
} satisfies SmartScriptPack
