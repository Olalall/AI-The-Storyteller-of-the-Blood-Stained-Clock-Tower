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

export const oneInOneOutFirstNightOrder = order([
  { roleId: 'kazali', sourceOrder: 8, note: '恶魔开局指定爪牙' },
  { roleId: 'poisoner', sourceOrder: 33 },
  { roleId: 'snakecharmer', sourceOrder: 37 },
  { roleId: 'harpy', sourceOrder: 45 },
  { roleId: 'mezepheles', sourceOrder: 46, note: '得知暗号' },
  { roleId: 'amnesiac', sourceOrder: 51, note: '自定义能力' },
  { roleId: 'fortuneteller', sourceOrder: 57, note: '红鲱鱼确认' },
  { roleId: 'seamstress', sourceOrder: 62 },
  { roleId: 'steward', sourceOrder: 63 },
  { roleId: 'knight', sourceOrder: 64 },
  { roleId: 'villageidiot', sourceOrder: 68 },
  { roleId: 'spy', sourceOrder: 72 },
  { roleId: 'ogre', sourceOrder: 73 },
  { roleId: 'highpriestess', sourceOrder: 74 },
])

export const oneInOneOutOtherNightOrder = order([
  { roleId: 'poisoner', sourceOrder: 17 },
  { roleId: 'snakecharmer', sourceOrder: 23 },
  { roleId: 'monk', sourceOrder: 24 },
  { roleId: 'harpy', sourceOrder: 31 },
  { roleId: 'mezepheles', sourceOrder: 32, note: '暗号触发检查' },
  { roleId: 'imp', sourceOrder: 40 },
  { roleId: 'fanggu', sourceOrder: 45 },
  { roleId: 'ojo', sourceOrder: 50 },
  { roleId: 'kazali', sourceOrder: 55 },
  { roleId: 'amnesiac', sourceOrder: 69, note: '能力猜测反馈' },
  { roleId: 'farmer', sourceOrder: 70 },
  { roleId: 'fortuneteller', sourceOrder: 77 },
  { roleId: 'oracle', sourceOrder: 82 },
  { roleId: 'seamstress', sourceOrder: 83 },
  { roleId: 'villageidiot', sourceOrder: 86 },
  { roleId: 'spy', sourceOrder: 92 },
  { roleId: 'highpriestess', sourceOrder: 93 },
])
