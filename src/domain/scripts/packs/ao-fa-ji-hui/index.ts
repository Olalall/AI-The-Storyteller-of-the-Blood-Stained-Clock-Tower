import type { SmartScriptPack } from '../../types'
import { aoFaJiHuiRoles } from './roles'
import { aoFaJiHuiFirstNightOrder, aoFaJiHuiOtherNightOrder } from './night-orders'
import { aoFaJiHuiSetupRules } from './setup-rules'
import { aoFaJiHuiSetupTemplates } from './setup-templates'

export const aoFaJiHuiSmartScriptPack = {
  scriptId: 'ao-fa-ji-hui',
  displayName: '奥法集会 / Ember',
  source: {
    author: 'Ember',
    version: 'Clocktower Wiki index 548 / build 16ad8f7c270d / 原库版→2026-10-16 当前官方规则适配',
    url: 'https://kkovo550.github.io/clocktower-wiki/',
    contentHash: 'sha256:f0dec4f76dcdfc9064d0ce2ce38eee58535688bd1ecb689f67bfc52ab64958ca',
    verifiedAt: '2026-10-16',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: aoFaJiHuiRoles,
  nightOrders: { firstNight: aoFaJiHuiFirstNightOrder, otherNight: aoFaJiHuiOtherNightOrder },
  setupRules: aoFaJiHuiSetupRules,
  setupTemplates: aoFaJiHuiSetupTemplates,
  knowledgeStatus: 'confirmed',
} satisfies SmartScriptPack
