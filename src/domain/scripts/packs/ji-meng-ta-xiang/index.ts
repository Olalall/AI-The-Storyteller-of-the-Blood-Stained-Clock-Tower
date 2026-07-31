import type { SmartScriptPack } from '../../types'
import { jiMengTaXiangFirstNight, jiMengTaXiangOtherNight } from './night-orders'
import { jiMengTaXiangRoles } from './roles'
import { jiMengTaXiangSetupRules } from './setup-rules'
import { jiMengTaXiangSetupTemplates } from './setup-templates'

export const jiMengTaXiangSmartScriptPack = {
  scriptId: "ji-meng-ta-xiang",
  displayName: "寄梦他乡",
  source: { author: "鸭木布拉夫钟楼小镇", version: "GStone edition 21263 / game 41725", url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21263_10294.json", contentHash: 'sha256:417d353edf620992fb3822f81bf7e12fd1a722a91ee21cd230a9f04f3d9b4fd7', verifiedAt: "2026-07-22" },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: jiMengTaXiangRoles,
  nightOrders: { firstNight: jiMengTaXiangFirstNight, otherNight: jiMengTaXiangOtherNight },
  setupTemplates: jiMengTaXiangSetupTemplates,
  setupRules: jiMengTaXiangSetupRules,
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
