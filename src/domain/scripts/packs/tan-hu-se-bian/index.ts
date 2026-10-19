import type { SmartScriptPack } from '../../types'
import { tanHuSeBianRoles } from './roles'
import { tanHuSeBianFirstNightOrder, tanHuSeBianOtherNightOrder } from './night-orders'
import { tanHuSeBianSetupRules } from './setup-rules'
import { tanHuSeBianSetupTemplates } from './setup-templates'

export const tanHuSeBianSmartScriptPack = {
  scriptId: 'tan-hu-se-bian', displayName: '谈虎色变 / v5',
  source: { author: "Brockwell", version: 'clocktower-wiki index 560 / 目录标v5，JSON元信息未标版号 → 2026-10-18官方规则适配 / build 16ad8f7c270d', url: 'https://kkovo550.github.io/clocktower-wiki/script_lib/%E5%89%A7%E6%9C%AC%E5%BA%93.html', contentHash: 'sha256:aff3eded23c576fe55149a470f643b5d2b57d30218b5222106474cea7059e005', verifiedAt: '2026-10-18' },
  playerCounts: [7,8,9,10,11,12,13,14,15], roles: tanHuSeBianRoles,
  nightOrders: { firstNight: tanHuSeBianFirstNightOrder, otherNight: tanHuSeBianOtherNightOrder },
  setupRules: tanHuSeBianSetupRules, setupTemplates: tanHuSeBianSetupTemplates,
  demonBluffPolicy: { count: 3, eligibleTeams: ['townsfolk','outsider'], requireNotInPlay: true, summary: '3个不同的本板不在场善良角色；传奇与旅行者不占伪装。' },
  knowledgeStatus: 'confirmed',
} satisfies SmartScriptPack
