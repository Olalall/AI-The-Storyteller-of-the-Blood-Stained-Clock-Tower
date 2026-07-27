import type { PlayerCount, RoleId, SetupTemplate, SetupTemplateStyle } from '../../types'

const scriptId = 'quick-maths'

type TemplateInput = {
  id: string
  count: PlayerCount
  style: SetupTemplateStyle
  roles: readonly RoleId[]
  bluffs: readonly RoleId[]
  note: string
}

function template(input: TemplateInput): SetupTemplate {
  return {
    templateId: `${scriptId}-${input.count}-${input.id}`,
    scriptId,
    playerCount: input.count,
    style: input.style,
    roles: input.roles,
    bluffs: input.bluffs,
    notes: [input.note],
    verified: true,
  }
}

export const quickMathsSetupTemplates: readonly SetupTemplate[] = [
  template({ id: 'starter-count', count: 7, style: 'beginner', roles: ['noble', 'shugenja', 'general', 'dreamer', 'seamstress', 'spy', 'riot'], bluffs: ['pixie', 'savant', 'alsaahir'], note: 'Quick Maths 7 人入门模板：贵族、修验者和将军给清晰方向，暴乱链路先只做白天提醒。' }),
  template({ id: 'social-advice', count: 7, style: 'balanced', roles: ['pixie', 'highpriestess', 'savant', 'nightwatchman', 'philosopher', 'marionette', 'riot'], bluffs: ['noble', 'dreamer', 'juggler'], note: 'Quick Maths 7 人社交模板：女祭司、博学者和守夜人推动交流，提线木偶相邻由说书人核对。' }),
  template({ id: 'public-guess', count: 7, style: 'chaos', roles: ['alsaahir', 'fisherman', 'juggler', 'dreamer', 'general', 'boffin', 'riot'], bluffs: ['shugenja', 'pixie', 'seamstress'], note: 'Quick Maths 7 人公开猜测模板：阿尔萨希尔和杂耍艺人制造白天压力，胜负不自动判定。' }),

  template({ id: 'xaan-one', count: 8, style: 'balanced', roles: ['noble', 'shugenja', 'pixie', 'general', 'seamstress', 'ogre', 'xaan', 'riot'], bluffs: ['dreamer', 'savant', 'juggler'], note: 'Quick Maths 8 人扎恩模板：1 名外来者时第 1 夜镇民中毒提醒，不能批量自动改状态。' }),
  template({ id: 'puzzle-spy', count: 8, style: 'long-game', roles: ['highpriestess', 'dreamer', 'savant', 'philosopher', 'juggler', 'puzzlemaster', 'spy', 'riot'], bluffs: ['noble', 'nightwatchman', 'fisherman'], note: 'Quick Maths 8 人解谜模板：解谜大师醉酒目标和间谍登记异常都由说书人确认。' }),

  template({ id: 'snitch-xaan', count: 9, style: 'balanced', roles: ['noble', 'pixie', 'general', 'nightwatchman', 'juggler', 'ogre', 'snitch', 'xaan', 'riot'], bluffs: ['shugenja', 'dreamer', 'savant'], note: 'Quick Maths 9 人告密者模板：每个爪牙都有伪装信息，扎恩按 2 名外来者做第 2 夜提醒。' }),
  template({ id: 'boffin-puzzle', count: 9, style: 'bluff-heavy', roles: ['shugenja', 'highpriestess', 'dreamer', 'savant', 'seamstress', 'politician', 'puzzlemaster', 'boffin', 'riot'], bluffs: ['noble', 'alsaahir', 'fisherman'], note: 'Quick Maths 9 人博芬模板：恶魔获得不在场善良能力只做提醒，政客保持赛后裁量。' }),

  template({ id: 'info-two-minions', count: 10, style: 'balanced', roles: ['noble', 'shugenja', 'pixie', 'general', 'dreamer', 'savant', 'seamstress', 'spy', 'boffin', 'riot'], bluffs: ['highpriestess', 'alsaahir', 'juggler'], note: 'Quick Maths 10 人双爪牙信息模板：0 外来者时不放扎恩，博芬额外能力和间谍登记只做提示。' }),
  template({ id: 'public-pressure', count: 10, style: 'chaos', roles: ['highpriestess', 'alsaahir', 'nightwatchman', 'philosopher', 'fisherman', 'juggler', 'general', 'marionette', 'spy', 'riot'], bluffs: ['noble', 'pixie', 'dreamer'], note: 'Quick Maths 10 人白天压力模板：阿尔萨希尔和杂耍艺人推动公开信息，提线木偶需人工核对相邻。' }),
  template({ id: 'boffin-marionette', count: 10, style: 'bluff-heavy', roles: ['noble', 'pixie', 'dreamer', 'savant', 'seamstress', 'philosopher', 'juggler', 'boffin', 'marionette', 'riot'], bluffs: ['shugenja', 'highpriestess', 'fisherman'], note: 'Quick Maths 10 人错认模板：提线木偶与博芬同时提供邪恶方伪装空间，身份错认不自动改状态。' }),

  template({ id: 'xaan-one-outsider', count: 11, style: 'balanced', roles: ['noble', 'shugenja', 'pixie', 'general', 'dreamer', 'savant', 'seamstress', 'ogre', 'xaan', 'spy', 'riot'], bluffs: ['highpriestess', 'alsaahir', 'juggler'], note: 'Quick Maths 11 人扎恩模板：1 名外来者时第 1 夜镇民中毒提醒，信息源数量适合标准桌。' }),
  template({ id: 'snitch-bluffs', count: 11, style: 'bluff-heavy', roles: ['highpriestess', 'alsaahir', 'nightwatchman', 'philosopher', 'fisherman', 'juggler', 'general', 'snitch', 'marionette', 'boffin', 'riot'], bluffs: ['noble', 'pixie', 'dreamer'], note: 'Quick Maths 11 人伪装模板：告密者与博芬都影响邪恶信息流，按爪牙分别记录伪装。' }),

  template({ id: 'xaan-two-outsiders', count: 12, style: 'balanced', roles: ['noble', 'shugenja', 'pixie', 'general', 'dreamer', 'savant', 'seamstress', 'ogre', 'puzzlemaster', 'xaan', 'spy', 'riot'], bluffs: ['highpriestess', 'alsaahir', 'juggler'], note: 'Quick Maths 12 人扎恩模板：2 名外来者对应第 2 夜镇民中毒提醒，解谜大师醉酒目标单独标记。' }),
  template({ id: 'marionette-boffin', count: 12, style: 'chaos', roles: ['highpriestess', 'alsaahir', 'nightwatchman', 'philosopher', 'fisherman', 'juggler', 'general', 'politician', 'snitch', 'marionette', 'boffin', 'riot'], bluffs: ['noble', 'pixie', 'dreamer'], note: 'Quick Maths 12 人高压模板：白天公开猜测、提线木偶和博芬同局，适合熟手主持。' }),
  template({ id: 'spy-boffin', count: 12, style: 'long-game', roles: ['noble', 'pixie', 'dreamer', 'seamstress', 'philosopher', 'fisherman', 'juggler', 'ogre', 'politician', 'spy', 'boffin', 'riot'], bluffs: ['shugenja', 'highpriestess', 'savant'], note: 'Quick Maths 12 人长局模板：信息源分散，政客与食人魔的阵营结果都不主动告知玩家。' }),

  template({ id: 'zero-outsider-riot', count: 13, style: 'balanced', roles: ['noble', 'shugenja', 'pixie', 'highpriestess', 'general', 'dreamer', 'savant', 'seamstress', 'juggler', 'spy', 'marionette', 'boffin', 'riot'], bluffs: ['alsaahir', 'nightwatchman', 'fisherman'], note: 'Quick Maths 13 人零外来者模板：不放扎恩，三爪牙让暴乱第 3 天提醒更重要。' }),
  template({ id: 'public-zero-outsider', count: 13, style: 'chaos', roles: ['noble', 'general', 'dreamer', 'savant', 'alsaahir', 'nightwatchman', 'philosopher', 'fisherman', 'juggler', 'spy', 'boffin', 'marionette', 'riot'], bluffs: ['shugenja', 'pixie', 'highpriestess'], note: 'Quick Maths 13 人公开模板：阿尔萨希尔、杂耍艺人和守夜人制造大量公开线索。' }),

  template({ id: 'xaan-one-large', count: 14, style: 'balanced', roles: ['noble', 'shugenja', 'pixie', 'highpriestess', 'general', 'dreamer', 'savant', 'seamstress', 'juggler', 'ogre', 'spy', 'xaan', 'boffin', 'riot'], bluffs: ['alsaahir', 'nightwatchman', 'fisherman'], note: 'Quick Maths 14 人扎恩大局：1 名外来者对应第 1 夜提醒，博芬能力选择需要避开在场善良角色。' }),
  template({ id: 'snitch-large', count: 14, style: 'bluff-heavy', roles: ['shugenja', 'general', 'dreamer', 'savant', 'alsaahir', 'nightwatchman', 'philosopher', 'fisherman', 'juggler', 'snitch', 'spy', 'marionette', 'boffin', 'riot'], bluffs: ['noble', 'pixie', 'highpriestess'], note: 'Quick Maths 14 人告密者大局：三爪牙伪装压力强，适合熟手桌和投票节奏练习。' }),

  template({ id: 'xaan-two-large', count: 15, style: 'balanced', roles: ['noble', 'shugenja', 'pixie', 'highpriestess', 'general', 'dreamer', 'savant', 'seamstress', 'juggler', 'ogre', 'puzzlemaster', 'spy', 'xaan', 'boffin', 'riot'], bluffs: ['alsaahir', 'nightwatchman', 'fisherman'], note: 'Quick Maths 15 人扎恩大局：2 名外来者对应第 2 夜提醒，解谜大师和博芬都要保留人工确认。' }),
  template({ id: 'snitch-marionette', count: 15, style: 'chaos', roles: ['shugenja', 'general', 'dreamer', 'savant', 'alsaahir', 'nightwatchman', 'philosopher', 'fisherman', 'juggler', 'politician', 'snitch', 'xaan', 'marionette', 'boffin', 'riot'], bluffs: ['noble', 'pixie', 'highpriestess'], note: 'Quick Maths 15 人错认大局：告密者、提线木偶、扎恩和博芬都在场，适合熟手主持。' }),
  template({ id: 'spy-marionette', count: 15, style: 'long-game', roles: ['noble', 'pixie', 'highpriestess', 'general', 'dreamer', 'seamstress', 'philosopher', 'fisherman', 'juggler', 'ogre', 'politician', 'spy', 'marionette', 'boffin', 'riot'], bluffs: ['shugenja', 'savant', 'alsaahir'], note: 'Quick Maths 15 人长局模板：间谍和提线木偶给邪恶方操作空间，投票链仍由说书人确认。' }),
]
