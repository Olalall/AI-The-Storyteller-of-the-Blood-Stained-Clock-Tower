import type { SmartScriptPack } from '../../types'
import { huiXuanMiZhenFirstNight, huiXuanMiZhenOtherNight } from './night-orders'
import { huiXuanMiZhenRoles } from './roles'
import { huiXuanMiZhenSetupRules } from './setup-rules'
import { huiXuanMiZhenSetupTemplates } from './setup-templates'

export const huiXuanMiZhenSmartScriptPack = {
  scriptId: "hui-xuan-mi-zhen",
  displayName: "回旋迷阵",
  source: { author: "Kyle J", version: 'GStone edition 20747 / game 39445', url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20747_59942.json", contentHash: 'sha256:af0a238cd7827215b5827a3a799d77d1761ef81ea30a74f0df5407d18b3f15c7', verifiedAt: "2026-07-22" },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: huiXuanMiZhenRoles,
  nightOrders: { firstNight: huiXuanMiZhenFirstNight, otherNight: huiXuanMiZhenOtherNight },
  setupTemplates: huiXuanMiZhenSetupTemplates,
  setupRules: huiXuanMiZhenSetupRules,
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
