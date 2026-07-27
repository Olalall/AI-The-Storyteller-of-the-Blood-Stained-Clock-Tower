import type { SmartScriptPack } from '../../types'
import { xinKouCiHuangFirstNightOrder, xinKouCiHuangOtherNightOrder } from './night-orders'
import { xinKouCiHuangRoles } from './roles'
import { xinKouCiHuangSetupRules } from './setup-rules'
import { xinKouCiHuangSetupTemplates } from './setup-templates'

export const xinKouCiHuangSmartScriptPack = {
  scriptId: "xin-kou-ci-huang",
  displayName: "信口雌黄",
  source: { author: "努力努力", version: "GStone edition 21685 / game 43856", url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21685_36800.json", contentHash: "sha256:4397c0506ab8e254b135a0610c1b096a8304925c86694e953514adf67ab1cd69", verifiedAt: '2026-07-22' },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: xinKouCiHuangRoles,
  nightOrders: { firstNight: xinKouCiHuangFirstNightOrder, otherNight: xinKouCiHuangOtherNightOrder },
  setupTemplates: xinKouCiHuangSetupTemplates,
  setupRules: xinKouCiHuangSetupRules,
  knowledgeStatus: 'needs-review',
} satisfies SmartScriptPack
