import type { SetupRule } from '../../types'

const sourceUrl = "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21489_56657.json"
const reviewedAt = '2026-07-22'

export const jingHouJiaYinSetupRules: readonly SetupRule[] = [
  { id: 'balloonist-extra-outsider', roleId: 'balloonist', summary: 'Balloonist may add 0-1 Outsider (storyteller decides); excluded from first normal templates.', knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: 'huntsman-adds-damsel', roleId: 'huntsman', summary: 'Huntsman adds the Damsel; excluded from first normal templates.', knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: 'legion-majority-setup', roleId: 'legion', summary: 'Legion requires a special majority-Legion setup and Djinn handling; excluded from normal templates.', knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: 'djinn-jinxes', roleId: 'djinn', summary: 'Djinn is a fabled rule source; announce jinxes publicly and do not seat as a player.', knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: 'pithag-demon-creation', roleId: 'pithag', summary: 'Pit-Hag can create a Demon; if this happens, night deaths are storyteller-decided.', knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: 'hatter-minion-demon-change', roleId: 'hatter', summary: 'Hatter death can let evil players choose new Minion/Demon characters.', knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: 'plaguedoctor-st-minion-ability', roleId: 'plaguedoctor', summary: 'Plague Doctor death gives the storyteller a Minion ability (usually out-of-play; an in-play Minion ability may be chosen).', knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: 'alsaahir-public-win-guess', roleId: 'alsaahir', summary: 'Alsaahir public guess can win for good; win/loss remains storyteller-confirmed.', knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: 'damsel-public-loss-guess', roleId: 'damsel', summary: 'A Minion public Damsel guess can make good lose; loss remains storyteller-confirmed.', knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
]
