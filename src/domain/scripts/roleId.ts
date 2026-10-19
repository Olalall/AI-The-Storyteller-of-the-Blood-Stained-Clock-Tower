import type { RoleId } from './types'

const roleIdAliases: Readonly<Record<RoleId, RoleId>> = {
  snake_charmer: 'snakecharmer',
  pit_hag: 'pithag',
  poppy_grower: 'poppygrower',
  fang_gu: 'fanggu',
  scarlet_woman: 'scarletwoman',
  tea_lady: 'tealady',
  fortune_teller: 'fortuneteller',
  undertaker: 'undertaker',
  devils_advocate: 'devilsadvocate',
  devil_s_advocate: 'devilsadvocate',
  bounty_hunter: 'bountyhunter',
  town_crier: 'towncrier',
  evil_twin: 'eviltwin',
  'pit-hag': 'pithag',
  lil_monsta: 'lilmonsta',
  bone_collector: 'bonecollector',
  no_dashii: 'nodashii',
  al_hadikhia: 'alhadikhia',
  'al-hadikhia': 'alhadikhia',
  cult_leader: 'cultleader',
  organ_grinder: 'organgrinder',
  spirit_of_ivory: 'spiritofivory',
  high_priestess: 'highpriestess',
}

export function normalizeRoleId(roleId: RoleId): RoleId {
  return roleIdAliases[roleId] ?? roleId
}
