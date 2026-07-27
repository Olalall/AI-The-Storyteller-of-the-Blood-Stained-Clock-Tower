import type { SmartScriptPack } from '../../types'
import { heFangJiaoZhongFirstNightOrder, heFangJiaoZhongOtherNightOrder } from './night-orders'
import { heFangJiaoZhongRoles } from './roles'
import { heFangJiaoZhongSetupRules } from './setup-rules'
import { heFangJiaoZhongSetupTemplates } from './setup-templates'

export const heFangJiaoZhongSmartScriptPack = {
  scriptId: 'he-fang-jiao-zhong',
  displayName: "何方教众",
  source: {
    author: "Zets",
    version: 'GStone edition 21087 / game 41102',
    url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21087_69602.json",
    contentHash: "sha256:63e5b87f8058d6c25041fca52652806a894e24ad883e7a97fe07bc4925601da4",
    verifiedAt: '2026-07-21',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: heFangJiaoZhongRoles,
  nightOrders: {
    firstNight: heFangJiaoZhongFirstNightOrder,
    otherNight: heFangJiaoZhongOtherNightOrder,
  },
  setupTemplates: heFangJiaoZhongSetupTemplates,
  setupRules: heFangJiaoZhongSetupRules,
  knowledgeStatus: 'needs-review',
} satisfies SmartScriptPack
