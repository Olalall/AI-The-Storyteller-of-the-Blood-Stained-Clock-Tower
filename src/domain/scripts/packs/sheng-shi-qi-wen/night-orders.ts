import type { NightOrderEntry } from '../../types'

export const shengShiQiWenFirstNight: readonly NightOrderEntry[] = [
  { roleId: "qianke", order: 4, note: "唤醒车夫，让他指向两名存活玩家。在这些玩家的角色标记旁放置“熟客”提示标记。", knowledgeStatus: 'confirmed' },
  { roleId: "heshang", order: 5, note: "唤醒和尚，让其选择一名玩家。在该玩家的角色标记旁放置“保护”提示标记。", knowledgeStatus: 'confirmed' },
  { roleId: "shusheng", order: 7, note: "唤醒恶魔，并对他展示“该角色的能力对你触发”提示标记与书生角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "xizi", order: 12, note: "唤醒所有戏子，让他们互相确认。如有必要，对他们展示“你是”提示标记和戏子角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "niangjiushi", order: 18, note: "唤醒酿酒师，让其选择一个角色并给出该角色对应的信息形式。如果该角色在场，在对应的角色标记旁放置“微醺”提示标记。如有必要，记录下该信息形式作为备忘，但不要将这一信息展示给任何能查看魔典的玩家。", knowledgeStatus: 'confirmed' },
  { roleId: "panguan", order: 27, note: "唤醒判官，并对其展示关键词。", knowledgeStatus: 'confirmed' },
  { roleId: "dianyuzhang", order: 31, note: "唤醒典狱长，让其选择至多三名玩家。在这些玩家角色标记旁放置“囚禁”提示标记。", knowledgeStatus: 'confirmed' },
  { roleId: "langzhong", order: 35, note: "唤醒郎中，让其指向一名玩家。以不会被其他玩家察觉的形式对其提供与该玩家角色能力相关的一个词语。", knowledgeStatus: 'confirmed' },
  { roleId: "yinyangshi", order: 43, note: "唤醒阴阳师，并对其展示两个善良角色，两个邪恶角色，共四个角色标记。其中正好只有两个角色在场。", knowledgeStatus: 'confirmed' },
  { roleId: "dianxiaoer", order: 44, note: "唤醒店小二，对他指向标记有店小二的“熟客”和“醉酒”提示标记的这两名玩家。", knowledgeStatus: 'confirmed' },
  { roleId: "zhanxingzhe", order: 49, note: "唤醒占星者，对其用拇指指向其左侧或右侧示意。如果两侧邪恶玩家与他距离相同，拇指朝下示意。", knowledgeStatus: 'confirmed' },
]

export const shengShiQiWenOtherNight: readonly NightOrderEntry[] = [
  { roleId: "qianke", order: 2, note: "移除上个夜晚放置的“熟客”标记。唤醒车夫，让他指向两名存活玩家。在这些玩家的角色标记旁放置“熟客”提示标记。", knowledgeStatus: 'confirmed' },
  { roleId: "heshang", order: 3, note: "移除上个夜晚的“保护”提示标记。唤醒和尚，让其选择一名玩家。在该玩家的角色标记旁放置“保护”提示标记。", knowledgeStatus: 'confirmed' },
  { roleId: "niangjiushi", order: 9, note: "唤醒酿酒师，让其选择一个角色并给出该角色对应的信息形式。如果该角色在场，在对应的角色标记旁放置“微醺”提示标记。如有必要，记录下该信息形式作为备忘，但不要将这一信息展示给任何能查看魔典的玩家。", knowledgeStatus: 'confirmed' },
  { roleId: "dagengren", order: 13, note: "唤醒打更人，并让其猜测距离，以数字手势给出。在这两名玩家的角色标记旁放置“警惕”提示标记。在当晚所有能造成死亡的角色行动完毕后，如果标记有“警惕”的玩家是当晚死亡的玩家中距离打更人最近的，那么这些玩家不会死亡。移除所有“警惕”标记。同时，如果说书人决定让打更人死亡，则在其角色标记旁放置“死亡”提示标记。", knowledgeStatus: 'confirmed' },
  { roleId: "rulianshi", order: 20, note: "如果白天入殓师提名了恶魔且恶魔被处决，唤醒他，并对他展示“你是”提示标记和恶魔角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "shusheng", order: 23, note: "如果白天恶魔成功猜中了书生是谁，唤醒那个恶魔，让其选择一名玩家。标记那名玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "shimengmo", order: 30, note: "唤醒食梦貘，让其选择一名玩家。标记那名玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "qiongqi", order: 31, note: "唤醒穷奇，让其选择一名玩家。标记那名玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "taowu", order: 32, note: "唤醒梼杌，让其选择一名玩家，并标记那名玩家死亡。如果梼杌成功杀死了一名外来者，让他再选择一名玩家，标记那名玩家死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "dianyuzhang", order: 33, note: "如果今天白天被处决的玩家标记有“囚禁”，则其他标记有囚禁的玩家死亡。否则，将其中一人标记为死亡。移除所有“囚禁”提示标记。唤醒典狱长，让其选择至多三名玩家。在这些玩家角色标记旁放置“囚禁”提示标记。", knowledgeStatus: 'confirmed' },
  { roleId: "fengshuishi", order: 54, note: "如果有超过两名死亡玩家，唤醒风水师。风水师要么摇头不使用能力，要么指向两名死亡玩家。对其点头或摇头示意，随后在其角色标记旁放置“失去能力”提示标记。", knowledgeStatus: 'confirmed' },
  { roleId: "tixingguan", order: 56, note: "如果提刑官在白天进行了整局游戏中他的首次提名，唤醒他并对他展示他提名的玩家的角色标记。", knowledgeStatus: 'confirmed' },
  { roleId: "langzhong", order: 61, note: "唤醒郎中，让其指向一名玩家。以不会被其他玩家察觉的形式对其提供与该玩家角色能力相关的一个词语。", knowledgeStatus: 'confirmed' },
  { roleId: "lingren", order: 62, note: "如果伶人在白天使用了能力，且恶魔成为了观众，标记伶人死亡。", knowledgeStatus: 'confirmed' },
  { roleId: "wushiren", order: 64, note: "唤醒舞狮人，对其展示一个在场的角色标记。", knowledgeStatus: 'confirmed' },
]
