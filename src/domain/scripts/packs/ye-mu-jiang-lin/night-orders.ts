import type { NightOrderEntry } from '../../types'

export const yeMuJiangLinFirstNightOrder: readonly NightOrderEntry[] = [
  { roleId: "alchemist", order: 1, note: "向炼金术士展示一个不在场爪牙的角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "godfather", order: 2, note: "对他展示所有在场的外来者标记。", knowledgeStatus: 'confirmed' },
  { roleId: "devilsadvocate", order: 3, note: "让魔鬼代言人选择一名存活玩家。标记那名玩家处决不死。", knowledgeStatus: 'confirmed' },
  { roleId: "washerwoman", order: 4, note: "展示那个镇民角色标记。指向被你标记“镇民”和“错误”的两名玩家。", knowledgeStatus: 'confirmed' },
  { roleId: "chef", order: 5, note: "给他展示数字手势来告诉他场上邻座邪恶玩家有多少对。", knowledgeStatus: 'confirmed' },
  { roleId: "fortuneteller", order: 6, note: "让占卜师选择两名玩家。如果其中有恶魔或“干扰项”，点头示意，否则摇头。", knowledgeStatus: 'confirmed' },
  { roleId: "seamstress", order: 7, note: "女裁缝可以选择除自己以外的两名玩家。如果她这么做了，对她点头或摇头示意这两名玩家是否为同一阵营，随后标记女裁缝失去能力。之后的夜晚无需再唤醒女裁缝。", knowledgeStatus: 'confirmed' },
]

export const yeMuJiangLinOtherNightOrder: readonly NightOrderEntry[] = [
  { roleId: "gambler", order: 1, note: "让赌徒选择一名玩家和一个角色。如果赌徒猜错了，标记赌徒死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "monk", order: 2, note: "让僧侣选择除自己外的一名玩家。标记那名玩家被保护。", knowledgeStatus: 'confirmed' },
  { roleId: "devilsadvocate", order: 3, note: "让魔鬼代言人选择一名存活玩家，不能是上一夜他选择过的玩家。标记那名玩家处决不死。", knowledgeStatus: 'confirmed' },
  { roleId: "scarletwoman", order: 4, note: "如果红唇女郎今天变成了小恶魔，对她展示“你是”信息标记，和小恶魔角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "imp", order: 5, note: "让小恶魔选择一名玩家。标记那名玩家死亡。如果小恶魔选择了自己：用一个备用的小恶魔标记替换一个存活的爪牙角色标记。让原来的小恶魔重新入睡。唤醒新的小恶魔。对他展示“你是”信息标记，和小恶魔角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "vortox", order: 6, note: "让涡流选择一名玩家。标记那名玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "assassin", order: 7, note: "刺客可以选择一名玩家。如果他这么做了，标记那名玩家死亡，且刺客失去能力，之后的夜晚无需再唤醒刺客。", knowledgeStatus: 'confirmed' },
  { roleId: "godfather", order: 8, note: "如果有外来者在今天白天死亡，让教父选择一名玩家。标记那名玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "ravenkeeper", order: 9, note: "如果守鸦人今晚死亡，唤醒他并让他选择一名玩家。对他展示那名玩家的角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "moonchild", order: 10, note: "如果月之子在白天触发了死亡能力并选择了一名善良玩家，该玩家死亡。标记那名玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "fortuneteller", order: 11, note: "让占卜师选择两名玩家。如果其中有恶魔或“干扰项”，点头示意，否则摇头。", knowledgeStatus: 'confirmed' },
  { roleId: "undertaker", order: 12, note: "如果有玩家今天白天死于处决，唤醒送葬者并对他展示那名玩家的角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "towncrier", order: 13, note: "对他点头或摇头示意今天白天是否有爪牙发起过提名。", knowledgeStatus: 'confirmed' },
  { roleId: "seamstress", order: 14, note: "女裁缝可以选择除自己以外的两名玩家。如果她这么做了，对她点头或摇头示意这两名玩家是否为同一阵营，随后标记女裁缝失去能力。之后的夜晚无需再唤醒女裁缝。", knowledgeStatus: 'confirmed' },
]
