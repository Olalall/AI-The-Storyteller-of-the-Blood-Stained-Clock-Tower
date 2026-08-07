import { confirmedRoleFactsForScript } from '../../role-facts'
import type { RoleId, SmartRoleDefinition } from '../../types'

const officialRolesSourceUrl = 'https://release.botc.app/resources/data/roles.json'
const scriptSourceUrl = 'https://www.botcscripts.com/script/2378/1.0.0/download'
const reviewedAt = '2026-07-21'

export const churchOfSpiesRoleIds = [
  'librarian',
  'steward',
  'pixie',
  'cultleader',
  'fortuneteller',
  'highpriestess',
  'exorcist',
  'monk',
  'undertaker',
  'juggler',
  'nightwatchman',
  'artist',
  'ravenkeeper',
  'klutz',
  'saint',
  'mutant',
  'drunk',
  'baron',
  'marionette',
  'scarletwoman',
  'spy',
  'nodashii',
  'po',
  'pukka',
] as const satisfies readonly RoleId[]

const reusableRoleIds = churchOfSpiesRoleIds.filter((roleId) => roleId !== 'cultleader')

const cultLeaderRole = {
  id: 'cultleader',
  name: '异教领袖',
  officialName: 'Cult Leader',
  team: 'townsfolk',
  abilityText:
    'Each night, you become the alignment of an alive neighbor. If all good players choose to join your cult, your team wins.',
  iconPath: '/assets/characters/cultleader.webp',
  inputKinds: ['none'],
  knowledgeStatus: 'confirmed',
  research: {
    edition: 'Carousel',
    setupImpact: [],
    possibleOutcomes: ['可能变成相邻存活玩家的阵营。', '若所有善良玩家选择加入邪教，可能触发善良胜利。'],
    stateChanges: [],
    identityChanges: [],
    teamChanges: ['夜晚可能改变阵营。'],
    playerMessageTemplates: ['你现在是善良阵营。', '你现在是邪恶阵营。'],
    highRiskNotes: ['阵营变化和邪教胜利必须由说书人确认；工具只记录和提醒，不自动改阵营或判胜。'],
    sourceUrls: [officialRolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
} as const satisfies SmartRoleDefinition

const reusableRoles = confirmedRoleFactsForScript(reusableRoleIds)
const roleById = new Map<RoleId, SmartRoleDefinition>([
  ...reusableRoles.map((role) => [role.id, role] as const),
  [cultLeaderRole.id, cultLeaderRole],
])

export const churchOfSpiesRoles = churchOfSpiesRoleIds.map((roleId) => {
  const role = roleById.get(roleId)
  if (!role) throw new Error(`Missing Church of Spies role fact: ${roleId}`)
  return role
})
