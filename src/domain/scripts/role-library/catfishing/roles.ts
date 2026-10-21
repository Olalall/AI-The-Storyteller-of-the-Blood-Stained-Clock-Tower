import type { SmartRoleDefinition } from '../../types'

export const catfishingRoles = [
  {
    "id": "investigator",
    "name": "调查员",
    "officialName": "Investigator",
    "team": "townsfolk",
    "abilityText": "You start knowing that 1 of 2 players is a particular Minion.",
    "iconPath": "/assets/characters/investigator.webp",
    "inputKinds": [
      "none"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "tb",
      "setupImpact": [],
      "possibleOutcomes": [],
      "stateChanges": [],
      "identityChanges": [],
      "teamChanges": [],
      "playerMessageTemplates": [],
      "highRiskNotes": [],
      "sourceUrls": [
        "https://release.botc.app/resources/data/roles.json",
        "https://www.botcscripts.com/script/3/11.1.1/download"
      ],
      "reviewedAt": "2026-07-19"
    }
  },
  {
    "id": "chef",
    "name": "厨师",
    "officialName": "Chef",
    "team": "townsfolk",
    "abilityText": "You start knowing how many pairs of evil players there are.",
    "iconPath": "/assets/characters/chef.webp",
    "inputKinds": [
      "none"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "tb",
      "setupImpact": [],
      "possibleOutcomes": [],
      "stateChanges": [],
      "identityChanges": [],
      "teamChanges": [],
      "playerMessageTemplates": [],
      "highRiskNotes": [],
      "sourceUrls": [
        "https://release.botc.app/resources/data/roles.json",
        "https://www.botcscripts.com/script/3/11.1.1/download"
      ],
      "reviewedAt": "2026-07-19"
    }
  },
  {
    "id": "grandmother",
    "name": "祖母",
    "officialName": "Grandmother",
    "team": "townsfolk",
    "abilityText": "You start knowing a good player & their character. If the Demon kills them, you die too.",
    "iconPath": "/assets/characters/grandmother.webp",
    "inputKinds": [
      "none"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "bmr",
      "setupImpact": [],
      "possibleOutcomes": [
        "Learns a good player and character.",
        "If Demon kills the grandchild, Grandmother dies too."
      ],
      "stateChanges": [
        "May kill Grandmother if grandchild is Demon-killed."
      ],
      "identityChanges": [],
      "teamChanges": [],
      "playerMessageTemplates": [],
      "highRiskNotes": [
        "Grandchild death must be confirmed as Demon-killed, not merely dead."
      ],
      "sourceUrls": [
        "https://release.botc.app/resources/data/roles.json",
        "https://www.botcscripts.com/script/3/11.1.1/download"
      ],
      "reviewedAt": "2026-07-19"
    }
  },
  {
    "id": "balloonist",
    "name": "气球驾驶员",
    "officialName": "Balloonist",
    "team": "townsfolk",
    "abilityText": "Each night, you learn a player of a different character type than last night. [+0 or +1 Outsider]",
    "iconPath": "/assets/characters/balloonist.webp",
    "inputKinds": [
      "player"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "carousel",
      "setupImpact": [
        "Setup may add +0 or +1 Outsider; storyteller/template must choose one."
      ],
      "possibleOutcomes": [],
      "stateChanges": [],
      "identityChanges": [],
      "teamChanges": [],
      "playerMessageTemplates": [],
      "highRiskNotes": [],
      "sourceUrls": [
        "https://release.botc.app/resources/data/roles.json",
        "https://www.botcscripts.com/script/3/11.1.1/download"
      ],
      "reviewedAt": "2026-07-19"
    }
  },
  {
    "id": "dreamer",
    "name": "筑梦师",
    "officialName": "Dreamer",
    "team": "townsfolk",
    "abilityText": "Each night, choose a player (not yourself or Travellers): you learn 1 good & 1 evil character, 1 of which is correct.",
    "iconPath": "/assets/characters/dreamer.webp",
    "inputKinds": [
      "player"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "snv",
      "setupImpact": [],
      "possibleOutcomes": [],
      "stateChanges": [],
      "identityChanges": [],
      "teamChanges": [],
      "playerMessageTemplates": [],
      "highRiskNotes": [],
      "sourceUrls": [
        "https://release.botc.app/resources/data/roles.json",
        "https://www.botcscripts.com/script/3/11.1.1/download"
      ],
      "reviewedAt": "2026-07-19"
    }
  },
  {
    "id": "fortuneteller",
    "name": "占卜师",
    "officialName": "Fortune Teller",
    "team": "townsfolk",
    "abilityText": "Each night, choose 2 players: you learn if either is a Demon. There is a good player that registers as a Demon to you.",
    "iconPath": "/assets/characters/fortuneteller.webp",
    "inputKinds": [
      "players"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "tb",
      "setupImpact": [],
      "possibleOutcomes": [],
      "stateChanges": [],
      "identityChanges": [],
      "teamChanges": [],
      "playerMessageTemplates": [],
      "highRiskNotes": [],
      "sourceUrls": [
        "https://release.botc.app/resources/data/roles.json",
        "https://www.botcscripts.com/script/3/11.1.1/download"
      ],
      "reviewedAt": "2026-07-19"
    }
  },
  {
    "id": "snakecharmer",
    "name": "舞蛇人",
    "officialName": "Snake Charmer",
    "team": "townsfolk",
    "abilityText": "Each night, choose an alive player: a chosen Demon swaps characters & alignments with you & is then poisoned.",
    "iconPath": "/assets/characters/snakecharmer.webp",
    "inputKinds": [
      "player"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "snv",
      "setupImpact": [],
      "possibleOutcomes": [
        "Miss Demon: no swap.",
        "Hit Demon: swap characters and alignments; the old Demon becomes poisoned."
      ],
      "stateChanges": [
        "Old Demon/new Snake Charmer is poisoned."
      ],
      "identityChanges": [
        "Swaps character with chosen Demon."
      ],
      "teamChanges": [
        "Swaps alignment with chosen Demon."
      ],
      "playerMessageTemplates": [
        "You are now {newRole}.",
        "You are now the Snake Charmer."
      ],
      "highRiskNotes": [
        "This can change character, alignment, and poison status at once; never auto-commit it.",
        "Do not reorder the current night snapshot automatically after a swap."
      ],
      "sourceUrls": [
        "https://release.botc.app/resources/data/roles.json",
        "https://www.botcscripts.com/script/3/11.1.1/download"
      ],
      "reviewedAt": "2026-07-19"
    }
  },
  {
    "id": "gambler",
    "name": "赌徒",
    "officialName": "Gambler",
    "team": "townsfolk",
    "abilityText": "Each night*, choose a player & guess their character: if you guess wrong, you die.",
    "iconPath": "/assets/characters/gambler.webp",
    "inputKinds": [
      "player",
      "role"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "bmr",
      "setupImpact": [],
      "possibleOutcomes": [
        "Correct guess: no death from this ability.",
        "Wrong guess: Gambler dies."
      ],
      "stateChanges": [
        "May kill the Gambler."
      ],
      "identityChanges": [],
      "teamChanges": [],
      "playerMessageTemplates": [
        "You chose {target} and guessed {role}."
      ],
      "highRiskNotes": [
        "Log the semantic guess first; storyteller confirms correctness and death separately."
      ],
      "sourceUrls": [
        "https://release.botc.app/resources/data/roles.json",
        "https://www.botcscripts.com/script/3/11.1.1/download"
      ],
      "reviewedAt": "2026-07-19"
    }
  },
  {
    "id": "savant",
    "name": "博学者",
    "officialName": "Savant",
    "team": "townsfolk",
    "abilityText": "Each day, you may visit the Storyteller to learn 2 things in private: 1 is true & 1 is false.",
    "iconPath": "/assets/characters/savant.webp",
    "inputKinds": [
      "text"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "snv",
      "setupImpact": [],
      "possibleOutcomes": [],
      "stateChanges": [],
      "identityChanges": [],
      "teamChanges": [],
      "playerMessageTemplates": [],
      "highRiskNotes": [],
      "sourceUrls": [
        "https://release.botc.app/resources/data/roles.json",
        "https://www.botcscripts.com/script/3/11.1.1/download"
      ],
      "reviewedAt": "2026-07-19"
    }
  },
  {
    "id": "philosopher",
    "name": "哲学家",
    "officialName": "Philosopher",
    "team": "townsfolk",
    "abilityText": "Once per game, at night, choose a good character: gain that ability. If this character is in play, they are drunk.",
    "iconPath": "/assets/characters/philosopher.webp",
    "inputKinds": [
      "role"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "snv",
      "setupImpact": [],
      "possibleOutcomes": [
        "Gain a good character ability.",
        "If that character is in play, the original character becomes drunk."
      ],
      "stateChanges": [
        "May make the original in-play character drunk."
      ],
      "identityChanges": [
        "Gains another good character ability."
      ],
      "teamChanges": [],
      "playerMessageTemplates": [
        "You gain the ability of {role}."
      ],
      "highRiskNotes": [
        "If the chosen good character is in play, record the drunk event separately."
      ],
      "sourceUrls": [
        "https://release.botc.app/resources/data/roles.json",
        "https://www.botcscripts.com/script/3/11.1.1/download"
      ],
      "reviewedAt": "2026-07-19"
    }
  },
  {
    "id": "ravenkeeper",
    "name": "守鸦人",
    "officialName": "Ravenkeeper",
    "team": "townsfolk",
    "abilityText": "If you die at night, you are woken to choose a player: you learn their character.",
    "iconPath": "/assets/characters/ravenkeeper.webp",
    "inputKinds": [
      "player"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "tb",
      "setupImpact": [],
      "possibleOutcomes": [
        "If killed at night, wakes to choose a player and learn their character."
      ],
      "stateChanges": [
        "Only wakes if they died at night."
      ],
      "identityChanges": [],
      "teamChanges": [],
      "playerMessageTemplates": [],
      "highRiskNotes": [],
      "sourceUrls": [
        "https://release.botc.app/resources/data/roles.json",
        "https://www.botcscripts.com/script/3/11.1.1/download"
      ],
      "reviewedAt": "2026-07-19"
    }
  },
  {
    "id": "amnesiac",
    "name": "失忆者",
    "officialName": "Amnesiac",
    "team": "townsfolk",
    "abilityText": "You do not know what your ability is. Each day, privately guess what it is: you learn how accurate you are.",
    "iconPath": "/assets/characters/amnesiac.webp",
    "inputKinds": [
      "text"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "carousel",
      "setupImpact": [],
      "possibleOutcomes": [],
      "stateChanges": [],
      "identityChanges": [],
      "teamChanges": [],
      "playerMessageTemplates": [],
      "highRiskNotes": [
        "Custom ability; default to manual record or low-confidence advice."
      ],
      "sourceUrls": [
        "https://release.botc.app/resources/data/roles.json",
        "https://www.botcscripts.com/script/3/11.1.1/download"
      ],
      "reviewedAt": "2026-07-19"
    }
  },
  {
    "id": "cannibal",
    "name": "食人族",
    "officialName": "Cannibal",
    "team": "townsfolk",
    "abilityText": "You have the ability of the recently killed executee. If they are evil, you are poisoned until a good player dies by execution.",
    "iconPath": "/assets/characters/cannibal.webp",
    "inputKinds": [
      "none"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "carousel",
      "setupImpact": [],
      "possibleOutcomes": [
        "Gains the ability of the recently killed executee.",
        "If the executee is evil, Cannibal is poisoned until a good execution."
      ],
      "stateChanges": [
        "May poison Cannibal."
      ],
      "identityChanges": [],
      "teamChanges": [],
      "playerMessageTemplates": [],
      "highRiskNotes": [
        "Ability source changes with the most recent executee; evil executee poisons Cannibal."
      ],
      "sourceUrls": [
        "https://release.botc.app/resources/data/roles.json",
        "https://www.botcscripts.com/script/3/11.1.1/download"
      ],
      "reviewedAt": "2026-07-19"
    }
  },
  {
    "id": "drunk",
    "name": "酒鬼",
    "officialName": "Drunk",
    "team": "outsider",
    "abilityText": "You do not know you are the Drunk. You think you are a Townsfolk character, but you are not.",
    "iconPath": "/assets/characters/drunk.webp",
    "inputKinds": [
      "none"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "tb",
      "setupImpact": [
        "Needs a Townsfolk cover identity; the player does not know they are the Drunk."
      ],
      "possibleOutcomes": [],
      "stateChanges": [],
      "identityChanges": [
        "Player sees a Townsfolk cover identity, not Drunk."
      ],
      "teamChanges": [],
      "playerMessageTemplates": [],
      "highRiskNotes": [
        "Identity handoff must not reveal the true Drunk role to the player."
      ],
      "sourceUrls": [
        "https://release.botc.app/resources/data/roles.json",
        "https://www.botcscripts.com/script/3/11.1.1/download"
      ],
      "reviewedAt": "2026-07-19"
    }
  },
  {
    "id": "recluse",
    "name": "陌客",
    "officialName": "Recluse",
    "team": "outsider",
    "abilityText": "You might register as evil & as a Minion or Demon, even if dead.",
    "iconPath": "/assets/characters/recluse.webp",
    "inputKinds": [
      "none"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "tb",
      "setupImpact": [],
      "possibleOutcomes": [],
      "stateChanges": [],
      "identityChanges": [],
      "teamChanges": [],
      "playerMessageTemplates": [],
      "highRiskNotes": [
        "Registration can differ from actual alignment/team; do not hard-calculate detections from true state only."
      ],
      "sourceUrls": [
        "https://release.botc.app/resources/data/roles.json",
        "https://www.botcscripts.com/script/3/11.1.1/download"
      ],
      "reviewedAt": "2026-07-19"
    }
  },
  {
    "id": "sweetheart",
    "name": "心上人",
    "officialName": "Sweetheart",
    "team": "outsider",
    "abilityText": "When you die, 1 player is drunk from now on.",
    "iconPath": "/assets/characters/sweetheart.webp",
    "inputKinds": [
      "none"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "snv",
      "setupImpact": [],
      "possibleOutcomes": [
        "When Sweetheart dies, one player becomes drunk from now on."
      ],
      "stateChanges": [
        "Makes one player drunk after death."
      ],
      "identityChanges": [],
      "teamChanges": [],
      "playerMessageTemplates": [],
      "highRiskNotes": [
        "The drunk target is storyteller-chosen; do not auto-select."
      ],
      "sourceUrls": [
        "https://release.botc.app/resources/data/roles.json",
        "https://www.botcscripts.com/script/3/11.1.1/download"
      ],
      "reviewedAt": "2026-07-19"
    }
  },
  {
    "id": "mutant",
    "name": "畸形秀演员",
    "officialName": "Mutant",
    "team": "outsider",
    "abilityText": "If you are “mad” about being an Outsider, you might be executed.",
    "iconPath": "/assets/characters/mutant.webp",
    "inputKinds": [
      "text"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "snv",
      "setupImpact": [],
      "possibleOutcomes": [],
      "stateChanges": [],
      "identityChanges": [],
      "teamChanges": [],
      "playerMessageTemplates": [],
      "highRiskNotes": [
        "Madness and possible execution remain storyteller discretion."
      ],
      "sourceUrls": [
        "https://release.botc.app/resources/data/roles.json",
        "https://www.botcscripts.com/script/3/11.1.1/download"
      ],
      "reviewedAt": "2026-07-19"
    }
  },
  {
    "id": "lunatic",
    "name": "疯子",
    "officialName": "Lunatic",
    "team": "outsider",
    "abilityText": "You think you are a Demon, but you are not. The Demon knows who you are & who you choose at night.",
    "iconPath": "/assets/characters/lunatic.webp",
    "inputKinds": [
      "player"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "bmr",
      "setupImpact": [],
      "possibleOutcomes": [
        "Lunatic believes they are the Demon and acts.",
        "Real Demon learns the Lunatic and their targets."
      ],
      "stateChanges": [],
      "identityChanges": [],
      "teamChanges": [],
      "playerMessageTemplates": [],
      "highRiskNotes": [
        "Simulate Demon information; do not treat Lunatic choices as real Demon kills."
      ],
      "sourceUrls": [
        "https://release.botc.app/resources/data/roles.json",
        "https://www.botcscripts.com/script/3/11.1.1/download"
      ],
      "reviewedAt": "2026-07-19"
    }
  },
  {
    "id": "godfather",
    "name": "教父",
    "officialName": "Godfather",
    "team": "minion",
    "abilityText": "You start knowing which Outsiders are in play. If 1 died today, choose a player tonight: they die. [-1 or +1 Outsider]",
    "iconPath": "/assets/characters/godfather.webp",
    "inputKinds": [
      "player"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "bmr",
      "setupImpact": [
        "Setup may remove 1 Outsider or add 1 Outsider."
      ],
      "possibleOutcomes": [
        "Learns which Outsiders are in play.",
        "If an Outsider died today, may choose a player tonight for them to die."
      ],
      "stateChanges": [
        "May kill the chosen player when the Outsider-death trigger is met."
      ],
      "identityChanges": [],
      "teamChanges": [],
      "playerMessageTemplates": [],
      "highRiskNotes": [
        "Confirm an Outsider died today before offering the kill result."
      ],
      "sourceUrls": [
        "https://release.botc.app/resources/data/roles.json",
        "https://www.botcscripts.com/script/3/11.1.1/download"
      ],
      "reviewedAt": "2026-07-19"
    }
  },
  {
    "id": "cerenovus",
    "name": "洗脑师",
    "officialName": "Cerenovus",
    "team": "minion",
    "abilityText": "Each night, choose a player & a good character: they are “mad” they are this character tomorrow, or might be executed.",
    "iconPath": "/assets/characters/cerenovus.webp",
    "inputKinds": [
      "player",
      "role"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "snv",
      "setupImpact": [],
      "possibleOutcomes": [
        "Target is mad as a chosen good character tomorrow.",
        "Breaking madness may lead to storyteller execution."
      ],
      "stateChanges": [
        "May cause execution by storyteller discretion."
      ],
      "identityChanges": [],
      "teamChanges": [],
      "playerMessageTemplates": [
        "You are mad as {role} tomorrow, or there may be consequences."
      ],
      "highRiskNotes": [
        "Madness wording is player-facing; execution consequence remains storyteller discretion."
      ],
      "sourceUrls": [
        "https://release.botc.app/resources/data/roles.json",
        "https://www.botcscripts.com/script/3/11.1.1/download"
      ],
      "reviewedAt": "2026-07-19"
    }
  },
  {
    "id": "pithag",
    "name": "麻脸巫婆",
    "officialName": "Pit-Hag",
    "team": "minion",
    "abilityText": "Each night*, choose a player & a character they become (if not in play). If a Demon is made, deaths tonight are arbitrary.",
    "iconPath": "/assets/characters/pithag.webp",
    "inputKinds": [
      "player",
      "role"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "snv",
      "setupImpact": [],
      "possibleOutcomes": [
        "Target becomes a not-in-play character.",
        "If a Demon is made, tonight deaths are arbitrary."
      ],
      "stateChanges": [
        "Can make arbitrary deaths tonight if a Demon is made."
      ],
      "identityChanges": [
        "Can change target into a not-in-play character."
      ],
      "teamChanges": [],
      "playerMessageTemplates": [
        "You are now {role}."
      ],
      "highRiskNotes": [
        "Target character must be not in play; making a Demon creates arbitrary-death handling, not a simple effective/ineffective result."
      ],
      "sourceUrls": [
        "https://release.botc.app/resources/data/roles.json",
        "https://www.botcscripts.com/script/3/11.1.1/download"
      ],
      "reviewedAt": "2026-07-19"
    }
  },
  {
    "id": "widow",
    "name": "寡妇",
    "officialName": "Widow",
    "team": "minion",
    "abilityText": "On your 1st night, look at the Grimoire & choose a player: they are poisoned. 1 good player knows a Widow is in play.",
    "iconPath": "/assets/characters/widow.webp",
    "inputKinds": [
      "player"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "carousel",
      "setupImpact": [],
      "possibleOutcomes": [
        "Widow sees the Grimoire and poisons a player.",
        "One good player learns a Widow is in play."
      ],
      "stateChanges": [
        "Poisons one player."
      ],
      "identityChanges": [],
      "teamChanges": [],
      "playerMessageTemplates": [
        "You learn that a Widow is in play."
      ],
      "highRiskNotes": [
        "Grimoire visibility and poison target are private; only single-seat display is safe."
      ],
      "sourceUrls": [
        "https://release.botc.app/resources/data/roles.json",
        "https://www.botcscripts.com/script/3/11.1.1/download"
      ],
      "reviewedAt": "2026-07-19"
    }
  },
  {
    "id": "imp",
    "name": "小恶魔",
    "officialName": "Imp",
    "team": "demon",
    "abilityText": "Each night*, choose a player: they die. If you kill yourself this way, a Minion becomes the Imp.",
    "iconPath": "/assets/characters/imp.webp",
    "inputKinds": [
      "player"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "tb",
      "setupImpact": [],
      "possibleOutcomes": [
        "Target dies.",
        "If the Imp kills themself this way, a Minion becomes the Imp."
      ],
      "stateChanges": [
        "Kills target; may create a new Imp."
      ],
      "identityChanges": [
        "Can turn a Minion into Imp when self-killing."
      ],
      "teamChanges": [],
      "playerMessageTemplates": [
        "You are now the Imp, and you are evil."
      ],
      "highRiskNotes": [
        "Self-kill succession is a high-risk character change; do not auto-select the new Imp."
      ],
      "sourceUrls": [
        "https://release.botc.app/resources/data/roles.json",
        "https://www.botcscripts.com/script/3/11.1.1/download"
      ],
      "reviewedAt": "2026-07-19"
    }
  },
  {
    "id": "vigormortis",
    "name": "亡骨魔",
    "officialName": "Vigormortis",
    "team": "demon",
    "abilityText": "Each night*, choose a player: they die. Minions you kill keep their ability & poison 1 Townsfolk neighbor. [-1 Outsider]",
    "iconPath": "/assets/characters/vigormortis.webp",
    "inputKinds": [
      "player"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "snv",
      "setupImpact": [
        "Setup removes 1 Outsider."
      ],
      "possibleOutcomes": [
        "Target dies.",
        "Killed Minion keeps ability and poisons a neighboring Townsfolk."
      ],
      "stateChanges": [
        "Kills target; may poison neighboring Townsfolk."
      ],
      "identityChanges": [],
      "teamChanges": [],
      "playerMessageTemplates": [],
      "highRiskNotes": [
        "Killed Minions keeping ability and neighbor poisoning are chain effects; only suggest them."
      ],
      "sourceUrls": [
        "https://release.botc.app/resources/data/roles.json",
        "https://www.botcscripts.com/script/3/11.1.1/download"
      ],
      "reviewedAt": "2026-07-19"
    }
  },
  {
    "id": "fanggu",
    "name": "方古",
    "officialName": "Fang Gu",
    "team": "demon",
    "abilityText": "Each night*, choose a player: they die. The 1st Outsider this kills becomes an evil Fang Gu & you die instead. [+1 Outsider]",
    "iconPath": "/assets/characters/fanggu.webp",
    "inputKinds": [
      "player"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "snv",
      "setupImpact": [
        "Setup adds 1 Outsider."
      ],
      "possibleOutcomes": [
        "Normal kill: target dies.",
        "First Outsider killed becomes an evil Fang Gu and old Fang Gu dies instead."
      ],
      "stateChanges": [
        "May kill old Fang Gu during first Outsider jump."
      ],
      "identityChanges": [
        "Can turn first killed Outsider into Fang Gu."
      ],
      "teamChanges": [
        "First killed Outsider becomes evil."
      ],
      "playerMessageTemplates": [
        "You are now the Fang Gu, and you are evil."
      ],
      "highRiskNotes": [
        "The first Outsider jump combines character, alignment, and death events; split into confirmable events."
      ],
      "sourceUrls": [
        "https://release.botc.app/resources/data/roles.json",
        "https://www.botcscripts.com/script/3/11.1.1/download"
      ],
      "reviewedAt": "2026-07-19"
    }
  },
  {
    "id": "apprentice",
    "name": "学徒",
    "officialName": "Apprentice",
    "team": "traveler",
    "abilityText": "On your 1st night, you gain a Townsfolk ability (if good), or a Minion ability (if evil).",
    "iconPath": "/assets/characters/apprentice.webp",
    "inputKinds": [
      "role"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "bmr",
      "setupImpact": [],
      "possibleOutcomes": [],
      "stateChanges": [],
      "identityChanges": [
        "Gains a Townsfolk or Minion ability on first night."
      ],
      "teamChanges": [],
      "playerMessageTemplates": [],
      "highRiskNotes": [],
      "sourceUrls": [
        "https://release.botc.app/resources/data/roles.json",
        "https://www.botcscripts.com/script/3/11.1.1/download"
      ],
      "reviewedAt": "2026-07-19"
    }
  },
  {
    "id": "barista",
    "name": "咖啡师",
    "officialName": "Barista",
    "team": "traveler",
    "abilityText": "Each night, until dusk, 1) a player becomes sober, healthy & gets true info, or 2) their ability works twice. They learn which.",
    "iconPath": "/assets/characters/barista.webp",
    "inputKinds": [
      "player"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "snv",
      "setupImpact": [],
      "possibleOutcomes": [],
      "stateChanges": [
        "Makes target sober/healthy or act twice until dusk."
      ],
      "identityChanges": [],
      "teamChanges": [],
      "playerMessageTemplates": [],
      "highRiskNotes": [
        "Storyteller chooses one of two effects and tells the target which one."
      ],
      "sourceUrls": [
        "https://release.botc.app/resources/data/roles.json",
        "https://www.botcscripts.com/script/3/11.1.1/download"
      ],
      "reviewedAt": "2026-07-19"
    }
  },
  {
    "id": "beggar",
    "name": "乞丐",
    "officialName": "Beggar",
    "team": "traveler",
    "abilityText": "You must use a vote token to vote. If a dead player gives you theirs, you learn their alignment. You are sober & healthy.",
    "iconPath": "/assets/characters/beggar.webp",
    "inputKinds": [
      "none"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "tb",
      "setupImpact": [],
      "possibleOutcomes": [],
      "stateChanges": [],
      "identityChanges": [],
      "teamChanges": [],
      "playerMessageTemplates": [],
      "highRiskNotes": [],
      "sourceUrls": [
        "https://release.botc.app/resources/data/roles.json",
        "https://www.botcscripts.com/script/3/11.1.1/download"
      ],
      "reviewedAt": "2026-07-19"
    }
  },
  {
    "id": "bonecollector",
    "name": "集骨者",
    "officialName": "Bone Collector",
    "team": "traveler",
    "abilityText": "Once per game, at night*, choose a dead player: they regain their ability until dusk.",
    "iconPath": "/assets/characters/bonecollector.webp",
    "inputKinds": [
      "player"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "snv",
      "setupImpact": [],
      "possibleOutcomes": [],
      "stateChanges": [
        "Restores a dead player ability until dusk."
      ],
      "identityChanges": [],
      "teamChanges": [],
      "playerMessageTemplates": [],
      "highRiskNotes": [
        "Only until dusk; may require waking the dead player for their restored ability."
      ],
      "sourceUrls": [
        "https://release.botc.app/resources/data/roles.json",
        "https://www.botcscripts.com/script/3/11.1.1/download"
      ],
      "reviewedAt": "2026-07-19"
    }
  },
  {
    "id": "harlot",
    "name": "流莺",
    "officialName": "Harlot",
    "team": "traveler",
    "abilityText": "Each night*, choose a living player: if they agree, you learn their character, but you both might die.",
    "iconPath": "/assets/characters/harlot.webp",
    "inputKinds": [
      "player"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "snv",
      "setupImpact": [],
      "possibleOutcomes": [],
      "stateChanges": [
        "Both players might die."
      ],
      "identityChanges": [],
      "teamChanges": [],
      "playerMessageTemplates": [],
      "highRiskNotes": [
        "The chosen player must agree before information; both might die by storyteller discretion."
      ],
      "sourceUrls": [
        "https://release.botc.app/resources/data/roles.json",
        "https://www.botcscripts.com/script/3/11.1.1/download"
      ],
      "reviewedAt": "2026-07-19"
    }
  }
] as const satisfies readonly SmartRoleDefinition[]
