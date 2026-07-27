import type { NightOrderEntry } from '../../types'

export const yiYanHuanYanFirstNightOrder: readonly NightOrderEntry[] = [
  { roleId: "philosopher", order: 1, note: "哲学家可以选择一个角色。如果选择的角色不在场，将哲学家的角色标题替换成对应角色，并标记“是哲学家”，否则标记该角色对应的玩家醉酒。从现在开始，你需要以哲学家获得能力的那种角色的行动方式来唤醒哲学家。", knowledgeStatus: 'confirmed' },
  { roleId: "poppygrower", order: 2, note: "不要让恶魔和爪牙相认。", knowledgeStatus: 'confirmed' },
  { roleId: "marionette", order: 3, note: "选择一个邻近恶魔的善良玩家放置提线木偶标记。唤醒恶魔并告知他谁是提线木偶。", knowledgeStatus: 'confirmed' },
  { roleId: "preacher", order: 4, note: "传教士选择一名玩家。如果选中了爪牙，则唤醒并告知他被传教士选中。", knowledgeStatus: 'confirmed' },
  { roleId: "poisoner", order: 5, note: "让投毒者选择一名玩家。标记那名玩家中毒。", knowledgeStatus: 'confirmed' },
  { roleId: "empath", order: 6, note: "给他展示数字手势来告诉他与他邻近的存活玩家有几人是邪恶的。", knowledgeStatus: 'confirmed' },
  { roleId: "fortuneteller", order: 7, note: "让占卜师选择两名玩家。如果其中有恶魔或“干扰项”，点头示意，否则摇头。", knowledgeStatus: 'confirmed' },
  { roleId: "grandmother", order: 8, note: "指向她的祖孙玩家，并展示该玩家的角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "steward", order: 9, note: "唤醒事务官，指向标记有“得知”的那名玩家。让事务官重新入睡。", knowledgeStatus: 'confirmed' },
  { roleId: "highpriestess", order: 10, note: "唤醒女祭司，指向一名玩家。让女祭司重新入睡。", knowledgeStatus: 'confirmed' },
  { roleId: "spy", order: 11, note: "将魔典展示给间谍，他想看多久就看多久。", knowledgeStatus: 'confirmed' },
]

export const yiYanHuanYanOtherNightOrder: readonly NightOrderEntry[] = [
  { roleId: "philosopher", order: 1, note: "哲学家可以选择一个角色。如果选择的角色不在场，将哲学家的角色标题替换成对应角色，并标记“是哲学家”，否则标记该角色对应的玩家醉酒。从现在开始，你需要以哲学家获得能力的那种角色的行动方式来唤醒哲学家。", knowledgeStatus: 'confirmed' },
  { roleId: "poppygrower", order: 2, note: "如果罂粟种植者死亡，安排恶魔和爪牙相认环节。", knowledgeStatus: 'confirmed' },
  { roleId: "preacher", order: 3, note: "传教士选择一名玩家。如果选中了爪牙，则唤醒并告知他被传教士选中。", knowledgeStatus: 'confirmed' },
  { roleId: "poisoner", order: 4, note: "让投毒者选择一名玩家。标记那名玩家中毒。", knowledgeStatus: 'confirmed' },
  { roleId: "nodashii", order: 5, note: "让诺-达鲺选择一名玩家。标记那名玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "vigormortis", order: 6, note: "让亡骨魔选择一名玩家。标记那名玩家死亡。如果该玩家是爪牙，标记该玩家保留能力，并标记与该玩家邻近的镇民玩家之一中毒。", knowledgeStatus: 'confirmed' },
  { roleId: "legion", order: 7, note: "由说书人决定，让哪一名玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "ojo", order: 8, note: "唤醒奥赫，让奥赫指向角色列表上的一个角色标记。如果被选择的角色在场，标记对应的玩家死亡。如果被选择的玩家不在场，改为说书人来选择任意一名玩家，标记那名玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "assassin", order: 9, note: "刺客可以选择一名玩家。如果他这么做了，标记那名玩家死亡，且刺客失去能力，之后的夜晚无需再唤醒刺客。", knowledgeStatus: 'confirmed' },
  { roleId: "farmer", order: 10, note: "如果农民在夜晚死去，则选择另一位善良玩家成为农民。唤醒这名玩家，并告知他成为了农民。", knowledgeStatus: 'confirmed' },
  { roleId: "grandmother", order: 11, note: "如果祖孙被恶魔杀死，祖母也会一同死亡。标记祖母死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "empath", order: 12, note: "给他展示数字手势来告诉他与他邻近的存活玩家有几人是邪恶的。", knowledgeStatus: 'confirmed' },
  { roleId: "fortuneteller", order: 13, note: "让占卜师选择两名玩家。如果其中有恶魔或“干扰项”，点头示意，否则摇头。", knowledgeStatus: 'confirmed' },
  { roleId: "oracle", order: 14, note: "给他展示数字手势来告诉他当前已死亡的玩家中有多少玩家是邪恶的。", knowledgeStatus: 'confirmed' },
  { roleId: "highpriestess", order: 15, note: "唤醒女祭司，指向一名玩家。让女祭司重新入睡。", knowledgeStatus: 'confirmed' },
  { roleId: "spy", order: 16, note: "将魔典展示给间谍，他想看多久就看多久。", knowledgeStatus: 'confirmed' },
]
