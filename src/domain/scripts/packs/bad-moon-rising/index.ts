import type { SmartScriptPack } from '../../types'
import { badMoonRisingFirstNightOrder, badMoonRisingOtherNightOrder } from './night-orders'
import { badMoonRisingRoles } from './roles'
import { badMoonRisingSetupRules } from './setup-rules'
import { badMoonRisingSetupTemplates } from './setup-templates'

export const badMoonRisingSmartScriptPack = {
  scriptId: 'bad-moon-rising',
  displayName: '黯月初升 / Bad Moon Rising',
  source: {
    author: 'The Pandemonium Institute',
    version: 'official edition data 2026-07-20',
    url: 'https://release.botc.app/resources/data/roles.json',
    contentHash: 'sha256:948647c614fae6c5a0c05c979ae72b466995d9ee9ffc36800f88ef3d22585a3d',
    verifiedAt: '2026-07-20',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: badMoonRisingRoles,
  nightOrders: {
    firstNight: badMoonRisingFirstNightOrder,
    otherNight: badMoonRisingOtherNightOrder,
  },
  setupTemplates: badMoonRisingSetupTemplates,
  setupRules: badMoonRisingSetupRules,
  knowledgeStatus: 'confirmed',
} satisfies SmartScriptPack
