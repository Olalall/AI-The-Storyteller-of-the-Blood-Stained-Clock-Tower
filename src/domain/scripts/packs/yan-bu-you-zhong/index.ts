import type { SmartScriptPack } from '../../types'
import { yanBuYouZhongRoles } from './roles'
import { yanBuYouZhongFirstNightOrder, yanBuYouZhongOtherNightOrder } from './night-orders'
import { yanBuYouZhongSetupRules } from './setup-rules'
import { yanBuYouZhongSetupTemplates } from './setup-templates'

export const yanBuYouZhongSmartScriptPack = {
  scriptId: 'yan-bu-you-zhong', displayName: '言不由衷',
  source: { author: "上海7221俱乐部", version: 'clocktower-wiki index 604 / 原文未标版本 → 2026-10-18官方规则适配 / build 16ad8f7c270d', url: 'https://kkovo550.github.io/clocktower-wiki/script_lib/%E5%89%A7%E6%9C%AC%E5%BA%93.html', contentHash: 'sha256:f90e3927c1b9aac332d37b29fe5119e82a0bd808d73d8a6dba0ed62ee57fce48', verifiedAt: '2026-10-18' },
  playerCounts: [7,8,9,10,11,12,13,14,15], roles: yanBuYouZhongRoles,
  nightOrders: { firstNight: yanBuYouZhongFirstNightOrder, otherNight: yanBuYouZhongOtherNightOrder },
  setupRules: yanBuYouZhongSetupRules, setupTemplates: yanBuYouZhongSetupTemplates,
  demonBluffPolicy: { count: 3, eligibleTeams: ['townsfolk','outsider'], requireNotInPlay: true, summary: '3个不同的本板不在场善良角色；传奇与旅行者不占伪装。' },
  knowledgeStatus: 'confirmed',
} satisfies SmartScriptPack
