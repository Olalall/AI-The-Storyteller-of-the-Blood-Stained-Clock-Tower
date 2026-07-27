import type { NightOrderEntry } from '../../types'

export const jiMengTaXiangFirstNight: readonly NightOrderEntry[] = [
  { roleId: "kazali", order: 4, note: "唤醒卡扎力，让他选择玩家变成邪恶爪牙。", knowledgeStatus: 'confirmed' },
  { roleId: "villageidiot", order: 45, note: "让村夫指向一名玩家，根据对方的阵营，对他给出拇指向上或向下的手势。", knowledgeStatus: 'confirmed' },
  { roleId: "gudiao", order: 4800, note: "唤醒蛊雕，让其选择一个方向。将他的“中毒”标记移动至那个方向上的下一个存活玩家的角色标记旁。随后对他指向那名玩家，并展示“他是”提示标记和该玩家的角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "cerenovus", order: 5800, note: "让洗脑师选择一名玩家和一个善良角色。标记那名玩家疯狂。让洗脑师重新入睡。唤醒洗脑师的目标。对这名玩家展示“该角色的能力对你生效”信息标记，洗脑师角色标记，该玩家需要疯狂证明的角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "dianyuzhang", order: 6700, note: "唤醒典狱长，让其选择至多三名玩家。在这些玩家角色标记旁放置“囚禁”提示标记。", knowledgeStatus: 'confirmed' },
  { roleId: "empath", order: 7900, note: "给他展示数字手势来告诉他与他邻近的存活玩家有几人是邪恶的。", knowledgeStatus: 'confirmed' },
  { roleId: "nichen", order: 8200, note: "唤醒逆臣，让其选择一名玩家。在该玩家的角色标记旁放置“不共戴天”提示标记。", knowledgeStatus: 'confirmed' },
  { roleId: "dreamer", order: 8500, note: "让筑梦师指向一名玩家。对他展示善良和邪恶的角色标记各一个，其中一个是属于该玩家的角色。", knowledgeStatus: 'confirmed' },
  { roleId: "yinyangshi", order: 9200, note: "唤醒阴阳师，并对其展示两个善良角色，两个邪恶角色，共四个角色标记。其中正好只有两个角色在场。", knowledgeStatus: 'confirmed' },
  { roleId: "dianxiaoer", order: 9400, note: "唤醒店小二，对他指向标记有店小二的“熟客”和“醉酒”提示标记的这两名玩家。", knowledgeStatus: 'confirmed' },
  { roleId: "qintianjian", order: 12100, note: "唤醒钦天监，对其用拇指指向其左侧或右侧示意。如果两侧邪恶玩家与他距离相同，拇指朝下示意。", knowledgeStatus: 'confirmed' },
  { roleId: "yinluren", order: 12200, note: "唤醒引路人，让其选择两名玩家。以点头或摇头作为信息给出。", knowledgeStatus: 'confirmed' },
]

export const jiMengTaXiangOtherNight: readonly NightOrderEntry[] = [
  { roleId: "kazali", order: 32, note: "唤醒卡扎力，让他攻击一名玩家。", knowledgeStatus: 'confirmed' },
  { roleId: "villageidiot", order: 65, note: "让村夫指向一名玩家，根据对方的阵营，对他给出拇指向上或向下的手势。", knowledgeStatus: 'confirmed' },
  { roleId: "gudiao", order: 1500, note: "唤醒蛊雕，让其选择一个方向。将他的“中毒”标记移动至那个方向上的下一个存活玩家的角色标记旁。随后对他指向那名玩家，并展示“他是”提示标记和该玩家的角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "cerenovus", order: 2800, note: "让洗脑师选择一名玩家和一个善良角色。标记那名玩家疯狂。让洗脑师重新入睡。唤醒洗脑师的目标。对这名玩家展示“该角色的能力对你生效”信息标记，洗脑师角色标记，该玩家需要疯狂证明的角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "nichen", order: 3400, note: "如果逆臣或标记了“不共戴天”的玩家死于处决，唤醒两者之中的另一名玩家，告诉他变为邪恶阵营。", knowledgeStatus: 'confirmed' },
  { roleId: "exorcist", order: 4300, note: "让驱魔人选择一名玩家，不能是上一夜他选择过的玩家。让驱魔人重新入睡。如果驱魔人选中了恶魔：唤醒恶魔。展示“该角色的能力对你生效”信息标记和驱魔人角色标记。指向驱魔人玩家。", knowledgeStatus: 'confirmed' },
  { roleId: "hundun", order: 7900, note: "唤醒混沌。让混沌指向一名玩家。该玩家死亡，在他角色标记旁放置“死亡”提示标记（除非该玩家受到其他原因影响导致不会死亡）。让混沌重新入睡。\n如果混沌成功杀死了与自己邻近的一名镇民玩家，在魔典中央放置混沌的“善良中毒”提示标记。从现在起，所有玩家只要是善良阵营，就会处于中毒状态。在下一个黄昏开始时，移除混沌的“善良中毒”提示标记。", knowledgeStatus: 'confirmed' },
  { roleId: "dianyuzhang", order: 8300, note: "如果今天白天被处决的玩家标记有“囚禁”，则其他标记有囚禁的玩家死亡。否则，将其中一人标记为死亡。移除所有“囚禁”提示标记。唤醒典狱长，让其选择至多三名玩家。在这些玩家角色标记旁放置“囚禁”提示标记。", knowledgeStatus: 'confirmed' },
  { roleId: "jianning", order: 8400, note: "唤醒奸佞，让其选择一名玩家。如果白天奸佞未投票，改为让其选择两名玩家。标记他选择的玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "assassin", order: 8600, note: "刺客可以选择一名玩家。如果他这么做了，标记那名玩家死亡，且刺客失去能力，之后的夜晚无需再唤醒刺客。", knowledgeStatus: 'confirmed' },
  { roleId: "acrobat", order: 8900, note: "如果杂技演员左右两侧最近的存活善良玩家之一中毒或醉酒，杂技演员死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "geling", order: 9000, note: "如果歌伶在白天使用了能力，且恶魔成为了观众，标记歌伶死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "gossip", order: 9100, note: "如果白天的声明为真，会有一名玩家死亡，并由说书人来选择一名玩家，标记该玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "barber", order: 9600, note: "如果理发师今天死亡了，唤醒恶魔并展示“该角色的效果对你生效”信息标记和理发师角色标记。如果恶魔选择了两名玩家，将这两名玩家分别独自唤醒。对他们展示“你是”信息标记和他们的新角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "plaguedoctor", order: 10000, note: "当瘟疫医生死亡时，将一个不在场的爪牙角色标记放置在魔典左侧的正中位置，并用瘟疫医生的“说书人能力”标记标记该爪牙角色。如可能，在夜晚顺序表旁添加相应的夜晚标记用以提示。", knowledgeStatus: 'confirmed' },
  { roleId: "empath", order: 11000, note: "给他展示数字手势来告诉他与他邻近的存活玩家有几人是邪恶的。", knowledgeStatus: 'confirmed' },
  { roleId: "undertaker", order: 11300, note: "如果有玩家今天白天死于处决，唤醒送葬者并对他展示那名玩家的角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "dreamer", order: 11500, note: "让筑梦师指向一名玩家。对他展示善良和邪恶的角色标记各一个，其中一个是属于该玩家的角色。", knowledgeStatus: 'confirmed' },
  { roleId: "yinluren", order: 14600, note: "唤醒引路人，让其选择两名玩家。以点头或摇头作为信息给出。", knowledgeStatus: 'confirmed' },
]
