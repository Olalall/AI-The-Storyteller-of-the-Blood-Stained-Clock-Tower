import type { NightOrderEntry } from '../../types'

export const wenWuShuangQuanFirstNightOrder: readonly NightOrderEntry[] = [
  { roleId: "philosopher", order: 1, note: "哲学家可以选择一个角色。如果选择的角色不在场，将哲学家的角色标题替换成对应角色，并标记“是哲学家”，否则标记该角色对应的玩家醉酒。从现在开始，你需要以哲学家获得能力的那种角色的行动方式来唤醒哲学家。", knowledgeStatus: 'confirmed' },
  { roleId: "lunatic", order: 2, note: "如果有七名或更多玩家，唤醒疯子：展示“他们是你的爪牙”信息标记。指向任意对应数量的玩家。展示“这些角色不在场”信息标记。展示三个善良角色。让疯子重新入睡。唤醒恶魔。展示“你是”信息标记和恶魔角色标记。展示“这名玩家是”信息标记和疯子角色标记，然后指向疯子玩家。", knowledgeStatus: 'confirmed' },
  { roleId: "sailor", order: 3, note: "让水手选择一名存活玩家。标记那名玩家或水手醉酒。", knowledgeStatus: 'confirmed' },
  { roleId: "lleech", order: 4, note: "寄生蛭指向一名玩家。放置寄生标记，那名玩家中毒。", knowledgeStatus: 'confirmed' },
  { roleId: "poisoner", order: 5, note: "让投毒者选择一名玩家。标记那名玩家中毒。", knowledgeStatus: 'confirmed' },
  { roleId: "godfather", order: 6, note: "对他展示所有在场的外来者标记。", knowledgeStatus: 'confirmed' },
  { roleId: "pukka", order: 7, note: "让普卡选择一名玩家。标记那名玩家中毒。", knowledgeStatus: 'confirmed' },
  { roleId: "librarian", order: 8, note: "展示那个外来者角色标记。指向被你标记“外来者”和“错误”的两名玩家。", knowledgeStatus: 'confirmed' },
  { roleId: "steward", order: 9, note: "唤醒事务官，指向标记有“得知”的那名玩家。让事务官重新入睡。", knowledgeStatus: 'confirmed' },
  { roleId: "balloonist", order: 10, note: "选择一种角色类型，并告知其一个符合该类型的玩家。在该玩家旁边标记已被知晓。", knowledgeStatus: 'confirmed' },
  { roleId: "mathematician", order: 11, note: "给他展示数字手势来告诉他在首个夜晚里有多少玩家的角色能力受他人影响而未正常生效。", knowledgeStatus: 'confirmed' },
]

export const wenWuShuangQuanOtherNightOrder: readonly NightOrderEntry[] = [
  { roleId: "philosopher", order: 1, note: "哲学家可以选择一个角色。如果选择的角色不在场，将哲学家的角色标题替换成对应角色，并标记“是哲学家”，否则标记该角色对应的玩家醉酒。从现在开始，你需要以哲学家获得能力的那种角色的行动方式来唤醒哲学家。", knowledgeStatus: 'confirmed' },
  { roleId: "sailor", order: 2, note: "让水手选择一名存活玩家。标记那名玩家或水手醉酒。", knowledgeStatus: 'confirmed' },
  { roleId: "poisoner", order: 3, note: "让投毒者选择一名玩家。标记那名玩家中毒。", knowledgeStatus: 'confirmed' },
  { roleId: "gambler", order: 4, note: "让赌徒选择一名玩家和一个角色。如果赌徒猜错了，标记赌徒死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "pithag", order: 5, note: "让麻脸巫婆选择一名玩家和一个角色。如果她选择的角色不在场：让麻脸巫婆重新入睡。唤醒她的目标玩家。对该玩家展示“你是”信息标记和他的新角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "lunatic", order: 6, note: "做任何需要做的事情来模拟一位恶魔的行动。让疯子重新入睡。唤醒恶魔。对恶魔展示疯子角色标记，并指向疯子玩家，随后是疯子的攻击目标。", knowledgeStatus: 'confirmed' },
  { roleId: "lycanthrope", order: 7, note: "半兽人指向一名存活玩家：如果那名玩家善良，则立刻死去且当晚只有恶魔不会造成死亡，其他来源仍可造成死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "imp", order: 8, note: "让小恶魔选择一名玩家。标记那名玩家死亡。如果小恶魔选择了自己：用一个备用的小恶魔标记替换一个存活的爪牙角色标记。让原来的小恶魔重新入睡。唤醒新的小恶魔。对他展示“你是”信息标记，和小恶魔角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "pukka", order: 9, note: "让普卡选择一名玩家。标记那名玩家中毒。【圆】上一个因普卡中毒的玩家死亡，随后恢复健康。", knowledgeStatus: 'confirmed' },
  { roleId: "shabaloth", order: 10, note: "上一夜被沙巴洛斯选择且当前已死亡的玩家之一可能被反刍，如果被反刍，标记那名玩家被复活。让沙巴洛斯选择两名玩家。标记这两名玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "lleech", order: 11, note: "寄生蛭指向一名玩家。那名玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "assassin", order: 12, note: "刺客可以选择一名玩家。如果他这么做了，标记那名玩家死亡，且刺客失去能力，之后的夜晚无需再唤醒刺客。", knowledgeStatus: 'confirmed' },
  { roleId: "godfather", order: 13, note: "如果有外来者在今天白天死亡，让教父选择一名玩家。标记那名玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "acrobat", order: 14, note: "如果杂技演员左右两侧最近的存活善良玩家之一中毒或醉酒，杂技演员死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "barber", order: 15, note: "如果理发师今天死亡了，唤醒恶魔并展示“该角色的效果对你生效”信息标记和理发师角色标记。如果恶魔选择了两名玩家，将这两名玩家分别独自唤醒。对他们展示“你是”信息标记和他们的新角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "professor", order: 16, note: "教授可以选择一名死亡玩家。如果他这么做了，标记教授失去能力，然后如果那名玩家是镇民，标记那名玩家被复活。之后的夜晚无需再唤醒教授。", knowledgeStatus: 'confirmed' },
  { roleId: "balloonist", order: 17, note: "选择一名角色类型与上一夜所示玩家不同的玩家，指给气球驾驶员；记录本夜所示玩家，供下一夜核对。", knowledgeStatus: 'confirmed' },
  { roleId: "mathematician", order: 18, note: "给他展示数字手势来告诉他从上个黎明到数学家醒来前有多少玩家的角色能力受他人影响而未正常生效。", knowledgeStatus: 'confirmed' },
]
