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

export const devoutTheistsFirstNightOrder = order([
  { roleId: 'kazali', sourceOrder: 8, note: '开局指定爪牙和外来者修正' },
  { roleId: 'magician', sourceOrder: 18, note: '影响恶魔/爪牙互认信息' },
  { roleId: 'snitch', sourceOrder: 21, note: '每个爪牙各得 3 个伪装' },
  { roleId: 'marionette', sourceOrder: 27, note: '相邻恶魔核对' },
  { roleId: 'lleech', sourceOrder: 31, note: '选择宿主中毒' },
  { roleId: 'widow', sourceOrder: 34, note: '查看魔典并选择中毒目标' },
  { roleId: 'pixie', sourceOrder: 48 },
  { roleId: 'amnesiac', sourceOrder: 51 },
  { roleId: 'chef', sourceOrder: 55 },
  { roleId: 'noble', sourceOrder: 65 },
  { roleId: 'highpriestess', sourceOrder: 74 },
  { roleId: 'mathematician', sourceOrder: 77 },
])

export const devoutTheistsOtherNightOrder = order([
  { roleId: 'legion', sourceOrder: 39, note: '可能死亡提醒，不自动判胜' },
  { roleId: 'fanggu', sourceOrder: 45, note: '外来者转化链路提醒' },
  { roleId: 'lleech', sourceOrder: 52, note: '宿主保护与死亡判定提醒' },
  { roleId: 'kazali', sourceOrder: 55 },
  { roleId: 'amnesiac', sourceOrder: 69 },
  { roleId: 'farmer', sourceOrder: 70, note: '夜晚死亡后可能产生新农夫' },
  { roleId: 'flowergirl', sourceOrder: 80 },
  { roleId: 'juggler', sourceOrder: 84 },
  { roleId: 'highpriestess', sourceOrder: 93 },
  { roleId: 'mathematician', sourceOrder: 96 },
])
