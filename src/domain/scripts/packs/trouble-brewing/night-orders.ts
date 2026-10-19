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

export const troubleBrewingFirstNightOrder = order([
  { roleId: "bureaucrat", sourceOrder: 11, note: "旅行者" },
  { roleId: "thief", sourceOrder: 12, note: "旅行者" },
  { roleId: "poisoner", sourceOrder: 33 },
  { roleId: "washerwoman", sourceOrder: 52 },
  { roleId: "librarian", sourceOrder: 53 },
  { roleId: "investigator", sourceOrder: 54 },
  { roleId: "chef", sourceOrder: 55 },
  { roleId: "empath", sourceOrder: 56 },
  { roleId: "fortuneteller", sourceOrder: 57 },
  { roleId: "butler", sourceOrder: 58, note: "让管家选择一名玩家。标记那名玩家为他的主人。提醒：流放表决不受主人限制，管家可自由参与表决。" },
  { roleId: "spy", sourceOrder: 72 },
])

export const troubleBrewingOtherNightOrder = order([
  { roleId: "bureaucrat", sourceOrder: 7, note: "旅行者" },
  { roleId: "thief", sourceOrder: 8, note: "旅行者" },
  { roleId: "poisoner", sourceOrder: 17 },
  { roleId: "monk", sourceOrder: 24 },
  { roleId: "scarletwoman", sourceOrder: 33 },
  { roleId: "imp", sourceOrder: 40 },
  { roleId: "ravenkeeper", sourceOrder: 75 },
  { roleId: "empath", sourceOrder: 76 },
  { roleId: "fortuneteller", sourceOrder: 77 },
  { roleId: "undertaker", sourceOrder: 78 },
  { roleId: "butler", sourceOrder: 91, note: "让管家选择一名玩家。标记那名玩家为他的主人。提醒：流放表决不受主人限制，管家可自由参与表决。" },
  { roleId: "spy", sourceOrder: 92 },
])
