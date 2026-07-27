import type { NightOrderEntry } from '../../types'

export const miaoShanFengXianFirstNightOrder: readonly NightOrderEntry[] = [
  { roleId: "sailor", order: 1, note: "让水手选择一名存活玩家。标记那名玩家或水手醉酒。", knowledgeStatus: 'confirmed' },
  { roleId: "engineer", order: 2, note: "工程师选择不使用能力，或在剧本列表中选择恶魔或爪牙角色。如果他选择爪牙角色，则需要选择对应数量的爪牙。然后将这些玩家依次唤醒，并告知他们变成了什么角色。", knowledgeStatus: 'confirmed' },
  { roleId: "lleech", order: 3, note: "寄生蛭指向一名玩家。放置寄生标记，那名玩家中毒。", knowledgeStatus: 'confirmed' },
  { roleId: "harpy", order: 4, note: "唤醒鹰身女妖并让他依次指向两名玩家。标记第一名玩家“疯狂”，标记第二名玩家“第二名”。", knowledgeStatus: 'confirmed' },
  { roleId: "pixie", order: 5, note: "对小精灵展示一个在场的镇民角色。", knowledgeStatus: 'confirmed' },
  { roleId: "fortuneteller", order: 6, note: "让占卜师选择两名玩家。如果其中有恶魔或“干扰项”，点头示意，否则摇头。", knowledgeStatus: 'confirmed' },
  { roleId: "knight", order: 7, note: "唤醒骑士，然后指向标记了“得知”的两名玩家。", knowledgeStatus: 'confirmed' },
  { roleId: "seamstress", order: 8, note: "女裁缝可以选择除自己以外的两名玩家。如果她这么做了，对她点头或摇头示意这两名玩家是否为同一阵营，随后标记女裁缝失去能力。之后的夜晚无需再唤醒女裁缝。", knowledgeStatus: 'confirmed' },
  { roleId: "highpriestess", order: 9, note: "唤醒女祭司，指向一名玩家。让女祭司重新入睡。", knowledgeStatus: 'confirmed' },
  { roleId: "spy", order: 10, note: "将魔典展示给间谍，他想看多久就看多久。", knowledgeStatus: 'confirmed' },
  { roleId: "shugenja", order: 11, note: "唤醒修行者，对其用拇指指向其左侧或右侧示意。", knowledgeStatus: 'confirmed' },
  { roleId: "mathematician", order: 12, note: "给他展示数字手势来告诉他在首个夜晚里有多少玩家的角色能力受他人影响而未正常生效。", knowledgeStatus: 'confirmed' },
]

export const miaoShanFengXianOtherNightOrder: readonly NightOrderEntry[] = [
  { roleId: "sailor", order: 1, note: "让水手选择一名存活玩家。标记那名玩家或水手醉酒。", knowledgeStatus: 'confirmed' },
  { roleId: "engineer", order: 2, note: "工程师选择不使用能力，或在剧本列表中选择恶魔或爪牙角色。如果他选择爪牙角色，则需要选择对应数量的爪牙。然后将这些玩家依次唤醒，并告知他们变成了什么角色。", knowledgeStatus: 'confirmed' },
  { roleId: "monk", order: 3, note: "让僧侣选择除自己外的一名玩家。标记那名玩家被保护。", knowledgeStatus: 'confirmed' },
  { roleId: "harpy", order: 4, note: "唤醒鹰身女妖并让他依次指向两名玩家。标记第一名玩家“疯狂”，标记第二名玩家“第二名”。", knowledgeStatus: 'confirmed' },
  { roleId: "scarletwoman", order: 5, note: "如果红唇女郎今天变成了小恶魔，对她展示“你是”信息标记，和小恶魔角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "fanggu", order: 6, note: "让方古选择一名玩家。标记那名玩家死亡。如果他选择了外来者，且“首次”标记未放置在魔典中：用备用的方古角色标记替换那名外来者的角色标记。让方古重新入睡。唤醒方古的目标玩家。对该玩家展示“你是”信息标记和方古角色标记，并用拇指向下代表他阵营变为邪恶。将“首次”标记放置在魔典中。标记原本的方古玩家死亡，且他选择的玩家不会被标记为死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "vortox", order: 7, note: "让涡流选择一名玩家。标记那名玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "vigormortis", order: 8, note: "让亡骨魔选择一名玩家。标记那名玩家死亡。如果该玩家是爪牙，标记该玩家保留能力，并标记与该玩家邻近的镇民玩家之一中毒。", knowledgeStatus: 'confirmed' },
  { roleId: "lleech", order: 9, note: "寄生蛭指向一名玩家。那名玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "barber", order: 10, note: "如果理发师今天死亡了，唤醒恶魔并展示“该角色的效果对你生效”信息标记和理发师角色标记。如果恶魔选择了两名玩家，将这两名玩家分别独自唤醒。对他们展示“你是”信息标记和他们的新角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "fortuneteller", order: 11, note: "让占卜师选择两名玩家。如果其中有恶魔或“干扰项”，点头示意，否则摇头。", knowledgeStatus: 'confirmed' },
  { roleId: "oracle", order: 12, note: "给他展示数字手势来告诉他当前已死亡的玩家中有多少玩家是邪恶的。", knowledgeStatus: 'confirmed' },
  { roleId: "seamstress", order: 13, note: "女裁缝可以选择除自己以外的两名玩家。如果她这么做了，对她点头或摇头示意这两名玩家是否为同一阵营，随后标记女裁缝失去能力。之后的夜晚无需再唤醒女裁缝。", knowledgeStatus: 'confirmed' },
  { roleId: "highpriestess", order: 14, note: "唤醒女祭司，指向一名玩家。让女祭司重新入睡。", knowledgeStatus: 'confirmed' },
  { roleId: "spy", order: 15, note: "将魔典展示给间谍，他想看多久就看多久。", knowledgeStatus: 'confirmed' },
  { roleId: "mathematician", order: 16, note: "给他展示数字手势来告诉他从上个黎明到数学家醒来前有多少玩家的角色能力受他人影响而未正常生效。", knowledgeStatus: 'confirmed' },
]
