import type { NightOrderEntry, RoleId } from '../../types'

const nightSheetSourceUrl = 'https://release.botc.app/resources/data/nightsheet.json'

type SourceOrder = { roleId: RoleId; sourceOrder: number; note?: string }

function order(entries: readonly SourceOrder[]): readonly NightOrderEntry[] {
  return entries.map((entry, index) => ({
    roleId: entry.roleId,
    order: index + 1,
    note: `${entry.note ? `${entry.note}；` : ''}官方 night sheet 原始顺位 ${entry.sourceOrder}。来源：${nightSheetSourceUrl}`,
    knowledgeStatus: 'confirmed',
  }))
}

export const badMoonRisingFirstNightOrder = order([
  { roleId: "apprentice", sourceOrder: 5 },
  { roleId: "lunatic", sourceOrder: 22 },
  { roleId: "sailor", sourceOrder: 23 },
  { roleId: "courtier", sourceOrder: 24 },
  { roleId: "godfather", sourceOrder: 25 },
  { roleId: "devilsadvocate", sourceOrder: 26 },
  { roleId: "pukka", sourceOrder: 27 },
  { roleId: "grandmother", sourceOrder: 63 },
  { roleId: "chambermaid", sourceOrder: 64 },
])

export const badMoonRisingOtherNightOrder = order([
  { roleId: "sailor", sourceOrder: 10 },
  { roleId: "courtier", sourceOrder: 11 },
  { roleId: "innkeeper", sourceOrder: 16 },
  { roleId: "gambler", sourceOrder: 18 },
  { roleId: "devilsadvocate", sourceOrder: 19 },
  { roleId: "lunatic", sourceOrder: 36 },
  { roleId: "exorcist", sourceOrder: 37 },
  { roleId: "zombuul", sourceOrder: 38 },
  { roleId: "pukka", sourceOrder: 39 },
  { roleId: "shabaloth", sourceOrder: 41 },
  { roleId: "po", sourceOrder: 42 },
  { roleId: "assassin", sourceOrder: 43 },
  { roleId: "godfather", sourceOrder: 44 },
  { roleId: "gossip", sourceOrder: 59 },
  { roleId: "professor", sourceOrder: 60 },
  { roleId: "tinker", sourceOrder: 68 },
  { roleId: "moonchild", sourceOrder: 69 },
  { roleId: "grandmother", sourceOrder: 79 },
  { roleId: "chambermaid", sourceOrder: 80 },
])
