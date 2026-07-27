import type { SmartScriptPack } from '../../types'
import { huaFuLeiMingFirstNight, huaFuLeiMingOtherNight } from './night-orders'
import { huaFuLeiMingRoles } from './roles'
import { huaFuLeiMingSetupRules } from './setup-rules'
import { huaFuLeiMingSetupTemplates } from './setup-templates'

export const huaFuLeiMingSmartScriptPack = {
  scriptId: 'hua-fu-lei-ming',
  displayName: '华府雷鸣',
  source: { author: '寒水', version: 'GStone edition 21450 / game 39317', url: 'https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21450_55971.json', contentHash: 'sha256:7f6034cb05123f9ea2949ebbd7e35e6895fe5cfbf7928f8878960e4c6f029fe5', verifiedAt: '2026-07-22' },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: huaFuLeiMingRoles,
  nightOrders: { firstNight: huaFuLeiMingFirstNight, otherNight: huaFuLeiMingOtherNight },
  setupTemplates: huaFuLeiMingSetupTemplates,
  setupRules: huaFuLeiMingSetupRules,
  demonBluffPolicy: { count: 3, eligibleTeams: ['townsfolk'], requireNotInPlay: true, summary: 'Use three not-in-play Townsfolk bluffs; do not bluff Travelers or Fabled.' },
  knowledgeStatus: 'needs-review',
} as const satisfies SmartScriptPack
