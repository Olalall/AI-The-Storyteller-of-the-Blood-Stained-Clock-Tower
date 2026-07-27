import type { SmartScriptPack } from '../../types'
import { eMoMiChengFirstNightOrder, eMoMiChengOtherNightOrder } from './night-orders'
import { eMoMiChengRoles } from './roles'
import { eMoMiChengSetupRules } from './setup-rules'
import { eMoMiChengSetupTemplates } from './setup-templates'

export const eMoMiChengSmartScriptPack = {
  scriptId: "e-mo-mi-cheng",
  displayName: "恶魔谜城",
  source: { author: "Cosmo", version: 'GStone edition 20752 / game 39440', url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20752_59935.json", contentHash: "sha256:0ecf691d816b1cb95b23d112e2512b691a8851f894bc1bab9c931d500edb7ab2", verifiedAt: "2026-07-22" },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: eMoMiChengRoles,
  nightOrders: { firstNight: eMoMiChengFirstNightOrder, otherNight: eMoMiChengOtherNightOrder },
  setupTemplates: eMoMiChengSetupTemplates,
  setupRules: eMoMiChengSetupRules,
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
