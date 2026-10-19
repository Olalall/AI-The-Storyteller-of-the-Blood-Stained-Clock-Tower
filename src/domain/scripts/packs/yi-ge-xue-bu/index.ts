import type { SmartScriptPack } from '../../types'
import { yiGeXueBuRoles } from './roles'
import { yiGeXueBuFirstNightOrder, yiGeXueBuOtherNightOrder } from './night-orders'
import { yiGeXueBuSetupRules } from './setup-rules'
import { yiGeXueBuSetupTemplates } from './setup-templates'

export const yiGeXueBuSmartScriptPack = {
  scriptId: 'yi-ge-xue-bu',
  displayName: '伊戈学步',
  source: {
    author: 'The Panda Money Couch',
    version: 'Clocktower Wiki index 510 / build 16ad8f7c270d / 原库版→2026-10-16 当前官方规则适配',
    url: 'https://kkovo550.github.io/clocktower-wiki/',
    contentHash: 'sha256:d724d38959cb17486da1bb128d4ffcb9d815231d1f5bf3858691da405fdccb58',
    verifiedAt: '2026-10-16',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: yiGeXueBuRoles,
  nightOrders: { firstNight: yiGeXueBuFirstNightOrder, otherNight: yiGeXueBuOtherNightOrder },
  setupRules: yiGeXueBuSetupRules,
  setupTemplates: yiGeXueBuSetupTemplates,
  knowledgeStatus: 'confirmed',
} satisfies SmartScriptPack
