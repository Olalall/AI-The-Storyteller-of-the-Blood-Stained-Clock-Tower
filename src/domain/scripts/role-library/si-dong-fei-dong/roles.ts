import type { AbilityInputKind, KnowledgeStatus, RoleResearchMetadata, RoleTeam, SmartRoleDefinition } from '../../types'

const officialRolesSourceUrl = "https://release.botc.app/resources/data/roles.json"
const gstoneRoleSourceUrl = "https://clocktower.gstonegames.com/ct/grimoireRoleJson/"
const scriptSourceUrl = "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21179_35934.json"
const reviewedAt = "2026-07-21"

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
    edition: "似懂非懂 / GStone 21179",
    setupImpact: input.setupImpact ?? [],
    possibleOutcomes: input.possibleOutcomes ?? [],
    stateChanges: input.stateChanges ?? [],
    identityChanges: input.identityChanges ?? [],
    teamChanges: input.teamChanges ?? [],
    playerMessageTemplates: input.playerMessageTemplates ?? [],
    highRiskNotes: input.highRiskNotes ?? [],
    sourceUrls: [officialRolesSourceUrl, gstoneRoleSourceUrl, scriptSourceUrl],
    reviewedAt,
  }
}

export const siDongFeiDongRoleIds = [
  "knight",
  "chef",
  "bountyhunter",
  "savant",
  "exorcist",
  "innkeeper",
  "balloonist",
  "gossip",
  "mathematician",
  "gambler",
  "oracle",
  "virgin",
  "fisherman",
  "tinker",
  "moonchild",
  "puzzlemaster",
  "barber",
  "godfather",
  "mastermind",
  "harpy",
  "scarletwoman",
  "pukka",
  "po",
  "nodashii",
  "ojo",
  "harlot",
  "matron",
  "beggar",
  "gunslinger",
  "thief",
  "scapegoat",
  "butcher",
  "voudon",
  "apprentice",
  "bishop",
  "deviant",
  "judge",
  "bureaucrat",
  "gangster",
  "bonecollector",
  "barista"
] as const

