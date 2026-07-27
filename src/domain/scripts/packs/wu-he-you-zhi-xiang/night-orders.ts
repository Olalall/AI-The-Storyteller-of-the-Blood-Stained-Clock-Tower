import type { NightOrderEntry } from '../../types'

export const wuHeYouZhiXiangFirstNightOrder: readonly NightOrderEntry[] = [
  { roleId: "philosopher", order: 300, note: "哲学家可以选择一个角色。如果选择的角色不在场，将哲学家的角色标题替换成对应角色，并标记“是哲学家”，否则标记该角色对应的玩家醉酒。从现在开始，你需要以哲学家获得能力的那种角色的行动方式来唤醒哲学家。", knowledgeStatus: 'confirmed' },
  { roleId: "poppygrower", order: 700, note: "不要让恶魔和爪牙相认。", knowledgeStatus: 'confirmed' },
  { roleId: "kazali", order: 1000, note: "在首个夜晚，唤醒卡扎力。让他指向一名玩家，和角色列表上的一个爪牙角色。用这个爪牙的角色标记替换该玩家原本的角色标记，然后唤醒该玩家，对他展示“你是”信息标记和这个爪牙角色标记，然后展示向下的大拇指。重复这个流程，直到场上有与初始设置时同等数量的爪牙。让卡扎力重新入睡。", knowledgeStatus: 'confirmed' },
  { roleId: "poisoner", order: 4600, note: "让投毒者选择一名玩家。标记那名玩家中毒。", knowledgeStatus: 'confirmed' },
  { roleId: "harpy", order: 6000, note: "唤醒鹰身女妖并让他依次指向两名玩家。标记第一名玩家“疯狂”，标记第二名玩家“第二名”。", knowledgeStatus: 'confirmed' },
  { roleId: "mezepheles", order: 6100, note: "告诉灵言师他的秘密词语。", knowledgeStatus: 'confirmed' },
  { roleId: "pixie", order: 7300, note: "对小精灵展示一个在场的镇民角色。", knowledgeStatus: 'confirmed' },
  { roleId: "seamstress", order: 8600, note: "女裁缝可以选择除自己以外的两名玩家。如果她这么做了，对她点头或摇头示意这两名玩家是否为同一阵营，随后标记女裁缝失去能力。之后的夜晚无需再唤醒女裁缝。", knowledgeStatus: 'confirmed' },
  { roleId: "villageidiot", order: 10100, note: "在为首个夜晚做准备时，（如果有超过一名村夫在场，）将村夫的“醉酒”提示标记放置到其中一个村夫角色标记旁。", knowledgeStatus: 'confirmed' },
  { roleId: "spy", order: 11700, note: "将魔典展示给间谍，他想看多久就看多久。", knowledgeStatus: 'confirmed' },
  { roleId: "highpriestess", order: 11900, note: "唤醒女祭司，指向一名玩家。让女祭司重新入睡。", knowledgeStatus: 'confirmed' },
  { roleId: "shugenja", order: 12000, note: "在首个夜晚，唤醒修行者。用手指水平指向修行者的某一侧，告诉他与他距离最近的邪恶玩家位于这一侧。如果修行者两侧最近的邪恶玩家与他的距离相等，由你来决定告诉他什么样的信息，并用手指指向对应的一侧。让修行者重新入睡。", knowledgeStatus: 'confirmed' },
]

