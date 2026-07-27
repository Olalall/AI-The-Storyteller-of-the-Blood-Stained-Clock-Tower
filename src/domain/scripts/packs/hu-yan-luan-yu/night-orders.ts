import type { NightOrderEntry } from '../../types'

export const huYanLuanYuFirstNight: readonly NightOrderEntry[] = [
  { roleId: "yaggababble", order: 28, note: "唤醒牙噶巴卜，对他展示秘密短语，让牙嘎巴卜重新入睡。", knowledgeStatus: 'confirmed' },
  { roleId: "poppygrower", order: 700, note: "不要让恶魔和爪牙相认。", knowledgeStatus: 'confirmed' },
  { roleId: "lunatic", order: 2300, note: "如果有七名或更多玩家，唤醒疯子：展示“他们是你的爪牙”信息标记。指向任意对应数量的玩家。展示“这些角色不在场”信息标记。展示三个善良角色。让疯子重新入睡。唤醒恶魔。展示“你是”信息标记和恶魔角色标记。展示“这名玩家是”信息标记和疯子角色标记，然后指向疯子玩家。", knowledgeStatus: 'confirmed' },
  { roleId: "marionette", order: 3200, note: "选择一个邻近恶魔的善良玩家放置提线木偶标记。唤醒恶魔并告知他谁是提线木偶。", knowledgeStatus: 'confirmed' },
  { roleId: "courtier", order: 5100, note: "侍臣可以选择一个角色。如果他这么做了，标记侍臣失去能力，标记被选择的角色所对应的玩家醉酒。之后的夜晚无需再唤醒侍臣。", knowledgeStatus: 'confirmed' },
  { roleId: "cerenovus", order: 5800, note: "让洗脑师选择一名玩家和一个善良角色。标记那名玩家疯狂。让洗脑师重新入睡。唤醒洗脑师的目标。对这名玩家展示“该角色的能力对你生效”信息标记，洗脑师角色标记，该玩家需要疯狂证明的角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "dianyuzhang", order: 6700, note: "唤醒典狱长，让其选择至多三名玩家。在这些玩家角色标记旁放置“囚禁”提示标记。", knowledgeStatus: 'confirmed' },
  { roleId: "grandmother", order: 8300, note: "指向她的孙子玩家，并展示该玩家的角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "yinyangshi", order: 9200, note: "唤醒阴阳师，并对其展示两个善良角色，两个邪恶角色，共四个角色标记。其中正好只有两个角色在场。", knowledgeStatus: 'confirmed' },
  { roleId: "langzhong", order: 9300, note: "唤醒郎中，让其指向一名玩家。以不会被其他玩家察觉的形式对其提供与该玩家角色能力相关的一个词语。", knowledgeStatus: 'confirmed' },
  { roleId: "villageidiot", order: 10100, note: "在为首个夜晚做准备时，（如果有超过一名村夫在场，）将村夫的“醉酒”提示标记放置到其中一个村夫角色标记旁。", knowledgeStatus: 'confirmed' },
  { roleId: "highpriestess", order: 11900, note: "唤醒女祭司，指向一名玩家。让女祭司重新入睡。", knowledgeStatus: 'confirmed' },
  { roleId: "chambermaid", order: 12400, note: "让侍女选择除自己外的两名存活玩家。给她展示数字手势来告诉她这些玩家中有几人因自身能力被唤醒。", knowledgeStatus: 'confirmed' },
]

export const huYanLuanYuOtherNight: readonly NightOrderEntry[] = [
  { roleId: "yaggababble", order: 31, note: "根据已放置的提示标记数量，选择最多等同于该数量的玩家死亡。该夜晚行动只是一个提示，死亡的造成时机可以是白天，也可以是夜晚的任何时候。", knowledgeStatus: 'confirmed' },
  { roleId: "poppygrower", order: 900, note: "如果罂粟种植者死亡，安排恶魔和爪牙相认环节。", knowledgeStatus: 'confirmed' },
  { roleId: "courtier", order: 1900, note: "侍臣可以选择一个角色。如果他这么做了，标记侍臣失去能力，标记被选择的角色所对应的玩家醉酒。之后的夜晚无需再唤醒侍臣。", knowledgeStatus: 'confirmed' },
  { roleId: "gambler", order: 2000, note: "让赌徒选择一名玩家和一个角色。如果赌徒猜错了，标记赌徒死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "cerenovus", order: 2800, note: "让洗脑师选择一名玩家和一个善良角色。标记那名玩家疯狂。让洗脑师重新入睡。唤醒洗脑师的目标。对这名玩家展示“该角色的能力对你生效”信息标记，洗脑师角色标记，该玩家需要疯狂证明的角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "scarletwoman", order: 3700, note: "如果红唇女郎今天变成了小恶魔，对她展示“你是”信息标记，和小恶魔角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "lunatic", order: 4200, note: "做任何需要做的事情来模拟一位恶魔的行动。让疯子重新入睡。唤醒恶魔。对恶魔展示疯子角色标记，并指向疯子玩家，随后是疯子的攻击目标。", knowledgeStatus: 'confirmed' },
  { roleId: "fanggu", order: 5400, note: "让方古选择一名玩家。标记那名玩家死亡。如果他选择了外来者，且“限一次”标记未放置在魔典中：用备用的方古角色标记替换那名外来者的角色标记。让方古重新入睡。唤醒方古的目标玩家。对该玩家展示“你是”信息标记和方古角色标记，并用拇指向下代表他阵营变为邪恶。将“首次”标记放置在魔典中。标记原本的方古玩家死亡，且他选择的玩家不会被标记为死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "nodashii", order: 5500, note: "让诺-达鲺选择一名玩家。标记那名玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "dianyuzhang", order: 8300, note: "如果今天白天被处决的玩家标记有“囚禁”，则其他标记有囚禁的玩家死亡。否则，将其中一人标记为死亡。移除所有“囚禁”提示标记。唤醒典狱长，让其选择至多三名玩家。在这些玩家角色标记旁放置“囚禁”提示标记。", knowledgeStatus: 'confirmed' },
  { roleId: "yangguren", order: 8800, note: "如果有玩家被放置了“提名”标记，标记该玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "gossip", order: 9100, note: "如果白天的声明为真，会有一名玩家死亡，并由说书人来选择一名玩家，标记该玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "grandmother", order: 9500, note: "如果孙子被恶魔杀死，祖母也会一同死亡。标记祖母死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "langzhong", order: 12200, note: "唤醒郎中，让其指向一名玩家。以不会被其他玩家察觉的形式对其提供与该玩家角色能力相关的一个词语。", knowledgeStatus: 'confirmed' },
  { roleId: "villageidiot", order: 12800, note: "每个夜晚，唤醒任意一名村夫。让他指向一名玩家。对他给出拇指向上或向下的手势。让他重新入睡。重复这个操作，直到所有村夫玩家都进行了夜晚行动。", knowledgeStatus: 'confirmed' },
  { roleId: "highpriestess", order: 14500, note: "唤醒女祭司，指向一名玩家。让女祭司重新入睡。", knowledgeStatus: 'confirmed' },
  { roleId: "chambermaid", order: 14800, note: "让侍女选择除自己外的两名存活玩家。给她展示数字手势来告诉她这些玩家中有几人因自身能力被唤醒。", knowledgeStatus: 'confirmed' },
]
