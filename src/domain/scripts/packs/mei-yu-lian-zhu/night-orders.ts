import type { NightOrderEntry } from '../../types'

const sourceUrl = 'https://release.botc.app/resources/data/nightsheet.json'

function order(entries: readonly (readonly [string, number])[]): readonly NightOrderEntry[] {
  return entries.map(([roleId, sourceOrder], index) => ({
    roleId, order: index + 1, knowledgeStatus: 'confirmed',
    note: `2026-10-16 官方夜表原始顺位 ${sourceOrder}；${sourceUrl}` ,
  }))
}

export const meiYuLianZhuFirstNightOrder = order([
  ["marionette", 27],
  ["cerenovus", 43],
  ["mezepheles", 46],
  ["pixie", 48],
  ["librarian", 53],
  ["chef", 55],
  ["empath", 56],
  ["dreamer", 61],
  ["noble", 65],
  ["spy", 72],
  ["highpriestess", 74],
])

export const meiYuLianZhuOtherNightOrder = order([
  ["monk", 24],
  ["cerenovus", 28],
  ["mezepheles", 32],
  ["legion", 39],
  ["nodashii", 46],
  ["vortox", 47],
  ["vigormortis", 49],
  ["empath", 76],
  ["dreamer", 79],
  ["oracle", 82],
  ["juggler", 84],
  ["spy", 92],
  ["highpriestess", 93],
])
