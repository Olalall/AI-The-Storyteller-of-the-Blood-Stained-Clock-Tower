import type { SmartScriptPack } from '../../types'
import { hideAndSeekFirstNightOrder, hideAndSeekOtherNightOrder } from './night-orders'
import { hideAndSeekRoles } from './roles'
import { hideAndSeekSetupRules } from './setup-rules'
import { hideAndSeekSetupTemplates } from './setup-templates'

export const hideAndSeekSmartScriptPack = {
  scriptId: 'hide-and-seek',
  displayName: '捉迷藏 / Hide & Seek',
  source: {
    author: 'Narninian and Zaba',
    version: 'TPI Recommended snapshot 2026-07-20',
    url: 'https://script.bloodontheclocktower.com/?script=H4sIAAAAAAAACo2Tu07FMAxAf%2BXKc7%2BgKwssLGwghNzGbU0TO3Kc8hL%2Fji5cwYjHJMdHfuXhAzjBCE%2BFHGEA7L6pwQi3aMLCKCeUdLrH6fwqWAhGuOZE39d3RDsMMGXV1BztpuBKV2pGs7MKjKDyI9Wm5jAumBsN4G%2F17Fl6zvA5XFIQnTLBAOum7Q%2BtLELpcvxlM0%2BGxihBvvIrR93VCOeNLIi7vshsHObVcA7X2SWROe5hezLCEqYbYWlu1FowAM25eRDeungr4RkZHiQ7UQ2nf7CtHNUnLI1yuI1d9iBbuqNEe7KqRhNeNS3o8UUs9E51o0zRYVblphL2z2QkevSwvu87hie5qhU9b1cwgkuNfrhn%2FYd8%2FAKDMcBoBgUAAA%3D%3D',
    contentHash: 'sha256:d50e711952349f51adc87356c2a3a1e29991bc131b906a5c49a795fd50f9c823',
    verifiedAt: '2026-07-31',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: hideAndSeekRoles,
  nightOrders: {
    firstNight: hideAndSeekFirstNightOrder,
    otherNight: hideAndSeekOtherNightOrder,
  },
  setupTemplates: hideAndSeekSetupTemplates,
  setupRules: hideAndSeekSetupRules,
  knowledgeStatus: 'confirmed',
} satisfies SmartScriptPack
