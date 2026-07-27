import type { SmartScriptPack } from '../../types'
import { moNiZhiJiaoFirstNight, moNiZhiJiaoOtherNight } from './night-orders'
import { moNiZhiJiaoRoles } from './roles'
import { moNiZhiJiaoSetupRules } from './setup-rules'
import { moNiZhiJiaoSetupTemplates } from './setup-templates'

export const moNiZhiJiaoSmartScriptPack = {
  scriptId: "mo-ni-zhi-jiao",
  displayName: "莫逆之交",
  source: { author: "板", version: 'GStone edition 21481 / game 42770', url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21481_47096.json", contentHash: 'sha256:ce05efb561f7a3acb70245b17aa904063d2ba9179f5726a52ca782eff643376f', verifiedAt: '2026-07-22' },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: moNiZhiJiaoRoles,
  nightOrders: { firstNight: moNiZhiJiaoFirstNight, otherNight: moNiZhiJiaoOtherNight },
  setupTemplates: moNiZhiJiaoSetupTemplates,
  setupRules: moNiZhiJiaoSetupRules,
  knowledgeStatus: 'needs-review',
} as const satisfies SmartScriptPack
