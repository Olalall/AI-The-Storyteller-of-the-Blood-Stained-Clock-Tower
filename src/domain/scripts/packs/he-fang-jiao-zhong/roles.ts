import type { AbilityInputKind, KnowledgeStatus, RoleResearchMetadata, RoleTeam, SmartRoleDefinition } from '../../types'

const officialRolesSourceUrl = 'https://release.botc.app/resources/data/roles.json'
const gstoneRoleSourceUrl = 'https://clocktower.gstonegames.com/ct/grimoireRoleJson/'
const scriptSourceUrl = 'https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21087_69602.json'
const reviewedAt = '2026-07-21'

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
    edition: '何方教众 / GStone 21087',
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

export const heFangJiaoZhongRoleIds = [
  "noble",
  "pixie",
  "fortuneteller",
  "balloonist",
  "king",
  "oracle",
  "cultleader",
  "lycanthrope",
  "savant",
  "seamstress",
  "huntsman",
  "choirboy",
  "cannibal",
  "damsel",
  "mutant",
  "recluse",
  "puzzlemaster",
  "witch",
  "cerenovus",
  "fearmonger",
  "goblin",
  "fanggu",
  "lilmonsta",
  "nodashii",
  "vortox",
  "stormcatcher",
] as const

export const heFangJiaoZhongRoles: readonly SmartRoleDefinition[] = [
  role({ id: "noble", name: "贵族", officialName: "Noble", team: "townsfolk", abilityText: "You start knowing 3 players, 1 and only 1 of which is evil.", inputKinds: ["players"], possibleOutcomes: ["Show three players with exactly one evil among them."], playerMessageTemplates: ["You learn: {seatA}, {seatB}, {seatC}; exactly one is evil."] }),
  role({ id: "pixie", name: "小精灵", officialName: "Pixie", team: "townsfolk", abilityText: "You start knowing 1 in-play Townsfolk. If you were mad that you were this character, you gain their ability when they die.", inputKinds: ["role"], possibleOutcomes: ["Learns one in-play Townsfolk.", "May gain that ability after the original character dies if madness condition was met."], identityChanges: ["May gain another character ability."], playerMessageTemplates: ["You learn that {role} is in play."], highRiskNotes: ["Madness and ability gain timing are storyteller-confirmed only."] }),
  role({ id: "fortuneteller", name: "占卜师", officialName: "Fortune Teller", team: "townsfolk", abilityText: "Each night, choose 2 players: you learn if either is a Demon. There is a good player that registers as a Demon to you.", inputKinds: ["players"], possibleOutcomes: ["Answer yes if either chosen player registers as a Demon.", "Answer no otherwise."], stateChanges: ["A good player registers as Demon to this character."], playerMessageTemplates: ["Your answer is: {yesNo}."], highRiskNotes: ["Red herring, Recluse, Vortox and poison/drunk can affect the answer."] }),
  role({ id: "balloonist", name: "气球驾驶员", officialName: "Balloonist", team: "townsfolk", abilityText: "Each night, you learn a player of a different character type than last night. [+0 or +1 Outsider]", inputKinds: ["player"], setupImpact: ["This source uses +1 Outsider for Balloonist templates."], possibleOutcomes: ["Learns a player of a different character type than last night."], playerMessageTemplates: ["You learn: {seat}."], highRiskNotes: ["Character type means Townsfolk, Outsider, Minion or Demon."] }),
  role({ id: "king", name: "国王", officialName: "King", team: "townsfolk", abilityText: "Each night, if the dead equal or outnumber the living, you learn 1 alive character. The Demon knows you are the King.", inputKinds: ["role"], setupImpact: ["The Demon learns who the King is."], possibleOutcomes: ["If dead players equal or outnumber living players, the King learns one living character.", "The Demon learns the King player."], stateChanges: ["Trigger depends on current dead and alive counts."], playerMessageTemplates: ["You learn: {role}.", "You learn that {seat} is the King."], highRiskNotes: ["Do not auto-calculate or send; storyteller confirms the live snapshot."] }),
  role({ id: "oracle", name: "神谕者", officialName: "Oracle", team: "townsfolk", abilityText: "Each night*, you learn how many dead players are evil.", inputKinds: ["number"], possibleOutcomes: ["Learns the number of dead evil players."], stateChanges: ["Answer depends on dead players and registration effects."], playerMessageTemplates: ["You learn: {number}."], highRiskNotes: ["Registration effects are storyteller discretion."] }),
  role({ id: "cultleader", name: "异教领袖", officialName: "Cult Leader", team: "townsfolk", abilityText: "Each night, you become the alignment of an alive neighbor. If all good players choose to join your cult, your team wins.", inputKinds: ["none"], possibleOutcomes: ["May become the alignment of a living neighbor.", "May satisfy the cult win condition."], teamChanges: ["Alignment may change each night."], playerMessageTemplates: ["You are now good.", "You are now evil."], highRiskNotes: ["Do not automatically change alignment or declare a win."] }),
  role({ id: "lycanthrope", name: "半兽人", officialName: "Lycanthrope", team: "townsfolk", abilityText: "Each night*, choose an alive player. If good, they die & the Demon doesn’t kill tonight. One good player registers as evil.", inputKinds: ["none"], possibleOutcomes: ["If the target is good, they die and the Demon does not kill tonight.", "If the target is not good, the Lycanthrope death effect usually does not happen."], stateChanges: ["Target may die and Demon kill may be replaced."], playerMessageTemplates: ["You chose {seat}."], highRiskNotes: ["Target alignment, false registration and Demon kill suppression need storyteller confirmation."] }),
  role({ id: "savant", name: "博学者", officialName: "Savant", team: "townsfolk", abilityText: "Each day, you may visit the Storyteller to learn 2 things in private: 1 is true & 1 is false.", inputKinds: ["text"], possibleOutcomes: ["Gives two private statements, one true and one false."], playerMessageTemplates: ["Statement A: {factA}. Statement B: {factB}."], highRiskNotes: ["AI can draft wording only; storyteller writes the actual facts."] }),
  role({ id: "seamstress", name: "女裁缝", officialName: "Seamstress", team: "townsfolk", abilityText: "Once per game, at night, choose 2 players (not yourself): you learn if they are the same alignment.", inputKinds: ["players"], possibleOutcomes: ["The two chosen players are the same alignment: yes.", "The two chosen players are different alignments: no."], playerMessageTemplates: ["Your answer is: {yesNo}."], highRiskNotes: ["Once per game; poison/drunk and registration can affect the answer."] }),
  role({ id: "huntsman", name: "巡山人", officialName: "Huntsman", team: "townsfolk", abilityText: "Once per game, at night, choose a living player: the Damsel, if chosen, becomes a not-in-play Townsfolk. [+the Damsel]", inputKinds: ["player"], setupImpact: ["Adds the Damsel, usually replacing one Townsfolk."], possibleOutcomes: ["If the Damsel is chosen, the target becomes a not-in-play Townsfolk."], identityChanges: ["Damsel may become a not-in-play Townsfolk."], playerMessageTemplates: ["You chose {seat}.", "You are now {role}."], highRiskNotes: ["Identity change is a correction draft until storyteller confirms it."] }),
  role({ id: "choirboy", name: "唱诗男孩", officialName: "Choirboy", team: "townsfolk", abilityText: "If the Demon kills the King, you learn which player is the Demon. [+the King]", inputKinds: ["player"], setupImpact: ["Adds the King."], possibleOutcomes: ["If the Demon kills the King, the Choirboy learns the Demon player."], stateChanges: ["Must verify King death source."], playerMessageTemplates: ["You learn that {seat} is the Demon."], highRiskNotes: ["Execution, Minion kills or storyteller deaths do not automatically trigger it."] }),
  role({ id: "cannibal", name: "食人族", officialName: "Cannibal", team: "townsfolk", abilityText: "You have the ability of the recently killed executee. If they are evil, you are poisoned until a good player dies by execution.", inputKinds: ["none"], possibleOutcomes: ["Gains the ability of the most recently executed dead player.", "If that player is evil, Cannibal is poisoned."], stateChanges: ["May be poisoned until a good player dies by execution."], playerMessageTemplates: ["You now have the ability of {role}."], highRiskNotes: ["Recently executed player, alignment and poison release must be checked manually."] }),
  role({ id: "damsel", name: "落难少女", officialName: "Damsel", team: "outsider", abilityText: "All Minions know a Damsel is in play. If a Minion publicly guesses you (once), your team loses.", inputKinds: ["none"], setupImpact: ["Minions know that a Damsel is in play."], possibleOutcomes: ["If a Minion publicly guesses the Damsel, the good team loses."], playerMessageTemplates: ["A Damsel is in play."], highRiskNotes: ["Public guess validity, hit result and loss are storyteller-confirmed."] }),
  role({ id: "mutant", name: "畸形秀演员", officialName: "Mutant", team: "outsider", abilityText: "If you are “mad” about being an Outsider, you might be executed.", inputKinds: ["none"], possibleOutcomes: ["May be executed for madness about being an Outsider."], stateChanges: ["May be executed and die."], highRiskNotes: ["Madness judgment and execution are storyteller discretion."] }),
  role({ id: "recluse", name: "陌客", officialName: "Recluse", team: "outsider", abilityText: "You might register as evil & as a Minion or Demon, even if dead.", inputKinds: ["none"], possibleOutcomes: ["May register as evil, as a Minion or as a Demon."], stateChanges: ["May register this way even while dead."], highRiskNotes: ["Registration affects information only; it does not change true character or alignment."] }),
  role({ id: "puzzlemaster", name: "解谜大师", officialName: "Puzzlemaster", team: "outsider", abilityText: "1 player is drunk, even if you die. If you guess (once) who it is, learn the Demon player, but guess wrong & get false info.", inputKinds: ["player"], possibleOutcomes: ["Correct guess learns the Demon player.", "Wrong guess gets false information."], stateChanges: ["One player is drunk even if the Puzzlemaster dies."], playerMessageTemplates: ["You learn: {seat}."], highRiskNotes: ["Drunk target, once-per-game guess and true/false info need storyteller confirmation."] }),
  role({ id: "witch", name: "女巫", officialName: "Witch", team: "minion", abilityText: "Each night, choose a player: if they nominate tomorrow, they die. If just 3 players live, you lose this ability.", inputKinds: ["player"], possibleOutcomes: ["If the target nominates tomorrow, they die.", "If just three players live, Witch loses this ability."], stateChanges: ["Target may die when nominating."], playerMessageTemplates: ["You chose {seat}."], highRiskNotes: ["Death triggers during day nomination; never pre-kill automatically."] }),
  role({ id: "cerenovus", name: "洗脑师", officialName: "Cerenovus", team: "minion", abilityText: "Each night, choose a player & a good character: they are “mad” they are this character tomorrow, or might be executed.", inputKinds: ["player", "role"], possibleOutcomes: ["Target must be mad tomorrow that they are the chosen good character.", "If not, target might be executed."], stateChanges: ["May cause execution death."], playerMessageTemplates: ["You are mad as {role}. You need to prove you are {role}, or something bad may happen."], highRiskNotes: ["Madness requirement and penalty are storyteller-confirmed."] }),
  role({ id: "fearmonger", name: "恐惧之灵", officialName: "Fearmonger", team: "minion", abilityText: "Each night, choose a player: if you nominate & execute them, their team loses. All players know if you choose a new player.", inputKinds: ["player"], possibleOutcomes: ["If Fearmonger nominates and executes the target, the target team loses.", "A changed target requires public announcement."], stateChanges: ["Current Fearmonger target must be tracked."], playerMessageTemplates: ["You chose {seat}."], highRiskNotes: ["Nominator, execution and losing team must be checked manually; no auto-win."] }),
  role({ id: "goblin", name: "哥布林", officialName: "Goblin", team: "minion", abilityText: "If you publicly claim to be the Goblin when nominated & are executed that day, your team wins.", inputKinds: ["none"], possibleOutcomes: ["If publicly claimed while nominated and executed that day, evil wins."], stateChanges: ["Public claim and same-day execution must be recorded."], highRiskNotes: ["Claim validity and win are storyteller-confirmed."] }),
  role({ id: "fanggu", name: "方古", officialName: "Fang Gu", team: "demon", abilityText: "Each night*, choose a player: they die. The 1st Outsider this kills becomes an evil Fang Gu & you die instead. [+1 Outsider]", inputKinds: ["player"], setupImpact: ["Adds one Outsider, usually replacing one Townsfolk."], possibleOutcomes: ["Chosen player dies.", "The first Outsider killed by Fang Gu becomes an evil Fang Gu and old Fang Gu dies instead."], stateChanges: ["Target or old Fang Gu may die."], identityChanges: ["Outsider may become Fang Gu."], teamChanges: ["Jumped Outsider becomes evil."], playerMessageTemplates: ["You are now the Fang Gu and evil."], highRiskNotes: ["Jump only happens once and only when Fang Gu kills an Outsider; identity, alignment and death must be confirmed."] }),
  role({ id: "lilmonsta", name: "小怪宝", officialName: "Lil' Monsta", team: "demon", abilityText: "Each night, Minions choose who babysits Lil' Monsta & \"is the Demon\". Each night*, a player might die. [+1 Minion]", inputKinds: ["player"], setupImpact: ["Adds one Minion, usually replacing one Townsfolk."], possibleOutcomes: ["Minions choose a babysitter who is the Demon tonight.", "Each other night, a player might die."], stateChanges: ["Babysitter may change nightly and a player might die."], identityChanges: ["Babysitter holds Lil Monsta and is the Demon."], teamChanges: ["Babysitter is part of the evil process."], playerMessageTemplates: ["You are babysitting Lil Monsta tonight."], highRiskNotes: ["Babysitter, Demon source and death target are suggestions until storyteller confirms."] }),
  role({ id: "nodashii", name: "诺-达鲺", officialName: "No Dashii", team: "demon", abilityText: "Each night*, choose a player: they die. Your 2 Townsfolk neighbors are poisoned.", inputKinds: ["player"], possibleOutcomes: ["Each other night, chosen player dies."], stateChanges: ["Two Townsfolk neighbors are poisoned; night target may die."], playerMessageTemplates: ["You chose {seat}."], highRiskNotes: ["Poisoned neighbors require current seating and registration review; do not auto-change state."] }),
  role({ id: "vortox", name: "涡流", officialName: "Vortox", team: "demon", abilityText: "Each night*, choose a player: they die. Townsfolk abilities yield false info. Each day, if no-one is executed, evil wins.", inputKinds: ["player"], possibleOutcomes: ["Each other night, chosen player dies.", "Townsfolk info must be false.", "If nobody is executed during the day, evil wins."], stateChanges: ["Target may die."], playerMessageTemplates: ["You chose {seat}."], highRiskNotes: ["False information and no-execution evil win require storyteller confirmation; no auto-win."] }),
  role({ id: "stormcatcher", name: "暴风捕手", officialName: "Storm Catcher", team: "fabled", abilityText: "Name a good character. If in play, they can only die by execution, but evil players learn which player it is.", inputKinds: ["role"], setupImpact: ["Name a good character at setup."], possibleOutcomes: ["If in play, that character can only die by execution.", "Evil players learn the player."], stateChanges: ["Stormcaught protection can affect death handling."], playerMessageTemplates: ["The stormcaught character is {role}."], highRiskNotes: ["Fabled role is never placed in the normal seat identity or bluff pool."] })
]
