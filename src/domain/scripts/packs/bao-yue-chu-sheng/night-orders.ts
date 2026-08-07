import type { NightOrderEntry } from '../../types'

export const baoYueChuShengFirstNight: readonly NightOrderEntry[] = [
  {"roleId": "king", "order": 9, "note": "唤醒恶魔，并告诉他国王是谁。", "knowledgeStatus": "confirmed"},
  {"roleId": "lilmonsta", "order": 16, "note": "唤醒所有爪牙，允许他们以指向的方式决定谁照看小怪宝，但不能产生其他交流，否则会有非常糟糕的事情发生。", "knowledgeStatus": "confirmed"},
  {"roleId": "widow", "order": 18, "note": "给寡妇展示魔典，她想看多久就看多久。等她看完后，让她指向一个玩家。那个玩家中毒。唤醒一名善良玩家，告诉他场上有寡妇。", "knowledgeStatus": "confirmed"},
  {"roleId": "snakecharmer", "order": 20, "note": "让舞蛇人选择一名玩家。如果舞蛇人选中了恶魔：展示“你是”信息标记和恶魔角色标记。用拇指向下代表他阵营变为邪恶。在魔典中交换舞蛇人和恶魔的角色标记。让原来的舞蛇人重新入睡。唤醒原来的恶魔。对老恶魔展示“你是”信息标记和舞蛇人角色标记，并用拇指向上代表他阵营变为善良。", "knowledgeStatus": "confirmed"},
  {"roleId": "godfather", "order": 21, "note": "对他展示所有在场的外来者标记。", "knowledgeStatus": "confirmed"},
  {"roleId": "cerenovus", "order": 25, "note": "让洗脑师选择一名玩家和一个善良角色。标记那名玩家疯狂。让洗脑师重新入睡。唤醒洗脑师的目标。对这名玩家展示“该角色的能力对你生效”信息标记，洗脑师角色标记，该玩家需要疯狂证明的角色标记。", "knowledgeStatus": "confirmed"},
  {"roleId": "pukka", "order": 28, "note": "让普卡选择一名玩家。标记那名玩家中毒。", "knowledgeStatus": "confirmed"},
  {"roleId": "pixie", "order": 29, "note": "对小精灵展示一个在场的镇民角色。", "knowledgeStatus": "confirmed"},
  {"roleId": "grandmother", "order": 39, "note": "指向她的孙子玩家，并展示该玩家的角色标记。", "knowledgeStatus": "confirmed"},
  {"roleId": "seamstress", "order": 42, "note": "女裁缝可以选择除自己以外的两名玩家。如果她这么做了，对她点头或摇头示意这两名玩家是否为同一阵营，随后标记女裁缝失去能力。之后的夜晚无需再唤醒女裁缝。", "knowledgeStatus": "confirmed"},
  {"roleId": "balloonist", "order": 44, "note": "选择一种角色类型，并告知其一个符合该类型的玩家。在该玩家旁边标记已被知晓。", "knowledgeStatus": "confirmed"},
  {"roleId": "chambermaid", "order": 50, "note": "让侍女选择除自己外的两名存活玩家。给她展示数字手势来告诉她这些玩家中有几人因自身能力被唤醒。", "knowledgeStatus": "confirmed"},
]

