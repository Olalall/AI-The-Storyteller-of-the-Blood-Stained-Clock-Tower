import type { SmartScriptPack } from '../../types'
import { quickMathsFirstNightOrder, quickMathsOtherNightOrder } from './night-orders'
import { quickMathsRoles } from './roles'
import { quickMathsSetupRules } from './setup-rules'
import { quickMathsSetupTemplates } from './setup-templates'

export const quickMathsSmartScriptPack = {
  scriptId: 'quick-maths',
  displayName: '快速心算 / Quick Maths',
  source: {
    author: 'Fran',
    version: 'Carousel Collection snapshot 2026-07-20 / Quick Maths',
    url: 'https://botc-script-viewer.sthom.kiwi/carousel/quick-maths/',
    contentHash: 'sha256:2960bb5ebba764e8cc812500a4cba1c759ef6817859e836db7121f4b89e4ae03',
    verifiedAt: '2026-07-20',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: quickMathsRoles,
  nightOrders: {
    firstNight: quickMathsFirstNightOrder,
    otherNight: quickMathsOtherNightOrder,
  },
  setupTemplates: quickMathsSetupTemplates,
  setupRules: quickMathsSetupRules,
  knowledgeStatus: 'needs-review',
} satisfies SmartScriptPack
