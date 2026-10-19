import type { NightOrderEntry } from '../../types'

const sourceUrl = 'https://release.botc.app/resources/data/nightsheet.json'

function order(entries: readonly (readonly [string, number, string?])[]): readonly NightOrderEntry[] {
  return entries.map(([roleId, sourceOrder, reminder], index) => ({
    roleId, order: index + 1, knowledgeStatus: 'confirmed',
    note: `${reminder ? `${reminder}；` : ''}2026-10-16 官方夜表原始顺位 ${sourceOrder}；${sourceUrl}` ,
  }))
}

export const tongXiaoDaDanFirstNightOrder = order([
  ["magician", 18],
  ["lunatic", 22],
  ["king", 25, '首夜只唤醒恶魔，展示国王标记并指向国王座位；国王此时不因本能力得知一个存活角色'],
  ["marionette", 27],
  ["widow", 34],
  ["fortuneteller", 57],
  ["butler", 58],
  ["dreamer", 61],
  ["seamstress", 62],
  ["steward", 63],
  ["knight", 64],
  ["mathematician", 77],
])

export const tongXiaoDaDanOtherNightOrder = order([
  ["monk", 24],
  ["scarletwoman", 33],
  ["lunatic", 35],
  ["legion", 39],
  ["imp", 40],
  ["nodashii", 46],
  ["vortox", 47],
  ["sweetheart", 61],
  ["sage", 63],
  ["fortuneteller", 77],
  ["dreamer", 79],
  ["seamstress", 83],
  ["king", 87, '存活且能力有效的国王，在死者人数大于或等于活者时得知一个存活角色；由说书人核对条件'],
  ["butler", 91],
  ["mathematician", 96],
])
