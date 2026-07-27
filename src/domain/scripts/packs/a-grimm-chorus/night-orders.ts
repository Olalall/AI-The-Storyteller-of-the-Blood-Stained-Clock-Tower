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

export const aGrimmChorusFirstNightOrder = order([
  { roleId: 'thief', sourceOrder: 12, note: '旅行者；常规模板不默认加入' },
  { roleId: 'yaggababble', sourceOrder: 17, note: '得知暗号' },
  { roleId: 'summoner', sourceOrder: 23, note: '无恶魔开局，获得 3 个恶魔伪装' },
  { roleId: 'godfather', sourceOrder: 38, note: '得知在场外来者' },
  { roleId: 'pukka', sourceOrder: 47 },
  { roleId: 'damsel', sourceOrder: 50, note: '爪牙得知落难少女在场' },
  { roleId: 'amnesiac', sourceOrder: 51 },
  { roleId: 'villageidiot', sourceOrder: 68 },
  { roleId: 'nightwatchman', sourceOrder: 70 },
  { roleId: 'general', sourceOrder: 75 },
])

export const aGrimmChorusOtherNightOrder = order([
  { roleId: 'thief', sourceOrder: 8, note: '旅行者；常规模板不默认加入' },
  { roleId: 'harlot', sourceOrder: 9, note: '旅行者；常规模板不默认加入' },
  { roleId: 'innkeeper', sourceOrder: 19 },
  { roleId: 'gambler', sourceOrder: 21 },
  { roleId: 'scarletwoman', sourceOrder: 33 },
  { roleId: 'summoner', sourceOrder: 34, note: '第 3 夜创建恶魔' },
  { roleId: 'exorcist', sourceOrder: 36 },
  { roleId: 'pukka', sourceOrder: 42 },
  { roleId: 'po', sourceOrder: 44 },
  { roleId: 'ojo', sourceOrder: 50 },
  { roleId: 'yaggababble', sourceOrder: 54, note: '根据说书人记录的暗号次数处理' },
  { roleId: 'assassin', sourceOrder: 56 },
  { roleId: 'godfather', sourceOrder: 57 },
  { roleId: 'damsel', sourceOrder: 68 },
  { roleId: 'amnesiac', sourceOrder: 69 },
  { roleId: 'towncrier', sourceOrder: 81 },
  { roleId: 'villageidiot', sourceOrder: 86 },
  { roleId: 'nightwatchman', sourceOrder: 89 },
  { roleId: 'general', sourceOrder: 94 },
])
