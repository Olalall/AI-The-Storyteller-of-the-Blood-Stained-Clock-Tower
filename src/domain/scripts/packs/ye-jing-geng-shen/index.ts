import type { SmartScriptPack } from '../../types'
import { yeJingGengShenRoles } from './roles'
import { yeJingGengShenFirstNightOrder, yeJingGengShenOtherNightOrder } from './night-orders'
import { yeJingGengShenSetupRules } from './setup-rules'
import { yeJingGengShenSetupTemplates } from './setup-templates'

export const yeJingGengShenSmartScriptPack = {
  scriptId: 'ye-jing-geng-shen',
  displayName: '夜静更深',
  source: {
    author: 'The Good Couch',
    version: 'Clocktower Wiki index 515 / build 16ad8f7c270d / 原库版→2026-10-16 当前官方规则适配',
    url: 'https://kkovo550.github.io/clocktower-wiki/',
    contentHash: 'sha256:a8ffa845e13d613c7fc63e6a29ce415ab8861cc08939214e901118465ca72161',
    verifiedAt: '2026-10-16',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: yeJingGengShenRoles,
  nightOrders: { firstNight: yeJingGengShenFirstNightOrder, otherNight: yeJingGengShenOtherNightOrder },
  setupRules: yeJingGengShenSetupRules,
  setupTemplates: yeJingGengShenSetupTemplates,
  knowledgeStatus: 'confirmed',
} satisfies SmartScriptPack
