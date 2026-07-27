import type { SmartScriptPack } from '../../types'
import { yeBanKuangHuanFirstNightOrder, yeBanKuangHuanOtherNightOrder } from './night-orders'
import { yeBanKuangHuanRoles } from './roles'
import { yeBanKuangHuanSetupRules } from './setup-rules'
import { yeBanKuangHuanSetupTemplates } from './setup-templates'
export const yeBanKuangHuanSmartScriptPack = {
  scriptId: "ye-ban-kuang-huan",
  displayName: "夜半狂欢",
  source: { author: 'Zets', version: 'GStone edition 20003 / game 32341', url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20003_86671.json", contentHash: "sha256:f512be8087e3f0b2caa971adc8d9b789cc96315f4c8bffef44423380107b3077", verifiedAt: "2026-07-22" },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: yeBanKuangHuanRoles,
  nightOrders: { firstNight: yeBanKuangHuanFirstNightOrder, otherNight: yeBanKuangHuanOtherNightOrder },
  setupTemplates: yeBanKuangHuanSetupTemplates,
  setupRules: yeBanKuangHuanSetupRules,
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
