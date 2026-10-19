import type { SmartScriptPack } from '../../types'
import { daChengXiaoZhenFirstNightOrder, daChengXiaoZhenOtherNightOrder } from './night-orders'
import { daChengXiaoZhenRoles } from './roles'
import { daChengXiaoZhenSetupRules } from './setup-rules'
import { daChengXiaoZhenSetupTemplates } from './setup-templates'

export const daChengXiaoZhenSmartScriptPack = {
  scriptId: 'da-cheng-xiao-zhen',
  displayName: "大诚小镇 / v2",
  source: { author: "Milk", version: 'clocktower-wiki index 907 / 原库v2 → 2026-10-16官方规则适配 / build 16ad8f7c270d', url: "https://kkovo550.github.io/clocktower-wiki/script_lib/%E5%89%A7%E6%9C%AC%E5%BA%93.html", contentHash: 'sha256:caffb90244367ea48d6c11a921f108feb109d2e396b6a375748df8b6f05ff6f3', verifiedAt: '2026-10-16' },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: daChengXiaoZhenRoles,
  nightOrders: { firstNight: daChengXiaoZhenFirstNightOrder, otherNight: daChengXiaoZhenOtherNightOrder },
  setupTemplates: daChengXiaoZhenSetupTemplates,
  setupRules: daChengXiaoZhenSetupRules,
  demonBluffPolicy: { count: 3, eligibleTeams: ['townsfolk', 'outsider'], requireNotInPlay: true, summary: '三枚不在场善良角色伪装，旅行者和传奇角色不能作为伪装。' },
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
