import type { NightOrderEntry } from '../../types'

export const shengRiYanHuiFirstNightOrder = [
  {"roleId": "king", "order": 9, "note": "唤醒恶魔，并告诉他国王是谁。", "knowledgeStatus": "confirmed"},
  {"roleId": "sailor", "order": 10, "note": "让水手选择一名存活玩家。标记那名玩家或水手醉酒。", "knowledgeStatus": "confirmed"},
  {"roleId": "marionette", "order": 11, "note": "选择一个邻近恶魔的善良玩家放置提线木偶标记。唤醒恶魔并告知他谁是提线木偶。", "knowledgeStatus": "confirmed"},
  {"roleId": "lleech", "order": 15, "note": "寄生蛭指向一名玩家。放置寄生标记，那名玩家中毒。", "knowledgeStatus": "confirmed"},
  {"roleId": "courtier", "order": 19, "note": "侍臣可以选择一个角色。如果他这么做了，标记侍臣失去能力，标记被选择的角色所对应的玩家醉酒。之后的夜晚无需再唤醒侍臣。", "knowledgeStatus": "confirmed"},
  {"roleId": "godfather", "order": 21, "note": "对他展示所有在场的外来者标记。", "knowledgeStatus": "confirmed"},
  {"roleId": "devilsadvocate", "order": 22, "note": "让魔鬼代言人选择一名存活玩家。标记那名玩家处决不死。", "knowledgeStatus": "confirmed"},
  {"roleId": "cerenovus", "order": 25, "note": "让洗脑师选择一名玩家和一个善良角色。标记那名玩家疯狂。让洗脑师重新入睡。唤醒洗脑师的目标。对这名玩家展示“该角色的能力对你生效”信息标记，洗脑师角色标记，该玩家需要疯狂证明的角色标记。", "knowledgeStatus": "confirmed"},
  {"roleId": "chef", "order": 35, "note": "给他展示数字手势来告诉他场上邻座邪恶玩家有多少对。", "knowledgeStatus": "confirmed"},
  {"roleId": "butler", "order": 38, "note": "让管家选择一名玩家。标记那名玩家为他的主人。提醒：流放表决不受主人限制，管家可自由参与表决。", "knowledgeStatus": "confirmed"},
  {"roleId": "noble", "order": 43, "note": "以任意顺序指向三名玩家，其中一名邪恶。", "knowledgeStatus": "confirmed"},
] as const satisfies readonly NightOrderEntry[]

export const shengRiYanHuiOtherNightOrder = [
  {"roleId": "sailor", "order": 4, "note": "让水手选择一名存活玩家。标记那名玩家或水手醉酒。", "knowledgeStatus": "confirmed"},
  {"roleId": "innkeeper", "order": 9, "note": "让旅店老板选择两名玩家。标记这两名玩家不会死亡，并标记其中一人醉酒。", "knowledgeStatus": "confirmed"},
  {"roleId": "courtier", "order": 10, "note": "侍臣可以选择一个角色。如果他这么做了，标记侍臣失去能力，标记被选择的角色所对应的玩家醉酒。之后的夜晚无需再唤醒侍臣。", "knowledgeStatus": "confirmed"},
  {"roleId": "gambler", "order": 11, "note": "让赌徒选择一名玩家和一个角色。如果赌徒猜错了，标记赌徒死亡。", "knowledgeStatus": "confirmed"},
  {"roleId": "devilsadvocate", "order": 14, "note": "让魔鬼代言人选择一名存活玩家，不能是上一夜他选择过的玩家。标记那名玩家处决不死。", "knowledgeStatus": "confirmed"},
  {"roleId": "cerenovus", "order": 16, "note": "让洗脑师选择一名玩家和一个善良角色。标记那名玩家疯狂。让洗脑师重新入睡。唤醒洗脑师的目标。对这名玩家展示“该角色的能力对你生效”信息标记，洗脑师角色标记，该玩家需要疯狂证明的角色标记。", "knowledgeStatus": "confirmed"},
  {"roleId": "imp", "order": 24, "note": "让小恶魔选择一名玩家。标记那名玩家死亡。如果小恶魔选择了自己：用一个备用的小恶魔标记替换一个存活的爪牙角色标记。让原来的小恶魔重新入睡。唤醒新的小恶魔。对他展示“你是”信息标记，和小恶魔角色标记。", "knowledgeStatus": "confirmed"},
  {"roleId": "fanggu", "order": 29, "note": "让方古选择一名玩家。标记那名玩家死亡。如果他选择了外来者，且“限一次”标记未放置在魔典中：用备用的方古角色标记替换那名外来者的角色标记。让方古重新入睡。唤醒方古的目标玩家。对该玩家展示“你是”信息标记和方古角色标记，并用拇指向下代表他阵营变为邪恶。将“首次”标记放置在魔典中。标记原本的方古玩家死亡，且他选择的玩家不会被标记为死亡。", "knowledgeStatus": "confirmed"},
  {"roleId": "vigormortis", "order": 32, "note": "让亡骨魔选择一名玩家。标记那名玩家死亡。如果该玩家是爪牙，标记该玩家保留能力，并标记与该玩家邻近的镇民玩家之一中毒。", "knowledgeStatus": "confirmed"},
  {"roleId": "lleech", "order": 35, "note": "寄生蛭指向一名玩家。那名玩家死亡。", "knowledgeStatus": "confirmed"},
  {"roleId": "godfather", "order": 38, "note": "如果有外来者在今天白天死亡，让教父选择一名玩家。标记那名玩家死亡。", "knowledgeStatus": "confirmed"},
  {"roleId": "acrobat", "order": 39, "note": "如果杂技演员左右两侧最近的存活善良玩家之一中毒或醉酒，杂技演员死亡。", "knowledgeStatus": "confirmed"},
  {"roleId": "sweetheart", "order": 41, "note": "如果心上人死亡，会有一名玩家立刻醉酒。如果你还没有让这件事情发生，那么现在为任意一位玩家放置醉酒标记。", "knowledgeStatus": "confirmed"},
  {"roleId": "choirboy", "order": 44, "note": "如果国王被恶魔杀死，将唱诗男孩唤醒并告诉他谁是那个杀死国王的恶魔。", "knowledgeStatus": "confirmed"},
  {"roleId": "butler", "order": 55, "note": "让管家选择一名玩家。标记那名玩家为他的主人。提醒：流放表决不受主人限制，管家可自由参与表决。", "knowledgeStatus": "confirmed"},
  {"roleId": "oracle", "order": 60, "note": "给他展示数字手势来告诉他当前已死亡的玩家中有多少玩家是邪恶的。", "knowledgeStatus": "confirmed"},
  {"roleId": "juggler", "order": 62, "note": "给他展示数字手势来告诉他他当天白天猜测正确的次数。", "knowledgeStatus": "confirmed"},
  {"roleId": "king", "order": 64, "note": "如果死亡玩家人数大于或等于存活玩家，唤醒国王并对其展示一个存活的角色标记。", "knowledgeStatus": "confirmed"},
] as const satisfies readonly NightOrderEntry[]
