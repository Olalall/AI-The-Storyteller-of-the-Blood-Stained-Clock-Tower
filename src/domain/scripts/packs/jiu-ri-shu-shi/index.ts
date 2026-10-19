import type { SmartScriptPack } from '../../types'
import { jiuRiShuShiRoles } from './roles'
import { jiuRiShuShiFirstNightOrder, jiuRiShuShiOtherNightOrder } from './night-orders'
import { jiuRiShuShiSetupRules } from './setup-rules'
import { jiuRiShuShiSetupTemplates } from './setup-templates'

export const jiuRiShuShiSmartScriptPack = {
  scriptId: 'jiu-ri-shu-shi',
  displayName: '旧日熟识',
  source: { author: "老许&王鑫", version: 'Clocktower Wiki index 321 / 来源未标版本 / build 16ad8f7c270d / 2026-10-16当前官方规则适配', url: 'https://kkovo550.github.io/clocktower-wiki/script_lib/%E5%89%A7%E6%9C%AC%E5%BA%93.html', contentHash: 'sha256:e277ec1aad9583021771d4654d542eb9cefb83426f388e18e19b04bf4256ebe7', verifiedAt: '2026-10-16' },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: jiuRiShuShiRoles,
  nightOrders: { firstNight: jiuRiShuShiFirstNightOrder, otherNight: jiuRiShuShiOtherNightOrder },
  setupRules: jiuRiShuShiSetupRules,
  setupTemplates: jiuRiShuShiSetupTemplates,
  knowledgeStatus: 'confirmed',
} satisfies SmartScriptPack
