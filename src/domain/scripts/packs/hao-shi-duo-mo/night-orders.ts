import type { NightOrderEntry } from '../../types'

export const haoShiDuoMoFirstNight: readonly NightOrderEntry[] = [
  {"roleId": "barista", "order": 1, "knowledgeStatus": "confirmed", "note": "说书人选择一名玩家唤醒，并告诉他触发了咖啡师的什么效果。"},
  {"roleId": "thief", "order": 1, "knowledgeStatus": "confirmed", "note": "窃贼指向一名玩家。将负票标记放在那名玩家旁。"},
  {"roleId": "poppygrower", "order": 4, "knowledgeStatus": "confirmed", "note": "不要让恶魔和爪牙相认。"},
  {"roleId": "sailor", "order": 10, "knowledgeStatus": "confirmed", "note": "让水手选择一名存活玩家。标记那名玩家或水手醉酒。"},
  {"roleId": "amnesiac", "order": 12, "knowledgeStatus": "confirmed", "note": "决定失忆者的能力。如果失忆者的能力会让他在今晚醒来：唤醒他并执行其能力。"},
  {"roleId": "lleech", "order": 15, "knowledgeStatus": "confirmed", "note": "寄生蛭指向一名玩家。放置寄生标记，那名玩家中毒。"},
  {"roleId": "poisoner", "order": 17, "knowledgeStatus": "confirmed", "note": "让投毒者选择一名玩家。标记那名玩家中毒。"},
  {"roleId": "snakecharmer", "order": 20, "knowledgeStatus": "confirmed", "note": "让舞蛇人选择一名玩家。如果舞蛇人选中了恶魔：展示“你是”信息标记和恶魔角色标记。用拇指向下代表他阵营变为邪恶。在魔典中交换舞蛇人和恶魔的角色标记。让原来的舞蛇人重新入睡。唤醒原来的恶魔。对老恶魔展示“你是”信息标记和舞蛇人角色标记，并用拇指向上代表他阵营变为善良。"},
  {"roleId": "cerenovus", "order": 25, "knowledgeStatus": "confirmed", "note": "让洗脑师选择一名玩家和一个善良角色。标记那名玩家疯狂。让洗脑师重新入睡。唤醒洗脑师的目标。对这名玩家展示“该角色的能力对你生效”信息标记，洗脑师角色标记，该玩家需要疯狂证明的角色标记。"},
  {"roleId": "pixie", "order": 29, "knowledgeStatus": "confirmed", "note": "对小精灵展示一个在场的镇民角色。"},
  {"roleId": "empath", "order": 36, "knowledgeStatus": "confirmed", "note": "给他展示数字手势来告诉他与他邻近的存活玩家有几人是邪恶的。"},
  {"roleId": "noble", "order": 43, "knowledgeStatus": "confirmed", "note": "以任意顺序指向三名玩家，其中一名邪恶。"},
]

