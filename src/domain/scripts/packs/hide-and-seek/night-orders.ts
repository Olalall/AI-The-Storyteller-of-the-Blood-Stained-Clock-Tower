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

export const hideAndSeekFirstNightOrder = order([
  { roleId: 'preacher', sourceOrder: 29 },
  { roleId: 'poisoner', sourceOrder: 33 },
  { roleId: 'godfather', sourceOrder: 38, note: '得知在场外来者' },
  { roleId: 'cerenovus', sourceOrder: 43 },
  { roleId: 'mezepheles', sourceOrder: 46, note: '得知暗号' },
  { roleId: 'pukka', sourceOrder: 47 },
  { roleId: 'pixie', sourceOrder: 48, note: '得知一个在场镇民角色' },
  { roleId: 'huntsman', sourceOrder: 49 },
  { roleId: 'damsel', sourceOrder: 50, note: '爪牙得知落难少女在场' },
  { roleId: 'librarian', sourceOrder: 53 },
  { roleId: 'dreamer', sourceOrder: 61 },
  { roleId: 'seamstress', sourceOrder: 62 },
  { roleId: 'noble', sourceOrder: 65 },
])

export const hideAndSeekOtherNightOrder = order([
  { roleId: 'preacher', sourceOrder: 15 },
  { roleId: 'poisoner', sourceOrder: 17 },
  { roleId: 'cerenovus', sourceOrder: 28 },
  { roleId: 'mezepheles', sourceOrder: 32, note: '检查暗号触发' },
  { roleId: 'imp', sourceOrder: 40 },
  { roleId: 'pukka', sourceOrder: 42 },
  { roleId: 'vigormortis', sourceOrder: 49 },
  { roleId: 'ojo', sourceOrder: 50 },
  { roleId: 'godfather', sourceOrder: 57 },
  { roleId: 'huntsman', sourceOrder: 67 },
  { roleId: 'damsel', sourceOrder: 68 },
  { roleId: 'ravenkeeper', sourceOrder: 75 },
  { roleId: 'undertaker', sourceOrder: 78 },
  { roleId: 'dreamer', sourceOrder: 79 },
  { roleId: 'towncrier', sourceOrder: 81 },
  { roleId: 'oracle', sourceOrder: 82 },
  { roleId: 'seamstress', sourceOrder: 83 },
])
