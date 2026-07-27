import type { SmartScriptPack } from '../../types'
import { yeMuJiangLinFirstNightOrder, yeMuJiangLinOtherNightOrder } from './night-orders'
import { yeMuJiangLinRoles } from './roles'
import { yeMuJiangLinSetupRules } from './setup-rules'
import { yeMuJiangLinSetupTemplates } from './setup-templates'

export const yeMuJiangLinSmartScriptPack = {
  scriptId: "ye-mu-jiang-lin",
  displayName: "夜幕降临",
  source: {
    author: "贾卡Jaques",
    version: "GStone edition 21091 / game 41106",
    url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21091_69606.json",
    contentHash: "sha256:7faddcacda1cd830df924b9dd2050fb707afc6532caa7ad2f6d696a47e92ec1a",
    verifiedAt: '2026-07-21',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: yeMuJiangLinRoles,
  nightOrders: {
    firstNight: yeMuJiangLinFirstNightOrder,
    otherNight: yeMuJiangLinOtherNightOrder,
  },
  setupTemplates: yeMuJiangLinSetupTemplates,
  setupRules: yeMuJiangLinSetupRules,
  knowledgeStatus: 'needs-review',
} satisfies SmartScriptPack
