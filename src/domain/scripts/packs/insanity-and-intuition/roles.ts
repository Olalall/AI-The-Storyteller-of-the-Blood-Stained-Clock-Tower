import { confirmedRoleFactsForScript } from '../../role-facts'
import type { RoleId, SmartRoleDefinition } from '../../types'

const officialRolesSourceUrl = 'https://release.botc.app/resources/data/roles.json'
const scriptSourceUrl = 'https://www.botcscripts.com/script/2128/1.2.0/download'
const reviewedAt = '2026-07-21'

export const insanityAndIntuitionRoleIds = [
  'knight',
  'pixie',
  'shugenja',
  'highpriestess',
  'general',
  'preacher',
  'fortuneteller',
  'towncrier',
  'oracle',
  'amnesiac',
  'ravenkeeper',
  'poppygrower',
  'mayor',
  'puzzlemaster',
  'plaguedoctor',
  'mutant',
  'lunatic',
  'poisoner',
  'harpy',
  'cerenovus',
  'boomdandy',
  'nodashii',
  'imp',
  'vigormortis',
  'fanggu',
] as const satisfies readonly RoleId[]

const localRoleFacts = [
  {
    id: 'poppygrower',
    name: '罂粟种植者',
    officialName: 'Poppy Grower',
    team: 'townsfolk',
    abilityText: 'Minions & Demons do not know each other. If you die, they learn who each other are that night.',
    iconPath: '/assets/characters/poppygrower.webp',
    inputKinds: ['none'],
    knowledgeStatus: 'confirmed',
    research: {
      edition: 'Carousel',
      setupImpact: ['邪恶方开局互认信息被隐藏。'],
      possibleOutcomes: ['罂粟种植者死亡当晚，恶魔与爪牙得知彼此。'],
      stateChanges: [],
      identityChanges: [],
      teamChanges: [],
      playerMessageTemplates: ['今晚你们得知邪恶方同伴信息。'],
      highRiskNotes: ['只影响信息流；不能自动向邪恶方发送互认信息，必须由说书人确认。'],
      sourceUrls: [officialRolesSourceUrl, scriptSourceUrl],
      reviewedAt,
    },
  },
  {
    id: 'plaguedoctor',
    name: '瘟疫医生',
    officialName: 'Plague Doctor',
    team: 'outsider',
    abilityText: 'When you die, the Storyteller gains a Minion ability.',
    iconPath: '/assets/characters/plaguedoctor.webp',
    inputKinds: ['role'],
    knowledgeStatus: 'confirmed',
    research: {
      edition: 'Carousel',
      setupImpact: [],
      possibleOutcomes: ['瘟疫医生死亡后，说书人获得一个爪牙能力。'],
      stateChanges: [],
      identityChanges: [],
      teamChanges: [],
      playerMessageTemplates: [],
      highRiskNotes: ['说书人获得哪个爪牙能力、何时使用都由说书人确认；工具只记录提示。'],
      sourceUrls: [officialRolesSourceUrl, scriptSourceUrl],
      reviewedAt,
    },
  },
  {
    id: 'boomdandy',
    name: '爆炸花花公子',
    officialName: 'Boomdandy',
    team: 'minion',
    abilityText:
      'If you are executed, all but 3 players die. After a 10 to 1 countdown, the player with the most players pointing at them, dies.',
    inputKinds: ['none'],
    knowledgeStatus: 'confirmed',
    research: {
      edition: 'Carousel',
      setupImpact: [],
      possibleOutcomes: ['被处决时，只留下 3 名玩家存活。', '倒计时后，被最多人指向的玩家死亡。'],
      stateChanges: ['可能造成大量玩家死亡。', '倒计时后可能再造成 1 名玩家死亡。'],
      identityChanges: [],
      teamChanges: [],
      playerMessageTemplates: [],
      highRiskNotes: ['大规模死亡和倒计时指认必须由说书人逐项确认；不能自动清空玩家状态。'],
      sourceUrls: [officialRolesSourceUrl, scriptSourceUrl],
      reviewedAt,
    },
  },
] as const satisfies readonly SmartRoleDefinition[]

const localRoleIds = new Set<RoleId>(localRoleFacts.map((role) => role.id))
const reusableRoleIds = insanityAndIntuitionRoleIds.filter((roleId) => !localRoleIds.has(roleId))
const reusableRoles = confirmedRoleFactsForScript(reusableRoleIds)
const roleById = new Map<RoleId, SmartRoleDefinition>([
  ...reusableRoles.map((role) => [role.id, role] as const),
  ...localRoleFacts.map((role) => [role.id, role] as const),
])

export const insanityAndIntuitionRoles = insanityAndIntuitionRoleIds.map((roleId) => {
  const role = roleById.get(roleId)
  if (!role) throw new Error(`Missing Insanity and Intuition role fact: ${roleId}`)
  return role
})
