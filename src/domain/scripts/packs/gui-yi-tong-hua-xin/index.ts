import type { SmartScriptPack } from '../../types'
import { guiYiTongHuaXinFirstNight, guiYiTongHuaXinOtherNight } from './night-orders'
import { guiYiTongHuaXinRoles } from './roles'
import { guiYiTongHuaXinSetupRules } from './setup-rules'
import { guiYiTongHuaXinSetupTemplates } from './setup-templates'

export const guiYiTongHuaXinSmartScriptPack = {
  scriptId: 'gui-yi-tong-hua-xin',
  displayName: "诡异童话-新",
  source: {
    author: "AstralZucchinii;翻译:鸭镇",
    version: 'GStone edition 20734 / game 39406',
    url: 'https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20734_52642.json',
    contentHash: 'sha256:5f40f34c79c1208e1587e3f9bf7301c316c50f89452e23295398b992a716905b',
    verifiedAt: '2026-07-22',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: guiYiTongHuaXinRoles,
  nightOrders: { firstNight: guiYiTongHuaXinFirstNight, otherNight: guiYiTongHuaXinOtherNight },
  setupTemplates: guiYiTongHuaXinSetupTemplates,
  setupRules: guiYiTongHuaXinSetupRules,
  demonBluffPolicy: { count: 3, eligibleTeams: ['townsfolk'], requireNotInPlay: true, summary: 'Use not-in-play Townsfolk bluffs; avoid setup/decree roles unless storyteller intentionally hand-adjusts.' },
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
