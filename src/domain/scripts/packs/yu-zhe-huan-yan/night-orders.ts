import type { NightOrderEntry } from '../../types'

export const yuZheHuanYanFirstNight: readonly NightOrderEntry[] = [
  { roleId: "poppygrower", order: 4, note: "不要让恶魔和爪牙相认。", knowledgeStatus: 'confirmed' },
  { roleId: "snakecharmer", order: 20, note: "让舞蛇人选择一名玩家。如果舞蛇人选中了恶魔：展示“你是”信息标记和恶魔角色标记。用拇指向下代表他阵营变为邪恶。在魔典中交换舞蛇人和恶魔的角色标记。让原来的舞蛇人重新入睡。唤醒原来的恶魔。对老恶魔展示“你是”信息标记和舞蛇人角色标记，并用拇指向上代表他阵营变为善良。", knowledgeStatus: 'confirmed' },
  { roleId: "fearmonger", order: 26, note: "恐惧之灵指向一名玩家，放置恐惧标记。宣布恐惧之灵选中或改变了目标。", knowledgeStatus: 'confirmed' },
  { roleId: "pixie", order: 29, note: "对小精灵展示一个在场的镇民角色。", knowledgeStatus: 'confirmed' },
  { roleId: "empath", order: 36, note: "给他展示数字手势来告诉他与他邻近的存活玩家有几人是邪恶的。", knowledgeStatus: 'confirmed' },
  { roleId: "fortuneteller", order: 37, note: "让占卜师选择两名玩家。如果其中有恶魔或“干扰项”，点头示意，否则摇头。", knowledgeStatus: 'confirmed' },
  { roleId: "organgrinder", order: 39, note: "唤醒街头风琴手，让他选择自己是否醉酒直到下个黄昏；只记录选择，不自动改变醉酒状态。", knowledgeStatus: 'confirmed' },
  { roleId: "clockmaker", order: 40, note: "给他展示数字手势来告诉他恶魔与爪牙之间最近的距离。", knowledgeStatus: 'confirmed' },
  { roleId: "noble", order: 43, note: "以任意顺序指向三名玩家，其中一名邪恶。", knowledgeStatus: 'confirmed' },
  { roleId: "balloonist", order: 44, note: "选择一种角色类型，并告知其一个符合该类型的玩家。在该玩家旁边标记已被知晓。", knowledgeStatus: 'confirmed' },
  { roleId: "bountyhunter", order: 45, note: "指向一名邪恶玩家。随后唤醒那名因赏金猎人而转变为邪恶的镇民，并告知他变成了邪恶阵营。", knowledgeStatus: 'confirmed' },
]

export const yuZheHuanYanOtherNight: readonly NightOrderEntry[] = [
  { roleId: "poppygrower", order: 3, note: "如果罂粟种植者死亡，安排恶魔和爪牙相认环节。", knowledgeStatus: 'confirmed' },
  { roleId: "snakecharmer", order: 12, note: "让舞蛇人选择一名玩家。如果舞蛇人选中了恶魔：展示“你是”信息标记和恶魔角色标记。用拇指向下代表他阵营变为邪恶。在魔典中交换舞蛇人和恶魔的角色标记。让原来的舞蛇人重新入睡。唤醒原来的恶魔。对老恶魔展示“你是”信息标记和舞蛇人角色标记，并用拇指向上代表他阵营变为善良。", knowledgeStatus: 'confirmed' },
  { roleId: "fearmonger", order: 18, note: "恐惧之灵指向一名玩家。如果与之前选择的不同，则更换恐惧标记并宣布恐惧之灵选中或改变了目标。", knowledgeStatus: 'confirmed' },
  { roleId: "imp", order: 24, note: "让小恶魔选择一名玩家。标记那名玩家死亡。如果小恶魔选择了自己：用一个备用的小恶魔标记替换一个存活的爪牙角色标记。让原来的小恶魔重新入睡。唤醒新的小恶魔。对他展示“你是”信息标记，和小恶魔角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "organgrinder", order: 25, note: "唤醒街头风琴手，让他选择自己是否醉酒直到下个黄昏；只记录选择，不自动改变醉酒状态。", knowledgeStatus: 'confirmed' },
  { roleId: "vortex", order: 31, note: "让涡流选择一名玩家。标记那名玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "vigormortis", order: 32, note: "让亡骨魔选择一名玩家。标记那名玩家死亡。如果该玩家是爪牙，标记该玩家保留能力，并标记与该玩家邻近的镇民玩家之一中毒。", knowledgeStatus: 'confirmed' },
  { roleId: "barber", order: 40, note: "如果理发师今天死亡了，唤醒恶魔并展示“该角色的效果对你生效”信息标记和理发师角色标记。如果恶魔选择了两名玩家，将这两名玩家分别独自唤醒。对他们展示“你是”信息标记和他们的新角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "empath", order: 53, note: "给他展示数字手势来告诉他与他邻近的存活玩家有几人是邪恶的。", knowledgeStatus: 'confirmed' },
  { roleId: "fortuneteller", order: 54, note: "让占卜师选择两名玩家。如果其中有恶魔或“干扰项”，点头示意，否则摇头。", knowledgeStatus: 'confirmed' },
  { roleId: "undertaker", order: 56, note: "如果有玩家今天白天死于处决，唤醒送葬者并对他展示那名玩家的角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "towncrier", order: 59, note: "对他点头或摇头示意今天白天是否有爪牙发起过提名。", knowledgeStatus: 'confirmed' },
  { roleId: "balloonist", order: 63, note: "选择一名角色类型与上一夜所示玩家不同的玩家，指给气球驾驶员；记录本夜所示玩家，供下一夜核对。", knowledgeStatus: 'confirmed' },
  { roleId: "bountyhunter", order: 65, note: "如果赏金猎人知晓的邪恶玩家死亡，指向另一名邪恶玩家。", knowledgeStatus: 'confirmed' },
]
