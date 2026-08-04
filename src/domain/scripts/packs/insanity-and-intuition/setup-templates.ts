import type { PlayerCount, RoleId, SetupTemplate, SetupTemplateStyle } from '../../types'

const scriptId = 'insanity-and-intuition'

const fangGuOutsiderAdjustment = {
  ruleId: 'fanggu-outsider',
  choiceId: 'add-one-outsider',
  compositionDelta: { townsfolk: -1, outsider: 1 },
  note: '方古：+1 外来者，通常替换 1 名镇民。',
} as const

const vigormortisOutsiderAdjustment = {
  ruleId: 'vigormortis-outsider',
  choiceId: 'remove-one-outsider',
  compositionDelta: { townsfolk: 1, outsider: -1 },
  note: '亡骨魔：-1 外来者，通常增加 1 名镇民。',
} as const

type TemplateInput = {
  id: string
  count: PlayerCount
  style: SetupTemplateStyle
  roles: readonly RoleId[]
  bluffs: readonly RoleId[]
  note: string
  fangGuAddsOutsider?: boolean
  vigormortisRemovesOutsider?: boolean
}

function template(input: TemplateInput): SetupTemplate {
  return {
    templateId: `insanity-and-intuition-${input.count}-${input.id}`,
    scriptId,
    playerCount: input.count,
    style: input.style,
    roles: input.roles,
    bluffs: input.bluffs,
    setupAdjustments: [
      ...(input.fangGuAddsOutsider ? [fangGuOutsiderAdjustment] : []),
      ...(input.vigormortisRemovesOutsider ? [vigormortisOutsiderAdjustment] : []),
    ],
    notes: [input.note],
    verified: true,
  }
}

