import type { NightOrderEntry } from '../../types'

export const zuiGeLuanWuFirstNight: readonly NightOrderEntry[] = [
  {"roleId": "philosopher", "order": 2, "knowledgeStatus": "confirmed", "note": "哲学家可以选择一个角色。如果选择的角色不在场，将哲学家的角色标题替换成对应角色，并标记“是哲学家”，否则标记该角色对应的玩家醉酒。从现在开始，你需要以哲学家获得能力的那种角色的行动方式来唤醒哲学家。"},
  {"roleId": "amnesiac", "order": 12, "knowledgeStatus": "confirmed", "note": "决定失忆者的能力。如果失忆者的能力会让他在今晚醒来：唤醒他并执行其能力。"},
  {"roleId": "poisoner", "order": 17, "knowledgeStatus": "confirmed", "note": "让投毒者选择一名玩家。标记那名玩家中毒。"},
  {"roleId": "godfather", "order": 21, "knowledgeStatus": "confirmed", "note": "对他展示所有在场的外来者标记。"},
  {"roleId": "cerenovus", "order": 25, "knowledgeStatus": "confirmed", "note": "让洗脑师选择一名玩家和一个善良角色。标记那名玩家疯狂。让洗脑师重新入睡。唤醒洗脑师的目标。对这名玩家展示“该角色的能力对你生效”信息标记，洗脑师角色标记，该玩家需要疯狂证明的角色标记。"},
  {"roleId": "pixie", "order": 29, "knowledgeStatus": "confirmed", "note": "对小精灵展示一个在场的镇民角色。"},
  {"roleId": "huntsman", "order": 30, "knowledgeStatus": "confirmed", "note": "巡山人选择不使用能力，或指向一名玩家。如果他指向了落难少女，则为落难少女安排一个新的不在场镇民角色，将其唤醒并告知她新的角色。"},
  {"roleId": "damsel", "order": 31, "knowledgeStatus": "confirmed", "note": "唤醒所有爪牙，并告知他们场中有落难少女。"},
  {"roleId": "clockmaker", "order": 40, "knowledgeStatus": "confirmed", "note": "给他展示数字手势来告诉他恶魔与爪牙之间最近的距离。"},
  {"roleId": "dreamer", "order": 41, "knowledgeStatus": "confirmed", "note": "让筑梦师指向一名玩家。对他展示善良和邪恶的角色标记各一个，其中一个是属于该玩家的角色。"},
  {"roleId": "noble", "order": 43, "knowledgeStatus": "confirmed", "note": "以任意顺序指向三名玩家，其中一名邪恶。"},
  {"roleId": "bountyhunter", "order": 45, "knowledgeStatus": "confirmed", "note": "指向一名邪恶玩家。随后唤醒那名因赏金猎人而转变为邪恶的镇民，并告知他变成了邪恶阵营。"},
  {"roleId": "chambermaid", "order": 50, "knowledgeStatus": "confirmed", "note": "让侍女选择除自己外的两名存活玩家。给她展示数字手势来告诉她这些玩家中有几人因自身能力被唤醒。"},
  {"roleId": "mathematician", "order": 51, "knowledgeStatus": "confirmed", "note": "给他展示数字手势来告诉他在首个夜晚里有多少玩家的角色能力受他人影响而未正常生效。"},
]

