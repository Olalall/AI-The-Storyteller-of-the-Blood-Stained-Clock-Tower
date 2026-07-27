import type { NightOrderEntry } from '../../types'

export const lanXieJieQuFirstNightOrder = [
  {"roleId": "thief", "order": 1, "note": "窃贼指向一名玩家。将负票标记放在那名玩家旁。", "knowledgeStatus": "confirmed"},
  {"roleId": "bureaucrat", "order": 1, "note": "官员指向一名玩家。将三票标记放在那名玩家旁。", "knowledgeStatus": "confirmed"},
  {"roleId": "lunatic", "order": 7, "note": "如果有七名或更多玩家，唤醒疯子：展示“他们是你的爪牙”信息标记。指向任意对应数量的玩家。展示“这些角色不在场”信息标记。展示三个善良角色。让疯子重新入睡。唤醒恶魔。展示“你是”信息标记和恶魔角色标记。展示“这名玩家是”信息标记和疯子角色标记，然后指向疯子玩家。", "knowledgeStatus": "confirmed"},
  {"roleId": "marionette", "order": 11, "note": "选择一个邻近恶魔的善良玩家放置提线木偶标记。唤醒恶魔并告知他谁是提线木偶。", "knowledgeStatus": "confirmed"},
  {"roleId": "poisoner", "order": 17, "note": "让投毒者选择一名玩家。标记那名玩家中毒。", "knowledgeStatus": "confirmed"},
  {"roleId": "godfather", "order": 21, "note": "对他展示所有在场的外来者标记。", "knowledgeStatus": "confirmed"},
  {"roleId": "devilsadvocate", "order": 22, "note": "让魔鬼代言人选择一名存活玩家。标记那名玩家处决不死。", "knowledgeStatus": "confirmed"},
  {"roleId": "investigator", "order": 34, "note": "展示那个爪牙角色标记。指向被你标记“爪牙”和“错误”的两名玩家。", "knowledgeStatus": "confirmed"},
  {"roleId": "chef", "order": 35, "note": "给他展示数字手势来告诉他场上邻座邪恶玩家有多少对。", "knowledgeStatus": "confirmed"},
  {"roleId": "empath", "order": 36, "note": "给他展示数字手势来告诉他与他邻近的存活玩家有几人是邪恶的。", "knowledgeStatus": "confirmed"},
  {"roleId": "grandmother", "order": 39, "note": "指向她的孙子玩家，并展示该玩家的角色标记。", "knowledgeStatus": "confirmed"},
  {"roleId": "seamstress", "order": 42, "note": "女裁缝可以选择除自己以外的两名玩家。如果她这么做了，对她点头或摇头示意这两名玩家是否为同一阵营，随后标记女裁缝失去能力。之后的夜晚无需再唤醒女裁缝。", "knowledgeStatus": "confirmed"},
  {"roleId": "chambermaid", "order": 50, "note": "让侍女选择除自己外的两名存活玩家。给她展示数字手势来告诉她这些玩家中有几人因自身能力被唤醒。", "knowledgeStatus": "confirmed"},
] as const satisfies readonly NightOrderEntry[]

export const lanXieJieQuOtherNightOrder = [
  {"roleId": "thief", "order": 1, "note": "窃贼指向一名玩家。将负票标记放在那名玩家旁。", "knowledgeStatus": "confirmed"},
  {"roleId": "bureaucrat", "order": 1, "note": "官员指向一名玩家。将三票标记放在那名玩家旁。", "knowledgeStatus": "confirmed"},
  {"roleId": "poisoner", "order": 8, "note": "让投毒者选择一名玩家。标记那名玩家中毒。", "knowledgeStatus": "confirmed"},
  {"roleId": "monk", "order": 13, "note": "让僧侣选择除自己外的一名玩家。标记那名玩家被保护。", "knowledgeStatus": "confirmed"},
  {"roleId": "devilsadvocate", "order": 14, "note": "让魔鬼代言人选择一名存活玩家，不能是上一夜他选择过的玩家。标记那名玩家处决不死。", "knowledgeStatus": "confirmed"},
  {"roleId": "lunatic", "order": 21, "note": "做任何需要做的事情来模拟一位恶魔的行动。让疯子重新入睡。唤醒恶魔。对恶魔展示疯子角色标记，并指向疯子玩家，随后是疯子的攻击目标。", "knowledgeStatus": "confirmed"},
  {"roleId": "imp", "order": 24, "note": "让小恶魔选择一名玩家。标记那名玩家死亡。如果小恶魔选择了自己：用一个备用的小恶魔标记替换一个存活的爪牙角色标记。让原来的小恶魔重新入睡。唤醒新的小恶魔。对他展示“你是”信息标记，和小恶魔角色标记。", "knowledgeStatus": "confirmed"},
  {"roleId": "nodashii", "order": 30, "note": "让诺-达鲺选择一名玩家。标记那名玩家死亡。", "knowledgeStatus": "confirmed"},
  {"roleId": "vortox", "order": 31, "note": "让涡流选择一名玩家。标记那名玩家死亡。", "knowledgeStatus": "confirmed"},
  {"roleId": "vigormortis", "order": 32, "note": "让亡骨魔选择一名玩家。标记那名玩家死亡。如果该玩家是爪牙，标记该玩家保留能力，并标记与该玩家邻近的镇民玩家之一中毒。", "knowledgeStatus": "confirmed"},
  {"roleId": "godfather", "order": 38, "note": "如果有外来者在今天白天死亡，让教父选择一名玩家。标记那名玩家死亡。", "knowledgeStatus": "confirmed"},
  {"roleId": "barber", "order": 40, "note": "如果理发师今天死亡了，唤醒恶魔并展示“该角色的效果对你生效”信息标记和理发师角色标记。如果恶魔选择了两名玩家，将这两名玩家分别独自唤醒。对他们展示“你是”信息标记和他们的新角色标记。", "knowledgeStatus": "confirmed"},
  {"roleId": "ravenkeeper", "order": 42, "note": "如果守鸦人今晚死亡，唤醒他并让他选择一名玩家。对他展示那名玩家的角色标记。", "knowledgeStatus": "confirmed"},
  {"roleId": "gossip", "order": 47, "note": "如果白天的声明为真，会有一名玩家死亡，并由说书人来选择一名玩家，标记该玩家死亡。", "knowledgeStatus": "confirmed"},
  {"roleId": "grandmother", "order": 50, "note": "如果孙子被恶魔杀死，祖母也会一同死亡。标记祖母死亡。", "knowledgeStatus": "confirmed"},
  {"roleId": "empath", "order": 53, "note": "给他展示数字手势来告诉他与他邻近的存活玩家有几人是邪恶的。", "knowledgeStatus": "confirmed"},
  {"roleId": "towncrier", "order": 59, "note": "对他点头或摇头示意今天白天是否有爪牙发起过提名。", "knowledgeStatus": "confirmed"},
  {"roleId": "seamstress", "order": 61, "note": "女裁缝可以选择除自己以外的两名玩家。如果她这么做了，对她点头或摇头示意这两名玩家是否为同一阵营，随后标记女裁缝失去能力。之后的夜晚无需再唤醒女裁缝。", "knowledgeStatus": "confirmed"},
  {"roleId": "chambermaid", "order": 70, "note": "让侍女选择除自己外的两名存活玩家。给她展示数字手势来告诉她这些玩家中有几人因自身能力被唤醒。", "knowledgeStatus": "confirmed"},
] as const satisfies readonly NightOrderEntry[]
