import type { AbilityInputKind, KnowledgeStatus, RoleResearchMetadata, RoleTeam, SmartRoleDefinition } from '../../types'

const officialRolesSourceUrl = "https://release.botc.app/resources/data/roles.json"
const gstoneRoleSourceUrl = "https://clocktower.gstonegames.com/ct/grimoireRoleJson/"
const scriptSourceUrl = "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21137_23248.json"
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
    edition: "无何有之乡 / GStone 21137",
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

export const wuHeYouZhiXiangRoleIds = [
  "cannibal",
  "legion",
  "kazali",
  "ojo",
  "scarletwoman",
  "spy",
  "harpy",
  "poisoner",
  "mezepheles",
  "politician",
  "hatter",
  "plaguedoctor",
  "drunk",
  "pixie",
  "poppygrower",
  "farmer",
  "juggler",
  "philosopher",
  "seamstress",
  "savant",
  "monk",
  "oracle",
  "highpriestess",
  "villageidiot",
  "shugenja"
] as const

export const wuHeYouZhiXiangRoles: readonly SmartRoleDefinition[] = [
  role({ id: "cannibal", name: "食人族", officialName: "Cannibal", team: "townsfolk", abilityText: "You have the ability of the recently killed executee. If they are evil, you are poisoned until a good player dies by execution.", inputKinds: ["none"], possibleOutcomes: ["May cause, prevent, or react to death depending on the confirmed source."], stateChanges: ["Death-related outcomes must be confirmed before state changes.", "May create poisoned, drunk, sober or healthy state."], teamChanges: ["May involve alignment, registration or win/loss interpretation."], highRiskNotes: ["Death, execution, protection and death source must not auto-apply.", "Poison/drunk state is a candidate result until storyteller confirms it.", "Alignment, registration and win/loss are never auto-applied."] }),
  role({ id: "legion", name: "军团", officialName: "Legion", team: "demon", abilityText: "Each night*, a player might die. Executions fail if only evil voted. You register as a Minion too. [Most players are Legion]", inputKinds: ["none"], setupImpact: ["Setup has a role-specific modification; apply only after storyteller confirmation.", "Legion needs the special most-players-are-Legion setup; normal templates do not auto-use Legion."], possibleOutcomes: ["A player might die at night; executions may fail if only evil players voted.", "May cause, prevent, or react to death depending on the confirmed source."], stateChanges: ["Legion may register as a Minion.", "Death-related outcomes must be confirmed before state changes.", "May register unusually without changing true character or true alignment."], teamChanges: ["May involve alignment, registration or win/loss interpretation."], highRiskNotes: ["Setup changes are reminders only and must not auto-change the authority state.", "Legion is treated as a special setup reminder, not an automatic template role.", "Death, execution, protection and death source must not auto-apply.", "Alignment, registration and win/loss are never auto-applied.", "Registration affects information only unless storyteller confirms another effect."] }),
  role({ id: "kazali", name: "卡扎力", officialName: "Kazali", team: "demon", abilityText: "Each night*, choose a player: they die. [You choose which players are which Minions. -? to +? Outsiders]", inputKinds: ["player"], setupImpact: ["Setup has a role-specific modification; apply only after storyteller confirmation.", "Kazali chooses which players are which Minions on the first night; outsider count can stay at base count unless storyteller changes it."], possibleOutcomes: ["May cause, prevent, or react to death depending on the confirmed source."], stateChanges: ["Death-related outcomes must be confirmed before state changes."], identityChanges: ["Selected players may become chosen Minions."], playerMessageTemplates: ["You are now {role}."], highRiskNotes: ["Setup changes are reminders only and must not auto-change the authority state.", "Kazali first-night Minion assignment must be confirmed one by one.", "Death, execution, protection and death source must not auto-apply."] }),
  role({ id: "ojo", name: "奥赫", officialName: "Ojo", team: "demon", abilityText: "Each night*, choose a character: they die. If they are not in play, the Storyteller chooses who dies.", inputKinds: ["role"], possibleOutcomes: ["May cause, prevent, or react to death depending on the confirmed source."], stateChanges: ["Death-related outcomes must be confirmed before state changes."], highRiskNotes: ["Death, execution, protection and death source must not auto-apply."] }),
  role({ id: "scarletwoman", name: "红唇女郎", officialName: "Scarlet Woman", team: "minion", abilityText: "If there are 5 or more players alive & the Demon dies, you become the Demon. (Travellers don't count.)", inputKinds: ["none"], possibleOutcomes: ["May cause, prevent, or react to death depending on the confirmed source."], stateChanges: ["Death-related outcomes must be confirmed before state changes."], identityChanges: ["May change character or gain/replace an ability."], playerMessageTemplates: ["You are now {role}."], highRiskNotes: ["Death, execution, protection and death source must not auto-apply.", "Identity changes affect later night order only after explicit confirmation."] }),
  role({ id: "spy", name: "间谍", officialName: "Spy", team: "minion", abilityText: "Each night, you see the Grimoire. You might register as good & as a Townsfolk or Outsider, even if dead.", inputKinds: ["none"], possibleOutcomes: ["May cause, prevent, or react to death depending on the confirmed source."], stateChanges: ["Death-related outcomes must be confirmed before state changes.", "May register unusually without changing true character or true alignment."], teamChanges: ["May involve alignment, registration or win/loss interpretation."], highRiskNotes: ["Death, execution, protection and death source must not auto-apply.", "Alignment, registration and win/loss are never auto-applied.", "Registration affects information only unless storyteller confirms another effect."] }),
  role({ id: "harpy", name: "鹰身女妖", officialName: "Harpy", team: "minion", abilityText: "Each night, choose 2 players: tomorrow, the 1st player is mad that the 2nd is evil, or one or both might die.", inputKinds: ["players"], possibleOutcomes: ["May cause, prevent, or react to death depending on the confirmed source."], stateChanges: ["Death-related outcomes must be confirmed before state changes.", "May create a madness requirement or madness penalty."], teamChanges: ["May involve alignment, registration or win/loss interpretation."], playerMessageTemplates: ["You need to be mad that you are {role}."], highRiskNotes: ["Death, execution, protection and death source must not auto-apply.", "Madness judgment and penalty are storyteller discretion.", "Alignment, registration and win/loss are never auto-applied."] }),
  role({ id: "poisoner", name: "投毒者", officialName: "Poisoner", team: "minion", abilityText: "Each night, choose a player: they are poisoned tonight and tomorrow day.", inputKinds: ["player"], possibleOutcomes: ["Record the choice or information result for storyteller confirmation."], stateChanges: ["May create poisoned, drunk, sober or healthy state."], highRiskNotes: ["Poison/drunk state is a candidate result until storyteller confirms it."] }),
  role({ id: "mezepheles", name: "灵言师", officialName: "Mezepheles", team: "minion", abilityText: "You start knowing a secret word. The 1st good player to say this word becomes evil that night.", inputKinds: ["text"], possibleOutcomes: ["May create a win/loss candidate."], identityChanges: ["May change character or gain/replace an ability."], teamChanges: ["May involve alignment, registration or win/loss interpretation."], playerMessageTemplates: ["You are now {role}."], highRiskNotes: ["Identity changes affect later night order only after explicit confirmation.", "Alignment, registration and win/loss are never auto-applied.", "Win/loss is a candidate reminder; storyteller declares the result."] }),
  role({ id: "politician", name: "政客", officialName: "Politician", team: "outsider", abilityText: "If you were the player most responsible for your team losing, you change alignment & win, even if dead.", inputKinds: ["none"], possibleOutcomes: ["May cause, prevent, or react to death depending on the confirmed source.", "May create a win/loss candidate."], stateChanges: ["Death-related outcomes must be confirmed before state changes."], teamChanges: ["May involve alignment, registration or win/loss interpretation."], highRiskNotes: ["Death, execution, protection and death source must not auto-apply.", "Alignment, registration and win/loss are never auto-applied.", "Win/loss is a candidate reminder; storyteller declares the result."] }),
  role({ id: "hatter", name: "帽匠", officialName: "Hatter", team: "outsider", abilityText: "If you died today or tonight, the Minion & Demon players may choose new Minion & Demon characters to be.", inputKinds: ["role"], possibleOutcomes: ["After Hatter dies, Minion and Demon players may choose new same-type evil characters.", "May cause, prevent, or react to death depending on the confirmed source."], stateChanges: ["Death-related outcomes must be confirmed before state changes."], identityChanges: ["Minions or Demons may become new same-type characters.", "May change character or gain/replace an ability."], playerMessageTemplates: ["You may choose a new same-type evil character.", "You are now {role}."], highRiskNotes: ["Hatter changes must check duplicate roles and current evil structure manually.", "Death, execution, protection and death source must not auto-apply.", "Identity changes affect later night order only after explicit confirmation."] }),
  role({ id: "plaguedoctor", name: "瘟疫医生", officialName: "Plague Doctor", team: "outsider", abilityText: "When you die, the Storyteller gains a Minion ability.", inputKinds: ["none"], possibleOutcomes: ["May cause, prevent, or react to death depending on the confirmed source."], stateChanges: ["Death-related outcomes must be confirmed before state changes."], highRiskNotes: ["Death, execution, protection and death source must not auto-apply."] }),
  role({ id: "drunk", name: "酒鬼", officialName: "Drunk", team: "outsider", abilityText: "You do not know you are the Drunk. You think you are a Townsfolk character, but you are not.", inputKinds: ["none"], possibleOutcomes: ["Record the choice or information result for storyteller confirmation."], stateChanges: ["The Drunk thinks they are a Townsfolk but does not have that ability.", "May create poisoned, drunk, sober or healthy state."], identityChanges: ["Displayed identity and true character differ."], highRiskNotes: ["Do not reveal Drunk truth in player-facing identity pickup.", "Poison/drunk state is a candidate result until storyteller confirms it."] }),
  role({ id: "pixie", name: "小精灵", officialName: "Pixie", team: "townsfolk", abilityText: "You start knowing 1 in-play Townsfolk. If you were mad that you were this character, you gain their ability when they die.", inputKinds: ["none"], possibleOutcomes: ["May cause, prevent, or react to death depending on the confirmed source.", "May create a win/loss candidate."], stateChanges: ["Death-related outcomes must be confirmed before state changes.", "May create a madness requirement or madness penalty."], playerMessageTemplates: ["You need to be mad that you are {role}."], highRiskNotes: ["Death, execution, protection and death source must not auto-apply.", "Madness judgment and penalty are storyteller discretion.", "Win/loss is a candidate reminder; storyteller declares the result."] }),
  role({ id: "poppygrower", name: "罂粟种植者", officialName: "Poppy Grower", team: "townsfolk", abilityText: "Minions & Demons do not know each other. If you die, they learn who each other are that night.", inputKinds: ["none"], setupImpact: ["Poppy Grower prevents Minions and Demons from knowing each other."], possibleOutcomes: ["If Poppy Grower dies, evil players learn each other that night.", "May cause, prevent, or react to death depending on the confirmed source."], stateChanges: ["Death-related outcomes must be confirmed before state changes."], highRiskNotes: ["Death, execution, protection and death source must not auto-apply."] }),
  role({ id: "farmer", name: "农夫", officialName: "Farmer", team: "townsfolk", abilityText: "When you die at night, an alive good player becomes a Farmer.", inputKinds: ["none"], possibleOutcomes: ["May cause, prevent, or react to death depending on the confirmed source."], stateChanges: ["Death-related outcomes must be confirmed before state changes."], identityChanges: ["May change character or gain/replace an ability."], teamChanges: ["May involve alignment, registration or win/loss interpretation."], playerMessageTemplates: ["You are now {role}."], highRiskNotes: ["Death, execution, protection and death source must not auto-apply.", "Identity changes affect later night order only after explicit confirmation.", "Alignment, registration and win/loss are never auto-applied."] }),
  role({ id: "juggler", name: "杂耍艺人", officialName: "Juggler", team: "townsfolk", abilityText: "On your 1st day, publicly guess up to 5 players' characters. That night, you learn how many you got correct.", inputKinds: ["players", "role", "number", "text"], possibleOutcomes: ["Record the choice or information result for storyteller confirmation."] }),
  role({ id: "philosopher", name: "哲学家", officialName: "Philosopher", team: "townsfolk", abilityText: "Once per game, at night, choose a good character: gain that ability. If this character is in play, they are drunk.", inputKinds: ["role"], possibleOutcomes: ["Record the choice or information result for storyteller confirmation."], stateChanges: ["May create poisoned, drunk, sober or healthy state."], teamChanges: ["May involve alignment, registration or win/loss interpretation."], highRiskNotes: ["Poison/drunk state is a candidate result until storyteller confirms it.", "Alignment, registration and win/loss are never auto-applied."] }),
  role({ id: "seamstress", name: "女裁缝", officialName: "Seamstress", team: "townsfolk", abilityText: "Once per game, at night, choose 2 players (not yourself): you learn if they are the same alignment.", inputKinds: ["players"], possibleOutcomes: ["Record the choice or information result for storyteller confirmation."], teamChanges: ["May involve alignment, registration or win/loss interpretation."], highRiskNotes: ["Alignment, registration and win/loss are never auto-applied."] }),
  role({ id: "savant", name: "博学者", officialName: "Savant", team: "townsfolk", abilityText: "Each day, you may visit the Storyteller to learn 2 things in private: 1 is true & 1 is false.", inputKinds: ["text"], possibleOutcomes: ["Record the choice or information result for storyteller confirmation."] }),
  role({ id: "monk", name: "僧侣", officialName: "Monk", team: "townsfolk", abilityText: "Each night*, choose a player (not yourself): they are safe from the Demon tonight.", inputKinds: ["player"], possibleOutcomes: ["Record the choice or information result for storyteller confirmation."] }),
  role({ id: "oracle", name: "神谕者", officialName: "Oracle", team: "townsfolk", abilityText: "Each night*, you learn how many dead players are evil.", inputKinds: ["number"], possibleOutcomes: ["May cause, prevent, or react to death depending on the confirmed source."], stateChanges: ["Death-related outcomes must be confirmed before state changes."], teamChanges: ["May involve alignment, registration or win/loss interpretation."], highRiskNotes: ["Death, execution, protection and death source must not auto-apply.", "Alignment, registration and win/loss are never auto-applied."] }),
  role({ id: "highpriestess", name: "女祭司", officialName: "High Priestess", team: "townsfolk", abilityText: "Each night, learn which player the Storyteller believes you should talk to most.", inputKinds: ["none"], possibleOutcomes: ["Record the choice or information result for storyteller confirmation."] }),
  role({ id: "villageidiot", name: "村夫", officialName: "Village Idiot", team: "townsfolk", abilityText: "Each night, choose a player: you learn their alignment. [+0 to +2 Village Idiots. 1 of the extras is drunk]", inputKinds: ["player"], setupImpact: ["Setup has a role-specific modification; apply only after storyteller confirmation.", "Village Idiot may add extra Village Idiots, one of the extras drunk; current templates use only one Village Idiot."], possibleOutcomes: ["Record the choice or information result for storyteller confirmation."], stateChanges: ["If multiple Village Idiots are used, one extra Village Idiot may be drunk.", "May create poisoned, drunk, sober or healthy state."], teamChanges: ["May involve alignment, registration or win/loss interpretation."], highRiskNotes: ["Setup changes are reminders only and must not auto-change the authority state.", "Poison/drunk state is a candidate result until storyteller confirms it.", "Alignment, registration and win/loss are never auto-applied."] }),
  role({ id: "shugenja", name: "修行者", officialName: "Shugenja", team: "townsfolk", abilityText: "You start knowing if your closest evil player is clockwise or anti-clockwise. If equidistant, this info is arbitrary.", inputKinds: ["none"], possibleOutcomes: ["May create a win/loss candidate."], teamChanges: ["May involve alignment, registration or win/loss interpretation."], highRiskNotes: ["Alignment, registration and win/loss are never auto-applied.", "Win/loss is a candidate reminder; storyteller declares the result."] }),
]
