import type { NightOrderEntry } from '../../types'

export const chuanQiZhiYeFirstNight: readonly NightOrderEntry[] = [
  { roleId: "pukka", order: 28, note: "让普卡选择一名玩家。标记那名玩家中毒。", knowledgeStatus: 'confirmed' },
  { roleId: "pixie", order: 29, note: "对小精灵展示一个在场的镇民角色。", knowledgeStatus: 'confirmed' },
  { roleId: "investigator", order: 34, note: "展示那个爪牙角色标记。指向被你标记“爪牙”和“错误”的两名玩家。", knowledgeStatus: 'confirmed' },
  { roleId: "seamstress", order: 42, note: "女裁缝可以选择除自己以外的两名玩家。如果她这么做了，对她点头或摇头示意这两名玩家是否为同一阵营，随后标记女裁缝失去能力。之后的夜晚无需再唤醒女裁缝。", knowledgeStatus: 'confirmed' },
  { roleId: "bountyhunter", order: 45, note: "指向一名邪恶玩家。随后唤醒那名因赏金猎人而转变为邪恶的镇民，并告知他变成了邪恶阵营。", knowledgeStatus: 'confirmed' },
  { roleId: "nightwatchman", order: 46, note: "守夜人可以指向一名玩家。如果他这么做，则唤醒那名玩家，告知其被守夜人选中，且告知他守夜人是谁。", knowledgeStatus: 'confirmed' },
]

export const chuanQiZhiYeOtherNight: readonly NightOrderEntry[] = [
  { roleId: "gambler", order: 11, note: "让赌徒选择一名玩家和一个角色。如果赌徒猜错了，标记赌徒死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "monk", order: 13, note: "让僧侣选择除自己外的一名玩家。标记那名玩家被保护。", knowledgeStatus: 'confirmed' },
  { roleId: "pithag", order: 17, note: "让麻脸巫婆选择一名玩家和一个角色。如果她选择的角色不在场：让麻脸巫婆重新入睡。唤醒她的目标玩家。对该玩家展示“你是”信息标记和他的新角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "scarletwoman", order: 20, note: "如果红唇女郎今天变成了小恶魔，对她展示“你是”信息标记，和小恶魔角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "exorcist", order: 22, note: "让驱魔人选择一名玩家，不能是上一夜他选择过的玩家。让驱魔人重新入睡。如果驱魔人选中了恶魔：唤醒恶魔。展示“该角色的能力对你生效”信息标记和驱魔人角色标记。指向驱魔人玩家。", knowledgeStatus: 'confirmed' },
  { roleId: "pukka", order: 26, note: "让普卡选择一名玩家。标记那名玩家中毒。【圆】上一个因普卡中毒的玩家死亡，随后恢复健康。", knowledgeStatus: 'confirmed' },
  { roleId: "po", order: 28, note: "珀可以选择一名玩家；或如果上一次他被唤醒时未做选择，让他选择三名玩家。标记这些玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "nodashii", order: 30, note: "让诺-达鲺选择一名玩家。标记那名玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "vigormortis", order: 32, note: "让亡骨魔选择一名玩家。标记那名玩家死亡。如果该玩家是爪牙，标记该玩家保留能力，并标记与该玩家邻近的镇民玩家之一中毒。", knowledgeStatus: 'confirmed' },
  { roleId: "assassin", order: 37, note: "刺客可以选择一名玩家。如果他这么做了，标记那名玩家死亡，且刺客失去能力，之后的夜晚无需再唤醒刺客。", knowledgeStatus: 'confirmed' },
  { roleId: "farmer", order: 46, note: "如果农民在夜晚死去，则选择另一位善良玩家成为农民。唤醒这名玩家，并告知他成为了农民。", knowledgeStatus: 'confirmed' },
  { roleId: "gossip", order: 47, note: "如果白天的声明为真，会有一名玩家死亡，并由说书人来选择一名玩家，标记该玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "undertaker", order: 56, note: "如果有玩家今天白天死于处决，唤醒送葬者并对他展示那名玩家的角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "towncrier", order: 59, note: "对他点头或摇头示意今天白天是否有爪牙发起过提名。", knowledgeStatus: 'confirmed' },
  { roleId: "seamstress", order: 61, note: "女裁缝可以选择除自己以外的两名玩家。如果她这么做了，对她点头或摇头示意这两名玩家是否为同一阵营，随后标记女裁缝失去能力。之后的夜晚无需再唤醒女裁缝。", knowledgeStatus: 'confirmed' },
  { roleId: "bountyhunter", order: 65, note: "如果赏金猎人知晓的邪恶玩家死亡，指向另一名邪恶玩家。", knowledgeStatus: 'confirmed' },
  { roleId: "nightwatchman", order: 66, note: "守夜人可以指向一名玩家。如果他这么做，则唤醒那名玩家，告知其被守夜人选中，且告知他守夜人是谁。", knowledgeStatus: 'confirmed' },
]
