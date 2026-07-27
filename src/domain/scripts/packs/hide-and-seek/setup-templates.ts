import type { PlayerCount, RoleId, SetupAdjustment, SetupTemplate, SetupTemplateStyle } from '../../types'

const scriptId = 'hide-and-seek'

const huntsmanAddsDamselAdjustment = {
  ruleId: 'huntsman-adds-damsel',
  choiceId: 'add-damsel',
  compositionDelta: { townsfolk: -1, outsider: 1 },
  note: '猎人：+落难少女，通常替换 1 名镇民。',
} as const

const godfatherAddOutsiderAdjustment = {
  ruleId: 'godfather-outsider',
  choiceId: 'add-outsider',
  compositionDelta: { townsfolk: -1, outsider: 1 },
  note: '教父：+1 外来者，通常替换 1 名镇民。',
} as const

const godfatherRemoveOutsiderAdjustment = {
  ruleId: 'godfather-outsider',
  choiceId: 'remove-outsider',
  compositionDelta: { townsfolk: 1, outsider: -1 },
  note: '教父：-1 外来者，通常增加 1 名镇民。',
} as const

const vigormortisOutsiderAdjustment = {
  ruleId: 'vigormortis-outsider',
  choiceId: 'remove-outsider',
  compositionDelta: { townsfolk: 1, outsider: -1 },
  note: '维格莫提斯：-1 外来者，通常增加 1 名镇民。',
} as const

type TemplateInput = {
  id: string
  count: PlayerCount
  style: SetupTemplateStyle
  roles: readonly RoleId[]
  bluffs: readonly RoleId[]
  note: string
  huntsmanAddsDamsel?: boolean
  godfatherAddsOutsider?: boolean
  godfatherRemovesOutsider?: boolean
  vigormortisRemovesOutsider?: boolean
}

function template(input: TemplateInput): SetupTemplate {
  const setupAdjustments = adjustmentsFor(input)

  return {
    templateId: `${scriptId}-${input.count}-${input.id}`,
    scriptId,
    playerCount: input.count,
    style: input.style,
    roles: input.roles,
    bluffs: input.bluffs,
    setupAdjustments: setupAdjustments.length > 0 ? setupAdjustments : undefined,
    notes: [input.note],
    verified: true,
  }
}

function adjustmentsFor(input: TemplateInput): SetupAdjustment[] {
  const adjustments: SetupAdjustment[] = []
  if (input.huntsmanAddsDamsel) adjustments.push(huntsmanAddsDamselAdjustment)
  if (input.godfatherAddsOutsider) adjustments.push(godfatherAddOutsiderAdjustment)
  if (input.godfatherRemovesOutsider) adjustments.push(godfatherRemoveOutsiderAdjustment)
  if (input.vigormortisRemovesOutsider) adjustments.push(vigormortisOutsiderAdjustment)
  return adjustments
}

