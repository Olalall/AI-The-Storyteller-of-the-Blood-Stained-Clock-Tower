import { confirmedRoleFactsForScript } from '../../role-facts'
import type { RoleId } from '../../types'

export const uncertainDeathRoleIds = [
  'clockmaker',
  'grandmother',
  'librarian',
  'empath',
  'fortuneteller',
  'exorcist',
  'flowergirl',
  'oracle',
  'undertaker',
  'artist',
  'slayer',
  'seamstress',
  'monk',
  'lunatic',
  'mutant',
  'sweetheart',
  'recluse',
  'godfather',
  'assassin',
  'scarletwoman',
  'marionette',
  'nodashii',
  'pukka',
] as const satisfies readonly RoleId[]

export const uncertainDeathRoles = confirmedRoleFactsForScript(uncertainDeathRoleIds)
