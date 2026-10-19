import type { SmartScriptPack } from '../../types'
import { huaWaiZhiMinRoles } from './roles'
import { huaWaiZhiMinFirstNightOrder, huaWaiZhiMinOtherNightOrder } from './night-orders'
import { huaWaiZhiMinSetupRules } from './setup-rules'
import { huaWaiZhiMinSetupTemplates } from './setup-templates'

export const huaWaiZhiMinSmartScriptPack = {
  scriptId: 'hua-wai-zhi-min',
  displayName: '化外之民',
  source: { author: "Riggs", version: 'Clocktower Wiki index 543 / 来源未标版本 / build 16ad8f7c270d / 2026-10-16当前官方规则适配', url: 'https://kkovo550.github.io/clocktower-wiki/script_lib/%E5%89%A7%E6%9C%AC%E5%BA%93.html', contentHash: 'sha256:92d35caa93ce60d9845432078da0dddfca65e0e6d1faf4aa9db12ac6c857203c', verifiedAt: '2026-10-16' },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: huaWaiZhiMinRoles,
  nightOrders: { firstNight: huaWaiZhiMinFirstNightOrder, otherNight: huaWaiZhiMinOtherNightOrder },
  setupRules: huaWaiZhiMinSetupRules,
  setupTemplates: huaWaiZhiMinSetupTemplates,
  knowledgeStatus: 'confirmed',
} satisfies SmartScriptPack
