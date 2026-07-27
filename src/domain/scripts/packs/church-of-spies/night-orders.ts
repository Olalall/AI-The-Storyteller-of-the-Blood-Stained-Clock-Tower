import type { NightOrderEntry } from '../../types'

function nightOrder(roleId: NightOrderEntry['roleId'], order: number, note?: string): NightOrderEntry {
  return { roleId, order, note, knowledgeStatus: 'confirmed' }
}

export const churchOfSpiesFirstNightOrder: readonly NightOrderEntry[] = [
  nightOrder('marionette', 27, '官方夜序过滤；身份隐蔽处理，不自动公开。'),
  nightOrder('pukka', 47, '官方夜序过滤；首夜选择只记录，不自动标中毒。'),
  nightOrder('pixie', 48, '官方夜序过滤；疯狂目标和后续获得能力只做提醒。'),
  nightOrder('librarian', 53),
  nightOrder('fortuneteller', 57, '红鲱鱼由说书人记录，不自动分配。'),
  nightOrder('steward', 63),
  nightOrder('nightwatchman', 70),
  nightOrder('cultleader', 71, '阵营变化必须由说书人确认，不自动改阵营。'),
  nightOrder('spy', 72, '查看魔典；登记异常只做提醒。'),
  nightOrder('highpriestess', 74, '说书人自由裁量信息，只生成交流建议草稿。'),
]

export const churchOfSpiesOtherNightOrder: readonly NightOrderEntry[] = [
  nightOrder('monk', 24),
  nightOrder('scarletwoman', 33, '恶魔传递只提醒，不自动换身份。'),
  nightOrder('exorcist', 36, '命中恶魔时只提醒，不自动跳过恶魔行动。'),
  nightOrder('pukka', 42, 'Pukka 的中毒/死亡链路只做提醒和草稿。'),
  nightOrder('po', 44, '蓄力和三杀都必须由说书人确认。'),
  nightOrder('nodashii', 46, '相邻中毒只提醒，不自动改玩家状态。'),
  nightOrder('ravenkeeper', 75),
  nightOrder('fortuneteller', 77),
  nightOrder('undertaker', 78),
  nightOrder('juggler', 84),
  nightOrder('nightwatchman', 89),
  nightOrder('cultleader', 90, '阵营变化和邪教胜利只做提醒，不自动判定。'),
  nightOrder('spy', 92),
  nightOrder('highpriestess', 93),
]
