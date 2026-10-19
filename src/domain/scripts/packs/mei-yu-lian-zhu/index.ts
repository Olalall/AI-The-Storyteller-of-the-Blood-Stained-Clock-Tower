import type { SmartScriptPack } from '../../types'
import { meiYuLianZhuFirstNightOrder, meiYuLianZhuOtherNightOrder } from './night-orders'
import { meiYuLianZhuRoles } from './roles'
import { meiYuLianZhuSetupRules } from './setup-rules'
import { meiYuLianZhuSetupTemplates } from './setup-templates'

export const meiYuLianZhuSmartScriptPack = {
  scriptId: 'mei-yu-lian-zhu',
  displayName: "魅语连珠 / v1.2.0",
  source: {
    author: "Luxray,Justin & sabenite",
    version: 'clocktower-wiki index 566 / v1.2.0 / build 16ad8f7c270d / 2026-10-16',
    url: "https://kkovo550.github.io/clocktower-wiki/script_lib/%E5%89%A7%E6%9C%AC%E5%BA%93.html",
    contentHash: 'sha256:b684e45ffcb9df260e7bafd4a6a520350e49dac7ed83230d7702408a025075dd',
    verifiedAt: '2026-10-16',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: meiYuLianZhuRoles,
  nightOrders: { firstNight: meiYuLianZhuFirstNightOrder, otherNight: meiYuLianZhuOtherNightOrder },
  setupTemplates: meiYuLianZhuSetupTemplates,
  setupRules: meiYuLianZhuSetupRules,
  demonBluffPolicy: { count: 3, eligibleTeams: ['townsfolk', 'outsider'], requireNotInPlay: true, summary: '三枚不在场善良角色伪装，旅行者/传奇角色不能作为伪装。' },
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