export const siDongFeiDongRoles: readonly SmartRoleDefinition[] = [
  role({ id: "knight", name: "骑士", officialName: "Knight", team: "townsfolk", abilityText: "You start knowing 2 players that are not the Demon.", inputKinds: ["none"], possibleOutcomes: ["May create a win/loss candidate."], highRiskNotes: ["Win/loss is a candidate reminder; storyteller declares the result."] }),
  role({ id: "chef", name: "厨师", officialName: "Chef", team: "townsfolk", abilityText: "You start knowing how many pairs of evil players there are.", inputKinds: ["number"], possibleOutcomes: ["May create a win/loss candidate."], teamChanges: ["May involve alignment, registration or win/loss interpretation."], highRiskNotes: ["Alignment, registration and win/loss are never auto-applied.", "Win/loss is a candidate reminder; storyteller declares the result."] }),
  role({ id: "bountyhunter", name: "赏金猎人", officialName: "Bounty Hunter", team: "townsfolk", abilityText: "You start knowing 1 evil player. If the player you know dies, you learn another evil player tonight. [1 Townsfolk is evil]", inputKinds: ["none"], setupImpact: ["Setup has a role-specific modification; apply only after storyteller confirmation.", "Bounty Hunter makes one Townsfolk evil (no Outsider count change). Templates avoid it unless storyteller deliberately chooses it."], possibleOutcomes: ["May cause, prevent, or react to death depending on the confirmed source.", "May create a win/loss candidate."], stateChanges: ["Death-related outcomes must be confirmed before state changes."], teamChanges: ["One Townsfolk may be evil due to Bounty Hunter setup.", "May involve alignment, registration or win/loss interpretation."], highRiskNotes: ["Setup changes are reminders only and must not auto-change the authority state.", "Do not automatically mark a Townsfolk evil; storyteller chooses and confirms.", "Death, execution, protection and death source must not auto-apply.", "Alignment, registration and win/loss are never auto-applied.", "Win/loss is a candidate reminder; storyteller declares the result."] }),
  role({ id: "savant", name: "博学者", officialName: "Savant", team: "townsfolk", abilityText: "Each day, you may visit the Storyteller to learn 2 things in private: 1 is true & 1 is false.", inputKinds: ["text"], possibleOutcomes: ["Record the choice or information result for storyteller confirmation."] }),
  role({ id: "exorcist", name: "驱魔人", officialName: "Exorcist", team: "townsfolk", abilityText: "Each night*, choose a player (different to last night): the Demon, if chosen, learns who you are then doesn't wake tonight.", inputKinds: ["player"], possibleOutcomes: ["Record the choice or information result for storyteller confirmation."] }),
  role({ id: "innkeeper", name: "旅店老板", officialName: "Innkeeper", team: "townsfolk", abilityText: "Each night*, choose 2 players: they can't die tonight, but 1 is drunk until dusk.", inputKinds: ["players"], possibleOutcomes: ["May cause, prevent, or react to death depending on the confirmed source."], stateChanges: ["Death-related outcomes must be confirmed before state changes.", "May create poisoned, drunk, sober or healthy state."], highRiskNotes: ["Death, execution, protection and death source must not auto-apply.", "Poison/drunk state is a candidate result until storyteller confirms it."] }),
  role({ id: "balloonist", name: "气球驾驶员", officialName: "Balloonist", team: "townsfolk", abilityText: "Each night, you learn a player of a different character type than last night. [+0 or +1 Outsider]", inputKinds: ["none"], setupImpact: ["Setup has a role-specific modification; apply only after storyteller confirmation.", "Balloonist can add an Outsider. Current normal templates avoid automatic Balloonist adjustment."], possibleOutcomes: ["Record the choice or information result for storyteller confirmation."], highRiskNotes: ["Setup changes are reminders only and must not auto-change the authority state.", "If used manually, outsider count must be confirmed."] }),
  role({ id: "gossip", name: "造谣者", officialName: "Gossip", team: "townsfolk", abilityText: "Each day, you may make a public statement. Tonight, if it was true, a player dies.", inputKinds: ["text"], possibleOutcomes: ["May cause, prevent, or react to death depending on the confirmed source."], stateChanges: ["Death-related outcomes must be confirmed before state changes."], highRiskNotes: ["Death, execution, protection and death source must not auto-apply."] }),
  role({ id: "mathematician", name: "数学家", officialName: "Mathematician", team: "townsfolk", abilityText: "Each night, you learn how many players’ abilities worked abnormally (since dawn) due to another character's ability.", inputKinds: ["number"], possibleOutcomes: ["Record the choice or information result for storyteller confirmation."] }),
  role({ id: "gambler", name: "赌徒", officialName: "Gambler", team: "townsfolk", abilityText: "Each night*, choose a player & guess their character: if you guess wrong, you die.", inputKinds: ["player"], possibleOutcomes: ["May cause, prevent, or react to death depending on the confirmed source."], stateChanges: ["Death-related outcomes must be confirmed before state changes."], highRiskNotes: ["Death, execution, protection and death source must not auto-apply."] }),
  role({ id: "oracle", name: "神谕者", officialName: "Oracle", team: "townsfolk", abilityText: "Each night*, you learn how many dead players are evil.", inputKinds: ["number"], possibleOutcomes: ["May cause, prevent, or react to death depending on the confirmed source."], stateChanges: ["Death-related outcomes must be confirmed before state changes."], teamChanges: ["May involve alignment, registration or win/loss interpretation."], highRiskNotes: ["Death, execution, protection and death source must not auto-apply.", "Alignment, registration and win/loss are never auto-applied."] }),
  role({ id: "virgin", name: "贞洁者", officialName: "Virgin", team: "townsfolk", abilityText: "The 1st time you are nominated, if the nominator is a Townsfolk, they are executed immediately.", inputKinds: ["none"], possibleOutcomes: ["May cause, prevent, or react to death depending on the confirmed source."], stateChanges: ["Death-related outcomes must be confirmed before state changes."], highRiskNotes: ["Death, execution, protection and death source must not auto-apply."] }),
  role({ id: "fisherman", name: "渔夫", officialName: "Fisherman", team: "townsfolk", abilityText: "Once per game, during the day, visit the Storyteller for some advice to help your team win.", inputKinds: ["none"], possibleOutcomes: ["May create a win/loss candidate."], highRiskNotes: ["Win/loss is a candidate reminder; storyteller declares the result."] }),
  role({ id: "tinker", name: "修补匠", officialName: "Tinker", team: "outsider", abilityText: "You might die at any time.", inputKinds: ["none"], possibleOutcomes: ["May cause, prevent, or react to death depending on the confirmed source."], stateChanges: ["Death-related outcomes must be confirmed before state changes."], highRiskNotes: ["Death, execution, protection and death source must not auto-apply."] }),
  role({ id: "moonchild", name: "月之子", officialName: "Moonchild", team: "outsider", abilityText: "When you learn that you died, publicly choose 1 alive player. Tonight, if it was a good player, they die.", inputKinds: ["none"], possibleOutcomes: ["After Moonchild death, chosen good player may die that night.", "May cause, prevent, or react to death depending on the confirmed source."], stateChanges: ["Chosen target and death source must be tracked.", "Death-related outcomes must be confirmed before state changes."], teamChanges: ["May involve alignment, registration or win/loss interpretation."], highRiskNotes: ["Death, execution, protection and death source must not auto-apply.", "Alignment, registration and win/loss are never auto-applied."] }),
  role({ id: "puzzlemaster", name: "解谜大师", officialName: "Puzzlemaster", team: "outsider", abilityText: "1 player is drunk, even if you die. If you guess (once) who it is, learn the Demon player, but guess wrong & get false info.", inputKinds: ["none"], possibleOutcomes: ["May cause, prevent, or react to death depending on the confirmed source."], stateChanges: ["Death-related outcomes must be confirmed before state changes.", "May create poisoned, drunk, sober or healthy state."], highRiskNotes: ["Death, execution, protection and death source must not auto-apply.", "Poison/drunk state is a candidate result until storyteller confirms it."] }),
  role({ id: "barber", name: "理发师", officialName: "Barber", team: "outsider", abilityText: "If you died today or tonight, the Demon may choose 2 players (not another Demon) to swap characters.", inputKinds: ["players"], possibleOutcomes: ["May cause, prevent, or react to death depending on the confirmed source."], stateChanges: ["Death-related outcomes must be confirmed before state changes."], identityChanges: ["If Barber dies, Demon may swap two players characters.", "May change character or gain/replace an ability."], playerMessageTemplates: ["Your character may have changed to {role}.", "You are now {role}."], highRiskNotes: ["Barber swaps must be confirmed and logged before changing identities.", "Death, execution, protection and death source must not auto-apply.", "Identity changes affect later night order only after explicit confirmation."] }),
  role({ id: "godfather", name: "教父", officialName: "Godfather", team: "minion", abilityText: "You start knowing which Outsiders are in play. If 1 died today, choose a player tonight: they die. [-1 or +1 Outsider]", inputKinds: ["player"], setupImpact: ["Setup has a role-specific modification; apply only after storyteller confirmation.", "Godfather may change Outsider count depending on in-play Outsiders. Current normal templates avoid automatic Godfather adjustment."], possibleOutcomes: ["May cause, prevent, or react to death depending on the confirmed source.", "May create a win/loss candidate."], stateChanges: ["Death-related outcomes must be confirmed before state changes."], highRiskNotes: ["Setup changes are reminders only and must not auto-change the authority state.", "If used manually, outsider count and kill trigger must be confirmed.", "Death, execution, protection and death source must not auto-apply.", "Win/loss is a candidate reminder; storyteller declares the result."] }),
  role({ id: "mastermind", name: "主谋", officialName: "Mastermind", team: "minion", abilityText: "If the Demon dies by execution (ending the game), play for 1 more day. If a player is then executed, their team loses.", inputKinds: ["none"], possibleOutcomes: ["May cause, prevent, or react to death depending on the confirmed source.", "May create a win/loss candidate."], stateChanges: ["Death-related outcomes must be confirmed before state changes."], highRiskNotes: ["Death, execution, protection and death source must not auto-apply.", "Win/loss is a candidate reminder; storyteller declares the result."] }),
  role({ id: "harpy", name: "鹰身女妖", officialName: "Harpy", team: "minion", abilityText: "Each night, choose 2 players: tomorrow, the 1st player is mad that the 2nd is evil, or one or both might die.", inputKinds: ["players"], possibleOutcomes: ["May cause, prevent, or react to death depending on the confirmed source."], stateChanges: ["Death-related outcomes must be confirmed before state changes.", "May create a madness requirement or madness penalty."], teamChanges: ["May involve alignment, registration or win/loss interpretation."], playerMessageTemplates: ["You must be mad that {seatB} is evil tomorrow, or one or both of you might die."], highRiskNotes: ["Death, execution, protection and death source must not auto-apply.", "Madness judgment and penalty are storyteller discretion.", "Alignment, registration and win/loss are never auto-applied."] }),
  role({ id: "scarletwoman", name: "红唇女郎", officialName: "Scarlet Woman", team: "minion", abilityText: "If there are 5 or more players alive & the Demon dies, you become the Demon. (Travellers don't count.)", inputKinds: ["none"], possibleOutcomes: ["May cause, prevent, or react to death depending on the confirmed source."], stateChanges: ["Death-related outcomes must be confirmed before state changes."], identityChanges: ["May change character or gain/replace an ability."], playerMessageTemplates: ["You are now {role}."], highRiskNotes: ["Death, execution, protection and death source must not auto-apply.", "Identity changes affect later night order only after explicit confirmation."] }),
  role({ id: "pukka", name: "普卡", officialName: "Pukka", team: "demon", abilityText: "Each night, choose a player: they are poisoned. The previously poisoned player dies then becomes healthy.", inputKinds: ["player"], possibleOutcomes: ["May cause, prevent, or react to death depending on the confirmed source."], stateChanges: ["Death-related outcomes must be confirmed before state changes.", "May create poisoned, drunk, sober or healthy state."], highRiskNotes: ["Death, execution, protection and death source must not auto-apply.", "Poison/drunk state is a candidate result until storyteller confirms it."] }),
  role({ id: "po", name: "珀", officialName: "Po", team: "demon", abilityText: "Each night*, you may choose a player: they die. If your last choice was no-one, choose 3 players tonight.", inputKinds: ["player"], possibleOutcomes: ["May cause, prevent, or react to death depending on the confirmed source."], stateChanges: ["Death-related outcomes must be confirmed before state changes."], highRiskNotes: ["Death, execution, protection and death source must not auto-apply."] }),
  role({ id: "nodashii", name: "诺-达鲺", officialName: "No Dashii", team: "demon", abilityText: "Each night*, choose a player: they die. Your 2 Townsfolk neighbors are poisoned.", inputKinds: ["player"], possibleOutcomes: ["May cause, prevent, or react to death depending on the confirmed source."], stateChanges: ["Death-related outcomes must be confirmed before state changes.", "May create poisoned, drunk, sober or healthy state."], highRiskNotes: ["Death, execution, protection and death source must not auto-apply.", "Poison/drunk state is a candidate result until storyteller confirms it."] }),
  role({ id: "ojo", name: "奥赫", officialName: "Ojo", team: "demon", abilityText: "Each night*, choose a character: they die. If they are not in play, the Storyteller chooses who dies.", inputKinds: ["role"], possibleOutcomes: ["May cause, prevent, or react to death depending on the confirmed source."], stateChanges: ["Death-related outcomes must be confirmed before state changes."], highRiskNotes: ["Death, execution, protection and death source must not auto-apply."] }),
  role({ id: "harlot", name: "流莺", officialName: "Harlot", team: "traveler", abilityText: "Each night*, choose a living player: if they agree, you learn their character, but you both might die.", inputKinds: ["none"], possibleOutcomes: ["May cause, prevent, or react to death depending on the confirmed source."], stateChanges: ["Death-related outcomes must be confirmed before state changes."], highRiskNotes: ["Death, execution, protection and death source must not auto-apply."] }),
  role({ id: "matron", name: "女舍监", officialName: "Matron", team: "traveler", abilityText: "Each day, you may choose up to 3 sets of 2 players to swap seats. Players may not leave their seats to talk in private.", inputKinds: ["none"], possibleOutcomes: ["Record the choice or information result for storyteller confirmation."], identityChanges: ["May change character or gain/replace an ability."], playerMessageTemplates: ["You are now {role}."], highRiskNotes: ["Identity changes affect later night order only after explicit confirmation."] }),
  role({ id: "beggar", name: "乞丐", officialName: "Beggar", team: "traveler", abilityText: "You must use a vote token to vote. If a dead player gives you theirs, you learn their alignment. You are sober & healthy.", inputKinds: ["none"], possibleOutcomes: ["May cause, prevent, or react to death depending on the confirmed source."], stateChanges: ["Death-related outcomes must be confirmed before state changes.", "May create poisoned, drunk, sober or healthy state."], teamChanges: ["May involve alignment, registration or win/loss interpretation."], highRiskNotes: ["Death, execution, protection and death source must not auto-apply.", "Poison/drunk state is a candidate result until storyteller confirms it.", "Alignment, registration and win/loss are never auto-applied."] }),
  role({ id: "gunslinger", name: "枪手", officialName: "Gunslinger", team: "traveler", abilityText: "Each day, after the 1st vote has been tallied, you may choose a player that voted: they die.", inputKinds: ["player"], possibleOutcomes: ["May cause, prevent, or react to death depending on the confirmed source."], stateChanges: ["Death-related outcomes must be confirmed before state changes."], highRiskNotes: ["Death, execution, protection and death source must not auto-apply.", "Exile votes are unaffected: an exile vote does not count as the day's 1st vote, and the Gunslinger cannot kill players who voted for an exile."] }),
  role({ id: "thief", name: "窃贼", officialName: "Thief", team: "traveler", abilityText: "Each night, choose a player (not yourself): their vote counts negatively tomorrow.", inputKinds: ["player"], possibleOutcomes: ["Record the choice or information result for storyteller confirmation."] }),
  role({ id: "scapegoat", name: "替罪羊", officialName: "Scapegoat", team: "traveler", abilityText: "If a player of your alignment is executed, you might be executed instead.", inputKinds: ["none"], possibleOutcomes: ["May cause, prevent, or react to death depending on the confirmed source."], stateChanges: ["Death-related outcomes must be confirmed before state changes."], teamChanges: ["May involve alignment, registration or win/loss interpretation."], highRiskNotes: ["Death, execution, protection and death source must not auto-apply.", "Alignment, registration and win/loss are never auto-applied."] }),
  role({ id: "butcher", name: "屠夫", officialName: "Butcher", team: "traveler", abilityText: "Each day, after the 1st execution, you may nominate again.", inputKinds: ["none"], possibleOutcomes: ["May cause, prevent, or react to death depending on the confirmed source."], stateChanges: ["Death-related outcomes must be confirmed before state changes."], highRiskNotes: ["Death, execution, protection and death source must not auto-apply."] }),
  role({ id: "voudon", name: "巫毒师", officialName: "Voudon", team: "traveler", abilityText: "Only you & the dead can vote. They don't need a vote token to do so. A 50% majority isn't required.", inputKinds: ["none"], possibleOutcomes: ["May cause, prevent, or react to death depending on the confirmed source."], stateChanges: ["Death-related outcomes must be confirmed before state changes."], highRiskNotes: ["Death, execution, protection and death source must not auto-apply."] }),
  role({ id: "apprentice", name: "学徒", officialName: "Apprentice", team: "traveler", abilityText: "On your 1st night, you gain a Townsfolk ability (if good), or a Minion ability (if evil).", inputKinds: ["none"], possibleOutcomes: ["Record the choice or information result for storyteller confirmation."], teamChanges: ["May involve alignment, registration or win/loss interpretation."], highRiskNotes: ["Alignment, registration and win/loss are never auto-applied."] }),
  role({ id: "bishop", name: "主教", officialName: "Bishop", team: "traveler", abilityText: "Only the Storyteller can nominate. At least 1 opposing player must be nominated each day.", inputKinds: ["none"], possibleOutcomes: ["Record the choice or information result for storyteller confirmation."] }),
  role({ id: "deviant", name: "怪咖", officialName: "Deviant", team: "traveler", abilityText: "If you were funny today, you cannot die by exile.", inputKinds: ["none"], possibleOutcomes: ["May cause, prevent, or react to death depending on the confirmed source."], stateChanges: ["Death-related outcomes must be confirmed before state changes."], highRiskNotes: ["Death, execution, protection and death source must not auto-apply."] }),
  role({ id: "judge", name: "法官", officialName: "Judge", team: "traveler", abilityText: "Once per game, if another player nominated, you may choose to force the current execution to pass or fail.", inputKinds: ["none"], possibleOutcomes: ["May cause, prevent, or react to death depending on the confirmed source."], stateChanges: ["Death-related outcomes must be confirmed before state changes."], highRiskNotes: ["Death, execution, protection and death source must not auto-apply."] }),
  role({ id: "bureaucrat", name: "官员", officialName: "Bureaucrat", team: "traveler", abilityText: "Each night, choose a player (not yourself): their vote counts as 3 votes tomorrow.", inputKinds: ["player"], possibleOutcomes: ["Record the choice or information result for storyteller confirmation.", "Exile votes are unaffected: the chosen player's vote counts normally (1 vote) in exile votes.", "The 3-vote weight ends immediately if the Bureaucrat dies or is exiled; the chosen player reverts to 1 vote."] }),
  role({ id: "gangster", name: "黑帮", officialName: "Gangster", team: "traveler", abilityText: "Once per day, you may choose to kill an alive neighbor, if your other alive neighbor agrees.", inputKinds: ["none"], possibleOutcomes: ["May cause, prevent, or react to death depending on the confirmed source."], stateChanges: ["Death-related outcomes must be confirmed before state changes."], highRiskNotes: ["Death, execution, protection and death source must not auto-apply."] }),
  role({ id: "bonecollector", name: "集骨者", officialName: "Bone Collector", team: "traveler", abilityText: "Once per game, at night*, choose a dead player: they regain their ability until dusk.", inputKinds: ["none"], possibleOutcomes: ["May cause, prevent, or react to death depending on the confirmed source."], stateChanges: ["Death-related outcomes must be confirmed before state changes."], highRiskNotes: ["Death, execution, protection and death source must not auto-apply."] }),
  role({ id: "barista", name: "咖啡师", officialName: "Barista", team: "traveler", abilityText: "Each night, until dusk, 1) a player becomes sober, healthy & gets true info, or 2) their ability works twice. They learn which.", inputKinds: ["none"], possibleOutcomes: ["Storyteller chooses one of two effects and tells the target which one.", "Record the choice or information result for storyteller confirmation."], stateChanges: ["May create poisoned, drunk, sober or healthy state."], playerMessageTemplates: ["The Barista affects you tonight: either you are sober, healthy & get true info until dusk, or your ability works twice. You learn which."], highRiskNotes: ["Poison/drunk state is a candidate result until storyteller confirms it."] }),
]
