import type { SmartScriptPack } from '../../types'
import { muHouCaoKongFirstNightOrder, muHouCaoKongOtherNightOrder } from './night-orders'
import { muHouCaoKongRoles } from './roles'
import { muHouCaoKongSetupRules } from './setup-rules'
import { muHouCaoKongSetupTemplates } from './setup-templates'

export const muHouCaoKongSmartScriptPack = {
  scriptId: 'mu-hou-cao-kong',
  displayName: "幕后操控",
  source: {
    author: "Ben Burns",
    version: 'clocktower-wiki index 823 / 来源未标版本 / build 16ad8f7c270d / 2026-10-16',
    url: "https://kkovo550.github.io/clocktower-wiki/script_lib/%E5%89%A7%E6%9C%AC%E5%BA%93.html",
    contentHash: 'sha256:b77d9ce8594bfccaf5faaec7e935aa05d633d60f0fe0919af9ea37d3460428da',
    verifiedAt: '2026-10-16',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: muHouCaoKongRoles,
  nightOrders: { firstNight: muHouCaoKongFirstNightOrder, otherNight: muHouCaoKongOtherNightOrder },
  setupTemplates: muHouCaoKongSetupTemplates,
  setupRules: muHouCaoKongSetupRules,
  demonBluffPolicy: { count: 3, eligibleTeams: ['townsfolk', 'outsider'], requireNotInPlay: true, summary: '三枚不在场善良角色伪装，旅行者/传奇角色不能作为伪装。' },
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
