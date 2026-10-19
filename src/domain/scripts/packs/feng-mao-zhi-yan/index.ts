import type { SmartScriptPack } from '../../types'
import { fengMaoZhiYanRoles } from './roles'
import { fengMaoZhiYanFirstNightOrder, fengMaoZhiYanOtherNightOrder } from './night-orders'
import { fengMaoZhiYanSetupRules } from './setup-rules'
import { fengMaoZhiYanSetupTemplates } from './setup-templates'

export const fengMaoZhiYanSmartScriptPack = {
  scriptId: 'feng-mao-zhi-yan', displayName: '疯帽之宴',
  source: { author: "Sui染钟楼", version: 'clocktower-wiki index 480 / 原文未标版本 → 2026-10-18官方规则适配 / build 16ad8f7c270d', url: 'https://kkovo550.github.io/clocktower-wiki/script_lib/%E5%89%A7%E6%9C%AC%E5%BA%93.html', contentHash: 'sha256:66abd567cdb4622ba5ece7aef64d70ccc324a2f3537eefda92457d5cbdb2f1ab', verifiedAt: '2026-10-18' },
  playerCounts: [7,8,9,10,11,12,13,14,15], roles: fengMaoZhiYanRoles,
  nightOrders: { firstNight: fengMaoZhiYanFirstNightOrder, otherNight: fengMaoZhiYanOtherNightOrder },
  setupRules: fengMaoZhiYanSetupRules, setupTemplates: fengMaoZhiYanSetupTemplates,
  demonBluffPolicy: { count: 3, eligibleTeams: ['townsfolk','outsider'], requireNotInPlay: true, summary: '3个不同的本板不在场善良角色；传奇与旅行者不占伪装。' },
  knowledgeStatus: 'confirmed',
} satisfies SmartScriptPack