export const insanityAndIntuitionSetupTemplates: readonly SetupTemplate[] = [
  template({
    id: 'clear-seven',
    count: 7,
    style: 'beginner',
    roles: ['knight', 'shugenja', 'fortuneteller', 'preacher', 'mayor', 'poisoner', 'imp'],
    bluffs: ['pixie', 'general', 'oracle'],
    note: '七人清晰局，骑士和修行者给方向，投毒者保留干扰。',
  }),
  template({
    id: 'poppy-seven',
    count: 7,
    style: 'balanced',
    roles: ['pixie', 'general', 'towncrier', 'oracle', 'poppygrower', 'harpy', 'nodashii'],
    bluffs: ['knight', 'shugenja', 'highpriestess'],
    note: '罂粟种植者隐藏邪恶互认，诺-达鲺中毒只做状态提醒。',
  }),
  template({
    id: 'fanggu-seven',
    count: 7,
    style: 'chaos',
    roles: ['highpriestess', 'amnesiac', 'ravenkeeper', 'mayor', 'lunatic', 'cerenovus', 'fanggu'],
    bluffs: ['knight', 'pixie', 'shugenja'],
    note: '七人方古加一外来者，疯子假局面和跳转都由说书人确认。',
    fangGuAddsOutsider: true,
  }),
  template({
    id: 'standard-eight',
    count: 8,
    style: 'beginner',
    roles: ['knight', 'pixie', 'general', 'fortuneteller', 'ravenkeeper', 'puzzlemaster', 'poisoner', 'nodashii'],
    bluffs: ['shugenja', 'highpriestess', 'towncrier'],
    note: '八人标准局，解谜大师醉酒和诺-达鲺邻座毒分开记录。',
  }),
  template({
    id: 'vigor-eight',
    count: 8,
    style: 'long-game',
    roles: ['shugenja', 'highpriestess', 'preacher', 'towncrier', 'oracle', 'amnesiac', 'harpy', 'vigormortis'],
    bluffs: ['knight', 'pixie', 'general'],
    note: '亡骨魔减少外来者，鹰身女妖疯狂只提示不自动惩罚。',
    vigormortisRemovesOutsider: true,
  }),
  template({
    id: 'chaos-nine',
    count: 9,
    style: 'balanced',
    roles: ['pixie', 'shugenja', 'general', 'towncrier', 'mayor', 'mutant', 'lunatic', 'cerenovus', 'imp'],
    bluffs: ['knight', 'highpriestess', 'oracle'],
    note: '疯子和畸形秀演员同场，发言压力和信息真假都有。',
  }),
  template({
    id: 'fanggu-nine',
    count: 9,
    style: 'chaos',
    roles: ['knight', 'highpriestess', 'oracle', 'ravenkeeper', 'puzzlemaster', 'plaguedoctor', 'mutant', 'poisoner', 'fanggu'],
    bluffs: ['pixie', 'shugenja', 'general'],
    note: '方古三外来者局，瘟疫医生死亡后说书人能力单独记录。',
    fangGuAddsOutsider: true,
  }),
  template({
    id: 'no-outsider-ten',
    count: 10,
    style: 'beginner',
    roles: ['knight', 'pixie', 'shugenja', 'highpriestess', 'general', 'fortuneteller', 'mayor', 'poisoner', 'harpy', 'nodashii'],
    bluffs: ['preacher', 'towncrier', 'oracle'],
    note: '十人无外来者局，信息密度高但结构清楚。',
  }),
  template({
    id: 'poppy-ten',
    count: 10,
    style: 'bluff-heavy',
    roles: ['preacher', 'towncrier', 'oracle', 'amnesiac', 'ravenkeeper', 'poppygrower', 'mayor', 'cerenovus', 'boomdandy', 'imp'],
    bluffs: ['knight', 'pixie', 'shugenja'],
    note: '罂粟种植者加炸弹人，邪恶互认和处决风险都只提醒。',
  }),
  template({
    id: 'fanggu-ten',
    count: 10,
    style: 'chaos',
    roles: ['knight', 'pixie', 'general', 'preacher', 'oracle', 'poppygrower', 'lunatic', 'poisoner', 'harpy', 'fanggu'],
    bluffs: ['shugenja', 'highpriestess', 'towncrier'],
    note: '十人方古局，疯子信息和首次外来者跳转必须人工确认。',
    fangGuAddsOutsider: true,
  }),
  template({
    id: 'standard-eleven',
    count: 11,
    style: 'balanced',
    roles: ['knight', 'shugenja', 'highpriestess', 'fortuneteller', 'towncrier', 'ravenkeeper', 'mayor', 'puzzlemaster', 'poisoner', 'cerenovus', 'nodashii'],
    bluffs: ['pixie', 'general', 'preacher'],
    note: '十一人均衡局，洗脑师疯狂和解谜大师醉酒分开核对。',
  }),
  template({
    id: 'vigor-eleven',
    count: 11,
    style: 'long-game',
    roles: ['pixie', 'general', 'preacher', 'oracle', 'amnesiac', 'poppygrower', 'mayor', 'knight', 'harpy', 'boomdandy', 'vigormortis'],
    bluffs: ['shugenja', 'highpriestess', 'fortuneteller'],
    note: '亡骨魔无外来者长线局，炸弹人只做处决提醒。',
    vigormortisRemovesOutsider: true,
  }),
  template({
    id: 'balanced-twelve',
    count: 12,
    style: 'balanced',
    roles: ['knight', 'pixie', 'shugenja', 'general', 'fortuneteller', 'oracle', 'ravenkeeper', 'puzzlemaster', 'mutant', 'poisoner', 'harpy', 'imp'],
    bluffs: ['highpriestess', 'preacher', 'towncrier'],
    note: '十二人均衡局，信息、疯狂和投毒干扰都有但不失控。',
  }),
  template({
    id: 'poppy-plague-twelve',
    count: 12,
    style: 'bluff-heavy',
    roles: ['highpriestess', 'preacher', 'towncrier', 'amnesiac', 'poppygrower', 'mayor', 'knight', 'plaguedoctor', 'lunatic', 'cerenovus', 'boomdandy', 'nodashii'],
    bluffs: ['pixie', 'shugenja', 'general'],
    note: '罂粟、瘟疫医生、疯子同场，重点练信息交接和死亡后能力。',
  }),
  template({
    id: 'fanggu-twelve',
    count: 12,
    style: 'chaos',
    roles: ['pixie', 'shugenja', 'general', 'oracle', 'amnesiac', 'poppygrower', 'puzzlemaster', 'plaguedoctor', 'mutant', 'poisoner', 'cerenovus', 'fanggu'],
    bluffs: ['knight', 'highpriestess', 'preacher'],
    note: '十二人方古三外来者局，跳转、醉酒和瘟疫医生能力都需确认。',
    fangGuAddsOutsider: true,
  }),
  template({
    id: 'boom-thirteen',
    count: 13,
    style: 'balanced',
    roles: ['knight', 'pixie', 'shugenja', 'highpriestess', 'general', 'preacher', 'fortuneteller', 'towncrier', 'oracle', 'poisoner', 'harpy', 'boomdandy', 'nodashii'],
    bluffs: ['amnesiac', 'ravenkeeper', 'poppygrower'],
    note: '十三人无外来者，炸弹人和诺-达鲺制造白天/夜晚双压力。',
  }),
  template({
    id: 'mayor-thirteen',
    count: 13,
    style: 'long-game',
    roles: ['knight', 'general', 'preacher', 'oracle', 'amnesiac', 'ravenkeeper', 'poppygrower', 'mayor', 'shugenja', 'poisoner', 'cerenovus', 'boomdandy', 'imp'],
    bluffs: ['pixie', 'highpriestess', 'fortuneteller'],
    note: '镇长长局和罂粟种植者信息隐藏并存，适合熟手。',
  }),
  template({
    id: 'standard-fourteen',
    count: 14,
    style: 'balanced',
    roles: ['knight', 'pixie', 'shugenja', 'highpriestess', 'general', 'preacher', 'fortuneteller', 'towncrier', 'oracle', 'puzzlemaster', 'poisoner', 'harpy', 'cerenovus', 'nodashii'],
    bluffs: ['amnesiac', 'ravenkeeper', 'poppygrower'],
    note: '十四人标准局，解谜大师醉酒、洗脑和诺-达鲺中毒都分层记录。',
  }),
  template({
    id: 'vigor-fourteen',
    count: 14,
    style: 'long-game',
    roles: ['knight', 'pixie', 'shugenja', 'highpriestess', 'general', 'preacher', 'fortuneteller', 'towncrier', 'oracle', 'amnesiac', 'poisoner', 'cerenovus', 'boomdandy', 'vigormortis'],
    bluffs: ['ravenkeeper', 'poppygrower', 'mayor'],
    note: '十四人亡骨魔无外来者局，爪牙死亡后的能力链只做提醒。',
    vigormortisRemovesOutsider: true,
  }),
  template({
    id: 'balanced-fifteen',
    count: 15,
    style: 'balanced',
    roles: ['knight', 'pixie', 'shugenja', 'highpriestess', 'general', 'preacher', 'fortuneteller', 'towncrier', 'oracle', 'puzzlemaster', 'mutant', 'poisoner', 'harpy', 'cerenovus', 'imp'],
    bluffs: ['amnesiac', 'ravenkeeper', 'poppygrower'],
    note: '十五人标准局，白天疯狂和夜间信息都比较完整。',
  }),
  template({
    id: 'plague-fifteen',
    count: 15,
    style: 'bluff-heavy',
    roles: ['knight', 'pixie', 'shugenja', 'general', 'preacher', 'towncrier', 'amnesiac', 'poppygrower', 'mayor', 'plaguedoctor', 'lunatic', 'poisoner', 'cerenovus', 'boomdandy', 'nodashii'],
    bluffs: ['highpriestess', 'fortuneteller', 'oracle'],
    note: '十五人瘟疫医生和疯子局，适合练说书人能力和假信息。',
  }),
  template({
    id: 'fanggu-fifteen',
    count: 15,
    style: 'chaos',
    roles: ['pixie', 'shugenja', 'highpriestess', 'general', 'fortuneteller', 'oracle', 'ravenkeeper', 'poppygrower', 'puzzlemaster', 'plaguedoctor', 'mutant', 'poisoner', 'harpy', 'boomdandy', 'fanggu'],
    bluffs: ['knight', 'preacher', 'towncrier'],
    note: '十五人方古三外来者局，跳转、爆炸和瘟疫医生都只做待确认提醒。',
    fangGuAddsOutsider: true,
  }),
]
