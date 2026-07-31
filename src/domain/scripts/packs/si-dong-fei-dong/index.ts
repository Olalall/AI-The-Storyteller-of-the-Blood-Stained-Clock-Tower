import type { SmartScriptPack } from '../../types'
import { siDongFeiDongFirstNightOrder, siDongFeiDongOtherNightOrder } from './night-orders'
import { siDongFeiDongRoles } from './roles'
import { siDongFeiDongSetupRules } from './setup-rules'
import { siDongFeiDongSetupTemplates } from './setup-templates'

export const siDongFeiDongSmartScriptPack = {
  scriptId: 'si-dong-fei-dong',
  displayName: "似懂非懂",
  source: {
    author: "靶子",
    version: 'GStone edition 21179 / game 41446',
    url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21179_35934.json",
    contentHash: "sha256:9440c0157f79ecba0d6118d97f7ec390b0decdb4213e4feaae68196062505116",
    verifiedAt: "2026-07-21",
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: siDongFeiDongRoles,
  nightOrders: {
    firstNight: siDongFeiDongFirstNightOrder,
    otherNight: siDongFeiDongOtherNightOrder,
  },
  setupTemplates: siDongFeiDongSetupTemplates,
  setupRules: siDongFeiDongSetupRules,
  knowledgeStatus: 'confirmed',
} satisfies SmartScriptPack
