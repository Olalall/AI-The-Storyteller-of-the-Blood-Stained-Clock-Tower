import type { SmartScriptPack } from '../../types'
import { wuHeYouZhiXiangFirstNightOrder, wuHeYouZhiXiangOtherNightOrder } from './night-orders'
import { wuHeYouZhiXiangRoles } from './roles'
import { wuHeYouZhiXiangSetupRules } from './setup-rules'
import { wuHeYouZhiXiangSetupTemplates } from './setup-templates'

export const wuHeYouZhiXiangSmartScriptPack = {
  scriptId: 'wu-he-you-zhi-xiang',
  displayName: "无何有之乡",
  source: {
    author: "鸭镇",
    version: 'GStone edition 21137 / game 41302',
    url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21137_23248.json",
    contentHash: "sha256:2339a029e70a71b16a7ecad56a64051f0852b7336b9e26d1708a046ed7b30a87",
    verifiedAt: "2026-07-21",
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: wuHeYouZhiXiangRoles,
  nightOrders: {
    firstNight: wuHeYouZhiXiangFirstNightOrder,
    otherNight: wuHeYouZhiXiangOtherNightOrder,
  },
  setupTemplates: wuHeYouZhiXiangSetupTemplates,
  setupRules: wuHeYouZhiXiangSetupRules,
  knowledgeStatus: 'confirmed',
} satisfies SmartScriptPack
