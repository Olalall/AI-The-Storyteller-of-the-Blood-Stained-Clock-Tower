import type { NightOrderEntry } from '../../types'

export const guiJueYiXiangFirstNight: readonly NightOrderEntry[] = [
  { roleId: "hundun", order: 4, note: "如果混沌在场，注意不要唤醒爪牙和恶魔让他们互相认识。恶魔仍然能够得知自己的三个伪装。", knowledgeStatus: 'confirmed' },
  { roleId: "xionghaizi", order: 6, note: "唤醒熊孩子，让其选择一个善良角色。如果那个角色在场，在对应角色标记旁放置“捣蛋”提示标记。", knowledgeStatus: 'confirmed' },
  { roleId: "gudiao", order: 17, note: "唤醒蛊雕，让其选择一个方向。将他的“中毒”标记移动至那个方向上的下一个存活玩家的角色标记旁。随后对他指向那名玩家，并展示“他是”提示标记和该玩家的角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "niangjiushi", order: 18, note: "唤醒酿酒师，让其选择一个角色并给出该角色对应的信息形式。如果该角色在场，在对应的角色标记旁放置“微醺”提示标记。如有必要，记录下该信息形式作为备忘，但不要将这一信息展示给任何能查看魔典的玩家。", knowledgeStatus: 'confirmed' },
  { roleId: "dianyuzhang", order: 31, note: "唤醒典狱长，让其选择至多三名玩家。在这些玩家角色标记旁放置“囚禁”提示标记。", knowledgeStatus: 'confirmed' },
  { roleId: "langzhong", order: 35, note: "唤醒郎中，让其指向一名玩家。以不会被其他玩家察觉的形式对其提供与该玩家角色能力相关的一个词语。", knowledgeStatus: 'confirmed' },
  { roleId: "nichen", order: 38, note: "唤醒逆臣，让其选择一名玩家。在该玩家的角色标记旁放置“不共戴天”提示标记。", knowledgeStatus: 'confirmed' },
  { roleId: "yinyangshi", order: 43, note: "唤醒阴阳师，并对其展示两个善良角色，两个邪恶角色，共四个角色标记。其中正好只有两个角色在场。", knowledgeStatus: 'confirmed' },
  { roleId: "dianxiaoer", order: 44, note: "唤醒店小二，对他指向标记有店小二的“熟客”和“醉酒”提示标记的这两名玩家。", knowledgeStatus: 'confirmed' },
  { roleId: "xingjiaoshang", order: 47, note: "唤醒行脚商，让其选择一名玩家。将当前放置在该玩家角色标记旁的所有提示标记展示给他看。", knowledgeStatus: 'confirmed' },
  { roleId: "zhanxingzhe", order: 49, note: "唤醒占星者，对其用拇指指向其左侧或右侧示意。如果两侧邪恶玩家与他距离相同，拇指朝下示意。", knowledgeStatus: 'confirmed' },
]

export const guiJueYiXiangOtherNight: readonly NightOrderEntry[] = [
  { roleId: "nichen", order: 1, note: "如果逆臣或标记了“不共戴天”的玩家死于处决，唤醒两者之中的另一名玩家，告诉他变为邪恶阵营。", knowledgeStatus: 'confirmed' },
  { roleId: "wudaozhe", order: 1, note: "如果今天有爪牙死于处决，唤醒悟道者并告诉他变成了什么角色。", knowledgeStatus: 'confirmed' },
  { roleId: "xionghaizi", order: 5, note: "移除上个夜晚放置的“捣蛋”提示标记。唤醒熊孩子，让其选择一个善良角色。如果那个角色在场，在对应角色标记旁放置“捣蛋”提示标记。", knowledgeStatus: 'confirmed' },
  { roleId: "gudiao", order: 8, note: "唤醒蛊雕，让其选择一个方向。将他的“中毒”标记移动至那个方向上的下一个存活玩家的角色标记旁。随后对他指向那名玩家，并展示“他是”提示标记和该玩家的角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "niangjiushi", order: 9, note: "唤醒酿酒师，让其选择一个角色并给出该角色对应的信息形式。如果该角色在场，在对应的角色标记旁放置“微醺”提示标记。如有必要，记录下该信息形式作为备忘，但不要将这一信息展示给任何能查看魔典的玩家。", knowledgeStatus: 'confirmed' },
  { roleId: "dagengren", order: 13, note: "唤醒打更人，并让其猜测距离，以数字手势给出。在这两名玩家的角色标记旁放置“警惕”提示标记。在当晚所有能造成死亡的角色行动完毕后，如果标记有“警惕”的玩家是当晚死亡的玩家中距离打更人最近的，那么这些玩家不会死亡。移除所有“警惕”标记。同时，如果说书人决定让打更人死亡，则在其角色标记旁放置“死亡”提示标记。", knowledgeStatus: 'confirmed' },
  { roleId: "jinyiwei", order: 14, note: "移除上个夜晚放置的“保护”标记。唤醒锦衣卫，让其选择一名玩家。在该玩家角色标记旁放置“保护”提示标记。", knowledgeStatus: 'confirmed' },
  { roleId: "rulianshi", order: 20, note: "如果白天入殓师提名了恶魔且恶魔被处决，唤醒他，并对他展示“你是”提示标记和恶魔角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "daoshi", order: 22, note: "唤醒道士，让其选择一名玩家。如果他选中了恶魔，在他的角色标记旁放置“死亡”提示标记。", knowledgeStatus: 'confirmed' },
  { roleId: "jianning", order: 27, note: "唤醒奸佞，让其选择一名玩家。如果白天奸佞未被提名，改为让其选择两名玩家。标记他选择的玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "taotie", order: 28, note: "唤醒饕餮，让其选择任意数量的玩家。如果这些玩家的角色类型均不相同，标记这些玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "hundun", order: 32, note: "唤醒混沌，让他选择一名玩家，标记那名玩家死亡。如果混沌存活时有爪牙首次死亡，进行爪牙与恶魔的互认环节。", knowledgeStatus: 'confirmed' },
  { roleId: "dianyuzhang", order: 33, note: "如果今天白天被处决的玩家标记有“囚禁”，则其他标记有囚禁的玩家死亡。否则，将其中一人标记为死亡。移除所有“囚禁”提示标记。唤醒典狱长，让其选择至多三名玩家。在这些玩家角色标记旁放置“囚禁”提示标记。", knowledgeStatus: 'confirmed' },
  { roleId: "shaxing", order: 39, note: "如果天花病人死亡，将与其邻近的存活善良玩家之一标记为死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "langzhong", order: 61, note: "唤醒郎中，让其指向一名玩家。以不会被其他玩家察觉的形式对其提供与该玩家角色能力相关的一个词语。", knowledgeStatus: 'confirmed' },
  { roleId: "lingren", order: 62, note: "如果伶人在白天使用了能力，且恶魔成为了观众，标记伶人死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "wushiren", order: 64, note: "唤醒舞狮人，对其展示一个在场的角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "xingjiaoshang", order: 67, note: "唤醒行脚商，让其选择一名玩家。将当前放置在该玩家角色标记旁的所有提示标记展示给他看。", knowledgeStatus: 'confirmed' },
  { roleId: "fangshi", order: 69, note: "如果这是游戏的最后一夜（场上仅有三名玩家存活，或在其他特殊情况使得明天白天会成为游戏的最后一个白天时），唤醒方士，让他查看魔典，但只对他展示其中一半的内容。", knowledgeStatus: 'confirmed' },
]
