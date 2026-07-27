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
    edition: 'Hide and Seek',
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

export const hideAndSeekRoles: readonly SmartRoleDefinition[] = [
  role({ id: 'noble', name: '贵族', officialName: 'Noble', team: 'townsfolk', abilityText: 'You start knowing 3 players, 1 and only 1 of which is evil.', inputKinds: ['players'], possibleOutcomes: ['告知 3 名玩家，其中有且只有 1 名邪恶。'] }),
  role({ id: 'librarian', name: '图书管理员', officialName: 'Librarian', team: 'townsfolk', abilityText: 'You start knowing that 1 of 2 players is a particular Outsider. (Or that zero are in play.)', inputKinds: ['players', 'role', 'number'], possibleOutcomes: ['在两名玩家中指认一名可能外来者。', '也可以告知本局没有外来者。'] }),
  role({ id: 'pixie', name: '小精灵', officialName: 'Pixie', team: 'townsfolk', abilityText: 'You start knowing 1 in-play Townsfolk. If you were mad that you were this character, you gain their ability when they die.', inputKinds: ['role'], possibleOutcomes: ['得知一个在场镇民角色。', '若保持疯狂且该角色死亡，获得其能力。'], identityChanges: ['可能在目标角色死亡后获得其能力。'], highRiskNotes: ['小精灵得知的必须是在场镇民，不能泄漏给非相关玩家；是否获得能力由说书人确认。'] }),
  role({ id: 'preacher', name: '传教士', officialName: 'Preacher', team: 'townsfolk', abilityText: 'Each night, choose a player: a Minion, if chosen, learns this. All chosen Minions have no ability.', inputKinds: ['player'], stateChanges: ['被选中过的爪牙失去能力。'], playerMessageTemplates: ['你被传教士选中了，失去爪牙能力。'], highRiskNotes: ['只在目标实际为爪牙时通知目标；是否失去能力由说书人确认。'] }),
  role({ id: 'towncrier', name: '镇喊者', officialName: 'Town Crier', team: 'townsfolk', abilityText: 'Each night*, you learn if a Minion nominated today.', inputKinds: ['text'], possibleOutcomes: ['告知今天是否有爪牙提名。'] }),
  role({ id: 'oracle', name: '神谕者', officialName: 'Oracle', team: 'townsfolk', abilityText: 'Each night*, you learn how many dead players are evil.', inputKinds: ['number'], possibleOutcomes: ['告知死亡玩家中邪恶玩家数量。'] }),
  role({ id: 'undertaker', name: '掘墓人', officialName: 'Undertaker', team: 'townsfolk', abilityText: 'Each night*, you learn which character died by execution today.', inputKinds: ['role'], possibleOutcomes: ['告知今天被处决死亡玩家的角色。'] }),
  role({ id: 'dreamer', name: '筑梦师', officialName: 'Dreamer', team: 'townsfolk', abilityText: 'Each night, choose a player (not yourself or Travellers): you learn 1 good & 1 evil character, 1 of which is correct.', inputKinds: ['player', 'role'], possibleOutcomes: ['告知一个善良角色和一个邪恶角色，其中一个正确。'] }),
  role({ id: 'seamstress', name: '裁缝', officialName: 'Seamstress', team: 'townsfolk', abilityText: 'Once per game, at night, choose 2 players (not yourself): you learn if they are the same alignment.', inputKinds: ['players'], possibleOutcomes: ['告知两名目标是否同阵营。'] }),
  role({ id: 'artist', name: '艺术家', officialName: 'Artist', team: 'townsfolk', abilityText: 'Once per game, during the day, privately ask the Storyteller any yes/no question.', inputKinds: ['text'], possibleOutcomes: ['回答一个私下的是/否问题。'] }),
  role({ id: 'huntsman', name: '猎人', officialName: 'Huntsman', team: 'townsfolk', abilityText: 'Once per game, at night, choose a living player: the Damsel, if chosen, becomes a not-in-play Townsfolk. [+the Damsel]', inputKinds: ['player'], setupImpact: ['+落难少女，通常替换 1 名镇民。'], possibleOutcomes: ['若选中落难少女，目标变成一个不在场镇民。'], identityChanges: ['落难少女可能变成不在场镇民。'], highRiskNotes: ['救援成功后身份变化必须由说书人确认并追加更正记录。'] }),
  role({ id: 'ravenkeeper', name: '守鸦人', officialName: 'Ravenkeeper', team: 'townsfolk', abilityText: 'If you die at night, you are woken to choose a player: you learn their character.', inputKinds: ['player'], possibleOutcomes: ['夜晚死亡后查看一名玩家角色。'] }),
  role({ id: 'virgin', name: '圣女', officialName: 'Virgin', team: 'townsfolk', abilityText: 'The 1st time you are nominated, if the nominator is a Townsfolk, they are executed immediately.', inputKinds: ['none'], possibleOutcomes: ['首次被镇民提名时，提名者立即被处决。'], stateChanges: ['可能立即处决提名者。'], highRiskNotes: ['确认提名者实际是否镇民，再决定是否触发。'] }),
  role({ id: 'damsel', name: '落难少女', officialName: 'Damsel', team: 'outsider', abilityText: 'All Minions know a Damsel is in play. If a Minion publicly guesses you (once), your team loses.', inputKinds: ['text'], possibleOutcomes: ['所有爪牙得知落难少女在场。', '爪牙公开猜中一次后善良阵营失败。'], highRiskNotes: ['是否猜中和胜负必须由说书人确认，不能由工具自动判定。'] }),
  role({ id: 'drunk', name: '酒鬼', officialName: 'Drunk', team: 'outsider', abilityText: 'You do not know you are the Drunk. You think you are a Townsfolk character, but you are not.', setupImpact: ['以 1 名外来者替换 1 名镇民，酒鬼以为自己是某个镇民。'], possibleOutcomes: ['实际没有自身能力，但需要正常接收假身份信息。'], highRiskNotes: ['不能让玩家知道自己是酒鬼。'] }),
  role({ id: 'mutant', name: '畸形秀演员', officialName: 'Mutant', team: 'outsider', abilityText: 'If you are “mad” about being an Outsider, you might be executed.', possibleOutcomes: ['若疯狂表示自己是外来者，可能被处决。'], highRiskNotes: ['疯狂惩罚是说书人裁量，不能自动处决。'] }),
  role({ id: 'goon', name: '莽夫', officialName: 'Goon', team: 'outsider', abilityText: 'Each night, the 1st player to choose you with their ability is drunk until dusk. You become their alignment.', stateChanges: ['首个夜晚选择莽夫的玩家醉酒至黄昏。'], teamChanges: ['莽夫变成首个影响他的玩家阵营。'], highRiskNotes: ['阵营变化必须记录来源和时间。'] }),
  role({ id: 'godfather', name: '教父', officialName: 'Godfather', team: 'minion', abilityText: 'You start knowing which Outsiders are in play. If 1 died today, choose a player tonight: they die. [-1 or +1 Outsider]', inputKinds: ['player'], setupImpact: ['-1 或 +1 外来者。'], possibleOutcomes: ['得知在场外来者。', '有外来者白天死亡时，夜晚可以额外杀人。'], stateChanges: ['可能造成目标死亡。'], highRiskNotes: ['先确认今天是否有外来者死亡。'] }),
  role({ id: 'mezepheles', name: '灵言师', officialName: 'Mezepheles', team: 'minion', abilityText: 'You start knowing a secret word. The 1st good player to say this word becomes evil that night.', inputKinds: ['text'], possibleOutcomes: ['首个说出暗号的善良玩家当晚变邪恶。'], teamChanges: ['首个说出暗号的善良玩家变为邪恶阵营。'], highRiskNotes: ['记录暗号和触发玩家；变阵营必须由说书人确认。'] }),
  role({ id: 'poisoner', name: '投毒者', officialName: 'Poisoner', team: 'minion', abilityText: 'Each night, choose a player: they are poisoned tonight and tomorrow day.', inputKinds: ['player'], stateChanges: ['目标今晚和明天白天中毒。'] }),
  role({ id: 'cerenovus', name: '洗脑师', officialName: 'Cerenovus', team: 'minion', abilityText: 'Each night, choose a player & a good character: they are “mad” they are this character tomorrow, or might be executed.', inputKinds: ['player', 'role'], possibleOutcomes: ['目标明天需要疯狂证明自己是指定善良角色。'], playerMessageTemplates: ['你被洗脑成了{roleName}。明天你需要疯狂地证明自己是{roleName}，否则可能发生不好的事情。'], highRiskNotes: ['疯狂惩罚是说书人裁量，只能提示不能自动处决。'] }),
  role({ id: 'pukka', name: '普卡', officialName: 'Pukka', team: 'demon', abilityText: 'Each night, choose a player: they are poisoned. The previously poisoned player dies then becomes healthy.', inputKinds: ['player'], stateChanges: ['当前目标中毒；上一名被普卡中毒的玩家死亡并恢复健康。'], highRiskNotes: ['需要追踪上一名普卡中毒目标，死亡仍由说书人确认。'] }),
  role({ id: 'vigormortis', name: '维格莫提斯', officialName: 'Vigormortis', team: 'demon', abilityText: 'Each night*, choose a player: they die. Minions you kill keep their ability & poison 1 Townsfolk neighbor. [-1 Outsider]', inputKinds: ['player'], setupImpact: ['-1 外来者，通常增加 1 名镇民。'], possibleOutcomes: ['杀死爪牙后，该爪牙保留能力并让相邻一名镇民中毒。'], highRiskNotes: ['邻近镇民中毒需要由说书人选择并记录。'] }),
  role({ id: 'imp', name: '小恶魔', officialName: 'Imp', team: 'demon', abilityText: 'Each night*, choose a player: they die. If you kill yourself this way, a Minion becomes the Imp.', inputKinds: ['player'], stateChanges: ['夜晚选择一名玩家死亡。'], identityChanges: ['小恶魔自杀时，一名爪牙变成小恶魔。'], highRiskNotes: ['自杀传位必须由说书人确认。'] }),
  role({ id: 'ojo', name: '奥赫', officialName: 'Ojo', team: 'demon', abilityText: 'Each night*, choose a character: they die. If they are not in play, the Storyteller chooses who dies.', inputKinds: ['role'], possibleOutcomes: ['所选角色在场：该角色玩家死亡。', '所选角色不在场：说书人选择死亡目标。'], stateChanges: ['可能造成死亡。'], highRiskNotes: ['是否在场和死亡目标都由说书人确认，不能自动杀人。'] }),
]
