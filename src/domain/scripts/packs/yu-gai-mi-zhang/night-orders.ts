import type { NightOrderEntry } from '../../types'

export const yuGaiMiZhangFirstNightOrder = [
  {"roleId": "philosopher", "order": 2, "note": "哲学家可以选择一个角色。如果选择的角色不在场，将哲学家的角色标题替换成对应角色，并标记“是哲学家”，否则标记该角色对应的玩家醉酒。从现在开始，你需要以哲学家获得能力的那种角色的行动方式来唤醒哲学家。", "knowledgeStatus": "confirmed"},
  {"roleId": "sailor", "order": 10, "note": "让水手选择一名存活玩家。标记那名玩家或水手醉酒。", "knowledgeStatus": "confirmed"},
  {"roleId": "lleech", "order": 15, "note": "寄生蛭指向一名玩家。放置寄生标记，那名玩家中毒。", "knowledgeStatus": "confirmed"},
  {"roleId": "lilmonsta", "order": 16, "note": "唤醒所有爪牙，允许他们以指向的方式决定谁照看小怪宝，但不能产生其他交流，否则会有非常糟糕的事情发生。", "knowledgeStatus": "confirmed"},
  {"roleId": "widow", "order": 18, "note": "给寡妇展示魔典，她想看多久就看多久。等她看完后，让她指向一个玩家。那个玩家中毒。唤醒一名善良玩家，告诉他场上有寡妇。", "knowledgeStatus": "confirmed"},
  {"roleId": "eviltwin", "order": 23, "note": "唤醒镜像双子和他的对立双子，让他们进行眼神接触。对镜像双子展示对立双子的角色标记，并对对立双子展示镜像双子的角色标记。", "knowledgeStatus": "confirmed"},
  {"roleId": "fearmonger", "order": 26, "note": "恐惧之灵指向一名玩家，放置恐惧标记。宣布恐惧之灵选中或改变了目标。", "knowledgeStatus": "confirmed"},
  {"roleId": "pixie", "order": 29, "note": "对小精灵展示一个在场的镇民角色。", "knowledgeStatus": "confirmed"},
  {"roleId": "librarian", "order": 33, "note": "展示那个外来者角色标记。指向被你标记“外来者”和“错误”的两名玩家。", "knowledgeStatus": "confirmed"},
  {"roleId": "fortuneteller", "order": 37, "note": "让占卜师选择两名玩家。如果其中有恶魔或“干扰项”，点头示意，否则摇头。", "knowledgeStatus": "confirmed"},
  {"roleId": "seamstress", "order": 42, "note": "女裁缝可以选择除自己以外的两名玩家。如果她这么做了，对她点头或摇头示意这两名玩家是否为同一阵营，随后标记女裁缝失去能力。之后的夜晚无需再唤醒女裁缝。", "knowledgeStatus": "confirmed"},
  {"roleId": "noble", "order": 43, "note": "以任意顺序指向三名玩家，其中一名邪恶。", "knowledgeStatus": "confirmed"},
  {"roleId": "balloonist", "order": 44, "note": "选择一种角色类型，并告知其一个符合该类型的玩家。在该玩家旁边标记已被知晓。", "knowledgeStatus": "confirmed"},
  {"roleId": "general", "order": 49, "note": "告诉将军你认为的答案。", "knowledgeStatus": "confirmed"},
  {"roleId": "chambermaid", "order": 50, "note": "让侍女选择除自己外的两名存活玩家。给她展示数字手势来告诉她这些玩家中有几人因自身能力被唤醒。", "knowledgeStatus": "confirmed"},
] as const satisfies readonly NightOrderEntry[]

export const yuGaiMiZhangOtherNightOrder = [
  {"roleId": "philosopher", "order": 2, "note": "哲学家可以选择一个角色。如果选择的角色不在场，将哲学家的角色标题替换成对应角色，并标记“是哲学家”，否则标记该角色对应的玩家醉酒。从现在开始，你需要以哲学家获得能力的那种角色的行动方式来唤醒哲学家。", "knowledgeStatus": "confirmed"},
  {"roleId": "sailor", "order": 4, "note": "让水手选择一名存活玩家。标记那名玩家或水手醉酒。", "knowledgeStatus": "confirmed"},
  {"roleId": "fearmonger", "order": 18, "note": "恐惧之灵指向一名玩家。如果与之前选择的不同，则更换恐惧标记并宣布恐惧之灵选中或改变了目标。", "knowledgeStatus": "confirmed"},
  {"roleId": "fanggu", "order": 29, "note": "让方古选择一名玩家。标记那名玩家死亡。如果他选择了外来者，且“限一次”标记未放置在魔典中：用备用的方古角色标记替换那名外来者的角色标记。让方古重新入睡。唤醒方古的目标玩家。对该玩家展示“你是”信息标记和方古角色标记，并用拇指向下代表他阵营变为邪恶。将“首次”标记放置在魔典中。标记原本的方古玩家死亡，且他选择的玩家不会被标记为死亡。", "knowledgeStatus": "confirmed"},
  {"roleId": "lleech", "order": 35, "note": "寄生蛭指向一名玩家。那名玩家死亡。", "knowledgeStatus": "confirmed"},
  {"roleId": "lilmonsta", "order": 36, "note": "唤醒所有爪牙，允许他们以指向的方式决定谁照看小怪宝，但不能产生其他交流，否则会有非常糟糕的事情发生。说书人选择一名玩家，那名玩家死亡。", "knowledgeStatus": "confirmed"},
  {"roleId": "barber", "order": 40, "note": "如果理发师今天死亡了，唤醒恶魔并展示“该角色的效果对你生效”信息标记和理发师角色标记。如果恶魔选择了两名玩家，将这两名玩家分别独自唤醒。对他们展示“你是”信息标记和他们的新角色标记。", "knowledgeStatus": "confirmed"},
  {"roleId": "sweetheart", "order": 41, "note": "如果心上人死亡，会有一名玩家立刻醉酒。如果你还没有让这件事情发生，那么现在为任意一位玩家放置醉酒标记。", "knowledgeStatus": "confirmed"},
  {"roleId": "ravenkeeper", "order": 42, "note": "如果守鸦人今晚死亡，唤醒他并让他选择一名玩家。对他展示那名玩家的角色标记。", "knowledgeStatus": "confirmed"},
  {"roleId": "fortuneteller", "order": 54, "note": "让占卜师选择两名玩家。如果其中有恶魔或“干扰项”，点头示意，否则摇头。", "knowledgeStatus": "confirmed"},
  {"roleId": "seamstress", "order": 61, "note": "女裁缝可以选择除自己以外的两名玩家。如果她这么做了，对她点头或摇头示意这两名玩家是否为同一阵营，随后标记女裁缝失去能力。之后的夜晚无需再唤醒女裁缝。", "knowledgeStatus": "confirmed"},
  {"roleId": "balloonist", "order": 63, "note": "选择一种尚未被气球驾驶员知晓的角色类型，并告知其一个符合该类型的玩家。在该玩家旁边标记已被知晓。如果所有类型均已被知晓或无该种类型，气球驾驶员不会醒来。", "knowledgeStatus": "confirmed"},
  {"roleId": "general", "order": 69, "note": "告诉将军你认为的答案。", "knowledgeStatus": "confirmed"},
  {"roleId": "chambermaid", "order": 70, "note": "让侍女选择除自己外的两名存活玩家。给她展示数字手势来告诉她这些玩家中有几人因自身能力被唤醒。", "knowledgeStatus": "confirmed"},
] as const satisfies readonly NightOrderEntry[]
