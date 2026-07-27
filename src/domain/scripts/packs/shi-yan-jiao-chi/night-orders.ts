import type { NightOrderEntry } from '../../types'

export const shiYanJiaoChiFirstNightOrder: readonly NightOrderEntry[] = [
  { roleId: "summoner", order: 2210, note: "在首个夜晚，对召唤师展示三个不在场的善良角色，作为他的伪装。", knowledgeStatus: 'confirmed' },
  { roleId: "qianke", order: 4000, note: "唤醒掮客，让他指向两名存活玩家。如果这两名玩家阵营相同，在这些玩家的角色标记旁放置“熟客”提示标记。", knowledgeStatus: 'confirmed' },
  { roleId: "widow", order: 4700, note: "给寡妇展示魔典，她想看多久就看多久。等她看完后，让她指向一个玩家。那个玩家中毒。唤醒一名善良玩家，告诉他场上有寡妇。", knowledgeStatus: 'confirmed' },
  { roleId: "snakecharmer", order: 5200, note: "让舞蛇人选择一名玩家。如果舞蛇人选中了恶魔：展示“你是”信息标记和恶魔角色标记。用拇指向下代表他阵营变为邪恶。在魔典中交换舞蛇人和恶魔的角色标记。让原来的舞蛇人重新入睡。唤醒原来的?", knowledgeStatus: 'confirmed' },
  { roleId: "godfather", order: 5400, note: "对他展示所有在场的外来者标记。", knowledgeStatus: 'confirmed' },
  { roleId: "eviltwin", order: 5600, note: "唤醒镜像双子和他的对立双子，让他们进行眼神接触。对镜像双子展示对立双子的角色标记，并对对立双子展示镜像双子的角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "empath", order: 7900, note: "给他展示数字手势来告诉他与他邻近的存活玩家有几人是邪恶的。", knowledgeStatus: 'confirmed' },
  { roleId: "dreamer", order: 8500, note: "让筑梦师指向一名玩家。对他展示善良和邪恶的角色标记各一个，其中一个是属于该玩家的角色。", knowledgeStatus: 'confirmed' },
  { roleId: "steward", order: 8700, note: "唤醒事务官，指向标记有“得知”的那名玩家。让事务官重新入睡。", knowledgeStatus: 'confirmed' },
  { roleId: "ogre", order: 11750, note: "在首个夜晚，唤醒食人魔。让食人魔指向一名玩家。让食人魔重新入睡。如果食人魔指向了一名邪恶玩家，将食人魔的角色标记倒转放置，代表食人魔现在属于邪恶阵营。", knowledgeStatus: 'confirmed' },
  { roleId: "qintianjian", order: 12100, note: "唤醒钦天监，对其用拇指指向其左侧或右侧示意。如果两侧邪恶玩家与他距离相同，拇指朝下示意。", knowledgeStatus: 'confirmed' },
  { roleId: "yinluren", order: 12200, note: "唤醒引路人，让其选择至多三名玩家。以点头或摇头作为信息给出。", knowledgeStatus: 'confirmed' },
]

export const shiYanJiaoChiOtherNightOrder: readonly NightOrderEntry[] = [
  { roleId: "qianke", order: 1010, note: "移除上个夜晚放置的“熟客”标记。唤醒掮客，让他指向两名存活玩家。如果这两名玩家阵营相同，在这些玩家的角色标记旁放置“熟客”提示标记。", knowledgeStatus: 'confirmed' },
  { roleId: "snakecharmer", order: 2100, note: "让舞蛇人选择一名玩家。如果舞蛇人选中了恶魔：展示“你是”信息标记和恶魔角色标记。用拇指向下代表他阵营变为邪恶。在魔典中交换舞蛇人和恶魔的角色标记。让原来的舞蛇人重新入睡。唤醒原来的?", knowledgeStatus: 'confirmed' },
  { roleId: "monk", order: 2200, note: "让僧侣选择除自己外的一名玩家。标记那名玩家被保护。", knowledgeStatus: 'confirmed' },
  { roleId: "summoner", order: 3710, note: "在夜晚时，如果召唤师旁放置了“第三晚”提示标记，唤醒召唤师。让他指向一名玩家，和角色列表上的一个恶魔图标。让召唤师重新入睡。唤醒被召唤师选择的玩家。对他展示“你是”信息标记，和恶魔?", knowledgeStatus: 'confirmed' },
  { roleId: "nodashii", order: 5500, note: "让诺-达鲺选择一名玩家。标记那名玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "vortox", order: 5600, note: "让涡流选择一名玩家。标记那名玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "hundun", order: 7900, note: "唤醒混沌。让混沌指向一名玩家。该玩家死亡，在他角色标记旁放置“死亡”提示标记（除非该玩家受到其他原因影响导致不会死亡）。让混沌重新入睡。 如果混沌成功杀死了与自己邻近的一名镇民玩家?", knowledgeStatus: 'confirmed' },
  { roleId: "taotie", order: 8100, note: "唤醒饕餮，让其选择任意数量的玩家。如果这些玩家的角色类型均不相同，标记这些玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "godfather", order: 8700, note: "如果有外来者在今天白天死亡，让教父选择一名玩家。标记那名玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "acrobat", order: 8900, note: "如果杂技演员左右两侧最近的存活善良玩家之一中毒或醉酒，杂技演员死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "gossip", order: 9100, note: "如果白天的声明为真，会有一名玩家死亡，并由说书人来选择一名玩家，标记该玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "bingbi", order: 10310, note: "如果秉笔人在夜晚死去，唤醒他并指向一名邪恶玩家；如果秉笔在白天死去，唤醒他并指向一名善良玩家。随后让他重新入睡。", knowledgeStatus: 'confirmed' },
  { roleId: "ranfangfangzhu", order: 10700, note: "", knowledgeStatus: 'confirmed' },
  { roleId: "empath", order: 11000, note: "给他展示数字手势来告诉他与他邻近的存活玩家有几人是邪恶的。", knowledgeStatus: 'confirmed' },
  { roleId: "tixingguan", order: 11400, note: "如果提刑官在白天进行了整局游戏中他的首次提名，唤醒他并对他展示他提名的玩家的角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "dreamer", order: 11500, note: "让筑梦师指向一名玩家。对他展示善良和邪恶的角色标记各一个，其中一个是属于该玩家的角色。", knowledgeStatus: 'confirmed' },
  { roleId: "yinluren", order: 14600, note: "唤醒引路人，让其选择至多三名玩家。以点头或摇头作为信息给出。", knowledgeStatus: 'confirmed' },
]
