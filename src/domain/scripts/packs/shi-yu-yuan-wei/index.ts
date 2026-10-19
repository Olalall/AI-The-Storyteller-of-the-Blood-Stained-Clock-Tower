import type { SmartScriptPack } from '../../types'
import { shiYuYuanWeiRoles } from './roles'
import { shiYuYuanWeiFirstNightOrder, shiYuYuanWeiOtherNightOrder } from './night-orders'
import { shiYuYuanWeiSetupRules } from './setup-rules'
import { shiYuYuanWeiSetupTemplates } from './setup-templates'

export const shiYuYuanWeiSmartScriptPack = {
  scriptId: 'shi-yu-yuan-wei',
  displayName: '事与愿违 / Train',
  source: {
    author: 'Train',
    version: 'Clocktower Wiki index 536 / build 16ad8f7c270d / 原库版→2026-10-16 当前官方规则适配',
    url: 'https://kkovo550.github.io/clocktower-wiki/',
    contentHash: 'sha256:924f2b54859c84e2fa5bf704162067f12ed683a347ca1da7efe98dd25bc2e5c9',
    verifiedAt: '2026-10-16',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: shiYuYuanWeiRoles,
  nightOrders: { firstNight: shiYuYuanWeiFirstNightOrder, otherNight: shiYuYuanWeiOtherNightOrder },
  setupRules: shiYuYuanWeiSetupRules,
  setupTemplates: shiYuYuanWeiSetupTemplates,
  knowledgeStatus: 'confirmed',
} satisfies SmartScriptPack
