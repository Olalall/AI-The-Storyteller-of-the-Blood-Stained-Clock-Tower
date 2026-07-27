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
    edition: 'Trouble Brewing',
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

export const troubleBrewingRoles: readonly SmartRoleDefinition[] = [
  role({"id":"chef","name":"厨师","officialName":"Chef","team":"townsfolk","abilityText":"You start knowing how many pairs of evil players there are.","inputKinds":["none"],"possibleOutcomes":["告知邪恶玩家相邻对数。"],"playerMessageTemplates":["你得知：有 {count} 对邪恶玩家相邻。"]}),
  role({"id":"investigator","name":"调查员","officialName":"Investigator","team":"townsfolk","abilityText":"You start knowing that 1 of 2 players is a particular Minion.","inputKinds":["players","role"],"possibleOutcomes":["在两名玩家中指认一名可能爪牙。"],"playerMessageTemplates":["你得知：{seatA}号和{seatB}号中有一名是{roleName}。"]}),
  role({"id":"washerwoman","name":"洗衣妇","officialName":"Washerwoman","team":"townsfolk","abilityText":"You start knowing that 1 of 2 players is a particular Townsfolk.","inputKinds":["players","role"],"possibleOutcomes":["在两名玩家中指认一名可能镇民。"],"playerMessageTemplates":["你得知：{seatA}号和{seatB}号中有一名是{roleName}。"]}),
  role({"id":"librarian","name":"图书管理员","officialName":"Librarian","team":"townsfolk","abilityText":"You start knowing that 1 of 2 players is a particular Outsider. (Or that zero are in play.)","inputKinds":["players","role","number"],"possibleOutcomes":["在两名玩家中指认一名可能外来者。","也可以告知本局没有外来者。"],"playerMessageTemplates":["你得知：{seatA}号和{seatB}号中有一名是{roleName}。","你得知：本局没有外来者。"]}),
  role({"id":"empath","name":"共情者","officialName":"Empath","team":"townsfolk","abilityText":"Each night, you learn how many of your 2 alive neighbors are evil.","inputKinds":["number"],"possibleOutcomes":["告知两侧存活邻座中的邪恶数量。"],"playerMessageTemplates":["你得知：你的两侧存活邻座中有 {count} 名邪恶玩家。"]}),
  role({"id":"fortuneteller","name":"占卜师","officialName":"Fortune Teller","team":"townsfolk","abilityText":"Each night, choose 2 players: you learn if either is a Demon. There is a good player that registers as a Demon to you.","inputKinds":["players"],"setupImpact":["开局指定 1 名善良玩家作为红鲱鱼。"],"possibleOutcomes":["至少一名目标被登记为恶魔。","两名目标都没有登记为恶魔。"],"playerMessageTemplates":["是。","否。"],"highRiskNotes":["先确认红鲱鱼、醉酒和中毒，再给占卜结果。"]}),
  role({"id":"undertaker","name":"掘墓人","officialName":"Undertaker","team":"townsfolk","abilityText":"Each night*, you learn which character died by execution today.","inputKinds":["role"],"possibleOutcomes":["告知今天被处决玩家的角色。"],"playerMessageTemplates":["你得知：今天被处决的玩家是{roleName}。"],"highRiskNotes":["只处理处决死亡，不处理夜晚死亡或替换死亡。"]}),
  role({"id":"monk","name":"僧侣","officialName":"Monk","team":"townsfolk","abilityText":"Each night*, choose a player (not yourself): they are safe from the Demon tonight.","inputKinds":["player"],"stateChanges":["目标今晚免受恶魔影响。"],"highRiskNotes":["保护只针对恶魔，不阻止爪牙或说书人来源的死亡。"]}),
  role({"id":"slayer","name":"猎手","officialName":"Slayer","team":"townsfolk","abilityText":"Once per game, during the day, publicly choose a player: if they are the Demon, they die.","inputKinds":["player"],"possibleOutcomes":["目标是恶魔则死亡。","目标不是恶魔则无事发生。"],"stateChanges":["可能造成目标死亡。"],"highRiskNotes":["白天公开发动；AI 只能提示，死亡必须由说书人确认。"]}),
  role({"id":"soldier","name":"士兵","officialName":"Soldier","team":"townsfolk","abilityText":"You are safe from the Demon.","inputKinds":["none"],"stateChanges":["免受恶魔影响。"],"highRiskNotes":["仍可能被非恶魔来源影响。"]}),
  role({"id":"ravenkeeper","name":"守鸦人","officialName":"Ravenkeeper","team":"townsfolk","abilityText":"If you die at night, you are woken to choose a player: you learn their character.","inputKinds":["player"],"possibleOutcomes":["夜晚死亡后查看一名玩家角色。"],"playerMessageTemplates":["你得知：{seat}号是{roleName}。"],"highRiskNotes":["只在夜晚死亡后唤醒。"]}),
  role({"id":"mayor","name":"镇长","officialName":"Mayor","team":"townsfolk","abilityText":"If only 3 players live & no execution occurs, your team wins. If you die at night, another player might die instead.","inputKinds":["none"],"possibleOutcomes":["三人存活且白天无人处决时善良可能获胜。","夜晚死亡可能转移给另一名玩家。"],"stateChanges":["夜晚死亡可能被转移。"],"highRiskNotes":["胜负和死亡转移必须由说书人确认。"]}),
  role({"id":"virgin","name":"圣女","officialName":"Virgin","team":"townsfolk","abilityText":"The 1st time you are nominated, if the nominator is a Townsfolk, they are executed immediately.","inputKinds":["none"],"possibleOutcomes":["首次被镇民提名时，提名者立即被处决。"],"stateChanges":["可能立即处决提名者。"],"highRiskNotes":["确认提名者实际是否镇民，再决定是否触发。"]}),
  role({"id":"butler","name":"管家","officialName":"Butler","team":"outsider","abilityText":"Each night, choose a player (not yourself): tomorrow, you may only vote if they are voting too.","inputKinds":["player"],"stateChanges":["明天投票受主人限制。"],"highRiskNotes":["记录选择即可，投票合法性由说书人提醒。"]}),
  role({"id":"drunk","name":"酒鬼","officialName":"Drunk","team":"outsider","abilityText":"You do not know you are the Drunk. You think you are a Townsfolk character, but you are not.","inputKinds":["none"],"setupImpact":["以 1 名外来者替换 1 名镇民，酒鬼以为自己是某个镇民。"],"possibleOutcomes":["实际没有自身能力，但需要正常接收假身份信息。"],"highRiskNotes":["不能让玩家知道自己是酒鬼。"]}),
  role({"id":"recluse","name":"隐士","officialName":"Recluse","team":"outsider","abilityText":"You might register as evil & as a Minion or Demon, even if dead.","inputKinds":["none"],"possibleOutcomes":["可能被登记为邪恶、爪牙或恶魔。"],"highRiskNotes":["登记结果是说书人自由裁量，不要让 AI 自动定死。"]}),
  role({"id":"saint","name":"圣徒","officialName":"Saint","team":"outsider","abilityText":"If you die by execution, your team loses.","inputKinds":["none"],"possibleOutcomes":["若被处决，善良阵营失败。"],"stateChanges":["被处决会触发失败条件。"],"highRiskNotes":["胜负必须由说书人确认。"]}),
  role({"id":"poisoner","name":"投毒者","officialName":"Poisoner","team":"minion","abilityText":"Each night, choose a player: they are poisoned tonight and tomorrow day.","inputKinds":["player"],"stateChanges":["目标今晚和明天白天中毒。"],"highRiskNotes":["中毒影响信息真实性，不应自动改权威状态。"]}),
  role({"id":"spy","name":"间谍","officialName":"Spy","team":"minion","abilityText":"Each night, you see the Grimoire. You might register as good & as a Townsfolk or Outsider, even if dead.","inputKinds":["none"],"possibleOutcomes":["查看完整魔典。","可能被登记为善良、镇民或外来者。"],"highRiskNotes":["登记异常属于说书人裁量。"]}),
  role({"id":"scarletwoman","name":"猩红女郎","officialName":"Scarlet Woman","team":"minion","abilityText":"If there are 5 or more players alive & the Demon dies, you become the Demon. (Travellers don't count.)","inputKinds":["none"],"identityChanges":["5 名及以上存活时，恶魔死亡后可能变成恶魔。"],"teamChanges":["成为新的恶魔。"],"highRiskNotes":["是否触发需要确认存活人数和恶魔死亡方式。"]}),
  role({"id":"baron","name":"男爵","officialName":"Baron","team":"minion","abilityText":"There are extra Outsiders in play. [+2 Outsiders]","inputKinds":["none"],"setupImpact":["+2 外来者，通常替换 2 名镇民。"],"highRiskNotes":["模板需要同步修正人数构成。"]}),
  role({"id":"imp","name":"小恶魔","officialName":"Imp","team":"demon","abilityText":"Each night*, choose a player: they die. If you kill yourself this way, a Minion becomes the Imp.","inputKinds":["player"],"stateChanges":["夜晚选择一名玩家死亡。"],"identityChanges":["小恶魔自杀时，一名爪牙变成小恶魔。"],"teamChanges":["新恶魔仍为邪恶阵营。"],"highRiskNotes":["自杀传位必须由说书人确认。"]}),
  role({"id":"thief","name":"窃贼","officialName":"Thief","team":"traveler","abilityText":"Each night, choose a player (not yourself): their vote counts negatively tomorrow.","inputKinds":["player"]}),
  role({"id":"bureaucrat","name":"官僚","officialName":"Bureaucrat","team":"traveler","abilityText":"Each night, choose a player (not yourself): their vote counts as 3 votes tomorrow.","inputKinds":["player"]}),
  role({"id":"gunslinger","name":"枪手","officialName":"Gunslinger","team":"traveler","abilityText":"Each day, after the 1st vote has been tallied, you may choose a player that voted: they die.","inputKinds":["player"]}),
  role({"id":"beggar","name":"乞丐","officialName":"Beggar","team":"traveler","abilityText":"You must use a vote token to vote. If a dead player gives you theirs, you learn their alignment. You are sober & healthy.","inputKinds":["text"]}),
  role({"id":"scapegoat","name":"替罪羊","officialName":"Scapegoat","team":"traveler","abilityText":"If a player of your alignment is executed, you might be executed instead.","inputKinds":["none"]}),
]

