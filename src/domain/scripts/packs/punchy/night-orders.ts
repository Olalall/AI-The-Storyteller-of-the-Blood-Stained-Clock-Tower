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

export const punchyFirstNightOrder = order([
  { roleId: 'kazali', sourceOrder: 8 },
  { roleId: 'philosopher', sourceOrder: 14 },
  { roleId: 'alchemist', sourceOrder: 15 },
  { roleId: 'cerenovus', sourceOrder: 43 },
  { roleId: 'harpy', sourceOrder: 45 },
  { roleId: 'pukka', sourceOrder: 47 },
  { roleId: 'pixie', sourceOrder: 48 },
  { roleId: 'huntsman', sourceOrder: 49 },
  { roleId: 'damsel', sourceOrder: 50 },
  { roleId: 'amnesiac', sourceOrder: 51 },
  { roleId: 'steward', sourceOrder: 63 },
  { roleId: 'balloonist', sourceOrder: 66 },
  { roleId: 'ogre', sourceOrder: 73 },
  { roleId: 'general', sourceOrder: 75 },
  { roleId: 'vizier', sourceOrder: 80, note: '公开身份提醒' },
])

export const punchyOtherNightOrder = order([
  { roleId: 'philosopher', sourceOrder: 11 },
  { roleId: 'monk', sourceOrder: 24 },
  { roleId: 'cerenovus', sourceOrder: 28 },
  { roleId: 'harpy', sourceOrder: 31 },
  { roleId: 'princess', sourceOrder: 38 },
  { roleId: 'pukka', sourceOrder: 42 },
  { roleId: 'vigormortis', sourceOrder: 49 },
  { roleId: 'ojo', sourceOrder: 50 },
  { roleId: 'kazali', sourceOrder: 55 },
  { roleId: 'huntsman', sourceOrder: 67 },
  { roleId: 'damsel', sourceOrder: 68 },
  { roleId: 'amnesiac', sourceOrder: 69 },
  { roleId: 'balloonist', sourceOrder: 85 },
  { roleId: 'general', sourceOrder: 94 },
])