export const hideAndSeekSetupTemplates: readonly SetupTemplate[] = [
  template({ id: 'starter-clues', count: 7, style: 'beginner', roles: ['noble', 'librarian', 'towncrier', 'oracle', 'virgin', 'poisoner', 'imp'], bluffs: ['undertaker', 'dreamer', 'artist'], note: 'Hide & Seek 7 人新手模板：首夜信息清晰，邪恶方干扰简单。' }),
  template({ id: 'huntsman-damsel', count: 7, style: 'balanced', roles: ['pixie', 'dreamer', 'huntsman', 'ravenkeeper', 'damsel', 'cerenovus', 'pukka'], bluffs: ['noble', 'oracle', 'seamstress'], note: 'Hide & Seek 7 人猎人模板：落难少女在场，救援与疯狂链路只做提醒。', huntsmanAddsDamsel: true }),
  template({ id: 'godfather-ojo', count: 7, style: 'chaos', roles: ['undertaker', 'artist', 'seamstress', 'preacher', 'drunk', 'godfather', 'ojo'], bluffs: ['noble', 'librarian', 'dreamer'], note: 'Hide & Seek 7 人教父模板：奥赫目标是否在场由说书人核对。', godfatherAddsOutsider: true }),
  template({ id: 'mutant-speech', count: 8, style: 'balanced', roles: ['noble', 'librarian', 'oracle', 'dreamer', 'virgin', 'mutant', 'mezepheles', 'imp'], bluffs: ['pixie', 'towncrier', 'artist'], note: 'Hide & Seek 8 人均衡模板：畸形秀演员与灵言师提供白天话术压力。' }),
  template({ id: 'vigormortis-clean', count: 8, style: 'long-game', roles: ['noble', 'pixie', 'preacher', 'towncrier', 'seamstress', 'ravenkeeper', 'poisoner', 'vigormortis'], bluffs: ['librarian', 'undertaker', 'artist'], note: 'Hide & Seek 8 人维格莫提斯模板：无外来者，爪牙死亡后的中毒只做提醒。', vigormortisRemovesOutsider: true }),
  template({ id: 'two-outsiders', count: 9, style: 'balanced', roles: ['librarian', 'pixie', 'undertaker', 'dreamer', 'artist', 'damsel', 'goon', 'cerenovus', 'pukka'], bluffs: ['noble', 'towncrier', 'ravenkeeper'], note: 'Hide & Seek 9 人均衡模板：落难少女和莽夫都需要记录私密信息。' }),
  template({ id: 'godfather-remove', count: 9, style: 'long-game', roles: ['noble', 'preacher', 'towncrier', 'oracle', 'seamstress', 'virgin', 'drunk', 'godfather', 'imp'], bluffs: ['pixie', 'undertaker', 'artist'], note: 'Hide & Seek 9 人教父模板：减少外来者，邪恶更依赖信息污染。', godfatherRemovesOutsider: true }),
  template({ id: 'ten-information', count: 10, style: 'beginner', roles: ['noble', 'librarian', 'pixie', 'preacher', 'towncrier', 'undertaker', 'virgin', 'poisoner', 'cerenovus', 'imp'], bluffs: ['oracle', 'dreamer', 'artist'], note: 'Hide & Seek 10 人新手模板：信息与疯狂分工明确。' }),
  template({ id: 'ten-huntsman', count: 10, style: 'balanced', roles: ['noble', 'oracle', 'dreamer', 'seamstress', 'huntsman', 'ravenkeeper', 'damsel', 'mezepheles', 'poisoner', 'pukka'], bluffs: ['librarian', 'undertaker', 'artist'], note: 'Hide & Seek 10 人猎人模板：救援落难少女后只追加身份更正，不自动替换。', huntsmanAddsDamsel: true }),
  template({ id: 'ten-ojo', count: 10, style: 'chaos', roles: ['librarian', 'pixie', 'preacher', 'artist', 'virgin', 'ravenkeeper', 'mutant', 'godfather', 'cerenovus', 'ojo'], bluffs: ['noble', 'towncrier', 'dreamer'], note: 'Hide & Seek 10 人奥赫模板：教父增加外来者，奥赫选择角色后人工确认死亡。', godfatherAddsOutsider: true }),
  template({ id: 'eleven-social', count: 11, style: 'balanced', roles: ['noble', 'librarian', 'towncrier', 'oracle', 'undertaker', 'dreamer', 'artist', 'drunk', 'mezepheles', 'poisoner', 'imp'], bluffs: ['pixie', 'seamstress', 'ravenkeeper'], note: 'Hide & Seek 11 人均衡模板：灵言师暗号与酒鬼伪装拉长讨论。' }),
  template({ id: 'eleven-vigormortis', count: 11, style: 'long-game', roles: ['noble', 'pixie', 'preacher', 'towncrier', 'seamstress', 'artist', 'ravenkeeper', 'virgin', 'poisoner', 'cerenovus', 'vigormortis'], bluffs: ['librarian', 'oracle', 'dreamer'], note: 'Hide & Seek 11 人维格莫提斯模板：外来者减少，爪牙保留能力与邻座中毒需手动记录。', vigormortisRemovesOutsider: true }),
  template({ id: 'twelve-balanced', count: 12, style: 'balanced', roles: ['noble', 'librarian', 'pixie', 'dreamer', 'seamstress', 'artist', 'ravenkeeper', 'damsel', 'drunk', 'poisoner', 'cerenovus', 'pukka'], bluffs: ['preacher', 'towncrier', 'undertaker'], note: 'Hide & Seek 12 人均衡模板：信息角色多，落难少女信息不要外泄。' }),
  template({ id: 'twelve-godfather', count: 12, style: 'chaos', roles: ['noble', 'preacher', 'towncrier', 'oracle', 'undertaker', 'virgin', 'damsel', 'mutant', 'goon', 'godfather', 'mezepheles', 'ojo'], bluffs: ['librarian', 'pixie', 'artist'], note: 'Hide & Seek 12 人教父模板：三外来者和奥赫形成高压局，但死亡只做确认候选。', godfatherAddsOutsider: true }),
  template({ id: 'twelve-vigormortis', count: 12, style: 'long-game', roles: ['noble', 'librarian', 'pixie', 'preacher', 'towncrier', 'seamstress', 'artist', 'virgin', 'goon', 'mezepheles', 'poisoner', 'vigormortis'], bluffs: ['oracle', 'dreamer', 'ravenkeeper'], note: 'Hide & Seek 12 人维格莫提斯模板：莽夫阵营变化和邻座中毒必须分开记录。', vigormortisRemovesOutsider: true }),
  template({ id: 'thirteen-godfather', count: 13, style: 'balanced', roles: ['noble', 'librarian', 'pixie', 'preacher', 'towncrier', 'oracle', 'undertaker', 'dreamer', 'drunk', 'godfather', 'mezepheles', 'poisoner', 'imp'], bluffs: ['seamstress', 'artist', 'ravenkeeper'], note: 'Hide & Seek 13 人教父模板：额外外来者提供伪装空间，信息源仍分散。', godfatherAddsOutsider: true }),
  template({ id: 'thirteen-huntsman', count: 13, style: 'chaos', roles: ['librarian', 'seamstress', 'artist', 'huntsman', 'ravenkeeper', 'virgin', 'noble', 'damsel', 'mutant', 'godfather', 'poisoner', 'cerenovus', 'ojo'], bluffs: ['pixie', 'towncrier', 'oracle'], note: 'Hide & Seek 13 人猎人模板：双外来者和奥赫增加压力，救援成功要追加更正。', huntsmanAddsDamsel: true, godfatherAddsOutsider: true }),
  template({ id: 'fourteen-balanced', count: 14, style: 'balanced', roles: ['noble', 'librarian', 'pixie', 'preacher', 'towncrier', 'oracle', 'undertaker', 'dreamer', 'seamstress', 'drunk', 'mezepheles', 'poisoner', 'cerenovus', 'pukka'], bluffs: ['artist', 'ravenkeeper', 'virgin'], note: 'Hide & Seek 14 人均衡模板：三爪牙齐全但不含教父修正，适合长线推理。' }),
  template({ id: 'fourteen-ojo', count: 14, style: 'chaos', roles: ['noble', 'pixie', 'preacher', 'artist', 'seamstress', 'ravenkeeper', 'virgin', 'oracle', 'damsel', 'goon', 'godfather', 'mezepheles', 'cerenovus', 'ojo'], bluffs: ['librarian', 'towncrier', 'undertaker'], note: 'Hide & Seek 14 人奥赫模板：教父增加外来者，奥赫死亡目标不能自动选择。', godfatherAddsOutsider: true }),
  template({ id: 'fifteen-imp', count: 15, style: 'balanced', roles: ['noble', 'librarian', 'pixie', 'preacher', 'towncrier', 'oracle', 'undertaker', 'dreamer', 'seamstress', 'damsel', 'drunk', 'mezepheles', 'poisoner', 'cerenovus', 'imp'], bluffs: ['artist', 'ravenkeeper', 'virgin'], note: 'Hide & Seek 15 人均衡模板：三爪牙带落难少女，恶魔传位仍由说书人确认。' }),
  template({ id: 'fifteen-godfather', count: 15, style: 'long-game', roles: ['noble', 'librarian', 'pixie', 'preacher', 'towncrier', 'oracle', 'undertaker', 'dreamer', 'seamstress', 'artist', 'mutant', 'godfather', 'poisoner', 'cerenovus', 'pukka'], bluffs: ['huntsman', 'ravenkeeper', 'virgin'], note: 'Hide & Seek 15 人教父模板：减少外来者，普卡中毒链需要连续记录。', godfatherRemovesOutsider: true }),
  template({ id: 'fifteen-vigormortis-hunt', count: 15, style: 'chaos', roles: ['noble', 'pixie', 'preacher', 'towncrier', 'oracle', 'seamstress', 'artist', 'huntsman', 'ravenkeeper', 'damsel', 'goon', 'mezepheles', 'poisoner', 'cerenovus', 'vigormortis'], bluffs: ['librarian', 'undertaker', 'dreamer'], note: 'Hide & Seek 15 人复杂模板：猎人增加落难少女，维格莫提斯减少外来者，两个修正抵消但都要保留提醒。', huntsmanAddsDamsel: true, vigormortisRemovesOutsider: true }),
]
