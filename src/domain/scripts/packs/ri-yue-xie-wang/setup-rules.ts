import type { SetupRule } from '../../types'

const sourceUrl = "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21530_04126.json"
const reviewedAt = '2026-07-22'

export const riYueXieWangSetupRules: readonly SetupRule[] = [
  { id: 'marionette-demon-neighbor', roleId: 'marionette', summary: 'Marionette is evil, thinks they are good, and must neighbor the Demon.', knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: 'scarlet-woman-demon-continuity', roleId: 'scarletwoman', summary: 'Scarlet Woman can become the Demon if Demon dies with at least five non-Traveler players alive.', knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: 'niangjiushi-replace-info', roleId: 'niangjiushi', summary: 'Niangjiushi replaces the next information result of the chosen Townsfolk role.', knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: 'baojun-night-death-count', roleId: 'baojun', summary: 'Baojun kills one player each night*; only if Baojun killed a player neighboring a Minion, the next night Baojun may choose up to two players to die (choosing fewer or none is allowed).', knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: 'aohe-absent-role-fallback', roleId: 'aohe', summary: 'Aohe chooses a role; if that role is absent, storyteller chooses the killed player.', knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: 'vortox-false-town-info', roleId: 'vortox', summary: 'Vortox makes Townsfolk information false and adds a no-execution win/loss risk.', knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: 'nodashii-neighbor-poison', roleId: 'nodashii', summary: 'No Dashii poisons the nearest two Townsfolk; apply only after storyteller confirmation.', knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
]
