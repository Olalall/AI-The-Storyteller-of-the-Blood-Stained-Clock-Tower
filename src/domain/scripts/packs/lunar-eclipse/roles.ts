import type { AbilityInputKind, RoleResearchMetadata, RoleTeam, SmartRoleDefinition } from '../../types'

const rolesSourceUrl = 'https://release.botc.app/resources/data/roles.json'
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
    knowledgeStatus: 'confirmed',
    research: research(input),
  }
}

function research(input: RoleInput): RoleResearchMetadata {
  return {
    edition: 'Lunar Eclipse',
    setupImpact: input.setupImpact ?? [],
    possibleOutcomes: input.possibleOutcomes ?? [],
    stateChanges: input.stateChanges ?? [],
    identityChanges: input.identityChanges ?? [],
    teamChanges: input.teamChanges ?? [],
    playerMessageTemplates: input.playerMessageTemplates ?? [],
    highRiskNotes: input.highRiskNotes ?? [],
    sourceUrls: [rolesSourceUrl],
    reviewedAt,
  }
}

export const lunarEclipseRoles: readonly SmartRoleDefinition[] = [
  role({ id: 'grandmother', name: '祖母', officialName: 'Grandmother', team: 'townsfolk', abilityText: 'You start knowing a good player & their character. If the Demon kills them, you die too.', inputKinds: ['player', 'role'], possibleOutcomes: ['告知一名善良玩家及其角色。'], highRiskNotes: ['若恶魔杀死孙辈，祖母也死亡；死亡仍由说书人确认。'] }),
  role({ id: 'pixie', name: '小精灵', officialName: 'Pixie', team: 'townsfolk', abilityText: 'You start knowing 1 in-play Townsfolk. If you were mad that you were this character, you gain their ability when they die.', inputKinds: ['role'], possibleOutcomes: ['得知一个在场镇民角色。', '若保持疯狂且该角色死亡，获得其能力。'], identityChanges: ['可能在目标角色死亡后获得其能力。'], highRiskNotes: ['小精灵得知的必须是在场镇民，不能泄漏给非相关玩家；是否获得能力由说书人确认。'] }),
  role({ id: 'sailor', name: '水手', officialName: 'Sailor', team: 'townsfolk', abilityText: "Each night, choose an alive player: either you or they are drunk until dusk. You can't die.", inputKinds: ['player'], stateChanges: ['水手或目标之一醉酒到黄昏。'], highRiskNotes: ['醉酒对象由说书人决定；水手通常不会死亡。'] }),
  role({ id: 'chambermaid', name: '侍女', officialName: 'Chambermaid', team: 'townsfolk', abilityText: 'Each night, choose 2 alive players (not yourself): you learn how many woke tonight due to their ability.', inputKinds: ['players', 'number'], possibleOutcomes: ['告知两名目标中有几人因自身能力醒来。'] }),
  role({ id: 'mathematician', name: '数学家', officialName: 'Mathematician', team: 'townsfolk', abilityText: "Each night, you learn how many players’ abilities worked abnormally (since dawn) due to another character's ability.", inputKinds: ['number'], possibleOutcomes: ['告知上个白天以来有多少玩家的能力异常生效。'] }),
  role({ id: 'innkeeper', name: '旅店老板', officialName: 'Innkeeper', team: 'townsfolk', abilityText: "Each night*, choose 2 players: they can't die tonight, but 1 is drunk until dusk.", inputKinds: ['players'], stateChanges: ['两名目标今晚不死，其中一人醉酒到黄昏。'], highRiskNotes: ['醉酒目标由说书人确认，不自动随机。'] }),
  role({ id: 'lycanthrope', name: '半兽人', officialName: 'Lycanthrope', team: 'townsfolk', abilityText: 'Each night*, choose an alive player. If good, they die & the Demon doesn’t kill tonight. One good player registers as evil.', inputKinds: ['player'], possibleOutcomes: ['若目标为善良，目标死亡且恶魔今晚不杀人。'], stateChanges: ['一名善良玩家可能登记为邪恶。'], highRiskNotes: ['半兽人目标、恶魔是否停刀和死亡结果都必须由说书人确认。'] }),
  role({ id: 'savant', name: '博学者', officialName: 'Savant', team: 'townsfolk', abilityText: 'Each day, you may visit the Storyteller to learn 2 things in private: 1 is true & 1 is false.', inputKinds: ['text'], possibleOutcomes: ['白天私下给出两条信息，一真一假。'] }),
  role({ id: 'artist', name: '艺术家', officialName: 'Artist', team: 'townsfolk', abilityText: 'Once per game, during the day, privately ask the Storyteller any yes/no question.', inputKinds: ['text'], possibleOutcomes: ['回答一个私下的是/否问题。'] }),
  role({ id: 'tealady', name: '茶艺师', officialName: 'Tea Lady', team: 'townsfolk', abilityText: "If both your alive neighbors are good, they can't die.", possibleOutcomes: ['两侧存活邻座均为善良时，他们不能死亡。'], highRiskNotes: ['先按当前存活邻座和阵营确认保护是否生效。'] }),
  role({ id: 'magician', name: '魔术师', officialName: 'Magician', team: 'townsfolk', abilityText: 'The Demon thinks you are a Minion. Minions think you are a Demon.', possibleOutcomes: ['恶魔把魔术师当作爪牙；爪牙把魔术师当作恶魔。'], highRiskNotes: ['只影响恶魔/爪牙开局信息，不改变真实身份或阵营。'] }),
  role({ id: 'mayor', name: '镇长', officialName: 'Mayor', team: 'townsfolk', abilityText: 'If only 3 players live & no execution occurs, your team wins. If you die at night, another player might die instead.', possibleOutcomes: ['夜晚死亡可能改为其他玩家死亡；三人白天无人处决可能善良胜利。'], highRiskNotes: ['胜负和转移死亡必须由说书人确认。'] }),
  role({ id: 'cannibal', name: '食人族', officialName: 'Cannibal', team: 'townsfolk', abilityText: 'You have the ability of the recently killed executee. If they are evil, you are poisoned until a good player dies by execution.', inputKinds: ['role'], possibleOutcomes: ['获得最近被处决死亡玩家的能力。'], stateChanges: ['若最近被处决者邪恶，食人族中毒直到善良玩家被处决死亡。'], highRiskNotes: ['借用能力只做提醒，不自动执行该角色结算。'] }),
  role({ id: 'goon', name: '莽夫', officialName: 'Goon', team: 'outsider', abilityText: 'Each night, the 1st player to choose you with their ability is drunk until dusk. You become their alignment.', stateChanges: ['首个夜晚选择莽夫的玩家醉酒至黄昏。'], teamChanges: ['莽夫变成首个影响他的玩家阵营。'], highRiskNotes: ['阵营变化必须记录来源和时间。'] }),
  role({ id: 'barber', name: '理发师', officialName: 'Barber', team: 'outsider', abilityText: 'If you died today or tonight, the Demon may choose 2 players (not another Demon) to swap characters.', inputKinds: ['players'], identityChanges: ['理发师死亡后，恶魔可交换两名非另一恶魔玩家的角色。'], highRiskNotes: ['交换身份必须由说书人确认并追加更正记录。'] }),
  role({ id: 'lunatic', name: '疯子', officialName: 'Lunatic', team: 'outsider', abilityText: 'You think you are a Demon, but you are not. The Demon knows who you are & who you choose at night.', inputKinds: ['player'], possibleOutcomes: ['疯子以为自己是恶魔，真正恶魔知道疯子及其夜晚选择。'], highRiskNotes: ['疯子选择只给真正恶魔作为信息，不自动造成死亡。'] }),
  role({ id: 'puzzlemaster', name: '解谜大师', officialName: 'Puzzlemaster', team: 'outsider', abilityText: '1 player is drunk, even if you die. If you guess (once) who it is, learn the Demon player, but guess wrong & get false info.', inputKinds: ['player'], stateChanges: ['一名玩家醉酒，即使解谜大师死亡仍持续。'], possibleOutcomes: ['每局一次猜醉酒玩家；猜对得知恶魔，猜错得到假信息。'], highRiskNotes: ['醉酒目标和猜测结果由说书人确认，不自动泄漏恶魔。'] }),
  role({ id: 'godfather', name: '教父', officialName: 'Godfather', team: 'minion', abilityText: 'You start knowing which Outsiders are in play. If 1 died today, choose a player tonight: they die. [-1 or +1 Outsider]', inputKinds: ['player'], setupImpact: ['-1 或 +1 外来者。'], possibleOutcomes: ['得知在场外来者。', '有外来者白天死亡时，夜晚可以额外杀人。'], stateChanges: ['可能造成目标死亡。'], highRiskNotes: ['先确认今天是否有外来者死亡。'] }),
  role({ id: 'devilsadvocate', name: '魔鬼代言人', officialName: "Devil's Advocate", team: 'minion', abilityText: "Each night, choose a living player (different to last night): if executed tomorrow, they don't die.", inputKinds: ['player'], stateChanges: ['目标若明天被处决，不会死亡。'], highRiskNotes: ['目标不能与上一晚相同，保护结果由说书人确认。'] }),
  role({ id: 'spy', name: '间谍', officialName: 'Spy', team: 'minion', abilityText: 'Each night, you see the Grimoire. You might register as good & as a Townsfolk or Outsider, even if dead.', possibleOutcomes: ['可查看魔典；可能登记为善良和镇民或外来者。'], highRiskNotes: ['登记错位由说书人裁量。'] }),
  role({ id: 'assassin', name: '刺客', officialName: 'Assassin', team: 'minion', abilityText: 'Once per game, at night*, choose a player: they die, even if for some reason they could not.', inputKinds: ['player'], stateChanges: ['每局一次夜晚杀死一名玩家，即使通常不能死亡。'], highRiskNotes: ['是否使用每局一次和死亡目标必须确认。'] }),
  role({ id: 'marionette', name: '提线木偶', officialName: 'Marionette', team: 'minion', abilityText: 'You think you are a good character, but you are not. The Demon knows who you are. [You neighbor the Demon]', setupImpact: ['提线木偶必须与恶魔相邻。'], possibleOutcomes: ['玩家以为自己是善良角色；恶魔知道提线木偶是谁。'], highRiskNotes: ['配板后需要人工核对座位相邻，不自动重排座位。'] }),
  role({ id: 'nodashii', name: '诺-达鲺', officialName: 'No Dashii', team: 'demon', abilityText: 'Each night*, choose a player: they die. Your 2 Townsfolk neighbors are poisoned.', inputKinds: ['player'], stateChanges: ['两侧最近镇民中毒。'], highRiskNotes: ['中毒邻座按当前座位与身份由说书人确认。'] }),
  role({ id: 'zombuul', name: '僵怖', officialName: 'Zombuul', team: 'demon', abilityText: 'Each night*, if no-one died today, choose a player: they die. The 1st time you die, you live but register as dead.', inputKinds: ['player'], possibleOutcomes: ['当天无人死亡时夜晚才能杀人。', '首次死亡时继续存活但登记为死亡。'], highRiskNotes: ['首次死亡后需要显示为死亡但仍可能存活行动。'] }),
  role({ id: 'vigormortis', name: '亡骨魔', officialName: 'Vigormortis', team: 'demon', abilityText: 'Each night*, choose a player: they die. Minions you kill keep their ability & poison 1 Townsfolk neighbor. [-1 Outsider]', inputKinds: ['player'], setupImpact: ['-1 外来者，通常增加 1 名镇民。'], possibleOutcomes: ['杀死爪牙后，该爪牙保留能力并让相邻一名镇民中毒。'], highRiskNotes: ['邻近镇民中毒需要由说书人选择并记录。'] }),
  role({ id: 'barista', name: '咖啡师', officialName: 'Barista', team: 'traveler', abilityText: 'Each night, until dusk, 1) a player becomes sober, healthy & gets true info, or 2) their ability works twice. They learn which.', inputKinds: ['player'], stateChanges: ['目标可能清醒健康并获得真实信息，或能力发动两次。'] }),
  role({ id: 'harlot', name: '流莺', officialName: 'Harlot', team: 'traveler', abilityText: 'Each night*, choose a living player: if they agree, you learn their character, but you both might die.', inputKinds: ['player'], possibleOutcomes: ['若目标同意，得知其角色；若目标邪恶，双方可能死亡。'] }),
  role({ id: 'apprentice', name: '学徒', officialName: 'Apprentice', team: 'traveler', abilityText: 'On your 1st night, you gain a Townsfolk ability (if good), or a Minion ability (if evil).', inputKinds: ['role'], identityChanges: ['首夜获得不在场镇民或爪牙能力。'] }),
  role({ id: 'beggar', name: '乞丐', officialName: 'Beggar', team: 'traveler', abilityText: 'You must use a vote token to vote. If a dead player gives you theirs, you learn their alignment. You are sober & healthy.', inputKinds: ['player'], possibleOutcomes: ['死亡玩家给出投票标记时，乞丐得知其阵营。'] }),
  role({ id: 'voudon', name: '巫毒师', officialName: 'Voudon', team: 'traveler', abilityText: "Only you & the dead can vote. They don't need a vote token to do so. A 50% majority isn't required.", highRiskNotes: ['投票规则变化只做提醒，不改变白天投票系统默认门槛。'] }),
  role({ id: 'spiritofivory', name: '圣洁之魂', officialName: 'Spirit of Ivory', team: 'fabled', abilityText: "There can't be more than 1 extra evil player.", setupImpact: ['全局限制额外邪恶玩家不能超过 1 名。'], highRiskNotes: ['传奇角色不进入座位身份、模板或恶魔伪装。'] }),
]
