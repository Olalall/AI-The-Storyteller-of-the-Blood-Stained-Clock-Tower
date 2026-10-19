import type { SmartScriptPack } from '../../types'
import { baoZouGeBuLinFirstNightOrder, baoZouGeBuLinOtherNightOrder } from './night-orders'
import { baoZouGeBuLinRoles } from './roles'
import { baoZouGeBuLinSetupRules } from './setup-rules'
import { baoZouGeBuLinSetupTemplates } from './setup-templates'

export const baoZouGeBuLinSmartScriptPack = {
  scriptId: 'bao-zou-ge-bu-lin',
  displayName: "暴揍哥布林",
  source: { author: "太一", version: 'clocktower-wiki index 602 / 原库来源未标版本 → 2026-10-16官方规则适配 / build 16ad8f7c270d', url: "https://kkovo550.github.io/clocktower-wiki/script_lib/%E5%89%A7%E6%9C%AC%E5%BA%93.html", contentHash: 'sha256:ec718ff385087b6789a7b0c177f4a3fe8da78858048b37f4836044ba6f7f494f', verifiedAt: '2026-10-16' },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: baoZouGeBuLinRoles,
  nightOrders: { firstNight: baoZouGeBuLinFirstNightOrder, otherNight: baoZouGeBuLinOtherNightOrder },
  setupTemplates: baoZouGeBuLinSetupTemplates,
  setupRules: baoZouGeBuLinSetupRules,
  demonBluffPolicy: { count: 3, eligibleTeams: ['townsfolk', 'outsider'], requireNotInPlay: true, summary: '三枚不在场善良角色伪装，旅行者和传奇角色不能作为伪装。' },
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
