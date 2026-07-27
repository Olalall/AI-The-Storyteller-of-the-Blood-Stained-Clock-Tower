import type { SetupRule } from '../../types'

const sourceUrl = "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21506_04125.json"
const reviewedAt = '2026-07-22'

export const ziGuiQiMingSetupRules: readonly SetupRule[] = [
  { id: 'lilmonsta-extra-minion', roleId: 'lilmonsta', summary: 'Lil Monsta adds one Minion and has a nightly babysitter; kept out of first normal templates.', knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: 'godfather-outsider', roleId: 'godfather', summary: 'Godfather may add or remove 1 Outsider; kept out of first normal templates for this pack.', knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: 'marionette-demon-neighbor', roleId: 'marionette', summary: 'Marionette is evil, thinks they are good, and must neighbor the Demon.', knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: 'yanluo-delayed-kill', roleId: 'yanluo', summary: 'Yanluo creates a delayed night-three kill and rolling previous-night death chain.', knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: 'dianyuzhang-delayed-execution', roleId: 'dianyuzhang', summary: 'Dianyuzhang marks up to three players and resolves deaths based on next-day execution.', knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: 'zhen-role-kill', roleId: 'zhen', summary: 'Zhen chooses a Townsfolk role; if in play, that player is drunk and dies after ST confirmation.', knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
]
