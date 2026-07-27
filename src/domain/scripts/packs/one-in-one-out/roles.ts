import type { AbilityInputKind, KnowledgeStatus, RoleResearchMetadata, RoleTeam, SmartRoleDefinition } from '../../types'

const rolesSourceUrl = 'https://release.botc.app/resources/data/roles.json'
const scriptSourceUrl =
  'https://script.bloodontheclocktower.com/?script=H4sIAAAAAAAACpWSQU7EMAxFr1J53RN0CSvEggMghEzrJqaJHTnOoBnE3RFiBEvMMtLzj/N%2BHt%2BBN1jguZIjzIDDsxoscIOmMp1Upvsy%2FAIzCFaCBR6EJpZJhSYdDjO8FNWtO9pdxUS3akarswosoPIdqV3NYdmxdJrBz%2B0raB%2BlwMd8XaA7vaFtMEPK2n%2FhxiK0XY8%2F9CGcsgfhzCk3Y%2BpOvQdnTlwKJuKNNXpNFzxozWiVLDiyq%2FkQciolPKOGa6EgXFWOIIpVqDOu0dW5Z7KKErVDWLtbvIH9PyJXFOEXLFGHyaIGk2r0iUZrGT0avNkId9OUu0rYRkZr52gvYbLShVqmQtEGD7xg4SDMtUXLe9XwF5KURlgEG7vufFL7S8nTJ74mOs83BQAA'
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
    edition: 'One in one out',
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

