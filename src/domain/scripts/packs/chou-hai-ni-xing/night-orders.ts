import type { NightOrderEntry } from '../../types'

export const chouHaiNiXingFirstNightOrder: readonly NightOrderEntry[] = [
  { roleId: "amnesiac", order: 1, note: "决定失忆者的能力。如果失忆者的能力会让他在今晚醒来：唤醒他并执行其能力。", knowledgeStatus: 'confirmed' },
  { roleId: "damsel", order: 2, note: "唤醒所有爪牙，并告知他们场中有落难少女。", knowledgeStatus: 'confirmed' },
  { roleId: "lunatic", order: 3, note: "如果有七名或更多玩家，唤醒疯子：展示“他们是你的爪牙”信息标记。指向任意对应数量的玩家。展示“这些角色不在场”信息标记。展示三个善良角色。让疯子重新入睡。唤醒恶魔。展示“你是”信息标记和恶魔角色标记。展示“这名玩家是”信息标记和疯子角色标记，然后指向疯子玩家。", knowledgeStatus: 'confirmed' },
  { roleId: "marionette", order: 4, note: "选择一名邻近恶魔的善良玩家放置提线木偶标记。唤醒恶魔并告知他谁是提线木偶。", knowledgeStatus: 'confirmed' },
  { roleId: "courtier", order: 5, note: "侍臣可以选择一个角色。如果他这么做了，标记侍臣失去能力，标记被选择的角色所对应的玩家醉酒。之后的夜晚无需再唤醒侍臣。", knowledgeStatus: 'confirmed' },
  { roleId: "snakecharmer", order: 6, note: "让舞蛇人选择一名玩家。如果舞蛇人选中了恶魔：展示“你是”信息标记和恶魔角色标记。用拇指向下代表他阵营变为邪恶。在魔典中交换舞蛇人和恶魔的角色标记。让原来的舞蛇人重新入睡。唤醒原来的恶魔。对老恶魔展示“你是”信息标记和舞蛇人角色标记，并用拇指向上代表他阵营变为善良。", knowledgeStatus: 'confirmed' },
  { roleId: "cerenovus", order: 7, note: " 让洗脑师选择一名玩家和一个善良角色。标记那名玩家疯狂。让洗脑师重新入睡。唤醒洗脑师的目标。对这名玩家展示“该角色的能力对你生效”信息标记，洗脑师角色标记，该玩家需要疯狂证明的角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "librarian", order: 8, note: "展示那个外来者角色标记。指向被你标记“外来者”和“错误”的两名玩家。", knowledgeStatus: 'confirmed' },
  { roleId: "investigator", order: 9, note: "展示那个爪牙角色标记。指向被你标记“爪牙”和“错误”的两名玩家。", knowledgeStatus: 'confirmed' },
  { roleId: "empath", order: 10, note: "给他展示数字手势来告诉他与他邻近的存活玩家有几人是邪恶的。", knowledgeStatus: 'confirmed' },
  { roleId: "dreamer", order: 11, note: "让筑梦师指向一名玩家。对他展示善良和邪恶的角色标记各一个，其中一个是属于该玩家的角色。", knowledgeStatus: 'confirmed' },
  { roleId: "seamstress", order: 12, note: "女裁缝可以选择除自己以外的两名玩家。如果她这么做了，对她点头或摇头示意这两名玩家是否为同一阵营，随后标记女裁缝失去能力。之后的夜晚无需再唤醒女裁缝。", knowledgeStatus: 'confirmed' },
  { roleId: "balloonist", order: 13, note: "选择一种角色类型，并告知其一个符合该类型的玩家。在该玩家旁边标记已被知晓。", knowledgeStatus: 'confirmed' },
  { roleId: "leviathan", order: 14, note: "放置利维坦的第一天标记，宣告利维坦在场，现在是第一天。", knowledgeStatus: 'confirmed' },
]

export const chouHaiNiXingOtherNightOrder: readonly NightOrderEntry[] = [
  { roleId: "amnesiac", order: 1, note: "如果失忆者的能力会让他在今晚醒来：唤醒他并执行其能力。", knowledgeStatus: 'confirmed' },
  { roleId: "courtier", order: 2, note: "侍臣可以选择一个角色。如果他这么做了，标记侍臣失去能力，标记被选择的角色所对应的玩家醉酒。之后的夜晚无需再唤醒侍臣。", knowledgeStatus: 'confirmed' },
  { roleId: "snakecharmer", order: 3, note: "让舞蛇人选择一名玩家。如果舞蛇人选中了恶魔：展示“你是”信息标记和恶魔角色标记。用拇指向下代表他阵营变为邪恶。在魔典中交换舞蛇人和恶魔的角色标记。让原来的舞蛇人重新入睡。唤醒原来的恶魔。对老恶魔展示“你是”信息标记和舞蛇人角色标记，并用拇指向上代表他阵营变为善良。", knowledgeStatus: 'confirmed' },
  { roleId: "cerenovus", order: 4, note: "让洗脑师选择一名玩家和一个善良角色。标记那名玩家疯狂。让洗脑师重新入睡。唤醒洗脑师的目标。对这名玩家展示“该角色的能力对你生效”信息标记，洗脑师角色标记，该玩家需要疯狂证明的角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "pithag", order: 5, note: "让麻脸巫婆选择一名玩家和一个角色。如果她选择的角色不在场：让麻脸巫婆重新入睡。唤醒她的目标玩家。对该玩家展示“你是”信息标记和他的新角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "empath", order: 6, note: "给他展示数字手势来告诉他与他邻近的存活玩家有几人是邪恶的。", knowledgeStatus: 'confirmed' },
  { roleId: "dreamer", order: 7, note: "让筑梦师指向一名玩家。对他展示善良和邪恶的角色标记各一个，其中一个是属于该玩家的角色。", knowledgeStatus: 'confirmed' },
  { roleId: "towncrier", order: 8, note: "对他点头或摇头示意今天白天是否有爪牙发起过提名。", knowledgeStatus: 'confirmed' },
  { roleId: "seamstress", order: 9, note: "女裁缝可以选择除自己以外的两名玩家。如果她这么做了，对她点头或摇头示意这两名玩家是否为同一阵营，随后标记女裁缝失去能力。之后的夜晚无需再唤醒女裁缝。", knowledgeStatus: 'confirmed' },
  { roleId: "balloonist", order: 10, note: "选择一名角色类型与上一夜所示玩家不同的玩家，指给气球驾驶员；记录本夜所示玩家，供下一夜核对。", knowledgeStatus: 'confirmed' },
  { roleId: "leviathan", order: 11, note: "将利维坦的标记转换到下一天。", knowledgeStatus: 'confirmed' },
]
