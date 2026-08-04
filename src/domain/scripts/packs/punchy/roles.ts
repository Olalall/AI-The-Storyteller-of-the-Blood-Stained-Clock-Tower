import type { AbilityInputKind, KnowledgeStatus, RoleResearchMetadata, RoleTeam, SmartRoleDefinition } from '../../types'

const rolesSourceUrl = 'https://release.botc.app/resources/data/roles.json'
const scriptSourceUrl = 'https://botc-script-viewer.sthom.kiwi/carousel/punchy/punchy.json'
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
    edition: 'Punchy v3.8',
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

export const punchyRoles: readonly SmartRoleDefinition[] = [
  role({ id: 'steward', name: '事务官', officialName: 'Steward', team: 'townsfolk', abilityText: 'You start knowing 1 good player.', inputKinds: ['player'], possibleOutcomes: ['告知 1 名善良玩家。'], playerMessageTemplates: ['你得知：{seat}号是善良玩家。'] }),
  role({ id: 'pixie', name: '小精灵', officialName: 'Pixie', team: 'townsfolk', abilityText: 'You start knowing 1 in-play Townsfolk. If you were mad you are this character, gain their ability when they die.', inputKinds: ['role'], possibleOutcomes: ['得知 1 个在场镇民。', '若保持疯狂且该角色死亡，获得其能力。'], identityChanges: ['可能获得被告知镇民的能力。'], playerMessageTemplates: ['你得知：场上有{role}。'], highRiskNotes: ['是否疯狂、是否获得能力都由说书人确认。'] }),
  role({ id: 'balloonist', name: '气球驾驶员', officialName: 'Balloonist', team: 'townsfolk', abilityText: 'Each night, you learn a player of a different character type than last night. [+0 or +1 Outsider]', inputKinds: ['player'], setupImpact: ['可增加 0 或 1 名外来者，若增加通常替换 1 名镇民。'], possibleOutcomes: ['每晚告知一名与上一晚不同角色类型的玩家。'], playerMessageTemplates: ['你得知：{seat}号。'], highRiskNotes: ['“角色类型”是镇民/外来者/爪牙/恶魔；顺序与真假信息由说书人确认。'] }),
  role({ id: 'general', name: '将军', officialName: 'General', team: 'townsfolk', abilityText: 'Each night, you learn which alignment the Storyteller believes is winning: good, evil, or neither.', inputKinds: ['text'], possibleOutcomes: ['善良领先。', '邪恶领先。', '双方无明显优势。'], playerMessageTemplates: ['你得知：{alignment}。'], highRiskNotes: ['这是说书人判断信息，不由工具根据局面自动计算。'] }),
  role({ id: 'monk', name: '僧侣', officialName: 'Monk', team: 'townsfolk', abilityText: 'Each night*, choose a player (not yourself): they are safe from the Demon tonight.', inputKinds: ['player'], stateChanges: ['目标今晚不受恶魔影响。'], highRiskNotes: ['保护只针对恶魔来源，不阻止爪牙或说书人来源。'] }),
  role({ id: 'savant', name: '博学者', officialName: 'Savant', team: 'townsfolk', abilityText: 'Each day, you may visit the Storyteller to learn 2 things in private: 1 is true & 1 is false.', inputKinds: ['text'], possibleOutcomes: ['给出两条信息：一真一假。'], playerMessageTemplates: ['信息一：{factA}。信息二：{factB}。'], highRiskNotes: ['信息内容由说书人撰写；AI 只能辅助润色。'] }),
  role({ id: 'philosopher', name: '哲学家', officialName: 'Philosopher', team: 'townsfolk', abilityText: 'Once per game, at night, choose a good character: gain that ability. If this character is in play, they are drunk.', inputKinds: ['role'], possibleOutcomes: ['获得所选善良角色能力。', '若该角色在场，原角色醉酒。'], stateChanges: ['被选择且在场的角色醉酒。'], identityChanges: ['哲学家获得一个善良角色能力。'], highRiskNotes: ['获得能力只写入提示和草稿；不为所选角色生成自动状态机。'] }),
  role({ id: 'huntsman', name: '巡山人', officialName: 'Huntsman', team: 'townsfolk', abilityText: 'Once per game, at night, choose a living player: the Damsel, if chosen, becomes a not-in-play Townsfolk. [+the Damsel]', inputKinds: ['player'], setupImpact: ['开局加入落难少女，通常替换 1 名镇民。'], possibleOutcomes: ['若选中落难少女，目标变成一个不在场镇民。'], identityChanges: ['落难少女可能变成不在场镇民。'], playerMessageTemplates: ['你选择了{seat}号。'], highRiskNotes: ['救援成功后由说书人确认并追加身份更正。'] }),
  role({ id: 'slayer', name: '猎手', officialName: 'Slayer', team: 'townsfolk', abilityText: 'Once per game, during the day, publicly choose a player: if they are the Demon, they die.', inputKinds: ['player'], possibleOutcomes: ['目标是恶魔：目标死亡。', '目标不是恶魔：通常无事发生。'], stateChanges: ['可能造成目标死亡。'], highRiskNotes: ['白天公开行动；是否死亡由说书人确认。'] }),
  role({ id: 'princess', name: '公主', officialName: 'Princess', team: 'townsfolk', abilityText: "On your 1st day, if you nominated & executed a player, the Demon doesn't kill tonight.", inputKinds: ['none'], possibleOutcomes: ['若首日由公主提名并处决玩家，恶魔当晚不杀人。'], highRiskNotes: ['需要核对首日提名人、处决结果和恶魔来源死亡；不自动停刀。'] }),
  role({ id: 'alchemist', name: '炼金术士', officialName: 'Alchemist', team: 'townsfolk', abilityText: 'You have a Minion ability. When using this, the Storyteller may prompt you to choose differently.', inputKinds: ['role'], possibleOutcomes: ['获得一个爪牙能力。'], identityChanges: ['以善良玩家身份使用一个爪牙能力。'], highRiskNotes: ['炼金能力由说书人开局指定；只提供对应能力提醒，不自动执行爪牙逻辑。'] }),
  role({ id: 'cannibal', name: '食人族', officialName: 'Cannibal', team: 'townsfolk', abilityText: 'You have the ability of the recently killed executee. If they are evil, you are poisoned until a good player dies by execution.', inputKinds: ['role'], possibleOutcomes: ['获得最近被处决者能力。', '若被处决者邪恶，食人族中毒。'], stateChanges: ['最近被处决者为邪恶时，食人族中毒直到善良玩家被处决死亡。'], highRiskNotes: ['先核对最近被处决者和阵营；借用能力只给提醒，不写自动结算。'] }),
  role({ id: 'amnesiac', name: '失忆者', officialName: 'Amnesiac', team: 'townsfolk', abilityText: 'You do not know what your ability is. Each day, privately guess what it is: you learn how accurate you are.', inputKinds: ['text'], possibleOutcomes: ['白天私下猜测能力，得知准确程度。'], playerMessageTemplates: ['你的猜测准确度：{accuracy}。'], highRiskNotes: ['自定义能力需要说书人单独保存；AI 只能帮写提示，不能发明权威能力。'] }),
  role({ id: 'ogre', name: '食人魔', officialName: 'Ogre', team: 'outsider', abilityText: "On your 1st night, choose a player (not yourself): you become their alignment (you don't know which) even if drunk or poisoned.", inputKinds: ['player'], teamChanges: ['首夜选择后变成目标阵营，即使醉酒或中毒也会发生。'], playerMessageTemplates: ['你选择了{seat}号。'], highRiskNotes: ['玩家不知道自己阵营结果；说书人确认后追加阵营变化。'] }),
  role({ id: 'drunk', name: '酒鬼', officialName: 'Drunk', team: 'outsider', abilityText: 'You do not know you are the Drunk. You think you are a Townsfolk character, but you are not.', inputKinds: ['none'], setupImpact: ['酒鬼以为自己是一个镇民角色，但实际为外来者且能力无效。'], highRiskNotes: ['不能让玩家知道自己是酒鬼。'] }),
  role({ id: 'mutant', name: '畸形秀演员', officialName: 'Mutant', team: 'outsider', abilityText: 'If you are “mad” about being an Outsider, you might be executed.', inputKinds: ['none'], possibleOutcomes: ['若疯狂表现为外来者，可能被处决。'], stateChanges: ['可能被处决死亡。'], highRiskNotes: ['疯狂和处决由说书人判断，不自动执行。'] }),
  role({ id: 'damsel', name: '落难少女', officialName: 'Damsel', team: 'outsider', abilityText: 'All Minions know a Damsel is in play. If a Minion publicly guesses you (once), your team loses.', inputKinds: ['none'], possibleOutcomes: ['爪牙知道落难少女在场。', '爪牙公开猜中落难少女时，善良阵营失败。'], highRiskNotes: ['猜测是否公开、是否命中和胜负必须由说书人确认。'] }),
  role({ id: 'harpy', name: '鹰身女妖', officialName: 'Harpy', team: 'minion', abilityText: 'Each night, choose 2 players: tomorrow, the 1st player is mad that the 2nd is evil, or one or both might die.', inputKinds: ['players'], possibleOutcomes: ['第一名目标明天需疯狂证明第二名目标是邪恶。', '若未满足疯狂要求，一方或双方可能死亡。'], stateChanges: ['可能导致一名或两名玩家死亡。'], playerMessageTemplates: ['你被要求疯狂证明：{seatB}号是邪恶。'], highRiskNotes: ['疯狂要求和死亡后果都需要说书人确认。'] }),
  role({ id: 'cerenovus', name: '洗脑师', officialName: 'Cerenovus', team: 'minion', abilityText: 'Each night, choose a player & a good character: they are “mad” they are this character tomorrow, or might be executed.', inputKinds: ['player', 'role'], possibleOutcomes: ['目标明天需疯狂证明自己是所选善良角色。', '若未满足疯狂要求，目标可能被处决。'], stateChanges: ['可能导致目标被处决死亡。'], playerMessageTemplates: ['你被洗脑成了{role}。你需要疯狂地证明自己是{role}，否则可能发生不好的事情。'], highRiskNotes: ['疯狂要求、处决和是否触发都由说书人确认。'] }),
  role({ id: 'psychopath', name: '精神病患者', officialName: 'Psychopath', team: 'minion', abilityText: 'Each day, before nominations, you may publicly choose a player: they die. If executed, you only die if you lose roshambo.', inputKinds: ['player'], possibleOutcomes: ['白天提名前公开选择一名玩家死亡。', '被处决时通过石头剪刀布决定是否死亡。'], stateChanges: ['可能造成目标死亡；自身被处决时可能不死。'], highRiskNotes: ['公开选择、死亡和猜拳结果都由说书人记录确认。'] }),
  role({ id: 'vizier', name: '维齐尔', officialName: 'Vizier', team: 'minion', abilityText: 'All players know you are the Vizier. You cannot die during the day. If good voted, you may choose to execute immediately.', inputKinds: ['player'], possibleOutcomes: ['全场知道维齐尔身份。', '白天不能死亡。', '若善良玩家投票，维齐尔可立即处决。'], stateChanges: ['可能立即处决一名玩家；维齐尔白天不死亡。'], highRiskNotes: ['公开身份和立即处决都要人工确认，不自动执行。'] }),
  role({ id: 'pukka', name: '普卡', officialName: 'Pukka', team: 'demon', abilityText: 'Each night, choose a player: they are poisoned. The previously poisoned player dies then becomes healthy.', inputKinds: ['player'], stateChanges: ['本晚目标中毒；上一名被普卡中毒的玩家死亡后恢复健康。'], highRiskNotes: ['要记录当前毒和上一名毒；死亡与恢复都由说书人确认。'] }),
  role({ id: 'ojo', name: '奥赫', officialName: 'Ojo', team: 'demon', abilityText: 'Each night*, choose a character: they die. If they are not in play, the Storyteller chooses who dies.', inputKinds: ['role'], possibleOutcomes: ['所选角色在场：该角色玩家死亡。', '所选角色不在场：说书人选择死亡玩家。'], stateChanges: ['可能造成玩家死亡。'], highRiskNotes: ['若选择不在场角色，死亡目标由说书人选择；不自动杀人。'] }),
  role({ id: 'kazali', name: '卡扎力', officialName: 'Kazali', team: 'demon', abilityText: 'Each night*, choose a player: they die. [You choose which players are which Minions. -? to +? Outsiders]', inputKinds: ['player', 'players', 'role'], setupImpact: ['开局由卡扎力指定哪些玩家成为哪些爪牙；外来者数量可被修正。'], possibleOutcomes: ['每晚选择一名玩家死亡。', '首夜指定爪牙身份。'], stateChanges: ['可能造成目标死亡。'], identityChanges: ['首夜可指定玩家成为具体爪牙。'], highRiskNotes: ['开局爪牙分配和外来者数量必须人工确认；不自动改身份。'] }),
  role({ id: 'vigormortis', name: '亡骨魔', officialName: 'Vigormortis', team: 'demon', abilityText: 'Each night*, choose a player: they die. Minions you kill keep their ability & poison 1 Townsfolk neighbor. [-1 Outsider]', inputKinds: ['player'], setupImpact: ['-1 外来者，通常增加 1 名镇民。'], stateChanges: ['夜晚选择一名玩家死亡；被杀爪牙保留能力并让相邻一名镇民中毒。'], highRiskNotes: ['爪牙死亡、保留能力和相邻镇民中毒都只做提醒，需说书人确认。'] }),
  role({ id: 'spiritofivory', name: '圣洁之魂', officialName: 'Spirit of Ivory', team: 'fabled', abilityText: "There can't be more than 1 extra evil player.", inputKinds: ['none'], setupImpact: ['额外邪恶玩家不能超过 1 名。'], possibleOutcomes: ['限制食人魔等额外邪恶变化。'], highRiskNotes: ['传奇角色只作为全局约束，不进入座位身份池，也不作为恶魔伪装。'] }),
]
