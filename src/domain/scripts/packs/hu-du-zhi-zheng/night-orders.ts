import type { NightOrderEntry } from '../../types'

export const huDuZhiZhengFirstNightOrder: readonly NightOrderEntry[] = [
  { roleId: "snitch", order: 1, note: "分别给爪牙们展示三个不在场角色，这些信息之间，包括与展示给恶魔的不在场角色之间可能会有重叠。", knowledgeStatus: 'confirmed' },
  { roleId: "preacher", order: 2, note: "传教士选择一名玩家。如果选中了爪牙，则唤醒并告知他被传教士选中。", knowledgeStatus: 'confirmed' },
  { roleId: "lilmonsta", order: 3, note: "唤醒所有爪牙，允许他们以指向的方式决定谁照看小怪宝，但不能产生其他交流，否则会有非常糟糕的事情发生。", knowledgeStatus: 'confirmed' },
  { roleId: "gudiao", order: 4, note: "唤醒蛊雕，让其选择一个方向。将他的“中毒”标记移动至那个方向上的下一个存活玩家的角色标记旁。随后对他指向那名玩家，并展示“他是”提示标记和该玩家的角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "godfather", order: 5, note: "对他展示所有在场的外来者标记。", knowledgeStatus: 'confirmed' },
  { roleId: "witch", order: 6, note: "让女巫选择一名玩家。标记那名玩家被诅咒。", knowledgeStatus: 'confirmed' },
  { roleId: "chef", order: 7, note: "给他展示数字手势来告诉他场上邻座邪恶玩家有多少对。", knowledgeStatus: 'confirmed' },
  { roleId: "grandmother", order: 8, note: "指向她的孙子玩家，并展示该玩家的角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "yinyangshi", order: 9, note: "唤醒阴阳师，并对其展示两个善良角色，两个邪恶角色，共四个角色标记。其中正好只有两个角色在场。", knowledgeStatus: 'confirmed' },
  { roleId: "bountyhunter", order: 10, note: "指向一名邪恶玩家。随后唤醒那名因赏金猎人而转变为邪恶的镇民，并告知他变成了邪恶阵营。", knowledgeStatus: 'confirmed' },
  { roleId: "cultleader", order: 11, note: "如果异教领袖改变了阵营，告诉他。", knowledgeStatus: 'confirmed' },
  { roleId: "spy", order: 12, note: "将魔典展示给间谍，他想看多久就看多久。", knowledgeStatus: 'confirmed' },
]

export const huDuZhiZhengOtherNightOrder: readonly NightOrderEntry[] = [
  { roleId: "wudaozhe", order: 1, note: "", knowledgeStatus: 'confirmed' },
  { roleId: "preacher", order: 2, note: "传教士选择一名玩家。如果选中了爪牙，则唤醒并告知他被传教士选中。", knowledgeStatus: 'confirmed' },
  { roleId: "gudiao", order: 3, note: "唤醒蛊雕，让其选择一个方向。将他的“中毒”标记移动至那个方向上的下一个存活玩家的角色标记旁。随后对他指向那名玩家，并展示“他是”提示标记和该玩家的角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "witch", order: 4, note: "让女巫选择一名玩家。标记那名玩家被诅咒。", knowledgeStatus: 'confirmed' },
  { roleId: "lycanthrope", order: 5, note: "半兽人指向一名存活玩家：如果那名玩家善良，则立刻死去且当晚只有恶魔不会造成死亡，其他来源仍可造成死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "lilmonsta", order: 6, note: "唤醒所有爪牙，允许他们以指向的方式决定谁照看小怪宝，但不能产生其他交流，否则会有非常糟糕的事情发生。说书人选择一名玩家，那名玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "assassin", order: 7, note: "刺客可以选择一名玩家。如果他这么做了，标记那名玩家死亡，且刺客失去能力，之后的夜晚无需再唤醒刺客。", knowledgeStatus: 'confirmed' },
  { roleId: "godfather", order: 8, note: "如果有外来者在今天白天死亡，让教父选择一名玩家。标记那名玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "barber", order: 9, note: "如果理发师今天死亡了，唤醒恶魔并展示“该角色的效果对你生效”信息标记和理发师角色标记。如果恶魔选择了两名玩家，将这两名玩家分别独自唤醒。对他们展示“你是”信息标记和他们的新角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "gossip", order: 10, note: "如果白天的声明为真，会有一名玩家死亡，并由说书人来选择一名玩家，标记该玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "grandmother", order: 11, note: "如果孙子被恶魔杀死，祖母也会一同死亡。标记祖母死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "flowergirl", order: 12, note: "对她点头或摇头来示意今天白天是否有恶魔投过票。", knowledgeStatus: 'confirmed' },
  { roleId: "towncrier", order: 13, note: "对他点头或摇头示意今天白天是否有爪牙发起过提名。", knowledgeStatus: 'confirmed' },
  { roleId: "bountyhunter", order: 14, note: "如果赏金猎人知晓的邪恶玩家死亡，指向另一名邪恶玩家。", knowledgeStatus: 'confirmed' },
  { roleId: "cultleader", order: 15, note: "如果异教领袖改变了阵营，告诉他。", knowledgeStatus: 'confirmed' },
  { roleId: "spy", order: 16, note: "将魔典展示给间谍，他想看多久就看多久。", knowledgeStatus: 'confirmed' },
]