export const baoYueChuShengOtherNight: readonly NightOrderEntry[] = [
  {"roleId": "gambler", "order": 11, "note": "让赌徒选择一名玩家和一个角色。如果赌徒猜错了，标记赌徒死亡。", "knowledgeStatus": "confirmed"},
  {"roleId": "snakecharmer", "order": 12, "note": "让舞蛇人选择一名玩家。如果舞蛇人选中了恶魔：展示“你是”信息标记和恶魔角色标记。用拇指向下代表他阵营变为邪恶。在魔典中交换舞蛇人和恶魔的角色标记。让原来的舞蛇人重新入睡。唤醒原来的恶魔。对老恶魔展示“你是”信息标记和舞蛇人角色标记，并用拇指向上代表他阵营变为善良。", "knowledgeStatus": "confirmed"},
  {"roleId": "cerenovus", "order": 16, "note": "让洗脑师选择一名玩家和一个善良角色。标记那名玩家疯狂。让洗脑师重新入睡。唤醒洗脑师的目标。对这名玩家展示“该角色的能力对你生效”信息标记，洗脑师角色标记，该玩家需要疯狂证明的角色标记。", "knowledgeStatus": "confirmed"},
  {"roleId": "pukka", "order": 26, "note": "让普卡选择一名玩家。标记那名玩家中毒。【圆】上一个因普卡中毒的玩家死亡，随后恢复健康。", "knowledgeStatus": "confirmed"},
  {"roleId": "shabaloth", "order": 27, "note": "上一夜被沙巴洛斯选择且当前已死亡的玩家之一可能被反刍，如果被反刍，标记那名玩家被复活。如果正常情况下该玩家会被唤醒，则在当晚的后续时段中照常唤醒；如果该玩家只在首个夜晚被唤醒，则现在就唤醒该玩家让他使用自己的能力。黎明时，在宣布哪些玩家死亡后，宣布哪些玩家复活了（不要说明原因）。让沙巴洛斯选择两名玩家。标记这两名玩家死亡。", "knowledgeStatus": "confirmed"},
  {"roleId": "po", "order": 28, "note": "珀可以选择一名玩家；或如果上一次他被唤醒时未做选择，让他选择三名玩家。标记这些玩家死亡。", "knowledgeStatus": "confirmed"},
  {"roleId": "lilmonsta", "order": 36, "note": "唤醒所有爪牙，允许他们以指向的方式决定谁照看小怪宝，但不能产生其他交流，否则会有非常糟糕的事情发生。说书人选择一名玩家，那名玩家死亡。", "knowledgeStatus": "confirmed"},
  {"roleId": "godfather", "order": 38, "note": "如果有外来者在今天白天死亡，让教父选择一名玩家。标记那名玩家死亡。", "knowledgeStatus": "confirmed"},
  {"roleId": "barber", "order": 40, "note": "如果理发师今天死亡了，唤醒恶魔并展示“该角色的效果对你生效”信息标记和理发师角色标记。如果恶魔选择了两名玩家，将这两名玩家分别独自唤醒。对他们展示“你是”信息标记和他们的新角色标记。", "knowledgeStatus": "confirmed"},
  {"roleId": "ravenkeeper", "order": 42, "note": "如果守鸦人今晚死亡，唤醒他并让他选择一名玩家。对他展示那名玩家的角色标记。", "knowledgeStatus": "confirmed"},
  {"roleId": "choirboy", "order": 44, "note": "如果国王被恶魔杀死，将唱诗男孩唤醒并告诉他谁是那个杀死国王的恶魔。", "knowledgeStatus": "confirmed"},
  {"roleId": "professor", "order": 45, "note": "教授可以选择一名死亡玩家。如果他这么做了，标记教授失去能力，然后如果那名玩家是镇民，标记那名玩家被复活。如果被复活的玩家其角色在当晚的后续时段中应该被唤醒，则照常唤醒；如果该玩家的角色只会在首个夜晚被唤醒，则立即唤醒该玩家来使用自己的能力。黎明时，在宣布哪些玩家死亡后，宣布哪些玩家再次变成存活状态了（不要说明原因）。之后的夜晚无需再唤醒教授。", "knowledgeStatus": "confirmed"},
  {"roleId": "grandmother", "order": 50, "note": "如果孙子被恶魔杀死，祖母也会一同死亡。标记祖母死亡。", "knowledgeStatus": "confirmed"},
  {"roleId": "seamstress", "order": 61, "note": "女裁缝可以选择除自己以外的两名玩家。如果她这么做了，对她点头或摇头示意这两名玩家是否为同一阵营，随后标记女裁缝失去能力。之后的夜晚无需再唤醒女裁缝。", "knowledgeStatus": "confirmed"},
  {"roleId": "balloonist", "order": 63, "note": "选择一名角色类型与上一夜所示玩家不同的玩家，指给气球驾驶员；记录本夜所示玩家，供下一夜核对。", "knowledgeStatus": "confirmed"},
  {"roleId": "king", "order": 64, "note": "如果死亡玩家人数大于或等于存活玩家，唤醒国王并对其展示一个存活的角色标记。", "knowledgeStatus": "confirmed"},
  {"roleId": "chambermaid", "order": 70, "note": "让侍女选择除自己外的两名存活玩家。给她展示数字手势来告诉她这些玩家中有几人因自身能力被唤醒。", "knowledgeStatus": "confirmed"},
]
