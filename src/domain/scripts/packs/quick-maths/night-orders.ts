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

export const quickMathsFirstNightOrder = order([
  { roleId: 'boffin', sourceOrder: 13 },
  { roleId: 'philosopher', sourceOrder: 14 },
  { roleId: 'snitch', sourceOrder: 21 },
  { roleId: 'marionette', sourceOrder: 27, note: '相邻恶魔核对' },
  { roleId: 'xaan', sourceOrder: 32 },
  { roleId: 'pixie', sourceOrder: 48 },
  { roleId: 'dreamer', sourceOrder: 61 },
  { roleId: 'seamstress', sourceOrder: 62 },
  { roleId: 'noble', sourceOrder: 65 },
  { roleId: 'shugenja', sourceOrder: 67 },
  { roleId: 'nightwatchman', sourceOrder: 70 },
  { roleId: 'spy', sourceOrder: 72 },
  { roleId: 'ogre', sourceOrder: 73 },
  { roleId: 'highpriestess', sourceOrder: 74 },
  { roleId: 'general', sourceOrder: 75 },
])

export const quickMathsOtherNightOrder = order([
  { roleId: 'philosopher', sourceOrder: 11 },
  { roleId: 'xaan', sourceOrder: 16 },
  { roleId: 'dreamer', sourceOrder: 79 },
  { roleId: 'seamstress', sourceOrder: 83 },
  { roleId: 'juggler', sourceOrder: 84 },
  { roleId: 'nightwatchman', sourceOrder: 89 },
  { roleId: 'spy', sourceOrder: 92 },
  { roleId: 'highpriestess', sourceOrder: 93 },
  { roleId: 'general', sourceOrder: 94 },
  { roleId: 'riot', sourceOrder: 97, note: '第 3 天暴乱链路提醒' },
])
