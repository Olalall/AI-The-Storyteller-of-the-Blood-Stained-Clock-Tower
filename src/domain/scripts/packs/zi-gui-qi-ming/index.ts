import type { SmartScriptPack } from '../../types'
import { ziGuiQiMingFirstNight, ziGuiQiMingOtherNight } from './night-orders'
import { ziGuiQiMingRoles } from './roles'
import { ziGuiQiMingSetupRules } from './setup-rules'
import { ziGuiQiMingSetupTemplates } from './setup-templates'

export const ziGuiQiMingSmartScriptPack = {
  scriptId: "zi-gui-qi-ming",
  displayName: "子规泣鸣",
  source: { author: "泽渡哥摧毁停车场", version: 'GStone edition 21506 / game 42995', url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21506_04125.json", contentHash: 'sha256:828c16539e3fb0a09778e3c281f5f9d93475279da9013dde1d753e9886c2c8a5', verifiedAt: '2026-07-22' },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: ziGuiQiMingRoles,
  nightOrders: { firstNight: ziGuiQiMingFirstNight, otherNight: ziGuiQiMingOtherNight },
  setupTemplates: ziGuiQiMingSetupTemplates,
  setupRules: ziGuiQiMingSetupRules,
  knowledgeStatus: 'needs-review',
} as const satisfies SmartScriptPack
