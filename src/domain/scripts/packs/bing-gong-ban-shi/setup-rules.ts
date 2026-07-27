import type { SetupRule } from '../../types'

const sourceUrl = 'https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21097_69653.json'
const reviewedAt = '2026-07-21'

export const bingGongBanShiSetupRules: readonly SetupRule[] = [
  {
    id: 'bing-gong-ban-shi-godfather-reminder',
    roleId: 'godfather',
    summary: 'Godfather may change outsider count and may get an extra night kill after an Outsider dies by day. Storyteller confirms.',
    knowledgeStatus: 'confirmed',
    sourceUrls: [sourceUrl],
    reviewedAt,
  },
  {
    id: 'bing-gong-ban-shi-qiongqi-reminder',
    roleId: 'qiongqi',
    summary: 'Qiongqi adds an Outsider and changes the death pattern after an Outsider dies by day. Storyteller confirms.',
    knowledgeStatus: 'confirmed',
    sourceUrls: [sourceUrl],
    reviewedAt,
  },
  {
    id: 'bing-gong-ban-shi-ganshiren-reminder',
    roleId: 'ganshiren',
    summary: 'Ganshiren removes an Outsider; adjacent Townsfolk first-death registration needs manual confirmation.',
    knowledgeStatus: 'confirmed',
    sourceUrls: [sourceUrl],
    reviewedAt,
  },
  {
    id: 'bing-gong-ban-shi-atheist-reminder',
    roleId: 'atheist',
    summary: 'Atheist has no evil characters and lets the Storyteller break rules; this tool does not auto-build an Atheist game.',
    knowledgeStatus: 'confirmed',
    sourceUrls: [sourceUrl],
    reviewedAt,
  },
  {
    id: 'bing-gong-ban-shi-spiritofivory-reminder',
    roleId: 'spiritofivory',
    summary: 'Spirit of Ivory limits extra evil players; identity or alignment changes must be checked one by one.',
    knowledgeStatus: 'confirmed',
    sourceUrls: [sourceUrl],
    reviewedAt,
  },
  {
    id: 'bing-gong-ban-shi-djinn-reminder',
    roleId: 'djinn',
    summary: 'Djinn jinxes should be announced before play; this script includes Investigator, Alchemist, Pit-Hag, Vizier and Damsel interactions.',
    knowledgeStatus: 'confirmed',
    sourceUrls: [sourceUrl],
    reviewedAt,
  },
  {
    id: 'bing-gong-ban-shi-pithag-reminder',
    roleId: 'pithag',
    summary: 'If Pit-Hag creates a Demon, tonight deaths are decided by the Storyteller. Record as draft only.',
    knowledgeStatus: 'confirmed',
    sourceUrls: [sourceUrl],
    reviewedAt,
  },
  {
    id: 'bing-gong-ban-shi-vizier-reminder',
    roleId: 'vizier',
    summary: 'Vizier public identity, daytime death immunity and immediate execution all need explicit Storyteller confirmation.',
    knowledgeStatus: 'confirmed',
    sourceUrls: [sourceUrl],
    reviewedAt,
  },
]
