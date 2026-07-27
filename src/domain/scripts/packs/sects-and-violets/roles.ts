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
    edition: 'Sects & Violets',
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

export const sectsAndVioletsRoles: readonly SmartRoleDefinition[] = [
  role({"id":"clockmaker","name":"钟表匠","officialName":"Clockmaker","team":"townsfolk","abilityText":"You start knowing how many steps from the Demon to its nearest Minion.","inputKinds":["number"]}),
  role({"id":"snakecharmer","name":"舞蛇人","officialName":"Snake Charmer","team":"townsfolk","abilityText":"Each night, choose an alive player: a chosen Demon swaps characters & alignments with you & is then poisoned.","inputKinds":["player"],"possibleOutcomes":["选择恶魔时，与恶魔交换角色和阵营。","未选择恶魔时无事发生。"],"identityChanges":["选择恶魔时，舞蛇人与恶魔交换角色。"],"teamChanges":["选择恶魔时，舞蛇人与恶魔交换阵营。"],"highRiskNotes":["交换当晚立即生效；原恶魔成为中毒的舞蛇人，不能继续让 AI 自动结算。"],"playerMessageTemplates":["你现在是{roleName}。","你变成了新的舞蛇人，并处于中毒状态。"]}),
  role({"id":"mathematician","name":"数学家","officialName":"Mathematician","team":"townsfolk","abilityText":"Each night, you learn how many players’ abilities worked abnormally (since dawn) due to another character's ability.","inputKinds":["none"]}),
  role({"id":"dreamer","name":"筑梦师","officialName":"Dreamer","team":"townsfolk","abilityText":"Each night, choose a player (not yourself or Travellers): you learn 1 good & 1 evil character, 1 of which is correct.","inputKinds":["player"]}),
  role({"id":"flowergirl","name":"花艺师","officialName":"Flowergirl","team":"townsfolk","abilityText":"Each night*, you learn if a Demon voted today.","inputKinds":["text"]}),
  role({"id":"towncrier","name":"镇喊者","officialName":"Town Crier","team":"townsfolk","abilityText":"Each night*, you learn if a Minion nominated today.","inputKinds":["text"]}),
  role({"id":"oracle","name":"神谕者","officialName":"Oracle","team":"townsfolk","abilityText":"Each night*, you learn how many dead players are evil.","inputKinds":["number"],"possibleOutcomes":["得知死亡玩家中有多少名邪恶。"],"playerMessageTemplates":["你得知：死亡玩家中有 {count} 名邪恶。"],"highRiskNotes":["数量由说书人核对阵营与登记异常后给出。"]}),
  role({"id":"savant","name":"博学者","officialName":"Savant","team":"townsfolk","abilityText":"Each day, you may visit the Storyteller to learn 2 things in private: 1 is true & 1 is false.","inputKinds":["text"]}),
  role({"id":"seamstress","name":"裁缝","officialName":"Seamstress","team":"townsfolk","abilityText":"Once per game, at night, choose 2 players (not yourself): you learn if they are the same alignment.","inputKinds":["players"],"possibleOutcomes":["两名目标同阵营。","两名目标不同阵营。"],"playerMessageTemplates":["是。","否。"],"highRiskNotes":["每局一次；同阵营判断受醉酒/中毒和登记异常影响。"]}),
  role({"id":"philosopher","name":"哲学家","officialName":"Philosopher","team":"townsfolk","abilityText":"Once per game, at night, choose a good character: gain that ability. If this character is in play, they are drunk.","inputKinds":["role"],"possibleOutcomes":["获得所选善良角色能力。","若所选角色在场，原角色醉酒。"],"stateChanges":["可能让在场的原角色醉酒。"],"identityChanges":["哲学家获得一个善良角色能力。"],"highRiskNotes":["获得能力只写入提示和草稿；不为所选角色生成自动状态机。"]}),
  role({"id":"artist","name":"艺术家","officialName":"Artist","team":"townsfolk","abilityText":"Once per game, during the day, privately ask the Storyteller any yes/no question.","inputKinds":["text"]}),
  role({"id":"juggler","name":"杂耍艺人","officialName":"Juggler","team":"townsfolk","abilityText":"On your 1st day, publicly guess up to 5 players' characters. That night, you learn how many you got correct.","inputKinds":["text"]}),
  role({"id":"sage","name":"贤者","officialName":"Sage","team":"townsfolk","abilityText":"If the Demon kills you, you learn that it is 1 of 2 players.","inputKinds":["none"]}),
  role({"id":"sweetheart","name":"甜心","officialName":"Sweetheart","team":"outsider","abilityText":"When you die, 1 player is drunk from now on.","inputKinds":["none"],"stateChanges":["甜心死亡后，一名玩家从此醉酒。"],"highRiskNotes":["醉酒目标由说书人选择并记录；死亡后持续。"]}),
  role({"id":"klutz","name":"冒失鬼","officialName":"Klutz","team":"outsider","abilityText":"When you learn that you died, publicly choose 1 alive player: if they are evil, your team loses.","inputKinds":["none"],"possibleOutcomes":["死亡后公开选择一名存活玩家。","若目标邪恶，己方失败。"],"stateChanges":["可能触发阵营失败。"],"highRiskNotes":["不自动判负；目标阵营和结局由说书人确认。"]}),
  role({"id":"barber","name":"理发师","officialName":"Barber","team":"outsider","abilityText":"If you died today or tonight, the Demon may choose 2 players (not another Demon) to swap characters.","inputKinds":["players"],"possibleOutcomes":["理发师今天或今晚死亡后，恶魔可交换两名玩家角色。"],"identityChanges":["恶魔选择的两名非另一恶魔玩家可能交换角色。"],"highRiskNotes":["交换由恶魔选择、说书人确认；不自动改身份。"]}),
  role({"id":"mutant","name":"畸形秀演员","officialName":"Mutant","team":"outsider","abilityText":"If you are “mad” about being an Outsider, you might be executed.","inputKinds":["none"],"possibleOutcomes":["若疯狂宣称自己是外来者，可能被处决。"],"stateChanges":["可能由说书人处决。"],"highRiskNotes":["疯狂与处决都是说书人裁量；不能自动处决。"]}),
  role({"id":"witch","name":"女巫","officialName":"Witch","team":"minion","abilityText":"Each night, choose a player: if they nominate tomorrow, they die. If just 3 players live, you lose this ability.","inputKinds":["player"],"possibleOutcomes":["目标明天若提名则死亡。","仅剩 3 名存活玩家时失去此能力。"],"stateChanges":["可能造成提名者死亡。"],"highRiskNotes":["需要记录女巫目标；三人存活时不要提供生效建议。"]}),
  role({"id":"cerenovus","name":"洗脑师","officialName":"Cerenovus","team":"minion","abilityText":"Each night, choose a player & a good character: they are “mad” they are this character tomorrow, or might be executed.","inputKinds":["player","role"],"possibleOutcomes":["目标明天需要疯狂证明自己是指定善良角色。"],"playerMessageTemplates":["你被洗脑成了{roleName}。明天你需要疯狂地证明自己是{roleName}，否则可能发生不好的事情。"],"highRiskNotes":["疯狂惩罚是说书人裁量，只能提示不能自动处决。"]}),
  role({"id":"pithag","name":"皮特哈格","officialName":"Pit-Hag","team":"minion","abilityText":"Each night*, choose a player & a character they become (if not in play). If a Demon is made, deaths tonight are arbitrary.","inputKinds":["player","role"],"identityChanges":["目标可能变成一个不在场角色。"],"highRiskNotes":["如果制造了新恶魔，当晚死亡由说书人任意决定。"]}),
  role({"id":"eviltwin","name":"邪恶双子","officialName":"Evil Twin","team":"minion","abilityText":"You & an opposing player know each other. If the good player is executed, evil wins. Good can't win if you both live.","inputKinds":["player","role"],"possibleOutcomes":["建立一对阵营相反的双子。"],"highRiskNotes":["善良双子被处决时邪恶获胜；双方存活时善良不能获胜。"]}),
  role({"id":"nodashii","name":"诺达鲺","officialName":"No Dashii","team":"demon","abilityText":"Each night*, choose a player: they die. Your 2 Townsfolk neighbors are poisoned.","inputKinds":["none"],"possibleOutcomes":["夜晚选择一名玩家死亡。","两侧最近镇民邻座中毒。"],"stateChanges":["可能造成目标死亡；两侧最近镇民中毒。"],"highRiskNotes":["中毒邻座按当前座位和身份由说书人确认。"]}),
  role({"id":"vigormortis","name":"维格莫提斯","officialName":"Vigormortis","team":"demon","abilityText":"Each night*, choose a player: they die. Minions you kill keep their ability & poison 1 Townsfolk neighbor. [-1 Outsider]","inputKinds":["player"],"setupImpact":["-1 外来者，通常增加 1 名镇民。"],"possibleOutcomes":["杀死爪牙后，该爪牙保留能力并让相邻一名镇民中毒。"],"highRiskNotes":["邻近镇民中毒需要由说书人选择并记录。"]}),
  role({"id":"vortox","name":"漩涡","officialName":"Vortox","team":"demon","abilityText":"Each night*, choose a player: they die. Townsfolk abilities yield false info. Each day, if no-one is executed, evil wins.","inputKinds":["player"],"highRiskNotes":["镇民能力获得的信息必须为错误；不能由 AI 自动生成唯一答案。"]}),
  role({"id":"fanggu","name":"方古","officialName":"Fang Gu","team":"demon","abilityText":"Each night*, choose a player: they die. The 1st Outsider this kills becomes an evil Fang Gu & you die instead. [+1 Outsider]","inputKinds":["player"],"setupImpact":["+1 外来者，通常替换 1 名镇民。"],"identityChanges":["首次被方古夜晚杀死的外来者变成邪恶方古，原方古死亡。"],"teamChanges":["被跳转的外来者变为邪恶阵营。"],"highRiskNotes":["只触发首次由方古杀死的外来者。"]}),
  role({"id":"barista","name":"咖啡师","officialName":"Barista","team":"traveler","abilityText":"Each night, until dusk, 1) a player becomes sober, healthy & gets true info, or 2) their ability works twice. They learn which.","inputKinds":["player"]}),
  role({"id":"harlot","name":"风尘女子","officialName":"Harlot","team":"traveler","abilityText":"Each night*, choose a living player: if they agree, you learn their character, but you both might die.","inputKinds":["player"]}),
  role({"id":"butcher","name":"屠夫","officialName":"Butcher","team":"traveler","abilityText":"Each day, after the 1st execution, you may nominate again.","inputKinds":["player"]}),
  role({"id":"bonecollector","name":"骸骨收集者","officialName":"Bone Collector","team":"traveler","abilityText":"Once per game, at night*, choose a dead player: they regain their ability until dusk.","inputKinds":["player"]}),
  role({"id":"deviant","name":"异端者","officialName":"Deviant","team":"traveler","abilityText":"If you were funny today, you cannot die by exile.","inputKinds":["none"]}),
]

