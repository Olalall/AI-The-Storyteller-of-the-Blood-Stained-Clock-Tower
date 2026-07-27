import type { PlayerCount, RoleId, SetupAdjustment, SetupTemplate, SetupTemplateStyle } from '../../types'

const scriptId = 'a-grimm-chorus'

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

const summonerNoDemonAdjustment = {
  ruleId: 'summoner-no-demon',
  choiceId: 'no-demon',
  compositionDelta: { minion: 1, demon: -1 },
  note: '召唤师：开局无恶魔，额外保留 1 名爪牙位。',
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
  summonerNoDemon?: boolean
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
  if (input.summonerNoDemon) adjustments.push(summonerNoDemonAdjustment)
  return adjustments
}

export const aGrimmChorusSetupTemplates: readonly SetupTemplate[] = [
  template({ id: 'starter-signal', count: 7, style: 'beginner', roles: ['general', 'villageidiot', 'nightwatchman', 'soldier', 'slayer', 'assassin', 'pukka'], bluffs: ['towncrier', 'innkeeper', 'gambler'], note: 'A Grimm Chorus 7 人新手模板：将军和村夫给稳定方向，夜晚处理压力较低。' }),
  template({ id: 'public-pressure', count: 7, style: 'balanced', roles: ['towncrier', 'innkeeper', 'gambler', 'exorcist', 'fisherman', 'scarletwoman', 'yaggababble'], bluffs: ['general', 'nightwatchman', 'soldier'], note: 'A Grimm Chorus 7 人均衡模板：白天话术和夜晚选择并重，呓语魔只做暗号记录提醒。' }),
  template({ id: 'damsel-hook', count: 7, style: 'chaos', roles: ['general', 'amnesiac', 'fisherman', 'cannibal', 'damsel', 'godfather', 'ojo'], bluffs: ['villageidiot', 'towncrier', 'soldier'], note: 'A Grimm Chorus 7 人外来者模板：落难少女与教父制造压力，奥赫目标仍由说书人确认。', godfatherAddsOutsider: true }),
  template({ id: 'golem-path', count: 8, style: 'balanced', roles: ['villageidiot', 'gambler', 'exorcist', 'nightwatchman', 'cannibal', 'politician', 'assassin', 'po'], bluffs: ['general', 'innkeeper', 'slayer'], note: 'A Grimm Chorus 8 人均衡模板：魔像不入场，政客与食人族提供复盘张力。' }),
  template({ id: 'godfather-outsiders', count: 8, style: 'chaos', roles: ['general', 'towncrier', 'innkeeper', 'soldier', 'damsel', 'drunk', 'godfather', 'ojo'], bluffs: ['gambler', 'exorcist', 'fisherman'], note: 'A Grimm Chorus 8 人教父模板：双外来者让邪恶伪装空间更大，但不加入旅行者。', godfatherAddsOutsider: true }),
  template({ id: 'pukka-threads', count: 9, style: 'balanced', roles: ['general', 'innkeeper', 'gambler', 'slayer', 'minstrel', 'damsel', 'golem', 'scarletwoman', 'pukka'], bluffs: ['villageidiot', 'towncrier', 'nightwatchman'], note: 'A Grimm Chorus 9 人均衡模板：普卡中毒链和魔像提名都需要说书人确认。' }),
  template({ id: 'three-outsiders', count: 9, style: 'chaos', roles: ['towncrier', 'exorcist', 'amnesiac', 'fisherman', 'damsel', 'drunk', 'politician', 'godfather', 'yaggababble'], bluffs: ['general', 'gambler', 'cannibal'], note: 'A Grimm Chorus 9 人高压模板：三外来者和呓语魔制造社交压力，暗号次数不自动结算。', godfatherAddsOutsider: true }),
  template({ id: 'stable-day', count: 10, style: 'beginner', roles: ['general', 'villageidiot', 'towncrier', 'innkeeper', 'gambler', 'nightwatchman', 'soldier', 'assassin', 'scarletwoman', 'po'], bluffs: ['exorcist', 'fisherman', 'cannibal'], note: 'A Grimm Chorus 10 人新手模板：信息角色清晰，珀的空刀节奏只做记录提醒。' }),
  template({ id: 'ojo-godfather', count: 10, style: 'balanced', roles: ['general', 'exorcist', 'amnesiac', 'slayer', 'fisherman', 'minstrel', 'golem', 'godfather', 'assassin', 'ojo'], bluffs: ['villageidiot', 'towncrier', 'cannibal'], note: 'A Grimm Chorus 10 人教父模板：奥赫选择角色后，由说书人核对是否在场并确认死亡。', godfatherAddsOutsider: true }),
  template({ id: 'summoner-short', count: 10, style: 'bluff-heavy', roles: ['general', 'towncrier', 'innkeeper', 'gambler', 'nightwatchman', 'soldier', 'cannibal', 'summoner', 'assassin', 'scarletwoman'], bluffs: ['exorcist', 'amnesiac', 'slayer'], note: 'A Grimm Chorus 10 人召唤师模板：开局无恶魔，第 3 夜创建恶魔必须手动确认。', summonerNoDemon: true }),
  template({ id: 'damsel-cannibal', count: 11, style: 'balanced', roles: ['general', 'villageidiot', 'innkeeper', 'exorcist', 'amnesiac', 'fisherman', 'cannibal', 'damsel', 'assassin', 'scarletwoman', 'pukka'], bluffs: ['towncrier', 'gambler', 'nightwatchman'], note: 'A Grimm Chorus 11 人均衡模板：落难少女和食人族都只做提醒，不自动触发胜负或借用能力。' }),
  template({ id: 'no-outsider-godfather', count: 11, style: 'long-game', roles: ['general', 'towncrier', 'gambler', 'nightwatchman', 'slayer', 'soldier', 'minstrel', 'cannibal', 'godfather', 'assassin', 'yaggababble'], bluffs: ['villageidiot', 'innkeeper', 'exorcist'], note: 'A Grimm Chorus 11 人长线模板：教父移除外来者，呓语魔的公开暗号次数由说书人记录。', godfatherRemovesOutsider: true }),
  template({ id: 'twelve-balanced', count: 12, style: 'balanced', roles: ['general', 'villageidiot', 'towncrier', 'innkeeper', 'gambler', 'exorcist', 'nightwatchman', 'damsel', 'drunk', 'assassin', 'scarletwoman', 'po'], bluffs: ['amnesiac', 'slayer', 'fisherman'], note: 'A Grimm Chorus 12 人均衡模板：白天技能、投票压力和珀的节奏都有记录入口。' }),
  template({ id: 'twelve-outsider-heat', count: 12, style: 'chaos', roles: ['general', 'amnesiac', 'slayer', 'fisherman', 'soldier', 'cannibal', 'damsel', 'golem', 'politician', 'godfather', 'assassin', 'ojo'], bluffs: ['villageidiot', 'towncrier', 'innkeeper'], note: 'A Grimm Chorus 12 人教父模板：三外来者提高伪装难度，魔像与政客只做裁量提醒。', godfatherAddsOutsider: true }),
  template({ id: 'summoner-mid', count: 12, style: 'bluff-heavy', roles: ['towncrier', 'innkeeper', 'gambler', 'exorcist', 'amnesiac', 'nightwatchman', 'minstrel', 'drunk', 'politician', 'summoner', 'assassin', 'scarletwoman'], bluffs: ['general', 'slayer', 'fisherman'], note: 'A Grimm Chorus 12 人召唤师模板：无恶魔开局，第三夜后再进入常规恶魔压力。', summonerNoDemon: true }),
  template({ id: 'thirteen-godfather', count: 13, style: 'balanced', roles: ['general', 'villageidiot', 'towncrier', 'innkeeper', 'gambler', 'exorcist', 'nightwatchman', 'soldier', 'damsel', 'godfather', 'assassin', 'scarletwoman', 'pukka'], bluffs: ['amnesiac', 'slayer', 'fisherman'], note: 'A Grimm Chorus 13 人教父模板：额外外来者让邪恶伪装更稳，普卡中毒链需要清楚记录。', godfatherAddsOutsider: true }),
  template({ id: 'thirteen-summoner', count: 13, style: 'bluff-heavy', roles: ['general', 'towncrier', 'innkeeper', 'gambler', 'amnesiac', 'fisherman', 'soldier', 'cannibal', 'politician', 'godfather', 'summoner', 'assassin', 'scarletwoman'], bluffs: ['villageidiot', 'exorcist', 'nightwatchman'], note: 'A Grimm Chorus 13 人召唤师模板：教父增加外来者，召唤师第三夜创建恶魔。', godfatherAddsOutsider: true, summonerNoDemon: true }),
  template({ id: 'fourteen-clean', count: 14, style: 'balanced', roles: ['general', 'villageidiot', 'towncrier', 'innkeeper', 'gambler', 'exorcist', 'amnesiac', 'nightwatchman', 'fisherman', 'cannibal', 'godfather', 'assassin', 'scarletwoman', 'yaggababble'], bluffs: ['slayer', 'soldier', 'minstrel'], note: 'A Grimm Chorus 14 人长线模板：教父移除外来者，呓语魔只提示暗号记录。', godfatherRemovesOutsider: true }),
  template({ id: 'fourteen-outsiders', count: 14, style: 'chaos', roles: ['general', 'amnesiac', 'slayer', 'fisherman', 'soldier', 'minstrel', 'cannibal', 'villageidiot', 'drunk', 'golem', 'godfather', 'assassin', 'scarletwoman', 'ojo'], bluffs: ['towncrier', 'innkeeper', 'gambler'], note: 'A Grimm Chorus 14 人高压模板：奥赫、魔像和吟游诗人都需要手动确认影响。', godfatherAddsOutsider: true }),
  template({ id: 'fifteen-po', count: 15, style: 'balanced', roles: ['general', 'villageidiot', 'towncrier', 'innkeeper', 'gambler', 'exorcist', 'amnesiac', 'nightwatchman', 'cannibal', 'fisherman', 'damsel', 'godfather', 'assassin', 'scarletwoman', 'po'], bluffs: ['slayer', 'soldier', 'minstrel'], note: 'A Grimm Chorus 15 人均衡模板：教父减少外来者，珀的空刀/三刀只做记录提醒。', godfatherRemovesOutsider: true }),
  template({ id: 'fifteen-pukka', count: 15, style: 'chaos', roles: ['general', 'towncrier', 'innkeeper', 'slayer', 'fisherman', 'soldier', 'minstrel', 'cannibal', 'damsel', 'drunk', 'golem', 'godfather', 'assassin', 'scarletwoman', 'pukka'], bluffs: ['villageidiot', 'gambler', 'exorcist'], note: 'A Grimm Chorus 15 人外来者模板：普卡中毒链、教父外来者和魔像提名都要留日志。', godfatherAddsOutsider: true }),
  template({ id: 'fifteen-summoner', count: 15, style: 'bluff-heavy', roles: ['general', 'villageidiot', 'towncrier', 'gambler', 'exorcist', 'amnesiac', 'nightwatchman', 'fisherman', 'soldier', 'cannibal', 'politician', 'godfather', 'summoner', 'assassin', 'scarletwoman'], bluffs: ['innkeeper', 'slayer', 'minstrel'], note: 'A Grimm Chorus 15 人召唤师模板：教父减少外来者，第三夜创建恶魔前保持无恶魔局面。', godfatherRemovesOutsider: true, summonerNoDemon: true }),
]
