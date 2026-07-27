import type { SetupRule } from '../../types'

const sourceUrl = "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21481_47096.json"
const reviewedAt = '2026-07-22'

export const moNiZhiJiaoSetupRules: readonly SetupRule[] = [
  { id: 'baron-extra-outsiders', roleId: 'baron', summary: 'Baron adds 2 Outsiders; excluded from first normal templates.', knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: 'lilmonsta-babysitter', roleId: 'lilmonsta', summary: 'Lil Monsta has no fixed Demon player, adds 1 Minion, and needs babysitter handling.', knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: 'vigormortis-minus-outsider', roleId: 'vigormortis', summary: 'Vigormortis removes 1 Outsider; excluded from first normal templates.', knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: 'ogre-hidden-team-change', roleId: 'ogre', summary: 'Ogre changes alignment to chosen player team but does not learn it.', knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: 'pithag-not-present', roleId: 'pithag', summary: 'No Pit-Hag in this source; guard alias remains unavailable.', knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: 'philosopher-drunk-role', roleId: 'philosopher', summary: 'Philosopher chosen good role and drunkness require manual confirmation.', knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: 'aohe-absent-role-kill', roleId: 'aohe', summary: 'Aohe kills by chosen character; if absent, storyteller chooses victim.', knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: 'klutz-public-loss-choice', roleId: 'klutz', summary: 'Klutz choice can lose the game; win/loss remains storyteller-confirmed.', knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: 'widow-grimoire-poison', roleId: 'widow', summary: 'Widow grimoire view, poison target and good-player warning are manual.', knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
]
