import type { SmartScriptPack } from '../../types'
import { devoutTheistsFirstNightOrder, devoutTheistsOtherNightOrder } from './night-orders'
import { devoutTheistsRoles } from './roles'
import { devoutTheistsSetupRules } from './setup-rules'
import { devoutTheistsSetupTemplates } from './setup-templates'

export const devoutTheistsSmartScriptPack = {
  scriptId: 'devout-theists',
  displayName: '虔诚信徒 / Devout Theists',
  source: {
    author: 'Emerald',
    version: 'Carousel Collection snapshot 2026-07-20 / Devout Theists v6',
    url: 'https://botc-script-viewer.sthom.kiwi/carousel/devout-theists/devout-theists.json',
    contentHash: 'sha256:fbf82db75ccfdcf0c211c0aa9318faacb29fbe3a5e967a45dc162c624b465683',
    verifiedAt: '2026-07-31',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: devoutTheistsRoles,
  nightOrders: {
    firstNight: devoutTheistsFirstNightOrder,
    otherNight: devoutTheistsOtherNightOrder,
  },
  setupTemplates: devoutTheistsSetupTemplates,
  setupRules: devoutTheistsSetupRules,
  knowledgeStatus: 'confirmed',
} satisfies SmartScriptPack
