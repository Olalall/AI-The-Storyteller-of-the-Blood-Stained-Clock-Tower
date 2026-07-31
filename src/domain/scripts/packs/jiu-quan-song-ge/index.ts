import type { SmartScriptPack } from '../../types'
import { jiuQuanSongGeFirstNight, jiuQuanSongGeOtherNight } from './night-orders'
import { jiuQuanSongGeRoles } from './roles'
import { jiuQuanSongGeSetupRules } from './setup-rules'
import { jiuQuanSongGeSetupTemplates } from './setup-templates'

export const jiuQuanSongGeSmartScriptPack = {
  scriptId: "jiu-quan-song-ge",
  displayName: "九泉颂歌",
  source: { author: "Cody", version: 'GStone edition 21271 / game 41733', url: "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21271_25016.json", contentHash: 'sha256:2d3564050b7fe17046197ff83836da240b2414dcedc00184da29dd0a81b6e30d', verifiedAt: '2026-07-22' },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: jiuQuanSongGeRoles,
  nightOrders: { firstNight: jiuQuanSongGeFirstNight, otherNight: jiuQuanSongGeOtherNight },
  setupTemplates: jiuQuanSongGeSetupTemplates,
  setupRules: jiuQuanSongGeSetupRules,
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
