import type { SmartScriptPack } from '../../types'
import { punchyFirstNightOrder, punchyOtherNightOrder } from './night-orders'
import { punchyRoles } from './roles'
import { punchySetupRules } from './setup-rules'
import { punchySetupTemplates } from './setup-templates'

export const punchySmartScriptPack = {
  scriptId: 'punchy',
  displayName: '重拳出击 / Punchy',
  source: {
    author: 'Zets',
    version: 'Carousel Collection snapshot 2026-07-20 / Punchy v3.8',
    url: 'https://botc-script-viewer.sthom.kiwi/carousel/punchy/',
    contentHash: 'sha256:2db376682e56699246b43b787ae0f3ddef03ab3c28f678e0373fc35b08b0036c',
    verifiedAt: '2026-07-20',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: punchyRoles,
  nightOrders: {
    firstNight: punchyFirstNightOrder,
    otherNight: punchyOtherNightOrder,
  },
  setupTemplates: punchySetupTemplates,
  setupRules: punchySetupRules,
  knowledgeStatus: 'needs-review',
} satisfies SmartScriptPack
