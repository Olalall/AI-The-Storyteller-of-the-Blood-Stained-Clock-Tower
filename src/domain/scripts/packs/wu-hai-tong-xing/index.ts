import type { SmartScriptPack } from '../../types'
import { wuHaiTongXingFirstNightOrder, wuHaiTongXingOtherNightOrder } from './night-orders'
import { wuHaiTongXingRoles } from './roles'
import { wuHaiTongXingSetupRules } from './setup-rules'
import { wuHaiTongXingSetupTemplates } from './setup-templates'

export const wuHaiTongXingSmartScriptPack = {
  scriptId: 'wu-hai-tong-xing',
  displayName: '雾海同行',
  source: {
    author: '鸭镇',
    version: 'GStone script import',
    url: 'https://oss.gstonegames.com/data_file/clocktower/upload/1689611944_197011_8300.png',
    contentHash: 'sha256:346da11714d836581a0db75a9f6a0d5f3aaf99b9649349abc5da0bac34912e6c',
    verifiedAt: '2026-07-23',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: wuHaiTongXingRoles,
  nightOrders: {
    firstNight: wuHaiTongXingFirstNightOrder,
    otherNight: wuHaiTongXingOtherNightOrder,
  },
  setupTemplates: wuHaiTongXingSetupTemplates,
  setupRules: wuHaiTongXingSetupRules,
  knowledgeStatus: 'confirmed',
} satisfies SmartScriptPack
