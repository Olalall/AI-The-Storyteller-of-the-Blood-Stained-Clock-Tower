import type { NightOrderEntry } from '../../types'

export const shuoShuRenZhiNuFirstNight: readonly NightOrderEntry[] = [
  { roleId: "philosopher", order: 2, note: "哲学家可以选择一个角色。如果选择的角色不在场，将哲学家的角色标题替换成对应角色，并标记“是哲学家”，否则标记该角色对应的玩家醉酒。从现在开始，你需要以哲学家获得能力的那种角色的行动方式来唤醒哲学家。", knowledgeStatus: 'confirmed' },
  { roleId: "alchemist", order: 3, note: "展示给炼金术士一个不在场的角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "poppygrower", order: 4, note: "不要让恶魔和爪牙相认。", knowledgeStatus: 'confirmed' },
  { roleId: "lunatic", order: 7, note: "如果有七名或更多玩家，唤醒疯子：展示“他们是你的爪牙”信息标记。指向任意对应数量的玩家。展示“这些角色不在场”信息标记。展示三个善良角色。让疯子重新入睡。唤醒恶魔。展示“你是”信息标记和恶魔角色标记。展示“这名玩家是”信息标记和疯子角色标记，然后指向疯子玩家。", knowledgeStatus: 'confirmed' },
  { roleId: "marionette", order: 11, note: "选择一个邻近恶魔的善良玩家放置提线木偶标记。唤醒恶魔并告知他谁是提线木偶。", knowledgeStatus: 'confirmed' },
  { roleId: "amnesiac", order: 12, note: "决定失忆者的能力。如果失忆者的能力会让他在今晚醒来：唤醒他并执行其能力。", knowledgeStatus: 'confirmed' },
  { roleId: "lilmonsta", order: 16, note: "唤醒所有爪牙，允许他们以指向的方式决定谁照看小怪宝，但不能产生其他交流，否则会有非常糟糕的事情发生。", knowledgeStatus: 'confirmed' },
  { roleId: "snakecharmer", order: 20, note: "让舞蛇人选择一名玩家。如果舞蛇人选中了恶魔：展示“你是”信息标记和恶魔角色标记。用拇指向下代表他阵营变为邪恶。在魔典中交换舞蛇人和恶魔的角色标记。让原来的舞蛇人重新入睡。唤醒原来的恶魔。对老恶魔展示“你是”信息标记和舞蛇人角色标记，并用拇指向上代表他阵营变为善良。", knowledgeStatus: 'confirmed' },
  { roleId: "cerenovus", order: 25, note: "让洗脑师选择一名玩家和一个善良角色。标记那名玩家疯狂。让洗脑师重新入睡。唤醒洗脑师的目标。对这名玩家展示“该角色的能力对你生效”信息标记，洗脑师角色标记，该玩家需要疯狂证明的角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "mezepheles", order: 27, note: "告诉灵言师他的秘密词语。", knowledgeStatus: 'confirmed' },
  { roleId: "pixie", order: 29, note: "对小精灵展示一个在场的镇民角色。", knowledgeStatus: 'confirmed' },
  { roleId: "butler", order: 38, note: "让管家选择一名玩家。标记那名玩家为他的主人。", knowledgeStatus: 'confirmed' },
  { roleId: "bountyhunter", order: 45, note: "指向一名邪恶玩家。随后唤醒那名因赏金猎人而转变为邪恶的镇民，并告知他变成了邪恶阵营。", knowledgeStatus: 'confirmed' },
  { roleId: "mathematician", order: 51, note: "给他展示数字手势来告诉他在首个夜晚里有多少玩家的角色能力受他人影响而未正常生效。", knowledgeStatus: 'confirmed' },
]

export const shuoShuRenZhiNuOtherNight: readonly NightOrderEntry[] = [
  { roleId: "philosopher", order: 2, note: "哲学家可以选择一个角色。如果选择的角色不在场，将哲学家的角色标题替换成对应角色，并标记“是哲学家”，否则标记该角色对应的玩家醉酒。从现在开始，你需要以哲学家获得能力的那种角色的行动方式来唤醒哲学家。", knowledgeStatus: 'confirmed' },
  { roleId: "poppygrower", order: 3, note: "如果罂粟种植者死亡，安排恶魔和爪牙相认环节。", knowledgeStatus: 'confirmed' },
  { roleId: "amnesiac", order: 5, note: "如果失忆者的能力会让他在今晚醒来：唤醒他并执行其能力。", knowledgeStatus: 'confirmed' },
  { roleId: "snakecharmer", order: 12, note: "让舞蛇人选择一名玩家。如果舞蛇人选中了恶魔：展示“你是”信息标记和恶魔角色标记。用拇指向下代表他阵营变为邪恶。在魔典中交换舞蛇人和恶魔的角色标记。让原来的舞蛇人重新入睡。唤醒原来的恶魔。对老恶魔展示“你是”信息标记和舞蛇人角色标记，并用拇指向上代表他阵营变为善良。", knowledgeStatus: 'confirmed' },
  { roleId: "monk", order: 13, note: "让僧侣选择除自己外的一名玩家。标记那名玩家被保护。", knowledgeStatus: 'confirmed' },
  { roleId: "cerenovus", order: 16, note: "让洗脑师选择一名玩家和一个善良角色。标记那名玩家疯狂。让洗脑师重新入睡。唤醒洗脑师的目标。对这名玩家展示“该角色的能力对你生效”信息标记，洗脑师角色标记，该玩家需要疯狂证明的角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "pithag", order: 17, note: "让麻脸巫婆选择一名玩家和一个角色。如果她选择的角色不在场：让麻脸巫婆重新入睡。唤醒她的目标玩家。对该玩家展示“你是”信息标记和他的新角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "mezepheles", order: 19, note: "唤醒第一个说出灵言师词语的玩家并告知他已经变成邪恶阵营。", knowledgeStatus: 'confirmed' },
  { roleId: "lunatic", order: 21, note: "做任何需要做的事情来模拟一位恶魔的行动。让疯子重新入睡。唤醒恶魔。对恶魔展示疯子角色标记，并指向疯子玩家，随后是疯子的攻击目标。", knowledgeStatus: 'confirmed' },
  { roleId: "zombuul", order: 25, note: "如果今天白天没有人死亡，让僵怖选择一名玩家。标记那名玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "vortex", order: 31, note: "让涡流选择一名玩家。标记那名玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "legion", order: 34, note: "由说书人决定，让哪一名玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "lilmonsta", order: 36, note: "唤醒所有爪牙，允许他们以指向的方式决定谁照看小怪宝，但不能产生其他交流，否则会有非常糟糕的事情发生。说书人选择一名玩家，那名玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "butler", order: 55, note: "让管家选择一名玩家。标记那名玩家为他的主人。", knowledgeStatus: 'confirmed' },
  { roleId: "bountyhunter", order: 65, note: "如果赏金猎人知晓的邪恶玩家死亡，指向另一名邪恶玩家。", knowledgeStatus: 'confirmed' },
  { roleId: "mathematician", order: 71, note: "给他展示数字手势来告诉他从上个黎明到数学家醒来前有多少玩家的角色能力受他人影响而未正常生效。", knowledgeStatus: 'confirmed' },
]
