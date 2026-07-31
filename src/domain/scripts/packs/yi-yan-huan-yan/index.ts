import type { SmartScriptPack } from '../../types'
import { yiYanHuanYanFirstNightOrder, yiYanHuanYanOtherNightOrder } from './night-orders'
import { yiYanHuanYanRoles } from './roles'
import { yiYanHuanYanSetupRules } from './setup-rules'
import { yiYanHuanYanSetupTemplates } from './setup-templates'

export const yiYanHuanYanSmartScriptPack = {
  scriptId: "yi-yan-huan-yan",
  displayName: "以眼还眼",
  source: {
    author: "The Good Couch",
    version: "GStone edition 20970 / game 40324",
    url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20970_16223.json",
    contentHash: "sha256:7e7eb334f450d0595457bfc0f95a36e5b282c2137b2b4ca250b3c0d7cf010d23",
    verifiedAt: '2026-07-21',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: yiYanHuanYanRoles,
  nightOrders: {
    firstNight: yiYanHuanYanFirstNightOrder,
    otherNight: yiYanHuanYanOtherNightOrder,
  },
  setupTemplates: yiYanHuanYanSetupTemplates,
  setupRules: yiYanHuanYanSetupRules,
  knowledgeStatus: 'confirmed',
} satisfies SmartScriptPack
