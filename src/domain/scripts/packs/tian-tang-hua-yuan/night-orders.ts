import type { NightOrderEntry } from '../../types'

export const tianTangHuaYuanFirstNight: readonly NightOrderEntry[] = [
  { roleId: "philosopher", order: 2, note: "哲学家可以选择一个角色。如果选择的角色不在场，将哲学家的角色标题替换成对应角色，并标记“是哲学家”，否则标记该角色对应的玩家醉酒。从现在开始，你需要以哲学家获得能力的那种角色的行动方式来唤醒哲学家。", knowledgeStatus: 'confirmed' },
  { roleId: "king", order: 9, note: "唤醒恶魔，并告诉他国王是谁。", knowledgeStatus: 'confirmed' },
  { roleId: "marionette", order: 11, note: "选择一个邻近恶魔的善良玩家放置提线木偶标记。唤醒恶魔并告知他谁是提线木偶。", knowledgeStatus: 'confirmed' },
  { roleId: "witch", order: 24, note: "让女巫选择一名玩家。标记那名玩家被诅咒。", knowledgeStatus: 'confirmed' },
  { roleId: "pixie", order: 29, note: "对小精灵展示一个在场的镇民角色。", knowledgeStatus: 'confirmed' },
  { roleId: "empath", order: 36, note: "给他展示数字手势来告诉他与他邻近的存活玩家有几人是邪恶的。", knowledgeStatus: 'confirmed' },
  { roleId: "fortuneteller", order: 37, note: "让占卜师选择两名玩家。如果其中有恶魔或“干扰项”，点头示意，否则摇头。", knowledgeStatus: 'confirmed' },
  { roleId: "clockmaker", order: 40, note: "给他展示数字手势来告诉他恶魔与爪牙之间最近的距离。", knowledgeStatus: 'confirmed' },
  { roleId: "dreamer", order: 41, note: "让筑梦师指向一名玩家。对他展示善良和邪恶的角色标记各一个，其中一个是属于该玩家的角色。", knowledgeStatus: 'confirmed' },
  { roleId: "spy", order: 48, note: "将魔典展示给间谍，他想看多久就看多久。", knowledgeStatus: 'confirmed' },
  { roleId: "chambermaid", order: 50, note: "让侍女选择除自己外的两名存活玩家。给她展示数字手势来告诉她这些玩家中有几人因自身能力被唤醒。", knowledgeStatus: 'confirmed' },
  { roleId: "vizier", order: 54, note: "告诉所有玩家维齐尔在场，并指向维齐尔玩家。", knowledgeStatus: 'confirmed' },
]

export const tianTangHuaYuanOtherNight: readonly NightOrderEntry[] = [
  { roleId: "philosopher", order: 2, note: "哲学家可以选择一个角色。如果选择的角色不在场，将哲学家的角色标题替换成对应角色，并标记“是哲学家”，否则标记该角色对应的玩家醉酒。从现在开始，你需要以哲学家获得能力的那种角色的行动方式来唤醒哲学家。", knowledgeStatus: 'confirmed' },
  { roleId: "innkeeper", order: 9, note: "让旅店老板选择两名玩家。标记这两名玩家不会死亡，并标记其中一人醉酒。", knowledgeStatus: 'confirmed' },
  { roleId: "gambler", order: 11, note: "让赌徒选择一名玩家和一个角色。如果赌徒猜错了，标记赌徒死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "witch", order: 15, note: "让女巫选择一名玩家。标记那名玩家被诅咒。", knowledgeStatus: 'confirmed' },
  { roleId: "alhadikhia", order: 33, note: "哈迪寂亚选择三名玩家。对所有人宣告第一位玩家，然后唤醒他并让他秘密选择活着还是死去。依次对第二第三位玩家如此做。如果三名玩家都选择活着，他们都死去。", knowledgeStatus: 'confirmed' },
  { roleId: "barber", order: 40, note: "如果理发师今天死亡了，唤醒恶魔并展示“该角色的效果对你生效”信息标记和理发师角色标记。如果恶魔选择了两名玩家，将这两名玩家分别独自唤醒。对他们展示“你是”信息标记和他们的新角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "choirboy", order: 44, note: "如果国王被恶魔杀死，将唱诗男孩唤醒并告诉他谁是那个杀死国王的恶魔。", knowledgeStatus: 'confirmed' },
  { roleId: "empath", order: 53, note: "给他展示数字手势来告诉他与他邻近的存活玩家有几人是邪恶的。", knowledgeStatus: 'confirmed' },
  { roleId: "fortuneteller", order: 54, note: "让占卜师选择两名玩家。如果其中有恶魔或“干扰项”，点头示意，否则摇头。", knowledgeStatus: 'confirmed' },
  { roleId: "dreamer", order: 57, note: "让筑梦师指向一名玩家。对他展示善良和邪恶的角色标记各一个，其中一个是属于该玩家的角色。", knowledgeStatus: 'confirmed' },
  { roleId: "oracle", order: 60, note: "给他展示数字手势来告诉他当前已死亡的玩家中有多少玩家是邪恶的。", knowledgeStatus: 'confirmed' },
  { roleId: "king", order: 64, note: "如果死亡玩家人数大于或等于存活玩家，唤醒国王并对其展示一个存活的角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "spy", order: 68, note: "将魔典展示给间谍，他想看多久就看多久。", knowledgeStatus: 'confirmed' },
  { roleId: "chambermaid", order: 70, note: "让侍女选择除自己外的两名存活玩家。给她展示数字手势来告诉她这些玩家中有几人因自身能力被唤醒。", knowledgeStatus: 'confirmed' },
]
