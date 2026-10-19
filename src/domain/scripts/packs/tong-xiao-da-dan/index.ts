import type { SmartScriptPack } from '../../types'
import { tongXiaoDaDanFirstNightOrder, tongXiaoDaDanOtherNightOrder } from './night-orders'
import { tongXiaoDaDanRoles } from './roles'
import { tongXiaoDaDanSetupRules } from './setup-rules'
import { tongXiaoDaDanSetupTemplates } from './setup-templates'

export const tongXiaoDaDanSmartScriptPack = {
  scriptId: 'tong-xiao-da-dan',
  displayName: "通宵达旦",
  source: {
    author: "clocktower Con US",
    version: 'clocktower-wiki index 528 / 来源未标版本 / build 16ad8f7c270d / 2026-10-16',
    url: "https://kkovo550.github.io/clocktower-wiki/script_lib/%E5%89%A7%E6%9C%AC%E5%BA%93.html",
    contentHash: 'sha256:fee2ffdb6f3d8d6b403038c3de9deee923570bde3c9dc4207136cecbb86bcdf9',
    verifiedAt: '2026-10-16',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: tongXiaoDaDanRoles,
  nightOrders: { firstNight: tongXiaoDaDanFirstNightOrder, otherNight: tongXiaoDaDanOtherNightOrder },
  setupTemplates: tongXiaoDaDanSetupTemplates,
  setupRules: tongXiaoDaDanSetupRules,
  demonBluffPolicy: { count: 3, eligibleTeams: ['townsfolk', 'outsider'], requireNotInPlay: true, summary: '三枚不在场善良角色伪装，旅行者/传奇角色不能作为伪装。' },
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
