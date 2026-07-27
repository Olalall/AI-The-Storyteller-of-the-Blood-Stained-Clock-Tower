import type { NightOrderEntry } from '../../types'

function nightOrder(roleId: NightOrderEntry['roleId'], order: number, note?: string): NightOrderEntry {
  return { roleId, order, note, knowledgeStatus: 'confirmed' }
}

export const uncertainDeathFirstNightOrder: readonly NightOrderEntry[] = [
  nightOrder('lunatic', 22, '官方夜序过滤；假信息和假队友由说书人决定。'),
  nightOrder('marionette', 27, '官方夜序过滤；身份隐蔽处理，不自动公开。'),
  nightOrder('godfather', 38, '官方夜序过滤；外来者数量和信息由说书人核对。'),
  nightOrder('pukka', 47, '官方夜序过滤；首夜选择只记录，不自动标中毒。'),
  nightOrder('librarian', 53),
  nightOrder('empath', 56),
  nightOrder('fortuneteller', 57, '红鲱鱼由说书人记录，不自动分配。'),
  nightOrder('grandmother', 59),
  nightOrder('clockmaker', 60),
  nightOrder('seamstress', 62),
]

export const uncertainDeathOtherNightOrder: readonly NightOrderEntry[] = [
  nightOrder('monk', 24),
  nightOrder('scarletwoman', 33, '恶魔传递只提醒，不自动换身份。'),
  nightOrder('lunatic', 35, '继续给假恶魔夜间信息；不自动生成假局面。'),
  nightOrder('exorcist', 36),
  nightOrder('pukka', 42, 'Pukka 的中毒/死亡链路只做提醒和草稿。'),
  nightOrder('nodashii', 46, '相邻中毒只提醒，不自动改玩家状态。'),
  nightOrder('assassin', 56),
  nightOrder('godfather', 57, '外来者死亡后的额外击杀必须由说书人确认。'),
  nightOrder('sweetheart', 61, '死亡后醉酒目标由说书人选择。'),
  nightOrder('grandmother', 73),
  nightOrder('empath', 76),
  nightOrder('fortuneteller', 77),
  nightOrder('undertaker', 78),
  nightOrder('flowergirl', 80),
  nightOrder('oracle', 82),
  nightOrder('seamstress', 83),
]
