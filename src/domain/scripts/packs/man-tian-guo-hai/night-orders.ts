import type { NightOrderEntry } from '../../types'

export const manTianGuoHaiFirstNightOrder = [
  {"roleId": "marionette", "order": 11, "note": "选择一个邻近恶魔的善良玩家放置提线木偶标记。唤醒恶魔并告知他谁是提线木偶。", "knowledgeStatus": "confirmed"},
  {"roleId": "cerenovus", "order": 25, "note": "让洗脑师选择一名玩家和一个善良角色。标记那名玩家疯狂。让洗脑师重新入睡。唤醒洗脑师的目标。对这名玩家展示“该角色的能力对你生效”信息标记，洗脑师角色标记，该玩家需要疯狂证明的角色标记。", "knowledgeStatus": "confirmed"},
  {"roleId": "pixie", "order": 29, "note": "对小精灵展示一个在场的镇民角色。", "knowledgeStatus": "confirmed"},
  {"roleId": "huntsman", "order": 30, "note": "巡山人选择不使用能力，或指向一名玩家。如果他指向了落难少女，则为落难少女安排一个新的不在场镇民角色，将其唤醒并告知她新的角色。", "knowledgeStatus": "confirmed"},
  {"roleId": "damsel", "order": 31, "note": "唤醒所有爪牙，并告知他们场中有落难少女。", "knowledgeStatus": "confirmed"},
  {"roleId": "fortuneteller", "order": 37, "note": "让占卜师选择两名玩家。如果其中有恶魔或“干扰项”，点头示意，否则摇头。", "knowledgeStatus": "confirmed"},
  {"roleId": "seamstress", "order": 42, "note": "女裁缝可以选择除自己以外的两名玩家。如果她这么做了，对她点头或摇头示意这两名玩家是否为同一阵营，随后标记女裁缝失去能力。之后的夜晚无需再唤醒女裁缝。", "knowledgeStatus": "confirmed"},
  {"roleId": "noble", "order": 43, "note": "以任意顺序指向三名玩家，其中一名邪恶。", "knowledgeStatus": "confirmed"},
  {"roleId": "balloonist", "order": 44, "note": "选择一种角色类型，并告知其一个符合该类型的玩家。在该玩家旁边标记已被知晓。", "knowledgeStatus": "confirmed"},
  {"roleId": "mathematician", "order": 51, "note": "给他展示数字手势来告诉他在首个夜晚里有多少玩家的角色能力受他人影响而未正常生效。", "knowledgeStatus": "confirmed"},
] as const satisfies readonly NightOrderEntry[]

export const manTianGuoHaiOtherNightOrder = [
  {"roleId": "cerenovus", "order": 16, "note": "让洗脑师选择一名玩家和一个善良角色。标记那名玩家疯狂。让洗脑师重新入睡。唤醒洗脑师的目标。对这名玩家展示“该角色的能力对你生效”信息标记，洗脑师角色标记，该玩家需要疯狂证明的角色标记。", "knowledgeStatus": "confirmed"},
  {"roleId": "scarletwoman", "order": 20, "note": "如果红唇女郎今天变成了小恶魔，对她展示“你是”信息标记，和小恶魔角色标记。", "knowledgeStatus": "confirmed"},
  {"roleId": "imp", "order": 24, "note": "让小恶魔选择一名玩家。标记那名玩家死亡。如果小恶魔选择了自己：用一个备用的小恶魔标记替换一个存活的爪牙角色标记。让原来的小恶魔重新入睡。唤醒新的小恶魔。对他展示“你是”信息标记，和小恶魔角色标记。", "knowledgeStatus": "confirmed"},
  {"roleId": "fanggu", "order": 29, "note": "让方古选择一名玩家。标记那名玩家死亡。如果他选择了外来者，且“限一次”标记未放置在魔典中：用备用的方古角色标记替换那名外来者的角色标记。让方古重新入睡。唤醒方古的目标玩家。对该玩家展示“你是”信息标记和方古角色标记，并用拇指向下代表他阵营变为邪恶。将“首次”标记放置在魔典中。标记原本的方古玩家死亡，且他选择的玩家不会被标记为死亡。", "knowledgeStatus": "confirmed"},
  {"roleId": "nodashii", "order": 30, "note": "让诺-达鲺选择一名玩家。标记那名玩家死亡。", "knowledgeStatus": "confirmed"},
  {"roleId": "ravenkeeper", "order": 42, "note": "如果守鸦人今晚死亡，唤醒他并让他选择一名玩家。对他展示那名玩家的角色标记。", "knowledgeStatus": "confirmed"},
  {"roleId": "huntsman", "order": 51, "note": "巡山人选择不使用能力，或指向一名玩家。如果他指向了落难少女，则为落难少女安排一个新的不在场镇民角色，将其唤醒并告知她新的角色。", "knowledgeStatus": "confirmed"},
  {"roleId": "damsel", "order": 52, "note": "如果被巡山人选中，唤醒并为其展示新角色。", "knowledgeStatus": "confirmed"},
  {"roleId": "fortuneteller", "order": 54, "note": "让占卜师选择两名玩家。如果其中有恶魔或“干扰项”，点头示意，否则摇头。", "knowledgeStatus": "confirmed"},
  {"roleId": "oracle", "order": 60, "note": "给他展示数字手势来告诉他当前已死亡的玩家中有多少玩家是邪恶的。", "knowledgeStatus": "confirmed"},
  {"roleId": "seamstress", "order": 61, "note": "女裁缝可以选择除自己以外的两名玩家。如果她这么做了，对她点头或摇头示意这两名玩家是否为同一阵营，随后标记女裁缝失去能力。之后的夜晚无需再唤醒女裁缝。", "knowledgeStatus": "confirmed"},
  {"roleId": "balloonist", "order": 63, "note": "选择一名角色类型与上一夜所示玩家不同的玩家，指给气球驾驶员；记录本夜所示玩家，供下一夜核对。", "knowledgeStatus": "confirmed"},
  {"roleId": "mathematician", "order": 71, "note": "给他展示数字手势来告诉他从上个黎明到数学家醒来前有多少玩家的角色能力受他人影响而未正常生效。", "knowledgeStatus": "confirmed"},
] as const satisfies readonly NightOrderEntry[]
