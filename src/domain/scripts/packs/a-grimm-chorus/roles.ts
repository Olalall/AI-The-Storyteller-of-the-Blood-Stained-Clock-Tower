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
    edition: 'A Grimm Chorus',
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

export const aGrimmChorusRoles: readonly SmartRoleDefinition[] = [
  role({ id: 'general', name: '将军', officialName: 'General', team: 'townsfolk', abilityText: 'Each night, you learn which alignment the Storyteller believes is winning: good, evil, or neither.', inputKinds: ['text'], possibleOutcomes: ['告知说书人认为当前领先的阵营：善良、邪恶或无。'], highRiskNotes: ['这是说书人判断信息，不应由工具根据局面自动算出。'] }),
  role({ id: 'villageidiot', name: '村夫', officialName: 'Village Idiot', team: 'townsfolk', abilityText: 'Each night, choose a player: you learn their alignment. [+0 to +2 Village Idiots. 1 of the extras is drunk]', inputKinds: ['player'], setupImpact: ['可加入 0-2 名额外村夫；若有额外村夫，其中 1 名额外村夫醉酒。'], possibleOutcomes: ['告知目标阵营。'], highRiskNotes: ['多个村夫需要逐个唤醒；额外醉酒村夫由说书人确认。'] }),
  role({ id: 'towncrier', name: '城镇公告员', officialName: 'Town Crier', team: 'townsfolk', abilityText: 'Each night*, you learn if a Minion nominated today.', inputKinds: ['text'], possibleOutcomes: ['告知今天是否有爪牙提名。'] }),
  role({ id: 'innkeeper', name: '旅店老板', officialName: 'Innkeeper', team: 'townsfolk', abilityText: "Each night*, choose 2 players: they can't die tonight, but 1 is drunk until dusk.", inputKinds: ['players'], stateChanges: ['两名目标今晚不会死亡；其中 1 名目标醉酒至黄昏。'], highRiskNotes: ['醉酒目标由说书人选择并记录，不能自动随机。'] }),
  role({ id: 'gambler', name: '赌徒', officialName: 'Gambler', team: 'townsfolk', abilityText: 'Each night*, choose a player & guess their character: if you guess wrong, you die.', inputKinds: ['player', 'role'], possibleOutcomes: ['猜对无事发生。', '猜错则赌徒死亡。'], stateChanges: ['可能造成自己死亡。'], highRiskNotes: ['先记录目标和猜测角色，再由说书人核对是否猜错。'] }),
  role({ id: 'exorcist', name: '驱魔人', officialName: 'Exorcist', team: 'townsfolk', abilityText: "Each night*, choose a player (different to last night): the Demon, if chosen, learns who you are then doesn't wake tonight.", inputKinds: ['player'], possibleOutcomes: ['若选中恶魔，恶魔得知驱魔人且今晚不醒。'], highRiskNotes: ['必须核对上次目标和当前恶魔身份；不能自动跳过恶魔行动。'] }),
  role({ id: 'amnesiac', name: '失忆者', officialName: 'Amnesiac', team: 'townsfolk', abilityText: 'You do not know what your ability is. Each day, privately guess what it is: you learn how accurate you are.', inputKinds: ['text'], possibleOutcomes: ['私下给出能力猜测接近程度。'], highRiskNotes: ['失忆者能力由说书人设计；AI 只能整理提示，不能发明权威能力。'] }),
  role({ id: 'nightwatchman', name: '守夜人', officialName: 'Nightwatchman', team: 'townsfolk', abilityText: 'Once per game, at night, choose a player: they learn you are the Nightwatchman.', inputKinds: ['player'], possibleOutcomes: ['目标得知该玩家是守夜人。'], playerMessageTemplates: ['你得知：{seat}号是守夜人。'] }),
  role({ id: 'slayer', name: '猎手', officialName: 'Slayer', team: 'townsfolk', abilityText: 'Once per game, during the day, publicly choose a player: if they are the Demon, they die.', inputKinds: ['player'], possibleOutcomes: ['目标是恶魔则死亡。', '目标不是恶魔则无事发生。'], stateChanges: ['可能造成目标死亡。'], highRiskNotes: ['白天公开发动；死亡必须由说书人确认。'] }),
  role({ id: 'fisherman', name: '渔夫', officialName: 'Fisherman', team: 'townsfolk', abilityText: 'Once per game, during the day, visit the Storyteller for some advice to help your team win.', inputKinds: ['text'], possibleOutcomes: ['给出帮助善良阵营获胜的建议。'], highRiskNotes: ['建议文案应帮助推进游戏，不直接泄漏完整魔典。'] }),
  role({ id: 'soldier', name: '士兵', officialName: 'Soldier', team: 'townsfolk', abilityText: 'You are safe from the Demon.', stateChanges: ['免受恶魔影响。'], highRiskNotes: ['仍可能被非恶魔来源影响。'] }),
  role({ id: 'minstrel', name: '吟游诗人', officialName: 'Minstrel', team: 'townsfolk', abilityText: 'When a Minion dies by execution, all other players (except Travellers) are drunk until dusk tomorrow.', stateChanges: ['爪牙被处决后，非旅行者的其他玩家醉酒至明天黄昏。'], highRiskNotes: ['必须确认死亡来源是处决且死者实际为爪牙。'] }),
  role({ id: 'cannibal', name: '食人族', officialName: 'Cannibal', team: 'townsfolk', abilityText: 'You have the ability of the recently killed executee. If they are evil, you are poisoned until a good player dies by execution.', inputKinds: ['role'], possibleOutcomes: ['获得最近被处决死亡者的能力。'], stateChanges: ['若最近被处决者邪恶，食人族中毒。'], highRiskNotes: ['先核对最近被处决者和阵营；借用能力只做提醒，不自动结算。'] }),
  role({ id: 'damsel', name: '落难少女', officialName: 'Damsel', team: 'outsider', abilityText: 'All Minions know a Damsel is in play. If a Minion publicly guesses you (once), your team loses.', inputKinds: ['text'], possibleOutcomes: ['所有爪牙得知落难少女在场。', '爪牙公开猜中一次后善良阵营失败。'], highRiskNotes: ['是否猜中和胜负必须由说书人确认，不能由工具自动判定。'] }),
  role({ id: 'drunk', name: '酒鬼', officialName: 'Drunk', team: 'outsider', abilityText: 'You do not know you are the Drunk. You think you are a Townsfolk character, but you are not.', setupImpact: ['以 1 名外来者替换 1 名镇民，酒鬼以为自己是某个镇民。'], possibleOutcomes: ['实际没有自身能力，但需要正常接收假身份信息。'], highRiskNotes: ['不能让玩家知道自己是酒鬼。'] }),
  role({ id: 'golem', name: '魔像', officialName: 'Golem', team: 'outsider', abilityText: 'You may only nominate once per game. When you do, if the nominee is not the Demon, they die.', inputKinds: ['player'], possibleOutcomes: ['首次提名非恶魔时，被提名人死亡。', '首次提名恶魔时无额外死亡。'], stateChanges: ['可能造成被提名人死亡。'], highRiskNotes: ['只能提名一次；是否死亡必须由说书人确认。'] }),
  role({ id: 'politician', name: '政客', officialName: 'Politician', team: 'outsider', abilityText: 'If you were the player most responsible for your team losing, you change alignment & win, even if dead.', teamChanges: ['结局时可能改变阵营并获胜。'], highRiskNotes: ['这是赛后裁量，不在对局过程中自动改变阵营。'] }),
  role({ id: 'godfather', name: '教父', officialName: 'Godfather', team: 'minion', abilityText: 'You start knowing which Outsiders are in play. If 1 died today, choose a player tonight: they die. [-1 or +1 Outsider]', inputKinds: ['player'], setupImpact: ['-1 或 +1 外来者。'], possibleOutcomes: ['得知在场外来者。', '有外来者白天死亡时，夜晚可以额外杀人。'], stateChanges: ['可能造成目标死亡。'], highRiskNotes: ['先确认今天是否有外来者死亡。'] }),
  role({ id: 'summoner', name: '召唤师', officialName: 'Summoner', team: 'minion', abilityText: 'You get 3 bluffs. On the 3rd night, choose a player: they become an evil Demon of your choice. [No Demon]', inputKinds: ['player', 'role'], setupImpact: ['开局无恶魔；召唤师得到 3 个恶魔伪装。'], possibleOutcomes: ['第 3 夜选择一名玩家成为邪恶恶魔。'], identityChanges: ['第 3 夜目标变成指定恶魔。'], teamChanges: ['第 3 夜目标变为邪恶阵营。'], highRiskNotes: ['第 3 夜创建恶魔必须由说书人确认；模板需要按无恶魔构成校验。'] }),
  role({ id: 'assassin', name: '刺客', officialName: 'Assassin', team: 'minion', abilityText: 'Once per game, at night*, choose a player: they die, even if for some reason they could not.', inputKinds: ['player'], stateChanges: ['可造成通常不能死亡的目标死亡。'], highRiskNotes: ['每局一次；死亡仍需说书人确认。'] }),
  role({ id: 'scarletwoman', name: '红唇女郎', officialName: 'Scarlet Woman', team: 'minion', abilityText: "If there are 5 or more players alive & the Demon dies, you become the Demon. (Travellers don't count.)", identityChanges: ['5 名及以上存活时，恶魔死亡后可能变成恶魔。'], teamChanges: ['成为新的恶魔。'], highRiskNotes: ['是否触发需要确认存活人数和恶魔死亡方式；旅行者不计入人数。'] }),
  role({ id: 'yaggababble', name: '牙噶巴卜', officialName: 'Yaggababble', team: 'demon', abilityText: 'You start knowing a secret phrase. For each time you said it publicly today, a player might die.', inputKinds: ['text', 'number'], possibleOutcomes: ['得知一个秘密短语。', '根据当天公开说出次数，可能有玩家死亡。'], stateChanges: ['可能造成一名或多名玩家死亡。'], highRiskNotes: ['公开短语次数由说书人记录；工具不能根据聊天自动判断杀人。'] }),
  role({ id: 'pukka', name: '普卡', officialName: 'Pukka', team: 'demon', abilityText: 'Each night, choose a player: they are poisoned. The previously poisoned player dies then becomes healthy.', inputKinds: ['player'], stateChanges: ['当前目标中毒；上一名被普卡中毒的玩家死亡并恢复健康。'], highRiskNotes: ['需要追踪上一名普卡中毒目标，死亡仍由说书人确认。'] }),
  role({ id: 'ojo', name: '奥赫', officialName: 'Ojo', team: 'demon', abilityText: 'Each night*, choose a character: they die. If they are not in play, the Storyteller chooses who dies.', inputKinds: ['role'], possibleOutcomes: ['所选角色在场：该角色玩家死亡。', '所选角色不在场：说书人选择死亡目标。'], stateChanges: ['可能造成死亡。'], highRiskNotes: ['是否在场和死亡目标都由说书人确认，不能自动杀人。'] }),
  role({ id: 'po', name: '珀', officialName: 'Po', team: 'demon', abilityText: 'Each night*, you may choose a player: they die. If your last choice was no-one, choose 3 players tonight.', inputKinds: ['text'], stateChanges: ['可选择不杀；若上一夜不杀，本夜可杀 3 人。'], highRiskNotes: ['需要记录上一夜是否空刀；多目标死亡必须由说书人确认。'] }),
  role({ id: 'thief', name: '窃贼', officialName: 'Thief', team: 'traveler', abilityText: 'Each night, choose a player (not yourself): their vote counts negatively tomorrow.', inputKinds: ['player'] }),
  role({ id: 'harlot', name: '流莺', officialName: 'Harlot', team: 'traveler', abilityText: 'Each night*, choose a living player: if they agree, you learn their character, but you both might die.', inputKinds: ['player'] }),
  role({ id: 'judge', name: '法官', officialName: 'Judge', team: 'traveler', abilityText: 'Once per game, if another player nominated, you may choose to force the current execution to pass or fail.', inputKinds: ['text'] }),
  role({ id: 'beggar', name: '乞丐', officialName: 'Beggar', team: 'traveler', abilityText: 'You must use a vote token to vote. If a dead player gives you theirs, you learn their alignment. You are sober & healthy.', inputKinds: ['text'] }),
  role({ id: 'scapegoat', name: '替罪羊', officialName: 'Scapegoat', team: 'traveler', abilityText: 'If a player of your alignment is executed, you might be executed instead.', inputKinds: ['none'] }),
]
