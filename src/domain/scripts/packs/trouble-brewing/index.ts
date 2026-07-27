import type { SmartScriptPack } from '../../types'
import { troubleBrewingFirstNightOrder, troubleBrewingOtherNightOrder } from './night-orders'
import { troubleBrewingRoles } from './roles'
import { troubleBrewingSetupRules } from './setup-rules'
import { troubleBrewingSetupTemplates } from './setup-templates'

export const troubleBrewingSmartScriptPack = {
  scriptId: 'trouble-brewing',
  displayName: '暗流涌动 / Trouble Brewing',
  source: {
    author: 'The Pandemonium Institute',
    version: 'official edition data 2026-07-20',
    url: 'https://release.botc.app/resources/data/roles.json',
    contentHash: 'sha256:102dddc141da4e829de953563b5d9370c6c71482860c756474f7e55477c56ecb',
    verifiedAt: '2026-07-20',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: troubleBrewingRoles,
  nightOrders: {
    firstNight: troubleBrewingFirstNightOrder,
    otherNight: troubleBrewingOtherNightOrder,
  },
  setupTemplates: troubleBrewingSetupTemplates,
  setupRules: troubleBrewingSetupRules,
  knowledgeStatus: 'confirmed',
} satisfies SmartScriptPack
