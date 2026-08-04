import type { PlayerCount, RoleId, SetupAdjustment, SetupTemplate, SetupTemplateStyle } from '../../types'

const scriptId = 'punchy'

const balloonistOutsiderAdjustment = {
  ruleId: 'balloonist-outsider',
  choiceId: 'add-outsider',
  compositionDelta: { townsfolk: -1, outsider: 1 },
  note: '气球驾驶员：+1 外来者，通常替换 1 名镇民。',
} as const

const huntsmanDamselAdjustment = {
  ruleId: 'huntsman-damsel',
  choiceId: 'add-damsel',
  compositionDelta: { townsfolk: -1, outsider: 1 },
  note: '巡山人：加入落难少女，通常替换 1 名镇民。',
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
  balloonistAddsOutsider?: boolean
  huntsmanAddsDamsel?: boolean
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
  if (input.balloonistAddsOutsider) adjustments.push(balloonistOutsiderAdjustment)
  if (input.huntsmanAddsDamsel) adjustments.push(huntsmanDamselAdjustment)
  if (input.vigormortisRemovesOutsider) adjustments.push(vigormortisOutsiderAdjustment)
  return adjustments
}

export const punchySetupTemplates: readonly SetupTemplate[] = [
  template({ id: 'starter-punch', count: 7, style: 'beginner', roles: ['steward', 'general', 'monk', 'savant', 'slayer', 'harpy', 'pukka'], bluffs: ['pixie', 'balloonist', 'alchemist'], note: 'Punchy 7 人入门模板：事务官和将军给清晰信息，普卡链路需要说书人记录当前毒和上一毒。' }),
  template({ id: 'damsel-hunt', count: 7, style: 'balanced', roles: ['steward', 'huntsman', 'slayer', 'cannibal', 'damsel', 'cerenovus', 'ojo'], bluffs: ['pixie', 'general', 'princess'], note: 'Punchy 7 人巡山人模板：落难少女信息链路清楚，洗脑师给白天压力。', huntsmanAddsDamsel: true }),
  template({ id: 'kazali-open', count: 7, style: 'chaos', roles: ['pixie', 'balloonist', 'philosopher', 'princess', 'alchemist', 'vizier', 'kazali'], bluffs: ['steward', 'monk', 'cannibal'], note: 'Punchy 7 人卡扎力模板：公开维齐尔与卡扎力指定爪牙都必须人工确认。' }),

  template({ id: 'eight-social', count: 8, style: 'balanced', roles: ['steward', 'pixie', 'monk', 'savant', 'amnesiac', 'ogre', 'psychopath', 'pukka'], bluffs: ['general', 'slayer', 'alchemist'], note: 'Punchy 8 人社交模板：食人魔阵营变化不告知玩家，精神病患者只在白天公开记录。' }),
  template({ id: 'eight-damsel', count: 8, style: 'chaos', roles: ['balloonist', 'huntsman', 'slayer', 'cannibal', 'damsel', 'mutant', 'harpy', 'ojo'], bluffs: ['steward', 'pixie', 'princess'], note: 'Punchy 8 人落难少女模板：巡山人和落难少女同局，鹰身女妖制造白天疯狂压力。', huntsmanAddsDamsel: true }),

  template({ id: 'nine-vigor', count: 9, style: 'balanced', roles: ['general', 'monk', 'savant', 'princess', 'cannibal', 'drunk', 'ogre', 'cerenovus', 'vigormortis'], bluffs: ['steward', 'pixie', 'balloonist'], note: 'Punchy 9 人亡骨魔模板：基础 2 外来者，毒醉与死亡链路分开记录。' }),
  template({ id: 'nine-balloon', count: 9, style: 'long-game', roles: ['steward', 'balloonist', 'philosopher', 'alchemist', 'damsel', 'mutant', 'ogre', 'harpy', 'kazali'], bluffs: ['pixie', 'monk', 'savant'], note: 'Punchy 9 人气球模板：气球驾驶员增加外来者，卡扎力开局调整需人工核对。', balloonistAddsOutsider: true }),

  template({ id: 'ten-public-kill', count: 10, style: 'balanced', roles: ['steward', 'pixie', 'balloonist', 'general', 'monk', 'savant', 'slayer', 'harpy', 'psychopath', 'pukka'], bluffs: ['philosopher', 'princess', 'cannibal'], note: 'Punchy 10 人公开击杀模板：猎手和精神病患者都在白天制造公开事件，日志要分开记录。' }),
  template({ id: 'ten-damsel-ojo', count: 10, style: 'chaos', roles: ['steward', 'huntsman', 'philosopher', 'princess', 'alchemist', 'cannibal', 'damsel', 'cerenovus', 'vizier', 'ojo'], bluffs: ['pixie', 'balloonist', 'general'], note: 'Punchy 10 人奥赫模板：洗脑师、维齐尔和落难少女让白天压力更强。', huntsmanAddsDamsel: true }),
  template({ id: 'ten-kazali-stable', count: 10, style: 'bluff-heavy', roles: ['pixie', 'balloonist', 'general', 'savant', 'slayer', 'princess', 'amnesiac', 'harpy', 'cerenovus', 'kazali'], bluffs: ['steward', 'monk', 'alchemist'], note: 'Punchy 10 人卡扎力模板：无外来者，邪恶方依赖公开维持伪装和疯狂压力。' }),

  template({ id: 'eleven-control', count: 11, style: 'balanced', roles: ['steward', 'pixie', 'general', 'monk', 'savant', 'alchemist', 'cannibal', 'drunk', 'psychopath', 'vizier', 'pukka'], bluffs: ['balloonist', 'philosopher', 'princess'], note: 'Punchy 11 人控制模板：公开维齐尔和普卡中毒链路都需要醒目标记。' }),
  template({ id: 'eleven-vigor-no-outsider', count: 11, style: 'long-game', roles: ['steward', 'balloonist', 'general', 'monk', 'savant', 'philosopher', 'princess', 'amnesiac', 'harpy', 'cerenovus', 'vigormortis'], bluffs: ['pixie', 'slayer', 'cannibal'], note: 'Punchy 11 人亡骨魔模板：外来者被移除，邻座中毒只给提醒。', vigormortisRemovesOutsider: true }),

  template({ id: 'twelve-ojo', count: 12, style: 'balanced', roles: ['steward', 'pixie', 'balloonist', 'general', 'monk', 'slayer', 'cannibal', 'ogre', 'mutant', 'harpy', 'psychopath', 'ojo'], bluffs: ['savant', 'philosopher', 'princess'], note: 'Punchy 12 人奥赫模板：奥赫选择不在场角色时，死亡目标由说书人决定。' }),
  template({ id: 'twelve-damsel-pressure', count: 12, style: 'chaos', roles: ['pixie', 'huntsman', 'savant', 'philosopher', 'alchemist', 'amnesiac', 'damsel', 'drunk', 'ogre', 'cerenovus', 'vizier', 'pukka'], bluffs: ['steward', 'balloonist', 'general'], note: 'Punchy 12 人落难少女模板：巡山人救援、洗脑师疯狂和普卡链路都保持草稿确认。', huntsmanAddsDamsel: true }),
  template({ id: 'twelve-vigor', count: 12, style: 'long-game', roles: ['steward', 'pixie', 'balloonist', 'general', 'monk', 'savant', 'princess', 'cannibal', 'mutant', 'harpy', 'psychopath', 'vigormortis'], bluffs: ['philosopher', 'huntsman', 'alchemist'], note: 'Punchy 12 人亡骨魔模板：移除 1 外来者，爪牙死亡后能力与中毒分开记录。', vigormortisRemovesOutsider: true }),

  template({ id: 'thirteen-kazali', count: 13, style: 'balanced', roles: ['steward', 'pixie', 'balloonist', 'general', 'monk', 'savant', 'philosopher', 'slayer', 'alchemist', 'harpy', 'cerenovus', 'vizier', 'kazali'], bluffs: ['huntsman', 'princess', 'cannibal'], note: 'Punchy 13 人卡扎力模板：无外来者，三爪牙公开压力强，适合熟手桌。' }),
  template({ id: 'thirteen-damsel', count: 13, style: 'chaos', roles: ['steward', 'huntsman', 'balloonist', 'general', 'monk', 'princess', 'cannibal', 'amnesiac', 'damsel', 'harpy', 'cerenovus', 'psychopath', 'ojo'], bluffs: ['pixie', 'savant', 'alchemist'], note: 'Punchy 13 人落难少女模板：三爪牙有足够公开压力，恶魔目标仍由说书人确认。', huntsmanAddsDamsel: true }),

  template({ id: 'fourteen-pukka', count: 14, style: 'balanced', roles: ['steward', 'pixie', 'balloonist', 'general', 'monk', 'savant', 'philosopher', 'slayer', 'cannibal', 'ogre', 'harpy', 'cerenovus', 'psychopath', 'pukka'], bluffs: ['huntsman', 'princess', 'alchemist'], note: 'Punchy 14 人普卡模板：信息源多，普卡上一毒死亡链路适合长局。' }),
  template({ id: 'fourteen-balloon-kazali', count: 14, style: 'bluff-heavy', roles: ['steward', 'pixie', 'balloonist', 'general', 'monk', 'alchemist', 'cannibal', 'amnesiac', 'drunk', 'mutant', 'harpy', 'vizier', 'psychopath', 'kazali'], bluffs: ['savant', 'philosopher', 'princess'], note: 'Punchy 14 人气球卡扎力模板：气球驾驶员增加外来者，卡扎力指定爪牙需要独立记录。', balloonistAddsOutsider: true }),

  template({ id: 'fifteen-pukka', count: 15, style: 'balanced', roles: ['steward', 'pixie', 'balloonist', 'general', 'monk', 'savant', 'philosopher', 'slayer', 'cannibal', 'ogre', 'mutant', 'harpy', 'cerenovus', 'psychopath', 'pukka'], bluffs: ['huntsman', 'princess', 'alchemist'], note: 'Punchy 15 人普卡模板：公开击杀和普卡中毒都明显，适合稳定长局。' }),
  template({ id: 'fifteen-damsel-ojo', count: 15, style: 'chaos', roles: ['steward', 'huntsman', 'balloonist', 'general', 'savant', 'princess', 'alchemist', 'amnesiac', 'damsel', 'drunk', 'ogre', 'harpy', 'vizier', 'psychopath', 'ojo'], bluffs: ['pixie', 'monk', 'cannibal'], note: 'Punchy 15 人奥赫落难少女模板：公开压力强，死亡与胜负都不自动处理。', huntsmanAddsDamsel: true }),
  template({ id: 'fifteen-vigor', count: 15, style: 'long-game', roles: ['steward', 'pixie', 'balloonist', 'general', 'monk', 'savant', 'philosopher', 'slayer', 'princess', 'cannibal', 'mutant', 'harpy', 'cerenovus', 'vizier', 'vigormortis'], bluffs: ['huntsman', 'alchemist', 'amnesiac'], note: 'Punchy 15 人亡骨魔模板：减少外来者，公开爪牙和邻座中毒让主持记录更重要。', vigormortisRemovesOutsider: true }),
]
