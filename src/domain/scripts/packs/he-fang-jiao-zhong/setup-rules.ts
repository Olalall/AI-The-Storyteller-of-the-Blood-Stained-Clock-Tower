import type { SetupRule } from '../../types'

const rolesSourceUrl = 'https://release.botc.app/resources/data/roles.json'
const scriptSourceUrl = 'https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21087_69602.json'
const reviewedAt = '2026-07-21'

function rule(id: string, roleId: string | undefined, summary: string): SetupRule {
  return { id, roleId, summary, knowledgeStatus: 'confirmed', sourceUrls: [rolesSourceUrl, scriptSourceUrl], reviewedAt }
}

export const heFangJiaoZhongSetupRules: readonly SetupRule[] = [
  rule('balloonist-outsider', 'balloonist', 'Balloonist Outsider adjustment is +0 or +1 at storyteller discretion; this source\'s templates default to -1 Townsfolk / +1 Outsider.'),
  rule('fanggu-outsider', 'fanggu', 'Fang Gu adds one Outsider; templates apply -1 Townsfolk / +1 Outsider.'),
  rule('huntsman-damsel', 'huntsman', 'Huntsman adds the Damsel; if used in templates, keep Damsel and setup adjustment together.'),
  rule('choirboy-king', 'choirboy', 'Choirboy requires the King; templates that use Choirboy must include King.'),
  rule('lilmonsta-minion', 'lilmonsta', 'Lil Monsta adds one Minion; first imported template set keeps it out to avoid babysitter overload.'),
  rule('vortox-no-execution', 'vortox', 'Vortox can make evil win if no one is executed during the day; exiling a Traveller does not count as an execution; the tool only reminds.'),
  rule('fearmonger-public-choice', 'fearmonger', 'Fearmonger target changes need public announcement; nomination, execution and losing team stay storyteller-confirmed.'),
  rule('cerenovus-madness', 'cerenovus', 'Cerenovus prompts must clearly say the player is mad as a chosen good character.'),
  rule('stormcatcher-fabled', 'stormcatcher', 'Storm Catcher is fabled and never enters seat identity or bluff pools.'),
]
