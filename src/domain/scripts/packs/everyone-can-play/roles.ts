import { confirmedRoleFactsForScript } from '../../role-facts'

export const everyoneCanPlayRoleIds = [
  'librarian',
  'clockmaker',
  'grandmother',
  'fortuneteller',
  'empath',
  'monk',
  'undertaker',
  'gambler',
  'artist',
  'slayer',
  'fool',
  'ravenkeeper',
  'mayor',
  'drunk',
  'recluse',
  'saint',
  'moonchild',
  'baron',
  'poisoner',
  'assassin',
  'devilsadvocate',
  'spy',
  'scarletwoman',
  'imp',
] as const

export const everyoneCanPlayRoles = confirmedRoleFactsForScript(everyoneCanPlayRoleIds)
