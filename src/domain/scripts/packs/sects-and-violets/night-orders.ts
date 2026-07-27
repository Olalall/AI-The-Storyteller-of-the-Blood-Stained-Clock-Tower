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

export const sectsAndVioletsFirstNightOrder = order([
  { roleId: "barista", sourceOrder: 1, note: "旅行者" },
  { roleId: "philosopher", sourceOrder: 28 },
  { roleId: "snakecharmer", sourceOrder: 29 },
  { roleId: "eviltwin", sourceOrder: 30 },
  { roleId: "witch", sourceOrder: 31 },
  { roleId: "cerenovus", sourceOrder: 32 },
  { roleId: "clockmaker", sourceOrder: 59 },
  { roleId: "dreamer", sourceOrder: 60 },
  { roleId: "seamstress", sourceOrder: 61 },
  { roleId: "mathematician", sourceOrder: 62 },
])

export const sectsAndVioletsOtherNightOrder = order([
  { roleId: "barista", sourceOrder: 1, note: "旅行者" },
  { roleId: "harlot", sourceOrder: 5, note: "旅行者" },
  { roleId: "bonecollector", sourceOrder: 6, note: "旅行者" },
  { roleId: "philosopher", sourceOrder: 12 },
  { roleId: "snakecharmer", sourceOrder: 13 },
  { roleId: "witch", sourceOrder: 14 },
  { roleId: "cerenovus", sourceOrder: 15 },
  { roleId: "pithag", sourceOrder: 20 },
  { roleId: "fanggu", sourceOrder: 45 },
  { roleId: "nodashii", sourceOrder: 46 },
  { roleId: "vortox", sourceOrder: 47 },
  { roleId: "vigormortis", sourceOrder: 48 },
  { roleId: "barber", sourceOrder: 66 },
  { roleId: "sweetheart", sourceOrder: 67 },
  { roleId: "sage", sourceOrder: 81 },
  { roleId: "dreamer", sourceOrder: 82 },
  { roleId: "flowergirl", sourceOrder: 83 },
  { roleId: "towncrier", sourceOrder: 84 },
  { roleId: "oracle", sourceOrder: 85 },
  { roleId: "seamstress", sourceOrder: 86 },
  { roleId: "juggler", sourceOrder: 87 },
  { roleId: "mathematician", sourceOrder: 88 },
])
