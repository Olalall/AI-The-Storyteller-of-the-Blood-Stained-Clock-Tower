import type { NightOrderEntry } from '../../types'

export const miYingXunZongFirstNight: readonly NightOrderEntry[] = [
  {"roleId": "preacher", "order": 14, "knowledgeStatus": "confirmed", "note": "传教士选择一名玩家。如果选中了爪牙，则唤醒并告知他被传教士选中。"},
  {"roleId": "poisoner", "order": 17, "knowledgeStatus": "confirmed", "note": "让投毒者选择一名玩家。标记那名玩家中毒。"},
  {"roleId": "godfather", "order": 21, "knowledgeStatus": "confirmed", "note": "对他展示所有在场的外来者标记。"},
  {"roleId": "cerenovus", "order": 25, "knowledgeStatus": "confirmed", "note": "让洗脑师选择一名玩家和一个善良角色。标记那名玩家疯狂。让洗脑师重新入睡。唤醒洗脑师的目标。对这名玩家展示“该角色的能力对你生效”信息标记，洗脑师角色标记，该玩家需要疯狂证明的角色标记。"},
  {"roleId": "mezepheles", "order": 27, "knowledgeStatus": "confirmed", "note": "告诉灵言师他的秘密词语。"},
  {"roleId": "pukka", "order": 28, "knowledgeStatus": "confirmed", "note": "让普卡选择一名玩家。标记那名玩家中毒。"},
  {"roleId": "pixie", "order": 29, "knowledgeStatus": "confirmed", "note": "对小精灵展示一个在场的镇民角色。"},
  {"roleId": "huntsman", "order": 30, "knowledgeStatus": "confirmed", "note": "巡山人选择不使用能力，或指向一名玩家。如果他指向了落难少女，则为落难少女安排一个新的不在场镇民角色，将其唤醒并告知她新的角色。"},
  {"roleId": "damsel", "order": 31, "knowledgeStatus": "confirmed", "note": "唤醒所有爪牙，并告知他们场中有落难少女。"},
  {"roleId": "librarian", "order": 33, "knowledgeStatus": "confirmed", "note": "展示那个外来者角色标记。指向被你标记“外来者”和“错误”的两名玩家。"},
  {"roleId": "dreamer", "order": 41, "knowledgeStatus": "confirmed", "note": "让筑梦师指向一名玩家。对他展示善良和邪恶的角色标记各一个，其中一个是属于该玩家的角色。"},
  {"roleId": "seamstress", "order": 42, "knowledgeStatus": "confirmed", "note": "女裁缝可以选择除自己以外的两名玩家。如果她这么做了，对她点头或摇头示意这两名玩家是否为同一阵营，随后标记女裁缝失去能力。之后的夜晚无需再唤醒女裁缝。"},
  {"roleId": "noble", "order": 43, "knowledgeStatus": "confirmed", "note": "以任意顺序指向三名玩家，其中一名邪恶。"},
]

export const miYingXunZongOtherNight: readonly NightOrderEntry[] = [
  {"roleId": "preacher", "order": 7, "knowledgeStatus": "confirmed", "note": "传教士选择一名玩家。如果选中了爪牙，则唤醒并告知他被传教士选中。"},
  {"roleId": "poisoner", "order": 8, "knowledgeStatus": "confirmed", "note": "让投毒者选择一名玩家。标记那名玩家中毒。"},
  {"roleId": "cerenovus", "order": 16, "knowledgeStatus": "confirmed", "note": "让洗脑师选择一名玩家和一个善良角色。标记那名玩家疯狂。让洗脑师重新入睡。唤醒洗脑师的目标。对这名玩家展示“该角色的能力对你生效”信息标记，洗脑师角色标记，该玩家需要疯狂证明的角色标记。"},
  {"roleId": "mezepheles", "order": 19, "knowledgeStatus": "confirmed", "note": "唤醒第一个说出灵言师词语的玩家并告知他已经变成邪恶阵营。"},
  {"roleId": "imp", "order": 24, "knowledgeStatus": "confirmed", "note": "让小恶魔选择一名玩家。标记那名玩家死亡。如果小恶魔选择了自己：用一个备用的小恶魔标记替换一个存活的爪牙角色标记。让原来的小恶魔重新入睡。唤醒新的小恶魔。对他展示“你是”信息标记，和小恶魔角色标记。"},
  {"roleId": "pukka", "order": 26, "knowledgeStatus": "confirmed", "note": "让普卡选择一名玩家。标记那名玩家中毒。【圆】上一个因普卡中毒的玩家死亡，随后恢复健康。"},
  {"roleId": "vigormortis", "order": 32, "knowledgeStatus": "confirmed", "note": "让亡骨魔选择一名玩家。标记那名玩家死亡。如果该玩家是爪牙，标记该玩家保留能力，并标记与该玩家邻近的镇民玩家之一中毒。"},
  {"roleId": "godfather", "order": 38, "knowledgeStatus": "confirmed", "note": "如果有外来者在今天白天死亡，让教父选择一名玩家。标记那名玩家死亡。"},
  {"roleId": "ravenkeeper", "order": 42, "knowledgeStatus": "confirmed", "note": "如果守鸦人今晚死亡，唤醒他并让他选择一名玩家。对他展示那名玩家的角色标记。"},
  {"roleId": "huntsman", "order": 51, "knowledgeStatus": "confirmed", "note": "巡山人选择不使用能力，或指向一名玩家。如果他指向了落难少女，则为落难少女安排一个新的不在场镇民角色，将其唤醒并告知她新的角色。"},
  {"roleId": "damsel", "order": 52, "knowledgeStatus": "confirmed", "note": "如果被巡山人选中，唤醒并为其展示新角色。"},
  {"roleId": "undertaker", "order": 56, "knowledgeStatus": "confirmed", "note": "如果有玩家今天白天死于处决，唤醒送葬者并对他展示那名玩家的角色标记。"},
  {"roleId": "dreamer", "order": 57, "knowledgeStatus": "confirmed", "note": "让筑梦师指向一名玩家。对他展示善良和邪恶的角色标记各一个，其中一个是属于该玩家的角色。"},
  {"roleId": "towncrier", "order": 59, "knowledgeStatus": "confirmed", "note": "对他点头或摇头示意今天白天是否有爪牙发起过提名。"},
  {"roleId": "oracle", "order": 60, "knowledgeStatus": "confirmed", "note": "给他展示数字手势来告诉他当前已死亡的玩家中有多少玩家是邪恶的。"},
  {"roleId": "seamstress", "order": 61, "knowledgeStatus": "confirmed", "note": "女裁缝可以选择除自己以外的两名玩家。如果她这么做了，对她点头或摇头示意这两名玩家是否为同一阵营，随后标记女裁缝失去能力。之后的夜晚无需再唤醒女裁缝。"},
]
