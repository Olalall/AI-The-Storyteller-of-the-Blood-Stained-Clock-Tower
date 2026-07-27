import type { SetupRationale, SetupRuleSelection } from '../game-session/types'
import type { CatfishingSetupStyle } from './types'

export interface CatfishingCandidateSpec {
  id: string
  style: CatfishingSetupStyle
  title: string
  roles: readonly string[]
  demonBluffs: readonly string[]
  setupRuleSelections: readonly SetupRuleSelection[]
  bluffAdvice: readonly { roleId: string; reason: string; risk: string }[]
  rationale: Omit<SetupRationale, 'playerFit'> & { playerFit: string }
}

export const catfishingCandidateSpecs: readonly CatfishingCandidateSpec[] = [
  {
    id: 'catfishing-12-balanced-prototype',
    style: 'balanced',
    title: '耐玩均衡',
    roles: ['investigator', 'chef', 'balloonist', 'dreamer', 'fortuneteller', 'gambler', 'ravenkeeper', 'drunk', 'recluse', 'godfather', 'cerenovus', 'imp'],
    demonBluffs: ['grandmother', 'savant', 'philosopher'],
    setupRuleSelections: [
      { ruleId: 'balloonist-outsider', choiceId: 'add-outsider' },
      { ruleId: 'godfather-outsider', choiceId: 'remove-outsider' },
    ],
    bluffAdvice: [
      { roleId: 'grandmother', reason: '首夜信息叙事自然，容易建立可追问的公开故事。', risk: '需提前准备“得知谁与什么角色”的一致说法。' },
      { roleId: 'savant', reason: '每天可给两条信息，适合制造长期但可控的讨论线。', risk: '连续信息必须自洽，不能临场随意改口。' },
      { roleId: 'philosopher', reason: '一次性能力能解释中后期身份或信息变化。', risk: '使用时机和获得的能力容易被玩家追问。' },
    ],
    rationale: {
      summary: '信息来源分散，邪恶方有稳定干扰，双方都有持续调整空间。',
      pace: 'steady',
      playerFit: '调查员、厨师等低负担角色适合新手，筑梦师与洗脑师交给熟练座更稳妥。',
      risk: '信息角色较多；若邪恶方经验不足，善方可能较早形成可信信息链。',
    },
  },
  {
    id: 'catfishing-12-participation-prototype',
    style: 'participation',
    title: '全员参与',
    roles: ['grandmother', 'balloonist', 'snakecharmer', 'gambler', 'savant', 'philosopher', 'cannibal', 'fortuneteller', 'sweetheart', 'cerenovus', 'pithag', 'vigormortis'],
    demonBluffs: ['investigator', 'chef', 'dreamer'],
    setupRuleSelections: [{ ruleId: 'balloonist-outsider', choiceId: 'no-extra-outsider' }],
    bluffAdvice: [
      { roleId: 'investigator', reason: '首夜一次性信息，白天叙事短且清楚。', risk: '两名候选与爪牙说法需保持一致。' },
      { roleId: 'chef', reason: '单个数字便于说书人与恶魔方维持一致叙事。', risk: '座位关系被反复讨论时，数字容易被交叉验证。' },
      { roleId: 'dreamer', reason: '有持续选择，能让恶魔主动参与白天的信息编织。', risk: '每晚两张角色信息的逻辑负担较高。' },
    ],
    rationale: {
      summary: '多数角色会持续产生选择、公开讨论或死亡后价值，减少旁观感。',
      pace: 'long',
      playerFit: '新手可承担祖母、心上人等明确角色，熟练座处理哲学家、食人族与麻脸巫婆。',
      risk: '操作量最高，夜晚记录更密；多名复杂角色同时在场时容易拖慢主持节奏。',
    },
  },
  {
    id: 'catfishing-12-reversal-prototype',
    style: 'reversal',
    title: '戏剧反转',
    roles: ['investigator', 'dreamer', 'fortuneteller', 'snakecharmer', 'philosopher', 'ravenkeeper', 'lunatic', 'recluse', 'drunk', 'pithag', 'widow', 'fanggu'],
    demonBluffs: ['chef', 'grandmother', 'gambler'],
    setupRuleSelections: [],
    bluffAdvice: [
      { roleId: 'chef', reason: '用一个座位数字制造稳定、易理解的早期公开线。', risk: '数字与后续阵营站位讨论可能被反推。' },
      { roleId: 'grandmother', reason: '可围绕“亲属与身份”建立一条清晰的人际故事。', risk: '需要维持两名相关玩家的口径。' },
      { roleId: 'gambler', reason: '每夜猜测可解释主动发言和高风险信息。', risk: '猜错后的死亡叙事不能与场上死亡矛盾。' },
    ],
    rationale: {
      summary: '角色交换、身份错认与阵营转化形成明显的中后期反转窗口。',
      pace: 'swingy',
      playerFit: '调查员与守鸦人可交给新手，舞蛇人、失忆者、疯子和邪恶核心更适合熟练座。',
      risk: '波动最大；舞蛇人、疯子、方古与寡妇叠加时，新手可能难以还原信息。',
    },
  },
]
