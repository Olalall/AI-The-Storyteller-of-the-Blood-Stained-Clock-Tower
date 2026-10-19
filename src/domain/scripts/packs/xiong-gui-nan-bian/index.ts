import type { SmartScriptPack } from '../../types'
import { xiongGuiNanBianRoles } from './roles'
import { xiongGuiNanBianFirstNightOrder, xiongGuiNanBianOtherNightOrder } from './night-orders'
import { xiongGuiNanBianSetupRules } from './setup-rules'
import { xiongGuiNanBianSetupTemplates } from './setup-templates'

export const xiongGuiNanBianSmartScriptPack = {
  scriptId: 'xiong-gui-nan-bian',
  displayName: '凶诡难辨',
  source: { author: "鸭木布拉夫钟楼小镇", version: 'Clocktower Wiki index 489 / 来源未标版本 / build 16ad8f7c270d / 2026-10-16当前官方规则适配', url: 'https://kkovo550.github.io/clocktower-wiki/script_lib/%E5%89%A7%E6%9C%AC%E5%BA%93.html', contentHash: 'sha256:f19e62de0b9e10b650211a2fa0df628ea0297cc1769be4bb50a915ac8e4b732a', verifiedAt: '2026-10-16' },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: xiongGuiNanBianRoles,
  nightOrders: { firstNight: xiongGuiNanBianFirstNightOrder, otherNight: xiongGuiNanBianOtherNightOrder },
  setupRules: xiongGuiNanBianSetupRules,
  setupTemplates: xiongGuiNanBianSetupTemplates,
  knowledgeStatus: 'confirmed',
} satisfies SmartScriptPack
