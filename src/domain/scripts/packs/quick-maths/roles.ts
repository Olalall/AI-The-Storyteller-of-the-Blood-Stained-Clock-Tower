import type { AbilityInputKind, KnowledgeStatus, RoleResearchMetadata, RoleTeam, SmartRoleDefinition } from '../../types'

const rolesSourceUrl = 'https://release.botc.app/resources/data/roles.json'
const scriptSourceUrl = 'https://botc-script-viewer.sthom.kiwi/carousel/quick-maths/quick-maths.json'
const reviewedAt = '2026-07-20'

type RoleInput = {
  id: string
  name: string
  officialName: string
  team: RoleTeam
  abilityText: string
  inputKinds?: readonly AbilityInputKind[]
  setupImpact?: readonly string[]
  possibleOutcomes?: readonly string[]
  stateChanges?: readonly string[]
  identityChanges?: readonly string[]
  teamChanges?: readonly string[]
  playerMessageTemplates?: readonly string[]
  highRiskNotes?: readonly string[]
  knowledgeStatus?: KnowledgeStatus
}

function role(input: RoleInput): SmartRoleDefinition {
  return {
    id: input.id,
    name: input.name,
    officialName: input.officialName,
    team: input.team,
    abilityText: input.abilityText,
    iconPath: `/assets/characters/${input.id}.webp`,
    inputKinds: input.inputKinds ?? ['none'],
    knowledgeStatus: input.knowledgeStatus ?? 'confirmed',
    research: research(input),
  }
}

