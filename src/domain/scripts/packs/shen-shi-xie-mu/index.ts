import type { SmartScriptPack } from '../../types'
import { shenShiXieMuRoles } from './roles'
import { shenShiXieMuFirstNightOrder, shenShiXieMuOtherNightOrder } from './night-orders'
import { shenShiXieMuSetupRules } from './setup-rules'
import { shenShiXieMuSetupTemplates } from './setup-templates'

export const shenShiXieMuSmartScriptPack = {
  scriptId: 'shen-shi-xie-mu',
  displayName: '绅士谢幕',
  source: {
    author: 'Aggie & Jams',
    version: 'Clocktower Wiki index 526 / build 16ad8f7c270d / 原库版→2026-10-16 当前官方规则适配',
    url: 'https://kkovo550.github.io/clocktower-wiki/',
    contentHash: 'sha256:b5e2c3dc70aff5f7c069bee5a52eeb4cf15b4f7b3e1eca74a8a7a9192edbb2b5',
    verifiedAt: '2026-10-16',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: shenShiXieMuRoles,
  nightOrders: { firstNight: shenShiXieMuFirstNightOrder, otherNight: shenShiXieMuOtherNightOrder },
  setupRules: shenShiXieMuSetupRules,
  setupTemplates: shenShiXieMuSetupTemplates,
  knowledgeStatus: 'confirmed',
} satisfies SmartScriptPack
