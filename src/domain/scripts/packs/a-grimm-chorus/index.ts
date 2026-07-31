import type { SmartScriptPack } from '../../types'
import { aGrimmChorusFirstNightOrder, aGrimmChorusOtherNightOrder } from './night-orders'
import { aGrimmChorusRoles } from './roles'
import { aGrimmChorusSetupRules } from './setup-rules'
import { aGrimmChorusSetupTemplates } from './setup-templates'

export const aGrimmChorusSmartScriptPack = {
  scriptId: 'a-grimm-chorus',
  displayName: '格林合唱 / A Grimm Chorus',
  source: {
    author: 'Zets；TPI 页面当前列为 Lachlan',
    version: 'TPI Recommended snapshot 2026-07-20',
    url: 'https://script.bloodontheclocktower.com/?script=H4sIAAAAAAAACpWUQU4DMQxFr4K8nhPMDnWBuAIIIU%2FiSdwm9sjOUCrE3VFFBUvMMtbzj%2FX95ecP4AwzvHYaCBPgPqoazPBEw2ECwU4ww%2F3dg3Hvd4eqtl%2FrS1PNPtAeOxY6qBmlwSowg8q3jrragHnF5jTBuGxXoXVvDT6n26%2BFhAwbTFCq%2Bi%2B8sQjl2%2FOHfuPWsBBn1hFsGXqWZEwW5FnkRLSF%2BYJ9aWGa3tUSe3R47ELOmIK4cKnjjCPVjhLs8YaX8PgreyX7h7i2HLe%2Bs%2FgwioYhoQgv4exk7B7WzrbLKZoAbdSD7KaNBycOO1g0rzhq2EPfe1cJ4%2BiO7hzeZ0JrNM4aj8AFS8EFl6VR1KP9dMIgq0cNOx89GJVpDbIVrYUv0XHPJerBQqVgeOcJNyqKfw3y8gXT%2BfIa6wUAAA%3D%3D',
    contentHash: 'sha256:1700a2c15bba5d993f429b6f5d9e5715aeb0dd2cfb0fc2d495078ec9d3dfb22d',
    verifiedAt: '2026-07-31',
  },
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: aGrimmChorusRoles,
  nightOrders: {
    firstNight: aGrimmChorusFirstNightOrder,
    otherNight: aGrimmChorusOtherNightOrder,
  },
  setupTemplates: aGrimmChorusSetupTemplates,
  setupRules: aGrimmChorusSetupRules,
  knowledgeStatus: 'confirmed',
} satisfies SmartScriptPack
