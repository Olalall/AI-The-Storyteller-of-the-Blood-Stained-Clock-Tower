import type { NightOrderEntry } from '../../types'

const sourceUrl = 'https://release.botc.app/resources/data/nightsheet.json'

function order(entries: readonly (readonly [string, number])[]): readonly NightOrderEntry[] {
  return entries.map(([roleId, sourceOrder], index) => ({
    roleId, order: index + 1, knowledgeStatus: 'confirmed',
    note: `2026-10-16 官方夜表原始顺位 ${sourceOrder}；${sourceUrl}` ,
  }))
}

export const muHouCaoKongFirstNightOrder = order([
  ["marionette", 27],
  ["poisoner", 33],
  ["washerwoman", 52],
  ["librarian", 53],
  ["investigator", 54],
  ["chef", 55],
  ["empath", 56],
  ["fortuneteller", 57],
  ["butler", 58],
  ["spy", 72],
])

export const muHouCaoKongOtherNightOrder = order([
  ["poisoner", 17],
  ["monk", 24],
  ["scarletwoman", 33],
  ["imp", 40],
  ["ravenkeeper", 75],
  ["empath", 76],
  ["fortuneteller", 77],
  ["undertaker", 78],
  ["butler", 91],
  ["spy", 92],
])