function research(input: RoleInput): RoleResearchMetadata {
  return {
    edition: 'Quick Maths',
    setupImpact: input.setupImpact ?? [],
    possibleOutcomes: input.possibleOutcomes ?? [],
    stateChanges: input.stateChanges ?? [],
    identityChanges: input.identityChanges ?? [],
    teamChanges: input.teamChanges ?? [],
    playerMessageTemplates: input.playerMessageTemplates ?? [],
    highRiskNotes: input.highRiskNotes ?? [],
    sourceUrls: [rolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  }
}

export const quickMathsRoles: readonly SmartRoleDefinition[] = [
  role({ id: 'noble', name: '贵族', officialName: 'Noble', team: 'townsfolk', abilityText: 'You start knowing 3 players, 1 and only 1 of which is evil.', inputKinds: ['players'], possibleOutcomes: ['告知 3 名玩家，其中有且只有 1 名邪恶。'], playerMessageTemplates: ['你得知：{seatA}号、{seatB}号、{seatC}号中有且只有 1 名邪恶。'] }),
  role({ id: 'shugenja', name: '修验者', officialName: 'Shugenja', team: 'townsfolk', abilityText: 'You start knowing if your closest evil player is clockwise or anti-clockwise. If equidistant, this info is arbitrary.', inputKinds: ['text'], possibleOutcomes: ['顺时针。', '逆时针。', '距离相等时可由说书人任选方向。'], playerMessageTemplates: ['你得知：最近的邪恶玩家在{direction}方向。'], highRiskNotes: ['若两侧最近邪恶等距，信息由说书人裁量。'] }),
  role({ id: 'pixie', name: '小精灵', officialName: 'Pixie', team: 'townsfolk', abilityText: 'You start knowing 1 in-play Townsfolk. If you were mad you are this character, gain their ability when they die.', inputKinds: ['role'], possibleOutcomes: ['得知 1 个在场镇民。', '若保持疯狂且该角色死亡，获得其能力。'], identityChanges: ['可能获得被告知镇民的能力。'], playerMessageTemplates: ['你得知：场上有{role}。'], highRiskNotes: ['是否疯狂、是否获得能力都由说书人确认。'] }),
  role({ id: 'highpriestess', name: '女祭司', officialName: 'High Priestess', team: 'townsfolk', abilityText: 'Each night, learn which player the Storyteller believes you should talk to most.', inputKinds: ['player'], possibleOutcomes: ['告知说书人认为最应该交流的一名玩家。'], playerMessageTemplates: ['你得知：今晚你最应该找 {seat}号 交流。'], highRiskNotes: ['这是说书人判断型信息，给谁由说书人确认。'] }),
  role({ id: 'general', name: '将军', officialName: 'General', team: 'townsfolk', abilityText: 'Each night, you learn which alignment the Storyteller believes is winning: good, evil, or neither.', inputKinds: ['text'], possibleOutcomes: ['善良领先。', '邪恶领先。', '双方无明显优势。'], playerMessageTemplates: ['你得知：{alignment}。'], highRiskNotes: ['这是说书人判断信息，不由工具根据局面自动计算。'] }),
  role({ id: 'dreamer', name: '筑梦师', officialName: 'Dreamer', team: 'townsfolk', abilityText: 'Each night, choose a player (not yourself or Travellers): you learn 1 good and 1 evil character, 1 of which is correct.', inputKinds: ['player'], possibleOutcomes: ['告知一个善良角色和一个邪恶角色，其中一个为真。'], playerMessageTemplates: ['你得知：{seat}号可能是{goodRole}或{evilRole}。'] }),
  role({ id: 'savant', name: '博学者', officialName: 'Savant', team: 'townsfolk', abilityText: 'Each day, you may visit the Storyteller to learn 2 things in private: 1 is true & 1 is false.', inputKinds: ['text'], possibleOutcomes: ['给出两条信息：一真一假。'], playerMessageTemplates: ['信息一：{factA}。信息二：{factB}。'], highRiskNotes: ['信息内容由说书人撰写；AI 只能辅助润色。'] }),
  role({ id: 'alsaahir', name: '阿尔萨希尔', officialName: 'Alsaahir', team: 'townsfolk', abilityText: 'Each day, if you publicly guess which players are Minion(s) and which are Demon(s), good wins.', inputKinds: ['players'], possibleOutcomes: ['公开猜中所有爪牙和恶魔：善良胜利。', '未猜中：无事发生。'], stateChanges: ['可能触发善良胜利。'], highRiskNotes: ['是否公开、是否完整命中和胜负必须由说书人确认。'] }),
  role({ id: 'nightwatchman', name: '守夜人', officialName: 'Nightwatchman', team: 'townsfolk', abilityText: 'Once per game, at night, choose a player: they learn you are the Nightwatchman.', inputKinds: ['player'], possibleOutcomes: ['目标得知你是守夜人。'], playerMessageTemplates: ['你得知：{seat}号是守夜人。'] }),
  role({ id: 'seamstress', name: '女裁缝', officialName: 'Seamstress', team: 'townsfolk', abilityText: 'Once per game, at night, choose 2 players (not yourself): you learn if they are the same alignment.', inputKinds: ['players'], possibleOutcomes: ['同阵营。', '不同阵营。'], playerMessageTemplates: ['是。', '否。'] }),
  role({ id: 'philosopher', name: '哲学家', officialName: 'Philosopher', team: 'townsfolk', abilityText: 'Once per game, at night, choose a good character: gain that ability. If this character is in play, they are drunk.', inputKinds: ['role'], possibleOutcomes: ['获得所选善良角色能力。', '若该角色在场，原角色醉酒。'], stateChanges: ['被选择且在场的角色醉酒。'], identityChanges: ['哲学家获得一个善良角色能力。'], highRiskNotes: ['获得能力只写入提示和草稿；不为所选角色生成自动状态机。'] }),
  role({ id: 'fisherman', name: '渔夫', officialName: 'Fisherman', team: 'townsfolk', abilityText: 'Once per game, during the day, visit the Storyteller for some advice to help your team win.', inputKinds: ['text'], possibleOutcomes: ['给出帮助善良阵营获胜的建议。'], playerMessageTemplates: ['建议：{advice}'], highRiskNotes: ['建议应帮助玩家推进游戏，但不要直接泄露完整魔典。'] }),
  role({ id: 'juggler', name: '杂耍艺人', officialName: 'Juggler', team: 'townsfolk', abilityText: "On your 1st day, publicly guess up to 5 players' characters. That night, you learn how many you got correct.", inputKinds: ['players', 'role', 'number'], possibleOutcomes: ['当晚得知首日公开猜测命中数量。'], playerMessageTemplates: ['你猜对了 {count} 个。'], highRiskNotes: ['白天公开猜测要逐条记录；命中数量由说书人核对。'] }),
  role({ id: 'ogre', name: '食人魔', officialName: 'Ogre', team: 'outsider', abilityText: "On your 1st night, choose a player (not yourself): you become their alignment (you don't know which) even if drunk or poisoned.", inputKinds: ['player'], teamChanges: ['首夜选择后变成目标阵营，即使醉酒或中毒也会发生。'], playerMessageTemplates: ['你选择了{seat}号。'], highRiskNotes: ['玩家不知道自己阵营结果；说书人确认后追加阵营变化。'] }),
  role({ id: 'politician', name: '政客', officialName: 'Politician', team: 'outsider', abilityText: 'If you were the player most responsible for your team losing, you change alignment & win, even if dead.', inputKinds: ['none'], possibleOutcomes: ['若最应为本阵营失败负责，赛后改变阵营并获胜。'], teamChanges: ['可能在赛后改变阵营。'], highRiskNotes: ['这是赛后裁量，不在对局中自动改变阵营。'] }),
  role({ id: 'snitch', name: '告密者', officialName: 'Snitch', team: 'outsider', abilityText: 'Each Minion gets 3 bluffs.', inputKinds: ['none'], setupImpact: ['每个爪牙各得 3 个伪装。'], highRiskNotes: ['伪装信息要按爪牙分别记录，不能默认只给恶魔 3 个。'] }),
  role({ id: 'puzzlemaster', name: '解谜大师', officialName: 'Puzzlemaster', team: 'outsider', abilityText: '1 player is drunk, even if you die. Once per game, guess who: learn the Demon if correct, but false info if not.', inputKinds: ['player'], possibleOutcomes: ['猜中醉酒玩家：得知恶魔。', '猜错：得到假信息。'], stateChanges: ['有 1 名玩家醉酒，即使解谜大师死亡也持续。'], highRiskNotes: ['醉酒目标和猜测结果都由说书人确认。'] }),
  role({ id: 'spy', name: '间谍', officialName: 'Spy', team: 'minion', abilityText: 'Each night, you see the Grimoire. You might register as good & as a Townsfolk or Outsider, even if dead.', inputKinds: ['none'], possibleOutcomes: ['查看完整魔典。', '可能被登记为善良或镇民/外来者。'], highRiskNotes: ['登记异常由说书人裁量。'] }),
  role({ id: 'xaan', name: '扎恩', officialName: 'Xaan', team: 'minion', abilityText: 'On night X, all Townsfolk are poisoned until dusk. [X Outsiders]', inputKinds: ['number'], setupImpact: ['外来者数量为 X；第 X 夜所有镇民中毒到黄昏。'], stateChanges: ['第 X 夜所有镇民中毒到黄昏。'], highRiskNotes: ['X 与外来者数量绑定；中毒范围只做提醒，不能批量自动改状态。'] }),
  role({ id: 'marionette', name: '提线木偶', officialName: 'Marionette', team: 'minion', abilityText: 'You think you are a good character, but you are not. The Demon knows who you are. [You neighbor the Demon]', inputKinds: ['none'], setupImpact: ['必须与恶魔相邻，恶魔知道其身份。'], possibleOutcomes: ['玩家以为自己是善良角色，但实际为爪牙。'], highRiskNotes: ['配座位时人工核对相邻；不自动重排座位。'] }),
  role({ id: 'boffin', name: '博芬', officialName: 'Boffin', team: 'minion', abilityText: 'The Demon (even if drunk or poisoned) has a not-in-play good character’s ability. You both know which.', inputKinds: ['role'], possibleOutcomes: ['恶魔获得一个不在场善良角色能力。'], identityChanges: ['恶魔额外拥有一个善良角色能力。'], highRiskNotes: ['恶魔获得能力只做提醒；不自动执行该善良角色状态机。'] }),
  role({ id: 'riot', name: '暴乱', officialName: 'Riot', team: 'demon', abilityText: 'On day 3, Minions become Riot & nominees die but nominate an alive player immediately. This must happen.', inputKinds: ['player'], possibleOutcomes: ['第 3 天爪牙变成暴乱。', '被提名者死亡并立即提名一名存活玩家。'], stateChanges: ['可能造成连续死亡和恶魔数量变化。'], identityChanges: ['第 3 天爪牙变成暴乱。'], highRiskNotes: ['胜负、提名链和死亡都必须由说书人确认；工具只记录票型和提醒。'] }),
]
