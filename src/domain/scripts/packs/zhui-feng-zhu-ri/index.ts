import type { SmartScriptPack } from '../../types'
import { zhuiFengZhuRiRoles } from './roles'
import { zhuiFengZhuRiFirstNightOrder, zhuiFengZhuRiOtherNightOrder } from './night-orders'
import { zhuiFengZhuRiSetupRules } from './setup-rules'
import { zhuiFengZhuRiSetupTemplates } from './setup-templates'

export const zhuiFengZhuRiSmartScriptPack = {
  scriptId: 'zhui-feng-zhu-ri',
  displayName: '追峰逐日',
  source: { author: "贾卡jaques", version: 'Clocktower Wiki index 324 / 来源未标版本 / build 16ad8f7c270d / 2026-10-16当前官方规则适配', url: 'https://kkovo550.github.io/clocktower-wiki/script_lib/%E5%89%A7%E6%9C%AC%E5%BA%93.html', contentHash: 'sha256:a6e65b08c24c8b8c43bd5bf5f8bed1d515a34d3f6d735c6f8a66713811ef030c', verifiedAt: '2026-10-16' },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: zhuiFengZhuRiRoles,
  nightOrders: { firstNight: zhuiFengZhuRiFirstNightOrder, otherNight: zhuiFengZhuRiOtherNightOrder },
  setupRules: zhuiFengZhuRiSetupRules,
  setupTemplates: zhuiFengZhuRiSetupTemplates,
  knowledgeStatus: 'confirmed',
} satisfies SmartScriptPack