export const wuHeYouZhiXiangOtherNightOrder: readonly NightOrderEntry[] = [
  { roleId: "philosopher", order: 400, note: "哲学家可以选择一个角色。如果选择的角色不在场，将哲学家的角色标题替换成对应角色，并标记“是哲学家”，否则标记该角色对应的玩家醉酒。从现在开始，你需要以哲学家获得能力的那种角色的行动方式来唤醒哲学家。", knowledgeStatus: 'confirmed' },
  { roleId: "hatter", order: 800, note: "在当晚，一同唤醒所有爪牙和恶魔。对他们展示“该角色的能力对你生效”信息标记，然后展示帽匠角色标记。每名以此被唤醒的玩家可以选择摇头或指向角色列表上与自己当前角色类型相同的一个角色。如果一名玩家在做出自己的选择后会使得自己的角色与一名其他玩家选择的角色相同，对他摇头示意他重新选择。在选择完成后让他重新入睡。移除“今晚茶会”提示标记。根据这些玩家的选择，在魔典上执行相应的角色变化操作。", knowledgeStatus: 'confirmed' },
  { roleId: "poppygrower", order: 900, note: "如果罂粟种植者死亡，安排恶魔和爪牙相认环节。", knowledgeStatus: 'confirmed' },
  { roleId: "poisoner", order: 1400, note: "让投毒者选择一名玩家。标记那名玩家中毒。", knowledgeStatus: 'confirmed' },
  { roleId: "monk", order: 2200, note: "让僧侣选择除自己外的一名玩家。标记那名玩家被保护。", knowledgeStatus: 'confirmed' },
  { roleId: "harpy", order: 3100, note: "唤醒鹰身女妖并让他依次指向两名玩家。标记第一名玩家“疯狂”，标记第二名玩家“第二名”。", knowledgeStatus: 'confirmed' },
  { roleId: "mezepheles", order: 3200, note: "唤醒第一个说出灵言师词语的玩家并告知他已经变成邪恶阵营。", knowledgeStatus: 'confirmed' },
  { roleId: "scarletwoman", order: 3700, note: "如果红唇女郎今天变成了小恶魔，对她展示“你是”信息标记，和小恶魔角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "legion", order: 6000, note: "由说书人决定，让哪一名玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "ojo", order: 6200, note: "唤醒奥赫。让奥赫指向角色列表上的一个角色标记。如果被选择的角色在场，对应的玩家死亡——使用“死亡”提示标记标记那名玩家。如果被选择的角色不在场，那么改为你来选择任意一名玩家，那名玩家死亡——使用“死亡”提示标记标记那名玩家。让奥赫重新入睡。", knowledgeStatus: 'confirmed' },
  { roleId: "kazali", order: 7700, note: "除首个夜晚以外的每个夜晚，唤醒卡扎力。让他指向任意一名玩家。那名玩家死亡——在他角色标记旁放置“死亡”提示标记。让卡扎力重新入睡。", knowledgeStatus: 'confirmed' },
  { roleId: "plaguedoctor", order: 10000, note: "当瘟疫医生死亡时，将一个不在场的爪牙角色标记放置在魔典左侧的正中位置，并用瘟疫医生的“说书人能力”标记标记该爪牙角色。如可能，在夜晚顺序表旁添加相应的夜晚标记用以提示。", knowledgeStatus: 'confirmed' },
  { roleId: "farmer", order: 10300, note: "如果农民在夜晚死去，则选择另一位善良玩家成为农民。唤醒这名玩家，并告知他成为了农民。", knowledgeStatus: 'confirmed' },
  { roleId: "oracle", order: 11800, note: "给他展示数字手势来告诉他当前已死亡的玩家中有多少玩家是邪恶的。", knowledgeStatus: 'confirmed' },
  { roleId: "seamstress", order: 11900, note: "女裁缝可以选择除自己以外的两名玩家。如果她这么做了，对她点头或摇头示意这两名玩家是否为同一阵营，随后标记女裁缝失去能力。之后的夜晚无需再唤醒女裁缝。", knowledgeStatus: 'confirmed' },
  { roleId: "juggler", order: 12000, note: "给他展示数字手势来告诉他他当天白天猜测正确的次数。", knowledgeStatus: 'confirmed' },
  { roleId: "villageidiot", order: 12800, note: "每个夜晚，唤醒任意一名村夫。让他指向一名玩家。对他给出拇指向上或向下的手势。让他重新入睡。重复这个操作，直到所有村夫玩家都进行了夜晚行动。", knowledgeStatus: 'confirmed' },
  { roleId: "spy", order: 14400, note: "将魔典展示给间谍，他想看多久就看多久。", knowledgeStatus: 'confirmed' },
  { roleId: "highpriestess", order: 14500, note: "唤醒女祭司，指向一名玩家。让女祭司重新入睡。", knowledgeStatus: 'confirmed' },
]
