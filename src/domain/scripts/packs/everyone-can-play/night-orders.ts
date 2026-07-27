import type { NightOrderEntry, RoleId } from '../../types'

const nightSheetSourceUrl = 'https://release.botc.app/resources/data/nightsheet.json'

type SourceOrder = { roleId: RoleId; sourceOrder: number }

function order(entries: readonly SourceOrder[]): readonly NightOrderEntry[] {
  return entries.map((entry, index) => ({
    roleId: entry.roleId,
    order: index + 1,
    note: `官方 night sheet 原始顺位 ${entry.sourceOrder}。来源：${nightSheetSourceUrl}`,
    knowledgeStatus: 'confirmed',
  }))
}

export const everyoneCanPlayFirstNightOrder = order([
  { roleId: 'poisoner', sourceOrder: 33 },
  { roleId: 'devilsadvocate', sourceOrder: 40 },
  { roleId: 'librarian', sourceOrder: 53 },
  { roleId: 'empath', sourceOrder: 56 },
  { roleId: 'fortuneteller', sourceOrder: 57 },
  { roleId: 'grandmother', sourceOrder: 59 },
  { roleId: 'clockmaker', sourceOrder: 60 },
  { roleId: 'spy', sourceOrder: 72 },
])

export const everyoneCanPlayOtherNightOrder = order([
  { roleId: 'poisoner', sourceOrder: 17 },
  { roleId: 'gambler', sourceOrder: 21 },
  { roleId: 'monk', sourceOrder: 24 },
  { roleId: 'devilsadvocate', sourceOrder: 26 },
  { roleId: 'scarletwoman', sourceOrder: 33 },
  { roleId: 'imp', sourceOrder: 40 },
  { roleId: 'assassin', sourceOrder: 56 },
  { roleId: 'moonchild', sourceOrder: 72 },
  { roleId: 'grandmother', sourceOrder: 73 },
  { roleId: 'ravenkeeper', sourceOrder: 75 },
  { roleId: 'empath', sourceOrder: 76 },
  { roleId: 'fortuneteller', sourceOrder: 77 },
  { roleId: 'undertaker', sourceOrder: 78 },
  { roleId: 'spy', sourceOrder: 92 },
])
