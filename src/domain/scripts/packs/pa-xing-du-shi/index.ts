import type { SmartScriptPack } from '../../types'
import { paXingDuShiFirstNightOrder, paXingDuShiOtherNightOrder } from './night-orders'
import { paXingDuShiRoles } from './roles'
import { paXingDuShiSetupRules } from './setup-rules'
import { paXingDuShiSetupTemplates } from './setup-templates'

export const paXingDuShiSmartScriptPack = {
  scriptId: 'pa-xing-du-shi',
  displayName: "爬行都市",
  source: { author: "Aero", version: 'clocktower-wiki index 830 / 原库来源未标版本 → 2026-10-16官方规则适配 / build 16ad8f7c270d', url: "https://kkovo550.github.io/clocktower-wiki/script_lib/%E5%89%A7%E6%9C%AC%E5%BA%93.html", contentHash: 'sha256:73f3f88be9401010c713ef346a8fe3ef98369e40735f0b679cde287a4c5cedac', verifiedAt: '2026-10-16' },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: paXingDuShiRoles,
  nightOrders: { firstNight: paXingDuShiFirstNightOrder, otherNight: paXingDuShiOtherNightOrder },
  setupTemplates: paXingDuShiSetupTemplates,
  setupRules: paXingDuShiSetupRules,
  demonBluffPolicy: { count: 3, eligibleTeams: ['townsfolk', 'outsider'], requireNotInPlay: true, summary: '三枚不在场善良角色伪装，旅行者和传奇角色不能作为伪装。' },
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
