import type { NightOrderEntry } from '../../types'

export const yinHeManBuFirstNight: readonly NightOrderEntry[] = [
  {"roleId": "poisoner", "order": 17, "knowledgeStatus": "confirmed", "note": "让投毒者选择一名玩家。标记那名玩家中毒。"},
  {"roleId": "widow", "order": 18, "knowledgeStatus": "confirmed", "note": "给寡妇展示魔典，她想看多久就看多久。等她看完后，让她指向一个玩家。那个玩家中毒。唤醒一名善良玩家，告诉他场上有寡妇。"},
  {"roleId": "godfather", "order": 21, "knowledgeStatus": "confirmed", "note": "对他展示所有在场的外来者标记。"},
  {"roleId": "witch", "order": 24, "knowledgeStatus": "confirmed", "note": "让女巫选择一名玩家。标记那名玩家被诅咒。"},
  {"roleId": "fortuneteller", "order": 37, "knowledgeStatus": "confirmed", "note": "让占卜师选择两名玩家。如果其中有恶魔或“干扰项”，点头示意，否则摇头。"},
  {"roleId": "grandmother", "order": 39, "knowledgeStatus": "confirmed", "note": "指向她的孙子玩家，并展示该玩家的角色标记。"},
  {"roleId": "seamstress", "order": 42, "knowledgeStatus": "confirmed", "note": "女裁缝可以选择除自己以外的两名玩家。如果她这么做了，对她点头或摇头示意这两名玩家是否为同一阵营，随后标记女裁缝失去能力。之后的夜晚无需再唤醒女裁缝。"},
  {"roleId": "noble", "order": 43, "knowledgeStatus": "confirmed", "note": "以任意顺序指向三名玩家，其中一名邪恶。"},
  {"roleId": "nightwatchman", "order": 46, "knowledgeStatus": "confirmed", "note": "守夜人可以指向一名玩家。如果他这么做，则唤醒那名玩家，告知其被守夜人选中，且告知他守夜人是谁。"},
  {"roleId": "mathematician", "order": 51, "knowledgeStatus": "confirmed", "note": "给他展示数字手势来告诉他在首个夜晚里有多少玩家的角色能力受他人影响而未正常生效。"},
]

export const yinHeManBuOtherNight: readonly NightOrderEntry[] = [
  {"roleId": "poisoner", "order": 8, "knowledgeStatus": "confirmed", "note": "让投毒者选择一名玩家。标记那名玩家中毒。"},
  {"roleId": "monk", "order": 13, "knowledgeStatus": "confirmed", "note": "让僧侣选择除自己外的一名玩家。标记那名玩家被保护。"},
  {"roleId": "witch", "order": 15, "knowledgeStatus": "confirmed", "note": "让女巫选择一名玩家。标记那名玩家被诅咒。"},
  {"roleId": "pithag", "order": 17, "knowledgeStatus": "confirmed", "note": "让麻脸巫婆选择一名玩家和一个角色。如果她选择的角色不在场：让麻脸巫婆重新入睡。唤醒她的目标玩家。对该玩家展示“你是”信息标记和他的新角色标记。"},
  {"roleId": "imp", "order": 24, "knowledgeStatus": "confirmed", "note": "让小恶魔选择一名玩家。标记那名玩家死亡。如果小恶魔选择了自己：用一个备用的小恶魔标记替换一个存活的爪牙角色标记。让原来的小恶魔重新入睡。唤醒新的小恶魔。对他展示“你是”信息标记，和小恶魔角色标记。"},
  {"roleId": "fanggu", "order": 29, "knowledgeStatus": "confirmed", "note": "让方古选择一名玩家。标记那名玩家死亡。如果他选择了外来者，且“限一次”标记未放置在魔典中：用备用的方古角色标记替换那名外来者的角色标记。让方古重新入睡。唤醒方古的目标玩家。对该玩家展示“你是”信息标记和方古角色标记，并用拇指向下代表他阵营变为邪恶。将“首次”标记放置在魔典中。标记原本的方古玩家死亡，且他选择的玩家不会被标记为死亡。"},
  {"roleId": "vigormortis", "order": 32, "knowledgeStatus": "confirmed", "note": "让亡骨魔选择一名玩家。标记那名玩家死亡。如果该玩家是爪牙，标记该玩家保留能力，并标记与该玩家邻近的镇民玩家之一中毒。"},
  {"roleId": "godfather", "order": 38, "knowledgeStatus": "confirmed", "note": "如果有外来者在今天白天死亡，让教父选择一名玩家。标记那名玩家死亡。"},
  {"roleId": "barber", "order": 40, "knowledgeStatus": "confirmed", "note": "如果理发师今天死亡了，唤醒恶魔并展示“该角色的效果对你生效”信息标记和理发师角色标记。如果恶魔选择了两名玩家，将这两名玩家分别独自唤醒。对他们展示“你是”信息标记和他们的新角色标记。"},
  {"roleId": "ravenkeeper", "order": 42, "knowledgeStatus": "confirmed", "note": "如果守鸦人今晚死亡，唤醒他并让他选择一名玩家。对他展示那名玩家的角色标记。"},
  {"roleId": "sage", "order": 43, "knowledgeStatus": "confirmed", "note": "如果恶魔杀死了贤者，唤醒贤者并指向两名玩家，其中一名玩家是杀死他的恶魔。"},
  {"roleId": "gossip", "order": 47, "knowledgeStatus": "confirmed", "note": "如果白天的声明为真，会有一名玩家死亡，并由说书人来选择一名玩家，标记该玩家死亡。"},
  {"roleId": "tinker", "order": 48, "knowledgeStatus": "confirmed", "note": "修补匠可能会死亡。如果说书人选择让修补匠死亡，放置死亡标记。"},
  {"roleId": "grandmother", "order": 50, "knowledgeStatus": "confirmed", "note": "如果孙子被恶魔杀死，祖母也会一同死亡。标记祖母死亡。"},
  {"roleId": "fortuneteller", "order": 54, "knowledgeStatus": "confirmed", "note": "让占卜师选择两名玩家。如果其中有恶魔或“干扰项”，点头示意，否则摇头。"},
  {"roleId": "oracle", "order": 60, "knowledgeStatus": "confirmed", "note": "给他展示数字手势来告诉他当前已死亡的玩家中有多少玩家是邪恶的。"},
  {"roleId": "seamstress", "order": 61, "knowledgeStatus": "confirmed", "note": "女裁缝可以选择除自己以外的两名玩家。如果她这么做了，对她点头或摇头示意这两名玩家是否为同一阵营，随后标记女裁缝失去能力。之后的夜晚无需再唤醒女裁缝。"},
  {"roleId": "nightwatchman", "order": 66, "knowledgeStatus": "confirmed", "note": "守夜人可以指向一名玩家。如果他这么做，则唤醒那名玩家，告知其被守夜人选中，且告知他守夜人是谁。"},
  {"roleId": "mathematician", "order": 71, "knowledgeStatus": "confirmed", "note": "给他展示数字手势来告诉他从上个黎明到数学家醒来前有多少玩家的角色能力受他人影响而未正常生效。"},
]
