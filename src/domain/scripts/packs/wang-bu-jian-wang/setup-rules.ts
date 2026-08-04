import type { SetupRule } from '../../types'

const sourceUrl = "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21493_62907.json"
const reviewedAt = '2026-07-22'

export const wangBuJianWangSetupRules: readonly SetupRule[] = [
  { id: 'baron-extra-outsiders', roleId: 'baron', summary: 'Baron adds 2 Outsiders; kept out of first normal templates.', knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: 'balloonist-extra-outsider', roleId: 'balloonist', summary: 'Balloonist adds +0 to +1 Outsider (storyteller\'s choice); kept out of first normal templates.', knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: 'bountyhunter-evil-townsfolk', roleId: 'bountyhunter', summary: 'Bounty Hunter turns one Townsfolk evil at setup; kept out of first normal templates.', knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: 'marionette-demon-neighbor', roleId: 'marionette', summary: 'Marionette is evil, thinks they are good, and must neighbor the Demon.', knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: 'alhadikhia-public-choice', roleId: 'alhadikhia', summary: 'Al-Hadikhia publicly chooses three players; secret life/death choices determine deaths after ST confirmation.', knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: 'alsaahir-public-win-guess', roleId: 'alsaahir', summary: 'Alsaahir can guess Minions and Demon publicly; win/loss remains storyteller-confirmed.', knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
]
