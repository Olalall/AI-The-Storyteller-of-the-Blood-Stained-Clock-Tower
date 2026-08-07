import type { PlayerCount, RoleId, SetupTemplate, SetupTemplateStyle } from '../../types'

const scriptId = 'one-in-one-out'
const fangGuOutsiderAdjustment = {
  ruleId: 'fanggu-outsider',
  choiceId: 'add-outsider',
  compositionDelta: { townsfolk: -1, outsider: 1 },
  note: '方古：+1 外来者，通常替换 1 名镇民。',
} as const

type TemplateInput = {
  id: string
  count: PlayerCount
  style: SetupTemplateStyle
  roles: readonly RoleId[]
  bluffs: readonly RoleId[]
  note: string
  fangGuAddsOutsider?: boolean
}

function template(input: TemplateInput): SetupTemplate {
  return {
    templateId: `one-in-one-out-${input.count}-${input.id}`,
    scriptId,
    playerCount: input.count,
    style: input.style,
    roles: input.roles,
    bluffs: input.bluffs,
    setupAdjustments: input.fangGuAddsOutsider ? [fangGuOutsiderAdjustment] : undefined,
    notes: [input.note],
    verified: true,
  }
}

export const oneInOneOutSetupTemplates: readonly SetupTemplate[] = [
  template({ id: 'starter-web', count: 7, style: 'beginner', roles: ['steward', 'knight', 'oracle', 'monk', 'farmer', 'poisoner', 'imp'], bluffs: ['highpriestess', 'fisherman', 'cannibal'], note: 'One in one out 7 人模板：首夜信息清楚，邪恶方干扰稳定，适合刚接触本板的 7 人局。' }),
  template({ id: 'identity-flow', count: 7, style: 'balanced', roles: ['highpriestess', 'snakecharmer', 'fortuneteller', 'seamstress', 'cannibal', 'harpy', 'ojo'], bluffs: ['steward', 'knight', 'oracle'], note: 'One in one out 7 人模板：强调身份流动和疯狂压力，但恶魔选择仍由说书人确认。' }),
  template({ id: 'fanggu-first-jump', count: 7, style: 'chaos', roles: ['steward', 'villageidiot', 'amnesiac', 'farmer', 'ogre', 'spy', 'fanggu'], bluffs: ['knight', 'oracle', 'monk'], note: 'One in one out 7 人模板：方古带 1 名外来者，配合食人魔和农夫制造身份变化张力。', fangGuAddsOutsider: true }),
  template({ id: 'clear-advice', count: 8, style: 'beginner', roles: ['steward', 'knight', 'highpriestess', 'oracle', 'fisherman', 'recluse', 'poisoner', 'imp'], bluffs: ['fortuneteller', 'monk', 'farmer'], note: 'One in one out 8 人模板：信息与建议并存，外来者压力较低。' }),
  template({ id: 'madness-hook', count: 8, style: 'balanced', roles: ['snakecharmer', 'fortuneteller', 'seamstress', 'farmer', 'cannibal', 'goon', 'harpy', 'kazali'], bluffs: ['steward', 'oracle', 'monk'], note: 'One in one out 8 人模板：卡扎力与鹰身女妖提供中阶张力，莽夫需要人工核对触发。' }),
  template({ id: 'two-outsider-read', count: 9, style: 'balanced', roles: ['steward', 'knight', 'highpriestess', 'fortuneteller', 'oracle', 'ogre', 'drunk', 'mezepheles', 'ojo'], bluffs: ['monk', 'fisherman', 'farmer'], note: 'One in one out 9 人模板：两个外来者提供伪装空间，灵言师暗号需记录。' }),
  template({ id: 'fanggu-outsider-path', count: 9, style: 'chaos', roles: ['villageidiot', 'snakecharmer', 'seamstress', 'amnesiac', 'ogre', 'goon', 'drunk', 'spy', 'fanggu'], bluffs: ['steward', 'knight', 'oracle'], note: 'One in one out 9 人模板：方古三外来者高变化局；食人魔和莽夫都只给提醒，不自动改阵营。', fangGuAddsOutsider: true }),
  template({ id: 'ten-stable-info', count: 10, style: 'beginner', roles: ['steward', 'knight', 'highpriestess', 'oracle', 'monk', 'fisherman', 'farmer', 'poisoner', 'spy', 'imp'], bluffs: ['villageidiot', 'fortuneteller', 'cannibal'], note: 'One in one out 10 人模板：10 人稳定信息局，邪恶方有毒和魔典压力。' }),
  template({ id: 'ten-cannibal-cycle', count: 10, style: 'balanced', roles: ['steward', 'villageidiot', 'fortuneteller', 'seamstress', 'amnesiac', 'farmer', 'cannibal', 'poisoner', 'harpy', 'ojo'], bluffs: ['knight', 'oracle', 'monk'], note: 'One in one out 10 人模板：食人族和奥赫都需要说书人确认目标与结果。' }),
  template({ id: 'ten-fanggu-flow', count: 10, style: 'chaos', roles: ['knight', 'highpriestess', 'snakecharmer', 'oracle', 'fisherman', 'farmer', 'ogre', 'harpy', 'mezepheles', 'fanggu'], bluffs: ['steward', 'seamstress', 'cannibal'], note: 'One in one out 10 人模板：方古 10 人加外来者，配合灵言师但受圣洁之魂限制提醒。', fangGuAddsOutsider: true }),
  template({ id: 'eleven-social-push', count: 11, style: 'balanced', roles: ['steward', 'knight', 'villageidiot', 'oracle', 'monk', 'amnesiac', 'fisherman', 'recluse', 'poisoner', 'harpy', 'kazali'], bluffs: ['highpriestess', 'farmer', 'cannibal'], note: 'One in one out 11 人模板：白天建议与疯狂压力更明显，卡扎力开局爪牙需人工确认。' }),
  template({ id: 'eleven-swap-risk', count: 11, style: 'long-game', roles: ['highpriestess', 'snakecharmer', 'fortuneteller', 'oracle', 'seamstress', 'farmer', 'cannibal', 'drunk', 'poisoner', 'mezepheles', 'imp'], bluffs: ['steward', 'knight', 'villageidiot'], note: 'One in one out 11 人模板：舞蛇人、酒鬼和灵言师同时制造真假身份压力。' }),
  template({ id: 'twelve-balanced', count: 12, style: 'balanced', roles: ['steward', 'knight', 'highpriestess', 'villageidiot', 'oracle', 'monk', 'fisherman', 'ogre', 'recluse', 'poisoner', 'harpy', 'ojo'], bluffs: ['fortuneteller', 'seamstress', 'farmer'], note: 'One in one out 12 人模板：12 人均衡模板，信息源分散，奥赫结果需要人工判定。' }),
  template({ id: 'twelve-long-game', count: 12, style: 'long-game', roles: ['steward', 'snakecharmer', 'fortuneteller', 'seamstress', 'amnesiac', 'farmer', 'cannibal', 'goon', 'drunk', 'spy', 'mezepheles', 'imp'], bluffs: ['knight', 'highpriestess', 'oracle'], note: 'One in one out 12 人模板：身份变化、阵营变化和食人族链条都集中到提示层，不自动结算。' }),
  template({ id: 'twelve-fanggu-chaos', count: 12, style: 'chaos', roles: ['knight', 'highpriestess', 'villageidiot', 'oracle', 'monk', 'fisherman', 'ogre', 'goon', 'recluse', 'poisoner', 'spy', 'fanggu'], bluffs: ['steward', 'seamstress', 'cannibal'], note: 'One in one out 12 人模板：方古三外来者版本，邪恶伪装空间大，适合熟手桌。', fangGuAddsOutsider: true }),
  template({ id: 'thirteen-kazali-table', count: 13, style: 'balanced', roles: ['steward', 'knight', 'highpriestess', 'villageidiot', 'fortuneteller', 'oracle', 'monk', 'amnesiac', 'fisherman', 'poisoner', 'harpy', 'spy', 'kazali'], bluffs: ['snakecharmer', 'farmer', 'cannibal'], note: 'One in one out 13 人模板：13 人无外来者卡扎力局，开局爪牙指定必须人工记录。' }),
  template({ id: 'thirteen-social-trap', count: 13, style: 'long-game', roles: ['steward', 'snakecharmer', 'fortuneteller', 'oracle', 'seamstress', 'farmer', 'cannibal', 'amnesiac', 'fisherman', 'poisoner', 'harpy', 'mezepheles', 'ojo'], bluffs: ['knight', 'highpriestess', 'monk'], note: 'One in one out 13 人模板：信息多、暗号和奥赫共存，适合中高阶玩家。' }),
  template({ id: 'fourteen-wide-info', count: 14, style: 'balanced', roles: ['steward', 'knight', 'highpriestess', 'villageidiot', 'snakecharmer', 'fortuneteller', 'oracle', 'monk', 'fisherman', 'ogre', 'poisoner', 'harpy', 'spy', 'imp'], bluffs: ['seamstress', 'farmer', 'cannibal'], note: 'One in one out 14 人模板：14 人宽信息局，恶魔自杀传位仍只做提醒。' }),
  template({ id: 'fourteen-fanggu-thread', count: 14, style: 'chaos', roles: ['steward', 'highpriestess', 'villageidiot', 'snakecharmer', 'oracle', 'seamstress', 'farmer', 'cannibal', 'ogre', 'goon', 'poisoner', 'spy', 'mezepheles', 'fanggu'], bluffs: ['knight', 'fortuneteller', 'monk'], note: 'One in one out 14 人模板：方古双外来者加灵言师，额外邪恶上限需要重点提示。', fangGuAddsOutsider: true }),
  template({ id: 'fifteen-balanced', count: 15, style: 'balanced', roles: ['steward', 'knight', 'highpriestess', 'villageidiot', 'fortuneteller', 'oracle', 'monk', 'amnesiac', 'fisherman', 'ogre', 'recluse', 'poisoner', 'harpy', 'spy', 'ojo'], bluffs: ['snakecharmer', 'seamstress', 'farmer'], note: 'One in one out 15 人模板：15 人均衡模板，奥赫与多信息源形成较长推理线。' }),
  template({ id: 'fifteen-identity-storm', count: 15, style: 'chaos', roles: ['steward', 'knight', 'snakecharmer', 'fortuneteller', 'seamstress', 'farmer', 'cannibal', 'amnesiac', 'fisherman', 'goon', 'drunk', 'poisoner', 'spy', 'mezepheles', 'kazali'], bluffs: ['highpriestess', 'oracle', 'monk'], note: 'One in one out 15 人模板：卡扎力、灵言师、莽夫、舞蛇人同局，适合熟手桌。' }),
  template({ id: 'fifteen-fanggu-max', count: 15, style: 'long-game', roles: ['highpriestess', 'villageidiot', 'snakecharmer', 'oracle', 'monk', 'amnesiac', 'fisherman', 'cannibal', 'ogre', 'goon', 'drunk', 'poisoner', 'harpy', 'mezepheles', 'fanggu'], bluffs: ['steward', 'knight', 'fortuneteller'], note: 'One in one out 15 人模板：方古三外来者长线局；身份与阵营变化多，主持压力高。', fangGuAddsOutsider: true }),
]
