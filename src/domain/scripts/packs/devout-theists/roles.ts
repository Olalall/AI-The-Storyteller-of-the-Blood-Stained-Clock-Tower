import type { AbilityInputKind, KnowledgeStatus, RoleResearchMetadata, RoleTeam, SmartRoleDefinition } from '../../types'

const rolesSourceUrl = 'https://release.botc.app/resources/data/roles.json'
const scriptSourceUrl = 'https://botc-script-viewer.sthom.kiwi/carousel/devout-theists/devout-theists.json'
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
    edition: 'Devout Theists',
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

export const devoutTheistsRoles: readonly SmartRoleDefinition[] = [
  role({ id: 'noble', name: '贵族', officialName: 'Noble', team: 'townsfolk', abilityText: 'You start knowing 3 players, 1 and only 1 of which is evil.', inputKinds: ['players'], possibleOutcomes: ['告知 3 名玩家，其中有且只有 1 名邪恶。'], playerMessageTemplates: ['你得知：{seatA}号、{seatB}号、{seatC}号中有且只有 1 名邪恶。'] }),
  role({ id: 'chef', name: '厨师', officialName: 'Chef', team: 'townsfolk', abilityText: 'You start knowing how many pairs of evil players there are.', inputKinds: ['number'], possibleOutcomes: ['告知相邻邪恶玩家对数。'], playerMessageTemplates: ['你得知：有 {count} 对邪恶玩家相邻。'] }),
  role({ id: 'pixie', name: '小精灵', officialName: 'Pixie', team: 'townsfolk', abilityText: 'You start knowing 1 in-play Townsfolk. If you were mad that you were this character, you gain their ability when they die.', inputKinds: ['role'], possibleOutcomes: ['得知 1 个在场镇民。', '若保持疯狂且该角色死亡，获得其能力。'], identityChanges: ['可能获得被告知镇民的能力。'], playerMessageTemplates: ['你得知：场上有{role}。'], highRiskNotes: ['是否疯狂、是否获得能力都由说书人确认。'] }),
  role({ id: 'highpriestess', name: '女祭司', officialName: 'High Priestess', team: 'townsfolk', abilityText: 'Each night, learn which player the Storyteller believes you should talk to most.', inputKinds: ['player'], possibleOutcomes: ['告知说书人认为最应该交流的一名玩家。'], playerMessageTemplates: ['你得知：今晚你最应该找 {seat}号 交流。'], highRiskNotes: ['这是说书人判断型信息，给谁由说书人确认。'] }),
  role({ id: 'mathematician', name: '数学家', officialName: 'Mathematician', team: 'townsfolk', abilityText: "Each night, you learn how many players’ abilities worked abnormally (since dawn) due to another character's ability.", inputKinds: ['number'], possibleOutcomes: ['告知上个白天以来异常生效的玩家数量。'], playerMessageTemplates: ['你得知：有 {count} 名玩家能力异常生效。'], highRiskNotes: ['异常生效数量由说书人根据当局上下文判断。'] }),
  role({ id: 'flowergirl', name: '卖花女孩', officialName: 'Flowergirl', team: 'townsfolk', abilityText: 'Each night*, you learn if a Demon voted today.', inputKinds: ['text'], possibleOutcomes: ['今天恶魔投票了。', '今天恶魔没有投票。'], playerMessageTemplates: ['是。', '否。'] }),
  role({ id: 'savant', name: '博学者', officialName: 'Savant', team: 'townsfolk', abilityText: 'Each day, you may visit the Storyteller to learn 2 things in private: 1 is true & 1 is false.', inputKinds: ['text'], possibleOutcomes: ['给出两条信息：一真一假。'], playerMessageTemplates: ['信息一：{factA}。信息二：{factB}。'], highRiskNotes: ['信息内容由说书人撰写；AI 只能辅助润色。'] }),
  role({ id: 'amnesiac', name: '失忆者', officialName: 'Amnesiac', team: 'townsfolk', abilityText: 'You do not know what your ability is. Each day, privately guess what it is: you learn how accurate you are.', inputKinds: ['text'], possibleOutcomes: ['告知能力猜测接近程度。'], identityChanges: ['说书人私下设定能力。'], highRiskNotes: ['能力本体必须由说书人设定，AI 不能发明权威能力。'] }),
  role({ id: 'juggler', name: '杂耍艺人', officialName: 'Juggler', team: 'townsfolk', abilityText: "On your 1st day, publicly guess up to 5 players' characters. That night, you learn how many you got correct.", inputKinds: ['players', 'role', 'number'], possibleOutcomes: ['当晚得知首日公开猜测命中数量。'], playerMessageTemplates: ['你猜对了 {count} 个。'], highRiskNotes: ['白天公开猜测要逐条记录；命中数量由说书人核对。'] }),
  role({ id: 'fisherman', name: '渔夫', officialName: 'Fisherman', team: 'townsfolk', abilityText: 'Once per game, during the day, visit the Storyteller for some advice to help your team win.', inputKinds: ['text'], possibleOutcomes: ['给出帮助善良阵营获胜的建议。'], playerMessageTemplates: ['建议：{advice}'], highRiskNotes: ['建议应帮助玩家推进游戏，但不要直接泄露完整魔典。'] }),
  role({ id: 'farmer', name: '农夫', officialName: 'Farmer', team: 'townsfolk', abilityText: 'When you die at night, an alive good player becomes a Farmer.', inputKinds: ['player'], possibleOutcomes: ['夜晚死亡后，一名存活善良玩家变成农夫。'], identityChanges: ['一名存活善良玩家可能变成农夫。'], highRiskNotes: ['新农夫由说书人确认，追加身份更正，不自动改身份。'] }),
  role({ id: 'magician', name: '魔术师', officialName: 'Magician', team: 'townsfolk', abilityText: 'The Demon thinks you are a Minion. Minions think you are a Demon.', inputKinds: ['none'], setupImpact: ['影响恶魔和爪牙开局互认信息。'], highRiskNotes: ['只影响信息流，不改变真实身份或阵营。'] }),
  role({ id: 'cannibal', name: '食人族', officialName: 'Cannibal', team: 'townsfolk', abilityText: 'You have the ability of the recently killed executee. If they are evil, you are poisoned until a good player dies by execution.', inputKinds: ['role'], possibleOutcomes: ['获得最近被处决者能力。', '若该被处决者邪恶，食人族中毒。'], stateChanges: ['可能中毒直到善良玩家被处决死亡。'], highRiskNotes: ['借用能力只做提醒，不自动进入被借用角色状态机。'] }),
  role({ id: 'puzzlemaster', name: '解谜大师', officialName: 'Puzzlemaster', team: 'outsider', abilityText: '1 player is drunk, even if you die. If you guess (once) who it is, learn the Demon player, but guess wrong & get false info.', inputKinds: ['player'], possibleOutcomes: ['猜中醉酒玩家：得知恶魔。', '猜错：得到假信息。'], stateChanges: ['有 1 名玩家醉酒，即使解谜大师死亡也持续。'], highRiskNotes: ['醉酒目标和猜测结果都由说书人确认。'] }),
  role({ id: 'klutz', name: '呆瓜', officialName: 'Klutz', team: 'outsider', abilityText: 'When you learn that you died, publicly choose 1 alive player: if they are evil, your team loses.', inputKinds: ['player'], possibleOutcomes: ['公开选择存活玩家。', '若目标邪恶，善良阵营失败。'], stateChanges: ['可能触发善良失败。'], highRiskNotes: ['死亡确认后才处理选择；胜负必须由说书人确认。'] }),
  role({ id: 'golem', name: '魔像', officialName: 'Golem', team: 'outsider', abilityText: 'You may only nominate once per game. When you do, if the nominee is not the Demon, they die.', inputKinds: ['player'], possibleOutcomes: ['首次提名若目标不是恶魔，目标死亡。'], stateChanges: ['可能造成被提名者死亡。'], highRiskNotes: ['提名次数和是否恶魔由说书人确认；不自动杀人。'] }),
  role({ id: 'snitch', name: '告密者', officialName: 'Snitch', team: 'outsider', abilityText: 'Each Minion gets 3 bluffs.', inputKinds: ['none'], setupImpact: ['每个爪牙各得 3 个伪装。'], highRiskNotes: ['伪装信息要按爪牙分别记录，不能默认只给恶魔 3 个。'] }),
  role({ id: 'widow', name: '寡妇', officialName: 'Widow', team: 'minion', abilityText: 'On your 1st night, look at the Grimoire & choose a player: they are poisoned. 1 good player knows a Widow is in play.', inputKinds: ['player'], possibleOutcomes: ['查看魔典并选择一名玩家中毒。', '一名善良玩家得知寡妇在场。'], stateChanges: ['一名玩家中毒。'], highRiskNotes: ['中毒目标和得知寡妇的善良玩家都由说书人确认。'] }),
  role({ id: 'goblin', name: '哥布林', officialName: 'Goblin', team: 'minion', abilityText: 'If you publicly claim to be the Goblin when nominated & are executed that day, your team wins.', inputKinds: ['none'], possibleOutcomes: ['被提名时公开声明哥布林且当天被处决，邪恶胜利。'], stateChanges: ['可能触发邪恶胜利。'], highRiskNotes: ['公开声明、当天处决和胜负必须由说书人确认。'] }),
  role({ id: 'psychopath', name: '精神病态者', officialName: 'Psychopath', team: 'minion', abilityText: 'Each day, before nominations, you may publicly choose a player: they die. If executed, you only die if you lose roshambo.', inputKinds: ['player'], possibleOutcomes: ['每天提名前公开选择一名玩家死亡。', '被处决时猜拳决定是否死亡。'], stateChanges: ['可能造成公开死亡。'], highRiskNotes: ['公开选择和猜拳结果都必须人工记录。'] }),
  role({ id: 'marionette', name: '提线木偶', officialName: 'Marionette', team: 'minion', abilityText: 'You think you are a good character, but you are not. The Demon knows who you are. [You neighbor the Demon]', inputKinds: ['none'], setupImpact: ['必须与恶魔相邻，恶魔知道其身份。'], possibleOutcomes: ['玩家以为自己是善良角色，但实际为爪牙。'], highRiskNotes: ['配座位时人工核对相邻；不自动重排座位。'] }),
  role({ id: 'lleech', name: '痢蛭', officialName: 'Lleech', team: 'demon', abilityText: 'Each night*, choose a player: they die. You start by choosing a player: they are poisoned. You die if & only if they are dead.', inputKinds: ['player'], possibleOutcomes: ['每晚选择一名玩家死亡。', '开局选择宿主中毒。', '宿主死亡时痢蛭才死亡。'], stateChanges: ['宿主中毒。', '可能造成夜间死亡。'], highRiskNotes: ['宿主保护和恶魔死亡判定必须由说书人确认，不能自动处理。'] }),
  role({ id: 'fanggu', name: '方古', officialName: 'Fang Gu', team: 'demon', abilityText: 'Each night*, choose a player: they die. The 1st Outsider this kills becomes an evil Fang Gu & you die instead. [+1 Outsider]', inputKinds: ['player'], setupImpact: ['开局多 1 名外来者。'], possibleOutcomes: ['每晚选择一名玩家死亡。', '第一次杀死外来者时，外来者变成邪恶方古，原方古死亡。'], stateChanges: ['可能造成死亡。'], identityChanges: ['外来者可能变成方古。'], teamChanges: ['外来者可能变成邪恶阵营。'], highRiskNotes: ['新恶魔、旧恶魔死亡和阵营变化都必须由说书人确认。'] }),
  role({ id: 'kazali', name: '卡扎力', officialName: 'Kazali', team: 'demon', abilityText: 'Each night*, choose a player: they die. [You choose which players are which Minions. -? to +? Outsiders]', inputKinds: ['player'], setupImpact: ['首夜指定哪些玩家成为哪些爪牙，并可修正外来者数量。'], possibleOutcomes: ['每晚选择一名玩家死亡。', '开局指定爪牙角色。'], identityChanges: ['玩家可能被指定为爪牙。'], highRiskNotes: ['开局指定爪牙和外来者修正必须人工确认。'] }),
  role({ id: 'legion', name: '军团', officialName: 'Legion', team: 'demon', abilityText: 'Each night*, a player might die. Executions fail if only evil voted. You register as a Minion too. [Most players are Legion]', inputKinds: ['player'], setupImpact: ['多数玩家是军团；军团也会登记为爪牙。'], possibleOutcomes: ['每晚可能有一名玩家死亡。', '若只有邪恶玩家投票，处决失败。'], stateChanges: ['可能造成夜间死亡。', '可能导致处决失败。'], highRiskNotes: ['当前模板暂不自动生成多名军团；胜负、处决失败和死亡都只做提醒。'] }),
]