export const haoShiDuoMoOtherNight: readonly NightOrderEntry[] = [
  {"roleId": "barista", "order": 1, "knowledgeStatus": "confirmed", "note": "说书人选择一名玩家唤醒，并告诉他触发了咖啡师的什么效果。"},
  {"roleId": "harlot", "order": 1, "knowledgeStatus": "confirmed", "note": "流莺选择一名玩家，将其唤醒，那名玩家选择同意或拒绝。如果同意，将他的角色标记展示给流莺看。然后说书人可以决定两名玩家是否会一起死去。"},
  {"roleId": "thief", "order": 1, "knowledgeStatus": "confirmed", "note": "窃贼指向一名玩家。将负票标记放在那名玩家旁。"},
  {"roleId": "poppygrower", "order": 3, "knowledgeStatus": "confirmed", "note": "如果罂粟种植者死亡，安排恶魔和爪牙相认环节。"},
  {"roleId": "sailor", "order": 4, "knowledgeStatus": "confirmed", "note": "让水手选择一名存活玩家。标记那名玩家或水手醉酒。"},
  {"roleId": "amnesiac", "order": 5, "knowledgeStatus": "confirmed", "note": "如果失忆者的能力会让他在今晚醒来：唤醒他并执行其能力。"},
  {"roleId": "poisoner", "order": 8, "knowledgeStatus": "confirmed", "note": "让投毒者选择一名玩家。标记那名玩家中毒。"},
  {"roleId": "innkeeper", "order": 9, "knowledgeStatus": "confirmed", "note": "让旅店老板选择两名玩家。标记这两名玩家不会死亡，并标记其中一人醉酒。"},
  {"roleId": "gambler", "order": 11, "knowledgeStatus": "confirmed", "note": "让赌徒选择一名玩家和一个角色。如果赌徒猜错了，标记赌徒死亡。"},
  {"roleId": "snakecharmer", "order": 12, "knowledgeStatus": "confirmed", "note": "让舞蛇人选择一名玩家。如果舞蛇人选中了恶魔：展示“你是”信息标记和恶魔角色标记。用拇指向下代表他阵营变为邪恶。在魔典中交换舞蛇人和恶魔的角色标记。让原来的舞蛇人重新入睡。唤醒原来的恶魔。对老恶魔展示“你是”信息标记和舞蛇人角色标记，并用拇指向上代表他阵营变为善良。"},
  {"roleId": "cerenovus", "order": 16, "knowledgeStatus": "confirmed", "note": "让洗脑师选择一名玩家和一个善良角色。标记那名玩家疯狂。让洗脑师重新入睡。唤醒洗脑师的目标。对这名玩家展示“该角色的能力对你生效”信息标记，洗脑师角色标记，该玩家需要疯狂证明的角色标记。"},
  {"roleId": "imp", "order": 24, "knowledgeStatus": "confirmed", "note": "让小恶魔选择一名玩家。标记那名玩家死亡。如果小恶魔选择了自己：用一个备用的小恶魔标记替换一个存活的爪牙角色标记。让原来的小恶魔重新入睡。唤醒新的小恶魔。对他展示“你是”信息标记，和小恶魔角色标记。"},
  {"roleId": "fanggu", "order": 29, "knowledgeStatus": "confirmed", "note": "让方古选择一名玩家。标记那名玩家死亡。如果他选择了外来者，且“限一次”标记未放置在魔典中：用备用的方古角色标记替换那名外来者的角色标记。让方古重新入睡。唤醒方古的目标玩家。对该玩家展示“你是”信息标记和方古角色标记，并用拇指向下代表他阵营变为邪恶。将“首次”标记放置在魔典中。标记原本的方古玩家死亡，且他选择的玩家不会被标记为死亡。"},
  {"roleId": "lleech", "order": 35, "knowledgeStatus": "confirmed", "note": "寄生蛭指向一名玩家。那名玩家死亡。"},
  {"roleId": "assassin", "order": 37, "knowledgeStatus": "confirmed", "note": "刺客可以选择一名玩家。如果他这么做了，标记那名玩家死亡，且刺客失去能力，之后的夜晚无需再唤醒刺客。"},
  {"roleId": "ravenkeeper", "order": 42, "knowledgeStatus": "confirmed", "note": "如果守鸦人今晚死亡，唤醒他并让他选择一名玩家。对他展示那名玩家的角色标记。"},
  {"roleId": "gossip", "order": 47, "knowledgeStatus": "confirmed", "note": "如果白天的声明为真，会有一名玩家死亡，并由说书人来选择一名玩家，标记该玩家死亡。"},
  {"roleId": "moonchild", "order": 49, "knowledgeStatus": "confirmed", "note": "如果月之子在白天触发了死亡能力并选择了一名善良玩家，该玩家死亡。标记那名玩家死亡。"},
  {"roleId": "empath", "order": 53, "knowledgeStatus": "confirmed", "note": "给他展示数字手势来告诉他与他邻近的存活玩家有几人是邪恶的。"},
]
