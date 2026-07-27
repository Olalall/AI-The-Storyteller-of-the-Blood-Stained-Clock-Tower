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

export const lunarEclipseFirstNightOrder = order([
  { roleId: 'apprentice', sourceOrder: 9 },
  { roleId: 'barista', sourceOrder: 10 },
  { roleId: 'magician', sourceOrder: 18, note: '影响恶魔/爪牙开局信息' },
  { roleId: 'lunatic', sourceOrder: 22, note: '疯子以为自己是恶魔' },
  { roleId: 'sailor', sourceOrder: 26 },
  { roleId: 'marionette', sourceOrder: 27, note: '恶魔得知提线木偶' },
  { roleId: 'godfather', sourceOrder: 38, note: '得知在场外来者' },
  { roleId: 'devilsadvocate', sourceOrder: 40 },
  { roleId: 'pixie', sourceOrder: 48, note: '得知一个在场镇民角色' },
  { roleId: 'grandmother', sourceOrder: 59 },
  { roleId: 'spy', sourceOrder: 72 },
  { roleId: 'chambermaid', sourceOrder: 76 },
  { roleId: 'mathematician', sourceOrder: 77 },
])

export const lunarEclipseOtherNightOrder = order([
  { roleId: 'barista', sourceOrder: 6 },
  { roleId: 'harlot', sourceOrder: 9 },
  { roleId: 'sailor', sourceOrder: 13 },
  { roleId: 'innkeeper', sourceOrder: 19 },
  { roleId: 'devilsadvocate', sourceOrder: 26 },
  { roleId: 'lunatic', sourceOrder: 35, note: '疯子选择只做信息来源' },
  { roleId: 'lycanthrope', sourceOrder: 37, note: '善良目标死亡且恶魔停刀' },
  { roleId: 'zombuul', sourceOrder: 41 },
  { roleId: 'nodashii', sourceOrder: 46 },
  { roleId: 'vigormortis', sourceOrder: 49 },
  { roleId: 'assassin', sourceOrder: 56 },
  { roleId: 'godfather', sourceOrder: 57 },
  { roleId: 'barber', sourceOrder: 60, note: '死亡后恶魔可交换角色' },
  { roleId: 'grandmother', sourceOrder: 73 },
  { roleId: 'spy', sourceOrder: 92 },
  { roleId: 'chambermaid', sourceOrder: 95 },
  { roleId: 'mathematician', sourceOrder: 96 },
])
