import type { NightOrderEntry } from '../../types'

export const manTangHongFirstNight: readonly NightOrderEntry[] = [
  { roleId: "lilmonsta", order: 4400, note: "唤醒所有爪牙，允许他们以指向的方式决定谁照看小怪宝，但不能产生其他交流，否则会有非常糟糕的事情发生。", knowledgeStatus: 'confirmed' },
  { roleId: "niangjiushi", order: 4900, note: "唤醒酿酒师，让其选择一个角色并给出该角色对应的信息形式。如果该角色在场，在对应的角色标记旁放置“微醺”提示标记。如有必要，记录下该信息形式作为备忘，但不要将这一信息展示给任何能查看魔典的玩家。", knowledgeStatus: 'confirmed' },
  { roleId: "godfather", order: 5400, note: "对他展示所有在场的外来者标记。", knowledgeStatus: 'confirmed' },
  { roleId: "panguan", order: 6300, note: "唤醒判官，并对其展示关键词。", knowledgeStatus: 'confirmed' },
  { roleId: "chef", order: 7800, note: "给他展示数字手势来告诉他场上邻座邪恶玩家有多少对。", knowledgeStatus: 'confirmed' },
  { roleId: "noble", order: 8900, note: "以任意顺序指向三名玩家，其中一名邪恶。", knowledgeStatus: 'confirmed' },
]

export const manTangHongOtherNight: readonly NightOrderEntry[] = [
  { roleId: "niangjiushi", order: 1600, note: "唤醒酿酒师，让其选择一个角色并给出该角色对应的信息形式。如果该角色在场，在对应的角色标记旁放置“微醺”提示标记。如有必要，记录下该信息形式作为备忘，但不要将这一信息展示给任何能查看魔典的玩家。", knowledgeStatus: 'confirmed' },
  { roleId: "gambler", order: 2000, note: "让赌徒选择一名玩家和一个角色。如果赌徒猜错了，标记赌徒死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "pithag", order: 2900, note: "让麻脸巫婆选择一名玩家和一个角色。如果她选择的角色不在场：让麻脸巫婆重新入睡。唤醒她的目标玩家。对该玩家展示“你是”信息标记和他的新角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "rulianshi", order: 3800, note: "如果白天入殓师提名了恶魔且恶魔被处决，唤醒他，并对他展示“你是”提示标记和恶魔角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "imp", order: 4900, note: "让小恶魔选择一名玩家。标记那名玩家死亡。如果小恶魔选择了自己：用一个备用的小恶魔标记替换一个存活的爪牙角色标记。让原来的小恶魔重新入睡。唤醒新的小恶魔。对他展示“你是”信息标记，和小恶魔角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "lilmonsta", order: 7300, note: "唤醒所有爪牙，允许他们以指向的方式决定谁照看小怪宝，但不能产生其他交流，否则会有非常糟糕的事情发生。说书人选择一名玩家，那名玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "jianning", order: 8400, note: "唤醒奸佞，让其选择一名玩家。如果白天奸佞未投票，改为让其选择两名玩家。标记他选择的玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "assassin", order: 8600, note: "刺客可以选择一名玩家。如果他这么做了，标记那名玩家死亡，且刺客失去能力，之后的夜晚无需再唤醒刺客。", knowledgeStatus: 'confirmed' },
  { roleId: "godfather", order: 8700, note: "如果有外来者在今天白天死亡，让教父选择一名玩家。标记那名玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "gossip", order: 9100, note: "如果白天的声明为真，会有一名玩家死亡，并由说书人来选择一名玩家，标记该玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "tixingguan", order: 11400, note: "如果提刑官在白天进行了整局游戏中他的首次提名，唤醒他并对他展示他提名的玩家的角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "flowergirl", order: 11600, note: "对她点头或摇头来示意今天白天是否有恶魔投过票。", knowledgeStatus: 'confirmed' },
  { roleId: "towncrier", order: 11700, note: "对他点头或摇头示意今天白天是否有爪牙发起过提名。", knowledgeStatus: 'confirmed' },
]
