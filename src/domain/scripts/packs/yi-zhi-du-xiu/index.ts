import type { SmartScriptPack } from '../../types'
import { yiZhiDuXiuFirstNightOrder, yiZhiDuXiuOtherNightOrder } from './night-orders'
import { yiZhiDuXiuRoles } from './roles'
import { yiZhiDuXiuSetupRules } from './setup-rules'
import { yiZhiDuXiuSetupTemplates } from './setup-templates'

export const yiZhiDuXiuSmartScriptPack = {
  scriptId: 'yi-zhi-du-xiu',
  displayName: "一枝独秀",
  source: {
    author: "Jams&Ben",
    version: 'clocktower-wiki index 507 / 来源未标版本 / build 16ad8f7c270d / 2026-10-16',
    url: "https://kkovo550.github.io/clocktower-wiki/script_lib/%E5%89%A7%E6%9C%AC%E5%BA%93.html",
    contentHash: 'sha256:1bf0a20cfcc8800bc41edb1bb36f6899795ec5d610528df9e115aa6d222316c2',
    verifiedAt: '2026-10-16',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: yiZhiDuXiuRoles,
  nightOrders: { firstNight: yiZhiDuXiuFirstNightOrder, otherNight: yiZhiDuXiuOtherNightOrder },
  setupTemplates: yiZhiDuXiuSetupTemplates,
  setupRules: yiZhiDuXiuSetupRules,
  demonBluffPolicy: { count: 3, eligibleTeams: ['townsfolk', 'outsider'], requireNotInPlay: true, summary: '三枚不在场善良角色伪装，旅行者/传奇角色不能作为伪装。' },
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
