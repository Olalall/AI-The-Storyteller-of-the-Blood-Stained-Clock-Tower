import type { SmartScriptPack } from '../../types'
import { longZhengHuDouFirstNightOrder, longZhengHuDouOtherNightOrder } from './night-orders'
import { longZhengHuDouRoles } from './roles'
import { longZhengHuDouSetupRules } from './setup-rules'
import { longZhengHuDouSetupTemplates } from './setup-templates'

export const longZhengHuDouSmartScriptPack = {
  scriptId: 'long-zheng-hu-dou',
  displayName: "龙争虎斗 / 2.0",
  source: { author: "追命丶", version: 'clocktower-wiki index 627 / 原库2.0 → 2026-10-16官方规则适配 / build 16ad8f7c270d', url: "https://kkovo550.github.io/clocktower-wiki/script_lib/%E5%89%A7%E6%9C%AC%E5%BA%93.html", contentHash: 'sha256:5c54906cd8dd44c78f0fc1aa7050ba8e922e527c5a471eb4f167d42d3aaedb17', verifiedAt: '2026-10-16' },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: longZhengHuDouRoles,
  nightOrders: { firstNight: longZhengHuDouFirstNightOrder, otherNight: longZhengHuDouOtherNightOrder },
  setupTemplates: longZhengHuDouSetupTemplates,
  setupRules: longZhengHuDouSetupRules,
  demonBluffPolicy: { count: 3, eligibleTeams: ['townsfolk', 'outsider'], requireNotInPlay: true, summary: '三枚不在场善良角色伪装，旅行者和传奇角色不能作为伪装。' },
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
