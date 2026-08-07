import type { PlayerCount, RoleId, SetupAdjustment, SetupTemplate, SetupTemplateStyle } from '../../types'

const scriptId = 'lunar-eclipse'

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
  note: '亡骨魔：-1 外来者，通常增加 1 名镇民。',
} as const

type TemplateInput = {
  id: string
  count: PlayerCount
  style: SetupTemplateStyle
  roles: readonly RoleId[]
  bluffs: readonly RoleId[]
  note: string
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
  if (input.godfatherAddsOutsider) adjustments.push(godfatherAddOutsiderAdjustment)
  if (input.godfatherRemovesOutsider) adjustments.push(godfatherRemoveOutsiderAdjustment)
  if (input.vigormortisRemovesOutsider) adjustments.push(vigormortisOutsiderAdjustment)
  return adjustments
}

export const lunarEclipseSetupTemplates: readonly SetupTemplate[] = [
  template({ id: 'starter-info', count: 7, style: 'beginner', roles: ['grandmother', 'chambermaid', 'mathematician', 'innkeeper', 'mayor', 'devilsadvocate', 'nodashii'], bluffs: ['pixie', 'savant', 'tealady'], note: 'Lunar Eclipse 7 人新手模板：信息清晰，死亡保护和魔鬼代言人压力适中。' }),
  template({ id: 'lunatic-godfather', count: 7, style: 'chaos', roles: ['pixie', 'sailor', 'lycanthrope', 'magician', 'lunatic', 'godfather', 'zombuul'], bluffs: ['grandmother', 'artist', 'cannibal'], note: 'Lunar Eclipse 7 人疯子模板：教父增加外来者，疯子选择只作为真正恶魔信息。', godfatherAddsOutsider: true }),
  template({ id: 'marionette-neighbor', count: 7, style: 'balanced', roles: ['grandmother', 'artist', 'tealady', 'mayor', 'cannibal', 'marionette', 'nodashii'], bluffs: ['pixie', 'savant', 'innkeeper'], note: 'Lunar Eclipse 7 人提线木偶模板：座位相邻必须人工核对，不自动重排。' }),
  template({ id: 'eight-puzzle', count: 8, style: 'balanced', roles: ['grandmother', 'pixie', 'chambermaid', 'mathematician', 'artist', 'puzzlemaster', 'spy', 'nodashii'], bluffs: ['sailor', 'savant', 'magician'], note: 'Lunar Eclipse 8 人解谜模板：一名玩家醉酒，猜测结果只由说书人确认。' }),
  template({ id: 'eight-vigormortis', count: 8, style: 'long-game', roles: ['sailor', 'innkeeper', 'lycanthrope', 'savant', 'tealady', 'cannibal', 'assassin', 'vigormortis'], bluffs: ['grandmother', 'pixie', 'artist'], note: 'Lunar Eclipse 8 人亡骨魔模板：无外来者，爪牙死亡后的中毒只做提醒。', vigormortisRemovesOutsider: true }),
  template({ id: 'nine-social', count: 9, style: 'balanced', roles: ['grandmother', 'pixie', 'chambermaid', 'artist', 'magician', 'goon', 'lunatic', 'devilsadvocate', 'zombuul'], bluffs: ['sailor', 'mathematician', 'cannibal'], note: 'Lunar Eclipse 9 人均衡模板：疯子、莽夫和魔术师共同制造信息错认。' }),
  template({ id: 'nine-godfather-remove', count: 9, style: 'long-game', roles: ['grandmother', 'sailor', 'mathematician', 'innkeeper', 'savant', 'mayor', 'barber', 'godfather', 'nodashii'], bluffs: ['pixie', 'artist', 'tealady'], note: 'Lunar Eclipse 9 人教父模板：减少外来者，死亡和理发师交换都走更正。', godfatherRemovesOutsider: true }),
  template({ id: 'ten-info', count: 10, style: 'beginner', roles: ['grandmother', 'pixie', 'sailor', 'chambermaid', 'mathematician', 'artist', 'mayor', 'devilsadvocate', 'spy', 'nodashii'], bluffs: ['innkeeper', 'savant', 'tealady'], note: 'Lunar Eclipse 10 人信息模板：镇民信息较多，邪恶方依赖登记错位。' }),
  template({ id: 'ten-marionette', count: 10, style: 'balanced', roles: ['grandmother', 'innkeeper', 'lycanthrope', 'savant', 'tealady', 'magician', 'cannibal', 'marionette', 'assassin', 'zombuul'], bluffs: ['pixie', 'chambermaid', 'artist'], note: 'Lunar Eclipse 10 人提线木偶模板：相邻限制必须由说书人配座位时确认。' }),
  template({ id: 'ten-vigormortis-godfather', count: 10, style: 'chaos', roles: ['grandmother', 'pixie', 'sailor', 'chambermaid', 'savant', 'magician', 'cannibal', 'godfather', 'assassin', 'vigormortis'], bluffs: ['mathematician', 'innkeeper', 'artist'], note: 'Lunar Eclipse 10 人修正抵消模板：教父增加外来者、亡骨魔减少外来者，两个提醒都保留。', godfatherAddsOutsider: true, vigormortisRemovesOutsider: true }),
  template({ id: 'eleven-social', count: 11, style: 'balanced', roles: ['grandmother', 'pixie', 'chambermaid', 'mathematician', 'innkeeper', 'artist', 'tealady', 'goon', 'spy', 'devilsadvocate', 'nodashii'], bluffs: ['sailor', 'lycanthrope', 'mayor'], note: 'Lunar Eclipse 11 人社交模板：莽夫阵营变化和诺-达鲺中毒都需分开记录。' }),
  template({ id: 'eleven-zombuul', count: 11, style: 'long-game', roles: ['sailor', 'lycanthrope', 'savant', 'artist', 'magician', 'mayor', 'cannibal', 'lunatic', 'marionette', 'assassin', 'zombuul'], bluffs: ['grandmother', 'pixie', 'innkeeper'], note: 'Lunar Eclipse 11 人僵怖模板：首次死亡登记为死亡但仍可能存活。' }),
  template({ id: 'twelve-balanced', count: 12, style: 'balanced', roles: ['grandmother', 'pixie', 'chambermaid', 'mathematician', 'innkeeper', 'savant', 'artist', 'goon', 'puzzlemaster', 'devilsadvocate', 'spy', 'nodashii'], bluffs: ['sailor', 'lycanthrope', 'magician'], note: 'Lunar Eclipse 12 人均衡模板：解谜大师醉酒与间谍登记错位都只做提醒。' }),
  template({ id: 'twelve-godfather', count: 12, style: 'chaos', roles: ['grandmother', 'sailor', 'lycanthrope', 'tealady', 'magician', 'cannibal', 'barber', 'lunatic', 'puzzlemaster', 'godfather', 'assassin', 'zombuul'], bluffs: ['pixie', 'chambermaid', 'artist'], note: 'Lunar Eclipse 12 人教父模板：三外来者增加伪装压力，阵营和死亡不自动结算。', godfatherAddsOutsider: true }),
  template({ id: 'twelve-vigormortis', count: 12, style: 'long-game', roles: ['grandmother', 'pixie', 'sailor', 'chambermaid', 'mathematician', 'innkeeper', 'savant', 'cannibal', 'goon', 'marionette', 'spy', 'vigormortis'], bluffs: ['artist', 'tealady', 'magician'], note: 'Lunar Eclipse 12 人亡骨魔模板：外来者减少，提线木偶相邻和爪牙中毒都需人工核对。', vigormortisRemovesOutsider: true }),
  template({ id: 'thirteen-no-outsider', count: 13, style: 'balanced', roles: ['grandmother', 'pixie', 'sailor', 'chambermaid', 'mathematician', 'innkeeper', 'savant', 'artist', 'magician', 'devilsadvocate', 'spy', 'assassin', 'nodashii'], bluffs: ['lycanthrope', 'tealady', 'mayor'], note: 'Lunar Eclipse 13 人无外来者模板：三爪牙齐全，魔术师制造开局互认错位。' }),
  template({ id: 'thirteen-vigormortis-godfather', count: 13, style: 'chaos', roles: ['grandmother', 'sailor', 'lycanthrope', 'savant', 'tealady', 'magician', 'mayor', 'cannibal', 'artist', 'godfather', 'marionette', 'assassin', 'vigormortis'], bluffs: ['pixie', 'chambermaid', 'innkeeper'], note: 'Lunar Eclipse 13 人复杂模板：教父与亡骨魔修正抵消，提线木偶必须邻恶魔。', godfatherAddsOutsider: true, vigormortisRemovesOutsider: true }),
  template({ id: 'fourteen-balanced', count: 14, style: 'balanced', roles: ['grandmother', 'pixie', 'sailor', 'chambermaid', 'mathematician', 'innkeeper', 'lycanthrope', 'artist', 'mayor', 'puzzlemaster', 'devilsadvocate', 'spy', 'assassin', 'nodashii'], bluffs: ['savant', 'tealady', 'magician'], note: 'Lunar Eclipse 14 人均衡模板：半兽人、解谜大师和诺-达鲺都需要状态提醒。' }),
  template({ id: 'fourteen-godfather', count: 14, style: 'chaos', roles: ['grandmother', 'pixie', 'sailor', 'savant', 'tealady', 'magician', 'mayor', 'cannibal', 'goon', 'lunatic', 'godfather', 'devilsadvocate', 'marionette', 'zombuul'], bluffs: ['chambermaid', 'mathematician', 'artist'], note: 'Lunar Eclipse 14 人教父模板：两外来者、疯子和提线木偶制造强错认局。', godfatherAddsOutsider: true }),
  template({ id: 'fifteen-nodashii', count: 15, style: 'balanced', roles: ['grandmother', 'pixie', 'sailor', 'chambermaid', 'mathematician', 'innkeeper', 'lycanthrope', 'savant', 'magician', 'lunatic', 'puzzlemaster', 'devilsadvocate', 'spy', 'assassin', 'nodashii'], bluffs: ['artist', 'tealady', 'mayor'], note: 'Lunar Eclipse 15 人诺-达鲺模板：中毒邻座、疯子和解谜大师醉酒都只做提示。' }),
  template({ id: 'fifteen-godfather-remove', count: 15, style: 'long-game', roles: ['grandmother', 'pixie', 'sailor', 'chambermaid', 'mathematician', 'innkeeper', 'lycanthrope', 'savant', 'artist', 'cannibal', 'barber', 'godfather', 'spy', 'marionette', 'zombuul'], bluffs: ['tealady', 'magician', 'mayor'], note: 'Lunar Eclipse 15 人教父模板：减少外来者，理发师交换和提线木偶相邻都走人工确认。', godfatherRemovesOutsider: true }),
  template({ id: 'fifteen-vigormortis', count: 15, style: 'chaos', roles: ['grandmother', 'pixie', 'sailor', 'chambermaid', 'mathematician', 'innkeeper', 'lycanthrope', 'tealady', 'magician', 'mayor', 'goon', 'devilsadvocate', 'assassin', 'marionette', 'vigormortis'], bluffs: ['savant', 'artist', 'cannibal'], note: 'Lunar Eclipse 15 人亡骨魔模板：外来者减少，莽夫阵营变化和爪牙保留能力分开记录。', vigormortisRemovesOutsider: true }),
]
