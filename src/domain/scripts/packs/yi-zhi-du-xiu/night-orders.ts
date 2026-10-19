import type { NightOrderEntry } from '../../types'

const sourceUrl = 'https://release.botc.app/resources/data/nightsheet.json'

function order(entries: readonly (readonly [string, number])[]): readonly NightOrderEntry[] {
  return entries.map(([roleId, sourceOrder], index) => ({
    roleId, order: index + 1, knowledgeStatus: 'confirmed',
    note: `2026-10-16 官方夜表原始顺位 ${sourceOrder}；${sourceUrl}` ,
  }))
}

export const yiZhiDuXiuFirstNightOrder = order([
  ["lordoftyphon", 7],
  ["marionette", 27],
  ["poisoner", 33],
  ["harpy", 45],
  ["pixie", 48],
  ["amnesiac", 51],
  ["chef", 55],
  ["butler", 58],
  ["balloonist", 66],
  ["shugenja", 67],
  ["spy", 72],
  ["general", 75],
  ["mathematician", 77],
])

export const yiZhiDuXiuOtherNightOrder = order([
  ["poisoner", 17],
  ["innkeeper", 19],
  ["harpy", 31],
  ["scarletwoman", 33],
  ["legion", 39],
  ["lordoftyphon", 48],
  ["vigormortis", 49],
  ["amnesiac", 69],
  ["ravenkeeper", 75],
  ["flowergirl", 80],
  ["balloonist", 85],
  ["butler", 91],
  ["spy", 92],
  ["general", 94],
  ["mathematician", 96],
])
