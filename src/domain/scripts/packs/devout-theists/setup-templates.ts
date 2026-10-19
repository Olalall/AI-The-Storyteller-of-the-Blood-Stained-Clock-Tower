import type { PlayerCount, RoleId, SetupAdjustment, SetupTemplate, SetupTemplateStyle } from '../../types'

const scriptId = 'devout-theists'

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
  return input.fangGuAddsOutsider ? [fangGuOutsiderAdjustment] : []
}

export const devoutTheistsSetupTemplates: readonly SetupTemplate[] = [
  template({ id: 'starter-lleech', count: 7, style: 'beginner', roles: ['chef', 'noble', 'flowergirl', 'savant', 'juggler', 'goblin', 'lleech'], bluffs: ['pixie', 'highpriestess', 'farmer'], note: 'Devout Theists 7 人入门模板：厨师、贵族和卖花女孩给清晰信息，痢蛭宿主只做人工记录。' }),
  template({ id: 'fanggu-golem', count: 7, style: 'balanced', roles: ['noble', 'pixie', 'mathematician', 'fisherman', 'golem', 'widow', 'fanggu'], bluffs: ['chef', 'flowergirl', 'cannibal'], note: 'Devout Theists 7 人方古模板：方古增加外来者，魔像提名死亡与新方古链路都不自动执行。', fangGuAddsOutsider: true }),
  template({ id: 'kazali-marionette', count: 7, style: 'chaos', roles: ['chef', 'highpriestess', 'amnesiac', 'farmer', 'magician', 'mathematician', 'kazali'], bluffs: ['noble', 'pixie', 'savant'], note: '卡扎力 7 人开局：初始袋子只有卡扎力与善良角色；首夜选择 1 组玩家与不同爪牙，模板不预定人选。' }),

  template({ id: 'widow-puzzle', count: 8, style: 'balanced', roles: ['chef', 'pixie', 'flowergirl', 'savant', 'cannibal', 'puzzlemaster', 'widow', 'lleech'], bluffs: ['noble', 'juggler', 'farmer'], note: 'Devout Theists 8 人寡妇模板：寡妇中毒、解谜大师醉酒和痢蛭宿主要分开记录。' }),
  template({ id: 'fanggu-snitch', count: 8, style: 'bluff-heavy', roles: ['noble', 'highpriestess', 'mathematician', 'juggler', 'snitch', 'klutz', 'goblin', 'fanggu'], bluffs: ['chef', 'amnesiac', 'fisherman'], note: 'Devout Theists 8 人告密者模板：每个爪牙各有伪装，方古增加外来者。', fangGuAddsOutsider: true }),

  template({ id: 'kazali-golem', count: 9, style: 'balanced', roles: ['noble', 'chef', 'pixie', 'savant', 'farmer', 'golem', 'puzzlemaster', 'flowergirl', 'kazali'], bluffs: ['highpriestess', 'mathematician', 'fisherman'], note: '卡扎力 9 人开局：初始袋子只有卡扎力与善良角色；首夜选择 1 组玩家与不同爪牙，模板不预定人选。' }),
  template({ id: 'fanggu-klutz', count: 9, style: 'chaos', roles: ['highpriestess', 'flowergirl', 'juggler', 'cannibal', 'klutz', 'golem', 'snitch', 'widow', 'fanggu'], bluffs: ['noble', 'pixie', 'amnesiac'], note: 'Devout Theists 9 人方古混乱模板：呆瓜、魔像、告密者和寡妇都制造公开风险，适合熟手桌。', fangGuAddsOutsider: true }),

  template({ id: 'lleech-public', count: 10, style: 'balanced', roles: ['noble', 'chef', 'pixie', 'flowergirl', 'savant', 'juggler', 'fisherman', 'widow', 'goblin', 'lleech'], bluffs: ['highpriestess', 'farmer', 'magician'], note: 'Devout Theists 10 人公开模板：哥布林和卖花女孩推动投票观察，痢蛭宿主保持隐藏记录。' }),
  template({ id: 'kazali-marionette', count: 10, style: 'bluff-heavy', roles: ['noble', 'highpriestess', 'mathematician', 'amnesiac', 'fisherman', 'farmer', 'magician', 'flowergirl', 'savant', 'kazali'], bluffs: ['chef', 'pixie', 'cannibal'], note: '卡扎力 10 人开局：初始袋子只有卡扎力与善良角色；首夜选择 2 组玩家与不同爪牙，模板不预定人选。' }),
  template({ id: 'fanggu-puzzle', count: 10, style: 'long-game', roles: ['chef', 'pixie', 'flowergirl', 'savant', 'juggler', 'cannibal', 'puzzlemaster', 'widow', 'psychopath', 'fanggu'], bluffs: ['noble', 'highpriestess', 'farmer'], note: 'Devout Theists 10 人方古模板：方古增加解谜大师，寡妇与精神病患者带来状态和公开死亡压力。', fangGuAddsOutsider: true }),

  template({ id: 'lleech-control', count: 11, style: 'balanced', roles: ['noble', 'chef', 'pixie', 'mathematician', 'flowergirl', 'savant', 'cannibal', 'puzzlemaster', 'widow', 'goblin', 'lleech'], bluffs: ['highpriestess', 'juggler', 'farmer'], note: 'Devout Theists 11 人痢蛭模板：信息源稳定，宿主和解谜大师醉酒目标要分别标记。' }),
  template({ id: 'fanggu-snitch-large', count: 11, style: 'bluff-heavy', roles: ['highpriestess', 'amnesiac', 'juggler', 'fisherman', 'farmer', 'magician', 'snitch', 'klutz', 'psychopath', 'marionette', 'fanggu'], bluffs: ['noble', 'chef', 'pixie'], note: 'Devout Theists 11 人方古伪装模板：告密者给邪恶方更多伪装，提线木偶和方古链路只做提醒。', fangGuAddsOutsider: true }),

  template({ id: 'kazali-standard', count: 12, style: 'balanced', roles: ['noble', 'chef', 'pixie', 'flowergirl', 'savant', 'juggler', 'farmer', 'golem', 'puzzlemaster', 'amnesiac', 'magician', 'kazali'], bluffs: ['highpriestess', 'mathematician', 'fisherman'], note: '卡扎力 12 人开局：初始袋子只有卡扎力与善良角色；首夜选择 2 组玩家与不同爪牙，模板不预定人选。' }),
  template({ id: 'lleech-snitch', count: 12, style: 'chaos', roles: ['highpriestess', 'mathematician', 'amnesiac', 'fisherman', 'farmer', 'magician', 'cannibal', 'snitch', 'klutz', 'goblin', 'psychopath', 'lleech'], bluffs: ['noble', 'chef', 'pixie'], note: 'Devout Theists 12 人痢蛭伪装模板：告密者、哥布林和精神病患者强化白天风险。' }),
  template({ id: 'fanggu-pressure', count: 12, style: 'long-game', roles: ['noble', 'chef', 'pixie', 'flowergirl', 'savant', 'cannibal', 'puzzlemaster', 'golem', 'snitch', 'widow', 'psychopath', 'fanggu'], bluffs: ['highpriestess', 'juggler', 'fisherman'], note: 'Devout Theists 12 人方古压力模板：方古增加外来者，寡妇和魔像都可能产生额外死亡。', fangGuAddsOutsider: true }),

  template({ id: 'no-outsider-lleech', count: 13, style: 'balanced', roles: ['noble', 'chef', 'pixie', 'highpriestess', 'mathematician', 'flowergirl', 'savant', 'juggler', 'cannibal', 'widow', 'goblin', 'psychopath', 'lleech'], bluffs: ['amnesiac', 'fisherman', 'farmer'], note: 'Devout Theists 13 人零外来者模板：三爪牙公开压力强，但没有外来者转化链路。' }),
  template({ id: 'fanggu-one', count: 13, style: 'chaos', roles: ['noble', 'chef', 'pixie', 'flowergirl', 'savant', 'amnesiac', 'fisherman', 'magician', 'golem', 'widow', 'marionette', 'psychopath', 'fanggu'], bluffs: ['highpriestess', 'mathematician', 'cannibal'], note: 'Devout Theists 13 人方古模板：方古增加 1 外来者，魔术师和提线木偶让邪恶信息更复杂。', fangGuAddsOutsider: true }),

  template({ id: 'kazali-large', count: 14, style: 'balanced', roles: ['noble', 'chef', 'pixie', 'highpriestess', 'mathematician', 'flowergirl', 'savant', 'juggler', 'farmer', 'puzzlemaster', 'magician', 'klutz', 'golem', 'kazali'], bluffs: ['amnesiac', 'fisherman', 'cannibal'], note: '卡扎力 14 人开局：初始袋子只有卡扎力与善良角色；首夜选择 3 组玩家与不同爪牙，模板不预定人选。' }),
  template({ id: 'fanggu-snitch-14', count: 14, style: 'bluff-heavy', roles: ['chef', 'pixie', 'mathematician', 'flowergirl', 'savant', 'amnesiac', 'fisherman', 'cannibal', 'snitch', 'klutz', 'widow', 'psychopath', 'marionette', 'fanggu'], bluffs: ['noble', 'highpriestess', 'juggler'], note: 'Devout Theists 14 人方古伪装大局：告密者和三爪牙提供高伪装空间，适合熟手桌。', fangGuAddsOutsider: true }),

  template({ id: 'lleech-15', count: 15, style: 'balanced', roles: ['noble', 'chef', 'pixie', 'highpriestess', 'mathematician', 'flowergirl', 'savant', 'juggler', 'cannibal', 'puzzlemaster', 'golem', 'widow', 'goblin', 'psychopath', 'lleech'], bluffs: ['amnesiac', 'fisherman', 'farmer'], note: 'Devout Theists 15 人痢蛭模板：信息源密集，宿主保护、寡妇中毒和公开死亡都要分层记录。' }),
  template({ id: 'kazali-magician', count: 15, style: 'chaos', roles: ['noble', 'chef', 'pixie', 'highpriestess', 'amnesiac', 'fisherman', 'farmer', 'magician', 'cannibal', 'snitch', 'klutz', 'juggler', 'puzzlemaster', 'golem', 'kazali'], bluffs: ['mathematician', 'flowergirl', 'savant'], note: '卡扎力 15 人开局：初始袋子只有卡扎力与善良角色；首夜选择 3 组玩家与不同爪牙，模板不预定人选。' }),
  template({ id: 'fanggu-15', count: 15, style: 'long-game', roles: ['chef', 'pixie', 'mathematician', 'flowergirl', 'savant', 'juggler', 'fisherman', 'magician', 'puzzlemaster', 'golem', 'snitch', 'widow', 'goblin', 'marionette', 'fanggu'], bluffs: ['noble', 'highpriestess', 'farmer'], note: 'Devout Theists 15 人方古长局模板：方古增加外来者，告密者和魔术师给邪恶方更大操作空间。', fangGuAddsOutsider: true }),
]
