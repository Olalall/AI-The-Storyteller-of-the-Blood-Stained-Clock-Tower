import type { NightOrderEntry } from '../../types'

export const nuoFuJiuXingFirstNight: readonly NightOrderEntry[] = [
  { roleId: "philosopher", order: 300, note: "哲学家可以选择一个角色。如果选择的角色不在场，将哲学家的角色标题替换成对应角色，并标记“是哲学家”，否则标记该角色对应的玩家醉酒。从现在开始，你需要以哲学家获得能力的那种角色的行动方式来唤醒哲学家。", knowledgeStatus: 'confirmed' },
  { roleId: "kazali", order: 1000, note: "在首个夜晚，唤醒卡扎力。让他指向一名玩家，和角色列表上的一个爪牙角色。用这个爪牙的角色标记替换该玩家原本的角色标记，然后唤醒该玩家，对他展示“你是”信息标记和这个爪牙角色标记，然后展示向下的大拇指。重复这个流程，直到场上有与初始设置时同等数量的爪牙。让卡扎力重新入睡。", knowledgeStatus: 'confirmed' },
  { roleId: "sailor", order: 3500, note: "让水手选择一名存活玩家。标记那名玩家或水手醉酒。", knowledgeStatus: 'confirmed' },
  { roleId: "lleech", order: 4500, note: "寄生蛭指向一名玩家。放置寄生标记，那名玩家中毒。", knowledgeStatus: 'confirmed' },
  { roleId: "harpy", order: 6000, note: "唤醒鹰身女妖并让他依次指向两名玩家。标记第一名玩家“疯狂”，标记第二名玩家“第二名”。", knowledgeStatus: 'confirmed' },
  { roleId: "humeiniang", order: 6200, note: "唤醒狐媚娘，让她选择一名玩家。标记那名玩家“被魅惑”。随后唤醒那名玩家，对他展示“该角色的能力对你触发”和狐媚娘角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "yaggababble", order: 6610, note: "在为首个夜晚做准备时，用纸条或手机便签或其他便捷的设备写下一段短语。在首个夜晚，唤醒牙噶巴卜，对他展示这段短语，然后让他重新入睡。", knowledgeStatus: 'confirmed' },
  { roleId: "fortuneteller", order: 8000, note: "让占卜师选择两名玩家。如果其中有恶魔或“干扰项”，点头示意，否则摇头。", knowledgeStatus: 'confirmed' },
  { roleId: "butler", order: 8100, note: "让管家选择一名玩家。标记那名玩家为他的主人。", knowledgeStatus: 'confirmed' },
  { roleId: "seamstress", order: 8600, note: "女裁缝可以选择除自己以外的两名玩家。如果她这么做了，对她点头或摇头示意这两名玩家是否为同一阵营，随后标记女裁缝失去能力。之后的夜晚无需再唤醒女裁缝。", knowledgeStatus: 'confirmed' },
  { roleId: "steward", order: 8700, note: "唤醒事务官，指向标记有“得知”的那名玩家。让事务官重新入睡。", knowledgeStatus: 'confirmed' },
  { roleId: "noble", order: 8900, note: "以任意顺序指向三名玩家，其中一名邪恶。", knowledgeStatus: 'confirmed' },
  { roleId: "langzhong", order: 9300, note: "唤醒郎中，让其指向一名玩家。以不会被其他玩家察觉的形式对其提供与该玩家角色能力相关的一个词语。", knowledgeStatus: 'confirmed' },
  { roleId: "highpriestess", order: 11900, note: "唤醒女祭司，指向一名玩家。让女祭司重新入睡。", knowledgeStatus: 'confirmed' },
]

export const nuoFuJiuXingOtherNight: readonly NightOrderEntry[] = [
  { roleId: "philosopher", order: 400, note: "哲学家可以选择一个角色。如果选择的角色不在场，将哲学家的角色标题替换成对应角色，并标记“是哲学家”，否则标记该角色对应的玩家醉酒。从现在开始，你需要以哲学家获得能力的那种角色的行动方式来唤醒哲学家。", knowledgeStatus: 'confirmed' },
  { roleId: "sailor", order: 1000, note: "让水手选择一名存活玩家。标记那名玩家或水手醉酒。", knowledgeStatus: 'confirmed' },
  { roleId: "monk", order: 2200, note: "让僧侣选择除自己外的一名玩家。标记那名玩家被保护。", knowledgeStatus: 'confirmed' },
  { roleId: "jinyiwei", order: 2400, note: "移除上个夜晚放置的“保护”标记。唤醒锦衣卫，让其选择一名玩家。在该玩家角色标记旁放置“保护”提示标记。", knowledgeStatus: 'confirmed' },
  { roleId: "harpy", order: 3100, note: "唤醒鹰身女妖并让他依次指向两名玩家。标记第一名玩家“疯狂”，标记第二名玩家“第二名”。", knowledgeStatus: 'confirmed' },
  { roleId: "humeiniang", order: 3300, note: "如果今日狐媚娘死于处决，且被魅惑的玩家为善良阵营，唤醒被魅惑的玩家，对他展示“你是”和朝下的大拇指。", knowledgeStatus: 'confirmed' },
  { roleId: "aohe", order: 6200, note: "唤醒奥赫。让奥赫指向角色列表上的一个角色标记。如果被选择的角色在场，对应的玩家死亡——使用“死亡”提示标记标记那名玩家。如果被选择的角色不在场，那么改为你来选择任意一名玩家，那名玩家死亡——使用“死亡”提示标记标记那名玩家。让奥赫重新入睡。", knowledgeStatus: 'confirmed' },
  { roleId: "lleech", order: 7200, note: "寄生蛭指向一名玩家。那名玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "kazali", order: 7700, note: "除首个夜晚以外的每个夜晚，唤醒卡扎力。让他指向任意一名玩家。那名玩家死亡——在他角色标记旁放置“死亡”提示标记。让卡扎力重新入睡。", knowledgeStatus: 'confirmed' },
  { roleId: "yaggababble", order: 7750, note: "每当牙噶巴卜在白天公开说出这段短语时，将一枚“死亡”提示标记放入魔典左侧的中央位置，用以提示你需要在今晚放置这个标记。每个夜晚，你需要选择是否将放入魔典中央的“死亡”提示标记放置在一名玩家的角色标记旁。如果你这么做，那么同时为放置了提示标记的角色标记上再放置帷幕标记。这些玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "fortuneteller", order: 11100, note: "让占卜师选择两名玩家。如果其中有恶魔或“干扰项”，点头示意，否则摇头。", knowledgeStatus: 'confirmed' },
  { roleId: "butler", order: 11200, note: "让管家选择一名玩家。标记那名玩家为他的主人。", knowledgeStatus: 'confirmed' },
  { roleId: "seamstress", order: 11900, note: "女裁缝可以选择除自己以外的两名玩家。如果她这么做了，对她点头或摇头示意这两名玩家是否为同一阵营，随后标记女裁缝失去能力。之后的夜晚无需再唤醒女裁缝。", knowledgeStatus: 'confirmed' },
  { roleId: "juggler", order: 12000, note: "给他展示数字手势来告诉他他当天白天猜测正确的次数。", knowledgeStatus: 'confirmed' },
  { roleId: "langzhong", order: 12200, note: "唤醒郎中，让其指向一名玩家。以不会被其他玩家察觉的形式对其提供与该玩家角色能力相关的一个词语。", knowledgeStatus: 'confirmed' },
  { roleId: "highpriestess", order: 14500, note: "唤醒女祭司，指向一名玩家。让女祭司重新入睡。", knowledgeStatus: 'confirmed' },
]
