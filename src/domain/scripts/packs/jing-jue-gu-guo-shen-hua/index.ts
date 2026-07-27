import type { SmartScriptPack } from '../../types'
import { jingJueGuGuoShenHuaFirstNightOrder, jingJueGuGuoShenHuaOtherNightOrder } from './night-orders'
import { jingJueGuGuoShenHuaRoles } from './roles'
import { jingJueGuGuoShenHuaSetupRules } from './setup-rules'
import { jingJueGuGuoShenHuaSetupTemplates } from './setup-templates'

export const jingJueGuGuoShenHuaSmartScriptPack = {
  scriptId: "jing-jue-gu-guo-shen-hua",
  displayName: "精绝古国（神话）",
  source: { author: "Lei的剧本钟楼", version: 'GStone edition 20973 / game 40326', url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20973_16225.json", contentHash: "sha256:541c3fc441a9ae4b1dfff154c2c47d53f653848dc0579ba688fefaba04c51c1c", verifiedAt: '2026-07-22' },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: jingJueGuGuoShenHuaRoles,
  nightOrders: { firstNight: jingJueGuGuoShenHuaFirstNightOrder, otherNight: jingJueGuGuoShenHuaOtherNightOrder },
  setupTemplates: jingJueGuGuoShenHuaSetupTemplates,
  setupRules: jingJueGuGuoShenHuaSetupRules,
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
