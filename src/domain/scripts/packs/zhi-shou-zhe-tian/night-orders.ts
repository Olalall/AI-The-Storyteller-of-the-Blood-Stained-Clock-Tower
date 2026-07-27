import type { NightOrderEntry } from '../../types'

export const zhiShouZheTianFirstNight: readonly NightOrderEntry[] = [
  { roleId: "philosopher", order: 2, note: "哲学家可以选择一个角色。如果选择的角色不在场，将哲学家的角色标题替换成对应角色，并标记“是哲学家”，否则标记该角色对应的玩家醉酒。从现在开始，你需要以哲学家获得能力的那种角色的行动方式来唤醒哲学家。", knowledgeStatus: 'confirmed' },
  { roleId: "lunatic", order: 7, note: "如果有七名或更多玩家，唤醒疯子：展示“他们是你的爪牙”信息标记。指向任意对应数量的玩家。展示“这些角色不在场”信息标记。展示三个善良角色。让疯子重新入睡。唤醒恶魔。展示“你是”信息标记和恶魔角色标记。展示“这名玩家是”信息标记和疯子角色标记，然后指向疯子玩家。", knowledgeStatus: 'confirmed' },
  { roleId: "sailor", order: 10, note: "让水手选择一名存活玩家。标记那名玩家或水手醉酒。", knowledgeStatus: 'confirmed' },
  { roleId: "lleech", order: 15, note: "寄生蛭指向一名玩家。放置寄生标记，那名玩家中毒。", knowledgeStatus: 'confirmed' },
  { roleId: "godfather", order: 21, note: "对他展示所有在场的外来者标记。", knowledgeStatus: 'confirmed' },
  { roleId: "devilsadvocate", order: 22, note: "让魔鬼代言人选择一名存活玩家。标记那名玩家处决不死。", knowledgeStatus: 'confirmed' },
  { roleId: "pukka", order: 28, note: "让普卡选择一名玩家。标记那名玩家中毒。", knowledgeStatus: 'confirmed' },
  { roleId: "damsel", order: 31, note: "唤醒所有爪牙，并告知他们场中有落难少女。", knowledgeStatus: 'confirmed' },
  { roleId: "knight", order: 42, note: "唤醒骑士，然后指向标记了“得知”的两名玩家。", knowledgeStatus: 'confirmed' },
  { roleId: "general", order: 49, note: "告诉将军你认为的答案。", knowledgeStatus: 'confirmed' },
  { roleId: "vizier", order: 54, note: "告诉所有玩家维齐尔在场，并指向维齐尔玩家。", knowledgeStatus: 'confirmed' },
]

export const zhiShouZheTianOtherNight: readonly NightOrderEntry[] = [
  { roleId: "philosopher", order: 2, note: "哲学家可以选择一个角色。如果选择的角色不在场，将哲学家的角色标题替换成对应角色，并标记“是哲学家”，否则标记该角色对应的玩家醉酒。从现在开始，你需要以哲学家获得能力的那种角色的行动方式来唤醒哲学家。", knowledgeStatus: 'confirmed' },
  { roleId: "sailor", order: 4, note: "让水手选择一名存活玩家。标记那名玩家或水手醉酒。", knowledgeStatus: 'confirmed' },
  { roleId: "innkeeper", order: 9, note: "让旅店老板选择两名玩家。标记这两名玩家不会死亡，并标记其中一人醉酒。", knowledgeStatus: 'confirmed' },
  { roleId: "gambler", order: 11, note: "让赌徒选择一名玩家和一个角色。如果赌徒猜错了，标记赌徒死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "devilsadvocate", order: 14, note: "让魔鬼代言人选择一名存活玩家，不能是上一夜他选择过的玩家。标记那名玩家处决不死。", knowledgeStatus: 'confirmed' },
  { roleId: "lunatic", order: 21, note: "做任何需要做的事情来模拟一位恶魔的行动。让疯子重新入睡。唤醒恶魔。对恶魔展示疯子角色标记，并指向疯子玩家，随后是疯子的攻击目标。", knowledgeStatus: 'confirmed' },
  { roleId: "pukka", order: 26, note: "让普卡选择一名玩家。标记那名玩家中毒。【圆】上一个因普卡中毒的玩家死亡，随后恢复健康。", knowledgeStatus: 'confirmed' },
  { roleId: "nodashii", order: 30, note: "让诺-达鲺选择一名玩家。标记那名玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "alhadikhia", order: 33, note: "哈迪寂亚选择三名玩家。对所有人宣告第一位玩家，然后唤醒他并让他秘密选择活着还是死去。依次对第二第三位玩家如此做。如果三名玩家都选择活着，他们都死去。", knowledgeStatus: 'confirmed' },
  { roleId: "lleech", order: 35, note: "寄生蛭指向一名玩家。那名玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "godfather", order: 38, note: "如果有外来者在今天白天死亡，让教父选择一名玩家。标记那名玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "farmer", order: 46, note: "如果农民在夜晚死去，则选择另一位善良玩家成为农民。唤醒这名玩家，并告知他成为了农民。", knowledgeStatus: 'confirmed' },
  { roleId: "gossip", order: 47, note: "如果白天的声明为真，会有一名玩家死亡，并由说书人来选择一名玩家，标记该玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "moonchild", order: 49, note: "如果月之子在白天触发了死亡能力并选择了一名善良玩家，该玩家死亡。标记那名玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "damsel", order: 52, note: "如果被巡山人选中，唤醒并为其展示新角色。", knowledgeStatus: 'confirmed' },
  { roleId: "flowergirl", order: 58, note: "对她点头或摇头来示意今天白天是否有恶魔投过票。", knowledgeStatus: 'confirmed' },
  { roleId: "general", order: 69, note: "告诉将军你认为的答案。", knowledgeStatus: 'confirmed' },
]
