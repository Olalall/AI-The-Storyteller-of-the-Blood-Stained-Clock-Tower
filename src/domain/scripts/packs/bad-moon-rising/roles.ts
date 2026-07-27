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
    edition: 'Bad Moon Rising',
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

export const badMoonRisingRoles: readonly SmartRoleDefinition[] = [
  role({"id":"grandmother","name":"祖母","officialName":"Grandmother","team":"townsfolk","abilityText":"You start knowing a good player & their character. If the Demon kills them, you die too.","inputKinds":["player","role"],"possibleOutcomes":["得知一名善良玩家和其角色。","孙辈被恶魔杀死时祖母也会死亡。"],"highRiskNotes":["必须确认孙辈是被恶魔杀死，而不是任意死亡。"]}),
  role({"id":"sailor","name":"水手","officialName":"Sailor","team":"townsfolk","abilityText":"Each night, choose an alive player: either you or they are drunk until dusk. You can't die.","inputKinds":["player"],"possibleOutcomes":["目标或水手醉酒到黄昏。","水手不能死亡。"],"stateChanges":["水手或目标醉酒到黄昏；阻止水手死亡。"],"highRiskNotes":["醉酒对象由说书人选择并记录；免死仍需确认死亡来源。"]}),
  role({"id":"chambermaid","name":"侍女","officialName":"Chambermaid","team":"townsfolk","abilityText":"Each night, choose 2 alive players (not yourself): you learn how many woke tonight due to their ability.","inputKinds":["players","number"]}),
  role({"id":"innkeeper","name":"旅店老板","officialName":"Innkeeper","team":"townsfolk","abilityText":"Each night*, choose 2 players: they can't die tonight, but 1 is drunk until dusk.","inputKinds":["players"],"possibleOutcomes":["两名目标今晚不能死亡。","其中一名目标醉酒到黄昏。"],"stateChanges":["保护两名目标免死，并让其中一人醉酒到黄昏。"],"highRiskNotes":["醉酒目标由说书人选择；保护和醉酒都需要记录。"]}),
  role({"id":"gambler","name":"赌徒","officialName":"Gambler","team":"townsfolk","abilityText":"Each night*, choose a player & guess their character: if you guess wrong, you die.","inputKinds":["player","role"],"possibleOutcomes":["猜对无事发生。","猜错则赌徒死亡。"],"stateChanges":["可能造成自己死亡。"],"highRiskNotes":["先记录目标和猜测角色，再由说书人核对是否猜错。"]}),
  role({"id":"exorcist","name":"驱魔人","officialName":"Exorcist","team":"townsfolk","abilityText":"Each night*, choose a player (different to last night): the Demon, if chosen, learns who you are then doesn't wake tonight.","inputKinds":["player"]}),
  role({"id":"gossip","name":"流言者","officialName":"Gossip","team":"townsfolk","abilityText":"Each day, you may make a public statement. Tonight, if it was true, a player dies.","inputKinds":["text"],"possibleOutcomes":["公开陈述为真：今晚可能有一名玩家死亡。","公开陈述为假：无额外死亡。"],"stateChanges":["可能造成说书人选择的一名玩家死亡。"],"highRiskNotes":["先记录公开陈述原文；真假和死亡目标都由说书人确认。"]}),
  role({"id":"courtier","name":"侍臣","officialName":"Courtier","team":"townsfolk","abilityText":"Once per game, at night, choose a character: they are drunk for 3 nights & 3 days.","inputKinds":["role"],"stateChanges":["所选角色醉酒 3 夜 3 天。"],"highRiskNotes":["每局一次；按角色而非座位影响，需跟踪持续时间。"]}),
  role({"id":"professor","name":"教授","officialName":"Professor","team":"townsfolk","abilityText":"Once per game, at night*, choose a dead player: if they are a Townsfolk, they are resurrected.","inputKinds":["player"],"possibleOutcomes":["目标是死亡镇民：复活。","目标不是死亡镇民：无事发生。"],"stateChanges":["可能复活一名死亡玩家。"],"highRiskNotes":["每局一次；目标阵营和角色类别由说书人核对。"]}),
  role({"id":"minstrel","name":"吟游诗人","officialName":"Minstrel","team":"townsfolk","abilityText":"When a Minion dies by execution, all other players (except Travellers) are drunk until dusk tomorrow.","inputKinds":["none"],"stateChanges":["爪牙被处决死亡后，其他非旅行者玩家醉酒至明天黄昏。"],"highRiskNotes":["必须确认死亡来源是处决且死者实际为爪牙。"]}),
  role({"id":"tealady","name":"茶艺师","officialName":"Tea Lady","team":"townsfolk","abilityText":"If both your alive neighbors are good, they can't die.","inputKinds":["none"],"possibleOutcomes":["两侧存活邻座均善良：他们不能死亡。","条件不满足：无保护。"],"stateChanges":["可能阻止两侧存活邻座死亡。"],"highRiskNotes":["邻座按当前存活邻座计算；是否善良由说书人核对。"]}),
  role({"id":"fool","name":"弄臣","officialName":"Fool","team":"townsfolk","abilityText":"The 1st time you die, you don't.","inputKinds":["none"],"possibleOutcomes":["首次死亡被阻止。","首次之后正常死亡。"],"stateChanges":["消耗首次免死。"],"highRiskNotes":["需要记录是否已经用过免死。"]}),
  role({"id":"pacifist","name":"和平主义者","officialName":"Pacifist","team":"townsfolk","abilityText":"Executed good players might not die.","inputKinds":["none"],"possibleOutcomes":["被处决的善良玩家可能不死亡。"],"stateChanges":["可能阻止善良玩家处决死亡。"],"highRiskNotes":["是否触发由说书人裁量；只影响善良玩家。"]}),
  role({"id":"goon","name":"莽夫","officialName":"Goon","team":"outsider","abilityText":"Each night, the 1st player to choose you with their ability is drunk until dusk. You become their alignment.","inputKinds":["none"],"teamChanges":["莽夫可能因首次影响他的玩家阵营而改变阵营。"],"highRiskNotes":["阵营变化必须记录来源和时间。"]}),
  role({"id":"lunatic","name":"疯子","officialName":"Lunatic","team":"outsider","abilityText":"You think you are a Demon, but you are not. The Demon knows who you are & who you choose at night.","inputKinds":["none"],"possibleOutcomes":["以为自己是恶魔，并得到伪爪牙和伪伪装。"],"highRiskNotes":["恶魔会知道疯子是谁以及疯子的夜晚选择。"]}),
  role({"id":"tinker","name":"修补匠","officialName":"Tinker","team":"outsider","abilityText":"You might die at any time.","inputKinds":["none"],"possibleOutcomes":["任意时间可能死亡。"],"stateChanges":["可能造成修补匠死亡。"],"highRiskNotes":["死亡时机完全由说书人裁量，不能自动触发。"]}),
  role({"id":"moonchild","name":"月之子","officialName":"Moonchild","team":"outsider","abilityText":"When you learn that you died, publicly choose 1 alive player. Tonight, if it was a good player, they die.","inputKinds":["player"],"possibleOutcomes":["月之子死亡后公开选择一名存活玩家。","若目标善良，今晚该目标死亡。"],"stateChanges":["可能造成被选择的善良玩家夜晚死亡。"],"highRiskNotes":["目标阵营由说书人核对；死亡仍需人工确认。"]}),
  role({"id":"godfather","name":"教父","officialName":"Godfather","team":"minion","abilityText":"You start knowing which Outsiders are in play. If 1 died today, choose a player tonight: they die. [-1 or +1 Outsider]","inputKinds":["player"],"setupImpact":["-1 或 +1 外来者。"],"possibleOutcomes":["得知在场外来者。","有外来者白天死亡时，夜晚可以额外杀人。"],"stateChanges":["可能造成目标死亡。"],"highRiskNotes":["先确认今天是否有外来者死亡。"]}),
  role({"id":"devilsadvocate","name":"魔鬼代言人","officialName":"Devil's Advocate","team":"minion","abilityText":"Each night, choose a living player (different to last night): if executed tomorrow, they don't die.","inputKinds":["player"],"possibleOutcomes":["目标明天若被处决，不会死亡。"],"stateChanges":["给予目标次日处决免死保护。"],"highRiskNotes":["目标不能与上一晚相同；保护只针对明天处决死亡。"]}),
  role({"id":"assassin","name":"刺客","officialName":"Assassin","team":"minion","abilityText":"Once per game, at night*, choose a player: they die, even if for some reason they could not.","inputKinds":["player"],"possibleOutcomes":["目标死亡，即使通常不能死亡。"],"stateChanges":["每局一次造成一名玩家死亡。"],"highRiskNotes":["每局一次；仍必须由说书人确认目标和使用次数。"]}),
  role({"id":"mastermind","name":"主谋","officialName":"Mastermind","team":"minion","abilityText":"If the Demon dies by execution (ending the game), play for 1 more day. If a player is then executed, their team loses.","inputKinds":["none"],"possibleOutcomes":["恶魔被处决且本应游戏结束时，额外进行 1 天。","额外一天若有人被处决，其阵营失败。"],"stateChanges":["可能延后游戏结束并改变最终胜负判断。"],"highRiskNotes":["不自动判胜；需要说书人确认是否进入主谋日。"]}),
  role({"id":"pukka","name":"普卡","officialName":"Pukka","team":"demon","abilityText":"Each night, choose a player: they are poisoned. The previously poisoned player dies then becomes healthy.","inputKinds":["player"],"possibleOutcomes":["当前目标中毒。","上一名被普卡中毒的玩家死亡并恢复健康。"],"stateChanges":["当前目标中毒；上一名普卡中毒目标死亡后恢复健康。"],"highRiskNotes":["必须追踪上一名普卡中毒目标；死亡和恢复都需人工确认。"]}),
  role({"id":"shabaloth","name":"沙巴洛斯","officialName":"Shabaloth","team":"demon","abilityText":"Each night*, choose 2 players: they die. A dead player you chose last night might be regurgitated.","inputKinds":["players"],"possibleOutcomes":["夜晚选择最多两名玩家死亡。","上一晚选中的死亡玩家可能被反刍复活。"],"stateChanges":["可能造成两名玩家死亡，也可能复活一名死亡玩家。"],"highRiskNotes":["复活对象由说书人裁量；不能自动复活或自动杀人。"]}),
  role({"id":"po","name":"珀","officialName":"Po","team":"demon","abilityText":"Each night*, you may choose a player: they die. If your last choice was no-one, choose 3 players tonight.","inputKinds":["text"],"possibleOutcomes":["选择一名玩家死亡。","若上一晚空刀，本晚可选择三名玩家死亡。"],"stateChanges":["可能造成 1 名或 3 名玩家死亡。"],"highRiskNotes":["需要记录上一晚是否选择无人；多目标死亡必须人工确认。"]}),
  role({"id":"zombuul","name":"僵怖","officialName":"Zombuul","team":"demon","abilityText":"Each night*, if no-one died today, choose a player: they die. The 1st time you die, you live but register as dead.","inputKinds":["player"],"possibleOutcomes":["当天无人死亡时夜晚才能杀人。","首次死亡时继续存活但登记为死亡。"],"highRiskNotes":["首次死亡后需要显示为死亡但仍可能存活行动。"]}),
  role({"id":"matron","name":"女舍监","officialName":"Matron","team":"traveler","abilityText":"Each day, you may choose up to 3 sets of 2 players to swap seats. Players may not leave their seats to talk in private.","inputKinds":["none"]}),
  role({"id":"judge","name":"法官","officialName":"Judge","team":"traveler","abilityText":"Once per game, if another player nominated, you may choose to force the current execution to pass or fail.","inputKinds":["text"]}),
  role({"id":"apprentice","name":"学徒","officialName":"Apprentice","team":"traveler","abilityText":"On your 1st night, you gain a Townsfolk ability (if good), or a Minion ability (if evil).","inputKinds":["none"],"possibleOutcomes":["善良学徒获得镇民能力；邪恶学徒获得爪牙能力。"],"identityChanges":["首夜获得一个合适阵营的角色能力。"],"highRiskNotes":["导入智能板子时要单独确认获得能力。"]}),
  role({"id":"bishop","name":"主教","officialName":"Bishop","team":"traveler","abilityText":"Only the Storyteller can nominate. At least 1 opposing player must be nominated each day.","inputKinds":["text"]}),
  role({"id":"voudon","name":"伏都教徒","officialName":"Voudon","team":"traveler","abilityText":"Only you & the dead can vote. They don't need a vote token to do so. A 50% majority isn't required.","inputKinds":["text"]}),
]