export const zuiGeLuanWuOtherNight: readonly NightOrderEntry[] = [
  {"roleId": "philosopher", "order": 2, "knowledgeStatus": "confirmed", "note": "哲学家可以选择一个角色。如果选择的角色不在场，将哲学家的角色标题替换成对应角色，并标记“是哲学家”，否则标记该角色对应的玩家醉酒。从现在开始，你需要以哲学家获得能力的那种角色的行动方式来唤醒哲学家。"},
  {"roleId": "amnesiac", "order": 5, "knowledgeStatus": "confirmed", "note": "如果失忆者的能力会让他在今晚醒来：唤醒他并执行其能力。"},
  {"roleId": "poisoner", "order": 8, "knowledgeStatus": "confirmed", "note": "让投毒者选择一名玩家。标记那名玩家中毒。"},
  {"roleId": "innkeeper", "order": 9, "knowledgeStatus": "confirmed", "note": "让旅店老板选择两名玩家。标记这两名玩家不会死亡，并标记其中一人醉酒。"},
  {"roleId": "cerenovus", "order": 16, "knowledgeStatus": "confirmed", "note": "让洗脑师选择一名玩家和一个善良角色。标记那名玩家疯狂。让洗脑师重新入睡。唤醒洗脑师的目标。对这名玩家展示“该角色的能力对你生效”信息标记，洗脑师角色标记，该玩家需要疯狂证明的角色标记。"},
  {"roleId": "pithag", "order": 17, "knowledgeStatus": "confirmed", "note": "让麻脸巫婆选择一名玩家和一个角色。如果她选择的角色不在场：让麻脸巫婆重新入睡。唤醒她的目标玩家。对该玩家展示“你是”信息标记和他的新角色标记。"},
  {"roleId": "fanggu", "order": 29, "knowledgeStatus": "confirmed", "note": "让方古选择一名玩家。标记那名玩家死亡。如果他选择了外来者，且“限一次”标记未放置在魔典中：用备用的方古角色标记替换那名外来者的角色标记。让方古重新入睡。唤醒方古的目标玩家。对该玩家展示“你是”信息标记和方古角色标记，并用拇指向下代表他阵营变为邪恶。将“首次”标记放置在魔典中。标记原本的方古玩家死亡，且他选择的玩家不会被标记为死亡。"},
  {"roleId": "nodashii", "order": 30, "knowledgeStatus": "confirmed", "note": "让诺-达鲺选择一名玩家。标记那名玩家死亡。"},
  {"roleId": "vigormortis", "order": 32, "knowledgeStatus": "confirmed", "note": "让亡骨魔选择一名玩家。标记那名玩家死亡。如果该玩家是爪牙，标记该玩家保留能力，并标记与该玩家邻近的镇民玩家之一中毒。"},
  {"roleId": "godfather", "order": 38, "knowledgeStatus": "confirmed", "note": "如果有外来者在今天白天死亡，让教父选择一名玩家。标记那名玩家死亡。"},
  {"roleId": "sweetheart", "order": 41, "knowledgeStatus": "confirmed", "note": "如果心上人死亡，会有一名玩家立刻醉酒。如果你还没有让这件事情发生，那么现在为任意一位玩家放置醉酒标记。"},
  {"roleId": "huntsman", "order": 51, "knowledgeStatus": "confirmed", "note": "巡山人选择不使用能力，或指向一名玩家。如果他指向了落难少女，则为落难少女安排一个新的不在场镇民角色，将其唤醒并告知她新的角色。"},
  {"roleId": "damsel", "order": 52, "knowledgeStatus": "confirmed", "note": "如果被巡山人选中，唤醒并为其展示新角色。"},
  {"roleId": "dreamer", "order": 57, "knowledgeStatus": "confirmed", "note": "让筑梦师指向一名玩家。对他展示善良和邪恶的角色标记各一个，其中一个是属于该玩家的角色。"},
  {"roleId": "bountyhunter", "order": 65, "knowledgeStatus": "confirmed", "note": "如果赏金猎人知晓的邪恶玩家死亡，指向另一名邪恶玩家。"},
  {"roleId": "chambermaid", "order": 70, "knowledgeStatus": "confirmed", "note": "让侍女选择除自己外的两名存活玩家。给她展示数字手势来告诉她这些玩家中有几人因自身能力被唤醒。"},
  {"roleId": "mathematician", "order": 71, "knowledgeStatus": "confirmed", "note": "给他展示数字手势来告诉他从上个黎明到数学家醒来前有多少玩家的角色能力受他人影响而未正常生效。"},
]
