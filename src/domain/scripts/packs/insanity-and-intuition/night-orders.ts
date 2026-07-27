import type { NightOrderEntry } from '../../types'

function nightEntry(roleId: string, index: number): NightOrderEntry {
  return { roleId, order: index + 1, knowledgeStatus: 'confirmed' }
}

export const insanityAndIntuitionFirstNightOrder = [
  'poppygrower',
  'lunatic',
  'preacher',
  'poisoner',
  'cerenovus',
  'harpy',
  'pixie',
  'amnesiac',
  'fortuneteller',
  'knight',
  'shugenja',
  'highpriestess',
  'general',
].map(nightEntry)

export const insanityAndIntuitionOtherNightOrder = [
  'poppygrower',
  'preacher',
  'poisoner',
  'cerenovus',
  'harpy',
  'lunatic',
  'imp',
  'fanggu',
  'nodashii',
  'vigormortis',
  'plaguedoctor',
  'amnesiac',
  'ravenkeeper',
  'fortuneteller',
  'towncrier',
  'oracle',
  'highpriestess',
  'general',
].map(nightEntry)
