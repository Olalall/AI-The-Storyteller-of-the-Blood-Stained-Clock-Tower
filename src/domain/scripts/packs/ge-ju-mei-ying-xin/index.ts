import type { SmartScriptPack } from '../../types'
import { geJuMeiYingXinFirstNight, geJuMeiYingXinOtherNight } from './night-orders'
import { geJuMeiYingXinRoles } from './roles'
import { geJuMeiYingXinSetupRules } from './setup-rules'
import { geJuMeiYingXinSetupTemplates } from './setup-templates'

export const geJuMeiYingXinSmartScriptPack = {
  scriptId: 'ge-ju-mei-ying-xin',
  displayName: "歌剧魅影-新",
  source: {
    author: "泽度哥摧毁停车场",
    version: 'GStone edition 20724 / game 39391',
    url: 'https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20724_52280.json',
    contentHash: 'sha256:fc2a22a523a094ee1d84c18a41cc0d7b10a6502672dd385912c9a4a32650111a',
    verifiedAt: '2026-07-22',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: geJuMeiYingXinRoles,
  nightOrders: { firstNight: geJuMeiYingXinFirstNight, otherNight: geJuMeiYingXinOtherNight },
  setupTemplates: geJuMeiYingXinSetupTemplates,
  setupRules: geJuMeiYingXinSetupRules,
  demonBluffPolicy: {
    count: 3,
    eligibleTeams: ['townsfolk'],
    requireNotInPlay: true,
    summary: 'Use not-in-play Townsfolk bluffs; avoid hidden/setup-modifier roles unless storyteller intentionally hand-adjusts.',
  },
  knowledgeStatus: 'confirmed',
} as const satisfies SmartScriptPack
