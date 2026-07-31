import type { SmartScriptPack } from '../../types'
import { tianTangHuaYuanFirstNight, tianTangHuaYuanOtherNight } from './night-orders'
import { tianTangHuaYuanRoles } from './roles'
import { tianTangHuaYuanSetupRules } from './setup-rules'
import { tianTangHuaYuanSetupTemplates } from './setup-templates'

export const tianTangHuaYuanSmartScriptPack = {
  scriptId: "tian-tang-hua-yuan",
  displayName: "天堂花园",
  source: { author: "Tyler Nafe", version: 'GStone edition 20725 / game 39396', url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20725_52289.json", contentHash: 'sha256:f70ddd0ffebd64bbfcc04b30ae9b6d54a91e5da61f55f20b4b8cec379486de39', verifiedAt: "2026-07-22" },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: tianTangHuaYuanRoles,
  nightOrders: { firstNight: tianTangHuaYuanFirstNight, otherNight: tianTangHuaYuanOtherNight },
  setupTemplates: tianTangHuaYuanSetupTemplates,
  setupRules: tianTangHuaYuanSetupRules,
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
