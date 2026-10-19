import type { SmartScriptPack } from '../../types'
import { weiWangGuiLaiRoles } from './roles'
import { weiWangGuiLaiFirstNightOrder, weiWangGuiLaiOtherNightOrder } from './night-orders'
import { weiWangGuiLaiSetupRules } from './setup-rules'
import { weiWangGuiLaiSetupTemplates } from './setup-templates'

export const weiWangGuiLaiSmartScriptPack = {
  scriptId: 'wei-wang-gui-lai',
  displayName: '伪王归来',
  source: { author: "Patters", version: 'Clocktower Wiki index 538 / 来源未标版本 / build 16ad8f7c270d / 2026-10-16当前官方规则适配', url: 'https://kkovo550.github.io/clocktower-wiki/script_lib/%E5%89%A7%E6%9C%AC%E5%BA%93.html', contentHash: 'sha256:7a0921d4f3b7ca391a608e681a59345fee7d5a1b3eb2498d08d7eebe8385aa93', verifiedAt: '2026-10-16' },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: weiWangGuiLaiRoles,
  nightOrders: { firstNight: weiWangGuiLaiFirstNightOrder, otherNight: weiWangGuiLaiOtherNightOrder },
  setupRules: weiWangGuiLaiSetupRules,
  setupTemplates: weiWangGuiLaiSetupTemplates,
  knowledgeStatus: 'confirmed',
} satisfies SmartScriptPack