export const oneInOneOutRoles: readonly SmartRoleDefinition[] = [
  role({ id: 'steward', name: '事务官', officialName: 'Steward', team: 'townsfolk', abilityText: 'You start knowing 1 good player.', inputKinds: ['player'], possibleOutcomes: ['告知 1 名善良玩家。'], playerMessageTemplates: ['你得知：{seat}号是善良玩家。'] }),
  role({ id: 'knight', name: '骑士', officialName: 'Knight', team: 'townsfolk', abilityText: 'You start knowing 2 players that are not the Demon.', inputKinds: ['players'], possibleOutcomes: ['告知 2 名不是恶魔的玩家。'], playerMessageTemplates: ['你得知：{seatA}号和{seatB}号都不是恶魔。'] }),
  role({ id: 'highpriestess', name: '女祭司', officialName: 'High Priestess', team: 'townsfolk', abilityText: 'Each night, learn which player the Storyteller believes you should talk to most.', inputKinds: ['player'], possibleOutcomes: ['告知说书人认为最应该交流的一名玩家。'], playerMessageTemplates: ['你得知：今晚你最应该找 {seat}号 交流。'], highRiskNotes: ['这是说书人判断型信息，给谁由说书人确认。'] }),
  role({ id: 'villageidiot', name: '村夫', officialName: 'Village Idiot', team: 'townsfolk', abilityText: 'Each night, choose a player: you learn their alignment. [+0 to +2 Village Idiots. 1 of the extras is drunk]', inputKinds: ['player'], setupImpact: ['可加入 0 到 2 名额外村夫；若有额外村夫，其中 1 名额外村夫醉酒。'], possibleOutcomes: ['告知目标阵营。'], stateChanges: ['若使用额外村夫，需要标记其中 1 名额外村夫醉酒。'], playerMessageTemplates: ['你得知：{seat}号是{alignment}阵营。'], highRiskNotes: ['多个村夫需要逐个记录；醉酒村夫的信息由说书人决定，不自动判定。'] }),
  role({ id: 'snakecharmer', name: '舞蛇人', officialName: 'Snake Charmer', team: 'townsfolk', abilityText: 'Each night, choose an alive player: a chosen Demon swaps characters & alignments with you & is then poisoned.', inputKinds: ['player'], possibleOutcomes: ['目标不是恶魔：通常无事发生。', '目标是恶魔：双方交换角色和阵营。'], stateChanges: ['原恶魔成为新的舞蛇人后中毒。'], identityChanges: ['舞蛇人与被选中的恶魔交换角色。'], teamChanges: ['舞蛇人与被选中的恶魔交换阵营。'], playerMessageTemplates: ['你选择了{seat}号。'], highRiskNotes: ['若发生交换，当晚身份立即变化；新技能通常从下个夜晚开始处理。'] }),
  role({ id: 'fortuneteller', name: '占卜师', officialName: 'Fortune Teller', team: 'townsfolk', abilityText: 'Each night, choose 2 players: you learn if either is a Demon. There is a good player that registers as a Demon to you.', inputKinds: ['players'], setupImpact: ['开局指定 1 名善良玩家作为红鲱鱼。'], possibleOutcomes: ['是。', '否。'], playerMessageTemplates: ['是。', '否。'], highRiskNotes: ['先核对红鲱鱼、隐士、间谍、毒醉等登记影响。'] }),
  role({ id: 'oracle', name: '神谕者', officialName: 'Oracle', team: 'townsfolk', abilityText: 'Each night*, you learn how many dead players are evil.', inputKinds: ['number'], possibleOutcomes: ['告知死亡玩家中的邪恶数量。'], playerMessageTemplates: ['你得知：死亡玩家中有 {count} 名邪恶。'] }),
  role({ id: 'monk', name: '僧侣', officialName: 'Monk', team: 'townsfolk', abilityText: 'Each night*, choose a player (not yourself): they are safe from the Demon tonight.', inputKinds: ['player'], stateChanges: ['目标今晚不受恶魔影响。'], highRiskNotes: ['保护只针对恶魔来源，不阻止爪牙或说书人来源。'] }),
  role({ id: 'amnesiac', name: '失忆者', officialName: 'Amnesiac', team: 'townsfolk', abilityText: 'You do not know what your ability is. Each day, privately guess what it is: you learn how accurate you are.', inputKinds: ['text'], possibleOutcomes: ['白天私下猜测能力，得知准确程度。'], playerMessageTemplates: ['你的猜测准确度：{accuracy}。'], highRiskNotes: ['自定义能力需要说书人单独保存；AI 只能帮写提示，不能发明权威能力。'] }),
  role({ id: 'fisherman', name: '渔夫', officialName: 'Fisherman', team: 'townsfolk', abilityText: 'Once per game, during the day, visit the Storyteller for some advice to help your team win.', inputKinds: ['text'], possibleOutcomes: ['给出帮助善良阵营获胜的建议。'], playerMessageTemplates: ['建议：{advice}'], highRiskNotes: ['建议应帮助玩家推进游戏，但不要直接泄露完整魔典。'] }),
  role({ id: 'seamstress', name: '女裁缝', officialName: 'Seamstress', team: 'townsfolk', abilityText: 'Once per game, at night, choose 2 players (not yourself): you learn if they are the same alignment.', inputKinds: ['players'], possibleOutcomes: ['同阵营。', '不同阵营。'], playerMessageTemplates: ['是。', '否。'] }),
  role({ id: 'farmer', name: '农夫', officialName: 'Farmer', team: 'townsfolk', abilityText: 'When you die at night, an alive good player becomes a Farmer.', inputKinds: ['player'], possibleOutcomes: ['夜晚死亡后，一名存活善良玩家变成农夫。'], identityChanges: ['一名存活善良玩家可能变成农夫。'], highRiskNotes: ['只在农夫夜晚死亡时处理；新农夫由说书人确认并追加身份更正。'] }),
  role({ id: 'cannibal', name: '食人族', officialName: 'Cannibal', team: 'townsfolk', abilityText: 'You have the ability of the recently killed executee. If they are evil, you are poisoned until a good player dies by execution.', inputKinds: ['role'], possibleOutcomes: ['获得最近被处决者能力。', '若被处决者邪恶，食人族中毒。'], stateChanges: ['最近被处决者为邪恶时，食人族中毒直到善良玩家被处决死亡。'], highRiskNotes: ['先核对最近被处决者和阵营；借用能力只给提醒，不写自动结算。'] }),
  role({ id: 'ogre', name: '食人魔', officialName: 'Ogre', team: 'outsider', abilityText: "On your 1st night, choose a player (not yourself): you become their alignment (you don't know which) even if drunk or poisoned.", inputKinds: ['player'], teamChanges: ['首夜选择后变成目标阵营，即使醉酒或中毒也会发生。'], playerMessageTemplates: ['你选择了{seat}号。'], highRiskNotes: ['玩家不知道自己阵营结果；说书人确认后追加阵营变化。'] }),
  role({ id: 'goon', name: '莽夫', officialName: 'Goon', team: 'outsider', abilityText: 'Each night, the 1st player to choose you with their ability is drunk until dusk. You become their alignment.', inputKinds: ['player'], stateChanges: ['首个选择莽夫的玩家醉酒到黄昏。'], teamChanges: ['莽夫变成首个选择他的玩家的阵营。'], highRiskNotes: ['这是被动触发；需要人工核对当晚第一个选择莽夫的玩家。'] }),
  role({ id: 'recluse', name: '隐士', officialName: 'Recluse', team: 'outsider', abilityText: 'You might register as evil & as a Minion or Demon, even if dead.', inputKinds: ['none'], possibleOutcomes: ['可能被登记为邪恶、爪牙或恶魔。'], highRiskNotes: ['登记异常由说书人裁量。'] }),
  role({ id: 'drunk', name: '酒鬼', officialName: 'Drunk', team: 'outsider', abilityText: 'You do not know you are the Drunk. You think you are a Townsfolk character, but you are not.', inputKinds: ['none'], setupImpact: ['酒鬼以为自己是一个镇民角色，但实际为外来者且能力无效。'], highRiskNotes: ['不能让玩家知道自己是酒鬼。'] }),
  role({ id: 'poisoner', name: '投毒者', officialName: 'Poisoner', team: 'minion', abilityText: 'Each night, choose a player: they are poisoned tonight and tomorrow day.', inputKinds: ['player'], stateChanges: ['目标今晚和明天白天中毒。'], highRiskNotes: ['中毒影响信息真实性，必须由说书人确认。'] }),
  role({ id: 'harpy', name: '鹰身女妖', officialName: 'Harpy', team: 'minion', abilityText: 'Each night, choose 2 players: tomorrow, the 1st player is mad that the 2nd is evil, or one or both might die.', inputKinds: ['players'], possibleOutcomes: ['第一名目标明天需疯狂证明第二名目标是邪恶。', '若未满足疯狂要求，一方或双方可能死亡。'], stateChanges: ['可能导致一名或两名玩家死亡。'], playerMessageTemplates: ['你被要求疯狂证明：{seatB}号是邪恶。'], highRiskNotes: ['疯狂要求和死亡后果都需要说书人确认。'] }),
  role({ id: 'spy', name: '间谍', officialName: 'Spy', team: 'minion', abilityText: 'Each night, you see the Grimoire. You might register as good & as a Townsfolk or Outsider, even if dead.', inputKinds: ['none'], possibleOutcomes: ['查看完整魔典。', '可能被登记为善良或镇民/外来者。'], highRiskNotes: ['登记异常由说书人裁量。'] }),
  role({ id: 'mezepheles', name: '灵言师', officialName: 'Mezepheles', team: 'minion', abilityText: 'You start knowing a secret word. The 1st good player to say this word becomes evil that night.', inputKinds: ['text'], possibleOutcomes: ['首个说出暗号的善良玩家当晚变邪恶。'], teamChanges: ['首个说出暗号的善良玩家当晚变为邪恶。'], playerMessageTemplates: ['你的暗号是：{word}。'], highRiskNotes: ['受象牙之灵额外邪恶限制；变邪恶必须由说书人确认并追加记录。'] }),
  role({ id: 'kazali', name: '卡扎力', officialName: 'Kazali', team: 'demon', abilityText: 'Each night*, choose a player: they die. [You choose which players are which Minions. -? to +? Outsiders]', inputKinds: ['player', 'players', 'role'], setupImpact: ['开局由卡扎力指定哪些玩家成为哪些爪牙；外来者数量可被修正。'], possibleOutcomes: ['每晚选择一名玩家死亡。', '首夜指定爪牙身份。'], stateChanges: ['可能造成目标死亡。'], identityChanges: ['首夜可指定玩家成为具体爪牙。'], highRiskNotes: ['开局爪牙分配和外来者数量必须人工确认；不自动改身份。'] }),
  role({ id: 'imp', name: '小恶魔', officialName: 'Imp', team: 'demon', abilityText: 'Each night*, choose a player: they die. If you kill yourself this way, a Minion becomes the Imp.', inputKinds: ['player'], stateChanges: ['夜晚选择一名玩家死亡。'], identityChanges: ['小恶魔自杀时一名爪牙变成小恶魔。'], highRiskNotes: ['自杀传位由说书人确认。'] }),
  role({ id: 'ojo', name: '奥赫', officialName: 'Ojo', team: 'demon', abilityText: 'Each night*, choose a character: they die. If they are not in play, the Storyteller chooses who dies.', inputKinds: ['role'], possibleOutcomes: ['所选角色在场：该角色玩家死亡。', '所选角色不在场：说书人选择死亡玩家。'], stateChanges: ['可能造成玩家死亡。'], highRiskNotes: ['若选择不在场角色，死亡目标由说书人选择；不自动杀人。'] }),
  role({ id: 'fanggu', name: '方古', officialName: 'Fang Gu', team: 'demon', abilityText: 'Each night*, choose a player: they die. The 1st Outsider this kills becomes an evil Fang Gu & you die instead. [+1 Outsider]', inputKinds: ['player'], setupImpact: ['+1 外来者，通常替换 1 名镇民。'], stateChanges: ['夜晚选择一名玩家死亡；首次杀死外来者时原方古死亡。'], identityChanges: ['首次被方古夜晚杀死的外来者变成邪恶方古。'], teamChanges: ['首次被方古杀死的外来者变为邪恶。'], highRiskNotes: ['首次外来者传位必须由说书人确认。'] }),
  role({ id: 'spiritofivory', name: '象牙之灵', officialName: 'Spirit of Ivory', team: 'fabled', abilityText: "There can't be more than 1 extra evil player.", inputKinds: ['none'], setupImpact: ['额外邪恶玩家不能超过 1 名。'], possibleOutcomes: ['限制灵言师、食人魔等额外邪恶变化。'], highRiskNotes: ['传奇角色只作为全局约束，不进入座位身份池，也不作为恶魔伪装。'] }),
]
