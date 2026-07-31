import type { SmartScriptPack } from '../../types'
import { lunarEclipseFirstNightOrder, lunarEclipseOtherNightOrder } from './night-orders'
import { lunarEclipseRoles } from './roles'
import { lunarEclipseSetupRules } from './setup-rules'
import { lunarEclipseSetupTemplates } from './setup-templates'

export const lunarEclipseSmartScriptPack = {
  scriptId: 'lunar-eclipse',
  displayName: '月食 / Lunar Eclipse',
  source: {
    author: 'Ekin',
    version: 'TPI Recommended snapshot 2026-07-20',
    url: 'https://script.bloodontheclocktower.com/?script=H4sIAAAAAAAACpWUTU7EMAyFr4K87gm6RbNA4gYIIbdxU2sSO3Lcig7i7mhgBEs8y0jPv%2B9zXj6AE4zwVskRBsDNVzUY4XRmgQEEK8EIz5ugPZzmwq0TDDAV1dQd7alipkc1o9lZBUZQ%2BUmjXc1hXLB0GsCPds2zbKXA53Armg0lVfWVDAbIq%2Fa%2FgMYilG7P34jG70xBbUcuGk08r1gnsoqcghEVfaWKzjOjBGNY5EzUwuOWY0bx1bTFh95RPChGc%2B5RsRMWTEd4O%2FmexVQ84lahCE9YgvKsGu1iQpvi3mxyNT8K7na5FKrYPVwga1rwjttItHPpmHad0cO8tKij2Dv2znFHjVXIw52IJuwrc1B%2B0TptWxSCnbNa1SvvcRa4f3%2BJEfWKVjR8dq0ZifMcXc1EOWMUg123FCa%2BNzZ2XXhX%2Bw%2BE1y%2BQsqpnLAYAAA%3D%3D',
    contentHash: 'sha256:070cb29f3835ee8b19312a6a7d19fe163cb1db3661d679c50f1d6296cbfcbe95',
    verifiedAt: '2026-07-31',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: lunarEclipseRoles,
  nightOrders: {
    firstNight: lunarEclipseFirstNightOrder,
    otherNight: lunarEclipseOtherNightOrder,
  },
  setupTemplates: lunarEclipseSetupTemplates,
  setupRules: lunarEclipseSetupRules,
  knowledgeStatus: 'confirmed',
} satisfies SmartScriptPack
