import type { NightOrderEntry } from '../../types'

export const zhuoYueBiFangFirstNightOrder: readonly NightOrderEntry[] = [
  { roleId: "godfather", order: 1, note: "对他展示所有在场的外来者标记。", knowledgeStatus: 'confirmed' },
  { roleId: "harpy", order: 2, note: "每个夜晚，唤醒鹰身女妖。让鹰身女妖指向一名玩家，再指向另一名玩家。用“疯狂”提示标记标记第一名玩家，并用“第二名”提示标记标记第二名玩家。让鹰身女妖重新入睡。唤醒标记了“疯狂”的玩家。对他展示“该角色的能力对你生效”信息标记，以及鹰身女妖的角色标记。然后指向标记了“第二名”的玩家。让这名玩家重新入睡。", knowledgeStatus: 'confirmed' },
  { roleId: "dianyuzhang", order: 3, note: "唤醒典狱长，选择一至三名玩家。", knowledgeStatus: 'confirmed' },
  { roleId: "empath", order: 4, note: "给他展示数字手势来告诉他与他邻近的存活玩家有几人是邪恶的。", knowledgeStatus: 'confirmed' },
  { roleId: "grandmother", order: 5, note: "指向她的孙子玩家，并展示该玩家的角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "yinyangshi", order: 6, note: "唤醒阴阳师，并对其展示两个善良角色，两个邪恶角色，共四个角色标记。其中正好只有两个角色在场。", knowledgeStatus: 'confirmed' },
  { roleId: "highpriestess", order: 7, note: "唤醒女祭司，指向一名玩家。", knowledgeStatus: 'confirmed' },
  { roleId: "chambermaid", order: 8, note: "让侍女选择除自己外的两名存活玩家。给她展示数字手势来告诉她这些玩家中有几人因自身能力被唤醒。", knowledgeStatus: 'confirmed' },
]

export const zhuoYueBiFangOtherNightOrder: readonly NightOrderEntry[] = [
  { roleId: "innkeeper", order: 1, note: "让旅店老板选择两名玩家。标记这两名玩家不会死亡，并标记其中一人醉酒。", knowledgeStatus: 'confirmed' },
  { roleId: "gambler", order: 2, note: "让赌徒选择一名玩家和一个角色。如果赌徒猜错了，标记赌徒死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "jinyiwei", order: 3, note: "移除上个夜晚放置的“保护”标记。唤醒锦衣卫，让其选择一名玩家。在该玩家角色标记旁放置“保护”提示标记。", knowledgeStatus: 'confirmed' },
  { roleId: "harpy", order: 4, note: "每个夜晚，唤醒鹰身女妖。让鹰身女妖指向一名玩家，再指向另一名玩家。用“疯狂”提示标记标记第一名玩家，并用“第二名”提示标记标记第二名玩家。让鹰身女妖重新入睡。唤醒标记了“疯狂”的玩家。对他展示“该角色的能力对你生效”信息标记，以及鹰身女妖的角色标记。然后指向标记了“第二名”的玩家。让这名玩家重新入睡。", knowledgeStatus: 'confirmed' },
  { roleId: "zombuul", order: 5, note: "如果今天白天没有人死亡，让僵怖选择一名玩家。标记那名玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "vigormortis", order: 6, note: "让亡骨魔选择一名玩家。标记那名玩家死亡。如果该玩家是爪牙，标记该玩家保留能力，并标记与该玩家邻近的镇民玩家之一中毒。", knowledgeStatus: 'confirmed' },
  { roleId: "dianyuzhang", order: 7, note: "唤醒典狱长，选择一至三名玩家。", knowledgeStatus: 'confirmed' },
  { roleId: "legion", order: 8, note: "由说书人决定，让哪一名玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "godfather", order: 9, note: "如果有外来者在今天白天死亡，让教父选择一名玩家。标记那名玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "shaxing", order: 10, note: "如果煞星死亡，将与其邻近的存活善良玩家之一标记为死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "ravenkeeper", order: 11, note: "如果守鸦人今晚死亡，唤醒他并让他选择一名玩家。对他展示那名玩家的角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "gossip", order: 12, note: "如果白天的声明为真，会有一名玩家死亡，并由说书人来选择一名玩家，标记该玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "tinker", order: 13, note: "修补匠可能会死亡。如果说书人选择让修补匠死亡，放置死亡标记。", knowledgeStatus: 'confirmed' },
  { roleId: "moonchild", order: 14, note: "如果月之子在白天触发了死亡能力并选择了一名善良玩家，该玩家死亡。标记那名玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "grandmother", order: 15, note: "如果孙子被恶魔杀死，祖母也会一同死亡。标记祖母死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "empath", order: 16, note: "给他展示数字手势来告诉他与他邻近的存活玩家有几人是邪恶的。", knowledgeStatus: 'confirmed' },
  { roleId: "oracle", order: 17, note: "给他展示数字手势来告诉他当前已死亡的玩家中有多少玩家是邪恶的。", knowledgeStatus: 'confirmed' },
  { roleId: "highpriestess", order: 18, note: "唤醒女祭司，指向一名玩家", knowledgeStatus: 'confirmed' },
  { roleId: "chambermaid", order: 19, note: "让侍女选择除自己外的两名存活玩家。给她展示数字手势来告诉她这些玩家中有几人因自身能力被唤醒。", knowledgeStatus: 'confirmed' },
]
