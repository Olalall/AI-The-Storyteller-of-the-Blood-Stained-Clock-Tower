import type { SmartRoleDefinition } from '../../types'

export const wuHaiTongXingRoles = [
  {
    "id": "20774_8365",
    "name": "落魄船长",
    "officialName": "落魄船长",
    "team": "townsfolk",
    "abilityText": "在你的首个夜晚，你会得知两个善良角色：其中只有一个在场。在第三个白天及之后，你可以拜访说书人赎回你的大船。",
    "iconPath": "/assets/characters/20774_8365.webp",
    "inputKinds": [
      "player",
      "role"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "gstone",
      "setupImpact": [],
      "possibleOutcomes": [
        "Apply 落魄船长 effect as a storyteller-verified draft result."
      ],
      "stateChanges": [],
      "identityChanges": [],
      "teamChanges": [
        "May affect effective alignment behavior or win/loss interpretation."
      ],
      "playerMessageTemplates": [
        "You may say: you are now 落魄船长"
      ],
      "highRiskNotes": [
        "Alignment effects are candidate reminders only until storyteller confirms."
      ],
      "sourceUrls": [
        "https://oss.gstonegames.com/data_file/clocktower/upload/1689611944_197011_8300.png",
        "https://clocktower.gstonegames.com/ct/grimoireRoleJson/"
      ],
      "reviewedAt": "2026-07-23"
    }
  },
  {
    "id": "20774_8366",
    "name": "灯塔看守员",
    "officialName": "灯塔看守员",
    "team": "townsfolk",
    "abilityText": "在你的首个夜晚，你会得知两名玩家。你得知的玩家之中会有一名是善良的。每当你得知的玩家死亡，你会在当晚得知另一名玩家。",
    "iconPath": "/assets/characters/20774_8366.webp",
    "inputKinds": [
      "none"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "gstone",
      "setupImpact": [],
      "possibleOutcomes": [
        "Apply 灯塔看守员 effect as a storyteller-verified draft result.",
        "May create one or more death-related candidates for confirmation."
      ],
      "stateChanges": [
        "Death-related outcomes should be confirmed before changing authoritative state."
      ],
      "identityChanges": [],
      "teamChanges": [
        "May affect effective alignment behavior or win/loss interpretation."
      ],
      "playerMessageTemplates": [
        "You may say: you are now 灯塔看守员"
      ],
      "highRiskNotes": [
        "Do not auto-commit death state. Storyteller confirms the real target and cause.",
        "Alignment effects are candidate reminders only until storyteller confirms."
      ],
      "sourceUrls": [
        "https://oss.gstonegames.com/data_file/clocktower/upload/1689611944_197011_8300.png",
        "https://clocktower.gstonegames.com/ct/grimoireRoleJson/"
      ],
      "reviewedAt": "2026-07-23"
    }
  },
  {
    "id": "20774_8367",
    "name": "殖民主义者",
    "officialName": "殖民主义者",
    "team": "townsfolk",
    "abilityText": "在你的首个夜晚，你会得知外来者与爪牙之间的最近距离。［+1外来者］",
    "iconPath": "/assets/characters/20774_8367.webp",
    "inputKinds": [
      "none"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "gstone",
      "setupImpact": [
        "殖民主义者 is a setup role; use template or ST confirmation for setup variations."
      ],
      "possibleOutcomes": [
        "Apply 殖民主义者 effect as a storyteller-verified draft result."
      ],
      "stateChanges": [],
      "identityChanges": [],
      "teamChanges": [],
      "playerMessageTemplates": [
        "You may say: you are now 殖民主义者"
      ],
      "highRiskNotes": [],
      "sourceUrls": [
        "https://oss.gstonegames.com/data_file/clocktower/upload/1689611944_197011_8300.png",
        "https://clocktower.gstonegames.com/ct/grimoireRoleJson/"
      ],
      "reviewedAt": "2026-07-23"
    }
  },
  {
    "id": "20774_8368",
    "name": "总督",
    "officialName": "总督",
    "team": "townsfolk",
    "abilityText": "每个夜晚，你要选择除你以外的一名玩家：你得知离他最近的爪牙角色。会有一名外来者被你的能力当作爪牙，除非他已死亡。",
    "iconPath": "/assets/characters/20774_8368.webp",
    "inputKinds": [
      "player",
      "role"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "gstone",
      "setupImpact": [],
      "possibleOutcomes": [
        "Apply 总督 effect as a storyteller-verified draft result.",
        "May create one or more death-related candidates for confirmation."
      ],
      "stateChanges": [
        "Death-related outcomes should be confirmed before changing authoritative state."
      ],
      "identityChanges": [],
      "teamChanges": [],
      "playerMessageTemplates": [
        "You may say: you are now 总督"
      ],
      "highRiskNotes": [
        "Do not auto-commit death state. Storyteller confirms the real target and cause."
      ],
      "sourceUrls": [
        "https://oss.gstonegames.com/data_file/clocktower/upload/1689611944_197011_8300.png",
        "https://clocktower.gstonegames.com/ct/grimoireRoleJson/"
      ],
      "reviewedAt": "2026-07-23"
    }
  },
  {
    "id": "20774_8369",
    "name": "码头工人",
    "officialName": "码头工人",
    "team": "townsfolk",
    "abilityText": "每个夜晚*，你要选择两名玩家：你将前者的一枚金币转交给后者。如果其中一名玩家死于今天，你得知他的角色类型。",
    "iconPath": "/assets/characters/20774_8369.webp",
    "inputKinds": [
      "player",
      "role"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "gstone",
      "setupImpact": [],
      "possibleOutcomes": [
        "Apply 码头工人 effect as a storyteller-verified draft result.",
        "May create one or more death-related candidates for confirmation."
      ],
      "stateChanges": [
        "Death-related outcomes should be confirmed before changing authoritative state."
      ],
      "identityChanges": [],
      "teamChanges": [],
      "playerMessageTemplates": [
        "You may say: you are now 码头工人"
      ],
      "highRiskNotes": [
        "Do not auto-commit death state. Storyteller confirms the real target and cause."
      ],
      "sourceUrls": [
        "https://oss.gstonegames.com/data_file/clocktower/upload/1689611944_197011_8300.png",
        "https://clocktower.gstonegames.com/ct/grimoireRoleJson/"
      ],
      "reviewedAt": "2026-07-23"
    }
  },
  {
    "id": "20774_8370",
    "name": "商会会长",
    "officialName": "商会会长",
    "team": "townsfolk",
    "abilityText": "每个夜晚*，你要选择一名玩家和一个角色：他们获得一枚金币。如果他们是同一玩家，则改为他会变成另一个角色，你会得知该角色。",
    "iconPath": "/assets/characters/20774_8370.webp",
    "inputKinds": [
      "player",
      "role"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "gstone",
      "setupImpact": [],
      "possibleOutcomes": [
        "Apply 商会会长 effect as a storyteller-verified draft result."
      ],
      "stateChanges": [],
      "identityChanges": [
        "May change character or public-facing identity."
      ],
      "teamChanges": [],
      "playerMessageTemplates": [
        "You may say: you are now 商会会长"
      ],
      "highRiskNotes": [
        "Identity changes should be confirmed with current board context before update."
      ],
      "sourceUrls": [
        "https://oss.gstonegames.com/data_file/clocktower/upload/1689611944_197011_8300.png",
        "https://clocktower.gstonegames.com/ct/grimoireRoleJson/"
      ],
      "reviewedAt": "2026-07-23"
    }
  },
  {
    "id": "20774_8371",
    "name": "广场诗人",
    "officialName": "广场诗人",
    "team": "townsfolk",
    "abilityText": "每个白天，你可以公开乞讨。每个夜晚*，你会得知当天施舍你的玩家以及死亡的玩家之中有多少个角色类型。",
    "iconPath": "/assets/characters/20774_8371.webp",
    "inputKinds": [
      "role"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "gstone",
      "setupImpact": [],
      "possibleOutcomes": [
        "Apply 广场诗人 effect as a storyteller-verified draft result.",
        "May create one or more death-related candidates for confirmation."
      ],
      "stateChanges": [
        "Death-related outcomes should be confirmed before changing authoritative state."
      ],
      "identityChanges": [],
      "teamChanges": [],
      "playerMessageTemplates": [
        "You may say: you are now 广场诗人"
      ],
      "highRiskNotes": [
        "Do not auto-commit death state. Storyteller confirms the real target and cause."
      ],
      "sourceUrls": [
        "https://oss.gstonegames.com/data_file/clocktower/upload/1689611944_197011_8300.png",
        "https://clocktower.gstonegames.com/ct/grimoireRoleJson/"
      ],
      "reviewedAt": "2026-07-23"
    }
  },
  {
    "id": "20774_8372",
    "name": "公爵",
    "officialName": "公爵",
    "team": "townsfolk",
    "abilityText": "每个白天，你可以公开声明今晚设宴。在当晚你获得一枚金币，且得知赴宴的玩家之中是否有邪恶玩家。其他赴宴的玩家可能会获得一枚金币，且之一会醉酒到下个黄昏。",
    "iconPath": "/assets/characters/20774_8372.webp",
    "inputKinds": [
      "none"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "gstone",
      "setupImpact": [],
      "possibleOutcomes": [
        "Apply 公爵 effect as a storyteller-verified draft result."
      ],
      "stateChanges": [
        "May add drunk/poisoned state depending on verified outcome."
      ],
      "identityChanges": [],
      "teamChanges": [
        "May affect effective alignment behavior or win/loss interpretation."
      ],
      "playerMessageTemplates": [
        "You may say: you are now 公爵"
      ],
      "highRiskNotes": [
        "Poison/drunk state is advisory; do not apply automatically.",
        "Alignment effects are candidate reminders only until storyteller confirms."
      ],
      "sourceUrls": [
        "https://oss.gstonegames.com/data_file/clocktower/upload/1689611944_197011_8300.png",
        "https://clocktower.gstonegames.com/ct/grimoireRoleJson/"
      ],
      "reviewedAt": "2026-07-23"
    }
  },
  {
    "id": "20774_8373",
    "name": "求学者",
    "officialName": "求学者",
    "team": "townsfolk",
    "abilityText": "每个白天，如果你“疯狂”地证明一件与自己无关的事情是正确的，在当晚你会得知一条信息。如果这件事情是错误的，你会得知错误信息。",
    "iconPath": "/assets/characters/20774_8373.webp",
    "inputKinds": [
      "none"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "gstone",
      "setupImpact": [],
      "possibleOutcomes": [
        "Apply 求学者 effect as a storyteller-verified draft result."
      ],
      "stateChanges": [],
      "identityChanges": [],
      "teamChanges": [],
      "playerMessageTemplates": [
        "You may say: you are now 求学者"
      ],
      "highRiskNotes": [
        "Madness handling depends on timing and storyteller confirmation."
      ],
      "sourceUrls": [
        "https://oss.gstonegames.com/data_file/clocktower/upload/1689611944_197011_8300.png",
        "https://clocktower.gstonegames.com/ct/grimoireRoleJson/"
      ],
      "reviewedAt": "2026-07-23"
    }
  },
  {
    "id": "20774_8374",
    "name": "航海家",
    "officialName": "航海家",
    "team": "townsfolk",
    "abilityText": "在夜晚时*，如果有邪恶角色的能力选择了你，你会得知该角色。在你扬帆的当天，除塞壬以外的邪恶玩家的负面能力对你无效。［拥有小船］",
    "iconPath": "/assets/characters/20774_8374.webp",
    "inputKinds": [
      "player",
      "role"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "gstone",
      "setupImpact": [
        "航海家 is a setup role; use template or ST confirmation for setup variations."
      ],
      "possibleOutcomes": [
        "Apply 航海家 effect as a storyteller-verified draft result."
      ],
      "stateChanges": [],
      "identityChanges": [],
      "teamChanges": [
        "May affect effective alignment behavior or win/loss interpretation."
      ],
      "playerMessageTemplates": [
        "You may say: you are now 航海家"
      ],
      "highRiskNotes": [
        "Alignment effects are candidate reminders only until storyteller confirms."
      ],
      "sourceUrls": [
        "https://oss.gstonegames.com/data_file/clocktower/upload/1689611944_197011_8300.png",
        "https://clocktower.gstonegames.com/ct/grimoireRoleJson/"
      ],
      "reviewedAt": "2026-07-23"
    }
  },
  {
    "id": "20774_8375",
    "name": "武器匠",
    "officialName": "武器匠",
    "team": "townsfolk",
    "abilityText": "当有玩家被处决后，你获得一枚金币。如果你死亡，在当晚你会被唤醒，然后选择是否让一名外来者死亡。",
    "iconPath": "/assets/characters/20774_8375.webp",
    "inputKinds": [
      "player"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "gstone",
      "setupImpact": [],
      "possibleOutcomes": [
        "Apply 武器匠 effect as a storyteller-verified draft result.",
        "May create one or more death-related candidates for confirmation."
      ],
      "stateChanges": [
        "Death-related outcomes should be confirmed before changing authoritative state."
      ],
      "identityChanges": [],
      "teamChanges": [],
      "playerMessageTemplates": [
        "You may say: you are now 武器匠"
      ],
      "highRiskNotes": [
        "Do not auto-commit death state. Storyteller confirms the real target and cause."
      ],
      "sourceUrls": [
        "https://oss.gstonegames.com/data_file/clocktower/upload/1689611944_197011_8300.png",
        "https://clocktower.gstonegames.com/ct/grimoireRoleJson/"
      ],
      "reviewedAt": "2026-07-23"
    }
  },
  {
    "id": "20774_8376",
    "name": "疫病颂者",
    "officialName": "疫病颂者",
    "team": "townsfolk",
    "abilityText": "如果你提名的玩家被处决，在当晚与他邻近的善良玩家之一，邪恶玩家的负面能力对他无效。",
    "iconPath": "/assets/characters/20774_8376.webp",
    "inputKinds": [
      "none"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "gstone",
      "setupImpact": [],
      "possibleOutcomes": [
        "Apply 疫病颂者 effect as a storyteller-verified draft result."
      ],
      "stateChanges": [],
      "identityChanges": [],
      "teamChanges": [
        "May affect effective alignment behavior or win/loss interpretation."
      ],
      "playerMessageTemplates": [
        "You may say: you are now 疫病颂者"
      ],
      "highRiskNotes": [
        "Alignment effects are candidate reminders only until storyteller confirms."
      ],
      "sourceUrls": [
        "https://oss.gstonegames.com/data_file/clocktower/upload/1689611944_197011_8300.png",
        "https://clocktower.gstonegames.com/ct/grimoireRoleJson/"
      ],
      "reviewedAt": "2026-07-23"
    }
  },
  {
    "id": "20774_8377",
    "name": "牧师",
    "officialName": "牧师",
    "team": "townsfolk",
    "abilityText": "当你得知你死亡时，你要选择三名存活的玩家：你分配给他们各一枚金币，在当晚你会得知其中是否有邪恶玩家。",
    "iconPath": "/assets/characters/20774_8377.webp",
    "inputKinds": [
      "player"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "gstone",
      "setupImpact": [],
      "possibleOutcomes": [
        "Apply 牧师 effect as a storyteller-verified draft result.",
        "May create one or more death-related candidates for confirmation."
      ],
      "stateChanges": [
        "Death-related outcomes should be confirmed before changing authoritative state."
      ],
      "identityChanges": [],
      "teamChanges": [
        "May affect effective alignment behavior or win/loss interpretation."
      ],
      "playerMessageTemplates": [
        "You may say: you are now 牧师"
      ],
      "highRiskNotes": [
        "Do not auto-commit death state. Storyteller confirms the real target and cause.",
        "Alignment effects are candidate reminders only until storyteller confirms."
      ],
      "sourceUrls": [
        "https://oss.gstonegames.com/data_file/clocktower/upload/1689611944_197011_8300.png",
        "https://clocktower.gstonegames.com/ct/grimoireRoleJson/"
      ],
      "reviewedAt": "2026-07-23"
    }
  },
  {
    "id": "20774_8378",
    "name": "吹嘘海盗",
    "officialName": "吹嘘海盗",
    "team": "outsider",
    "abilityText": "你不知道你是吹嘘海盗。你以为你是一个镇民角色，但你的能力会产生错误信息。当你的远洋提议通过后，你会是其中死亡的玩家。",
    "iconPath": "/assets/characters/20774_8378.webp",
    "inputKinds": [
      "role"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "gstone",
      "setupImpact": [
        "吹嘘海盗 is a setup role; use template or ST confirmation for setup variations."
      ],
      "possibleOutcomes": [
        "Apply 吹嘘海盗 effect as a storyteller-verified draft result.",
        "May create one or more death-related candidates for confirmation."
      ],
      "stateChanges": [
        "Death-related outcomes should be confirmed before changing authoritative state."
      ],
      "identityChanges": [],
      "teamChanges": [],
      "playerMessageTemplates": [
        "You may say: you are now 吹嘘海盗"
      ],
      "highRiskNotes": [
        "Do not auto-commit death state. Storyteller confirms the real target and cause."
      ],
      "sourceUrls": [
        "https://oss.gstonegames.com/data_file/clocktower/upload/1689611944_197011_8300.png",
        "https://clocktower.gstonegames.com/ct/grimoireRoleJson/"
      ],
      "reviewedAt": "2026-07-23"
    }
  },
  {
    "id": "20774_8379",
    "name": "海上义贼",
    "officialName": "海上义贼",
    "team": "outsider",
    "abilityText": "一名镇民被海上义贼抢夺了角色，他自以为是海上义贼，且义贼留下了两枚金币给该镇民。你以为你是该镇民且拥有他的能力。如果你死亡时他存活，他找回自己的角色。",
    "iconPath": "/assets/characters/20774_8379.webp",
    "inputKinds": [
      "role"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "gstone",
      "setupImpact": [],
      "possibleOutcomes": [
        "Apply 海上义贼 effect as a storyteller-verified draft result.",
        "May create one or more death-related candidates for confirmation."
      ],
      "stateChanges": [
        "Death-related outcomes should be confirmed before changing authoritative state."
      ],
      "identityChanges": [],
      "teamChanges": [],
      "playerMessageTemplates": [
        "You may say: you are now 海上义贼"
      ],
      "highRiskNotes": [
        "Do not auto-commit death state. Storyteller confirms the real target and cause."
      ],
      "sourceUrls": [
        "https://oss.gstonegames.com/data_file/clocktower/upload/1689611944_197011_8300.png",
        "https://clocktower.gstonegames.com/ct/grimoireRoleJson/"
      ],
      "reviewedAt": "2026-07-23"
    }
  },
  {
    "id": "20774_8380",
    "name": "投机商人",
    "officialName": "投机商人",
    "team": "outsider",
    "abilityText": "每局游戏限一次，在夜晚时*，你可以花费四枚金币，选择除你以外的一名存活的玩家：如果你选中了镇民，他醉酒。如果你选中了恶魔，你变成邪恶的该恶魔且他死亡。",
    "iconPath": "/assets/characters/20774_8380.webp",
    "inputKinds": [
      "player"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "gstone",
      "setupImpact": [],
      "possibleOutcomes": [
        "Apply 投机商人 effect as a storyteller-verified draft result.",
        "May create one or more death-related candidates for confirmation."
      ],
      "stateChanges": [
        "Death-related outcomes should be confirmed before changing authoritative state.",
        "May add drunk/poisoned state depending on verified outcome."
      ],
      "identityChanges": [
        "May change character or public-facing identity."
      ],
      "teamChanges": [
        "May affect effective alignment behavior or win/loss interpretation."
      ],
      "playerMessageTemplates": [
        "You may say: you are now 投机商人"
      ],
      "highRiskNotes": [
        "Do not auto-commit death state. Storyteller confirms the real target and cause.",
        "Poison/drunk state is advisory; do not apply automatically.",
        "Identity changes should be confirmed with current board context before update.",
        "Alignment effects are candidate reminders only until storyteller confirms."
      ],
      "sourceUrls": [
        "https://oss.gstonegames.com/data_file/clocktower/upload/1689611944_197011_8300.png",
        "https://clocktower.gstonegames.com/ct/grimoireRoleJson/"
      ],
      "reviewedAt": "2026-07-23"
    }
  },
  {
    "id": "20774_8381",
    "name": "迷雾信徒",
    "officialName": "迷雾信徒",
    "team": "outsider",
    "abilityText": "在雾海解除后，如果你的阵营获胜，则改为落败。首个死于处决的迷雾信徒会在当晚转变为邪恶阵营。",
    "iconPath": "/assets/characters/20774_8381.webp",
    "inputKinds": [
      "none"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "gstone",
      "setupImpact": [],
      "possibleOutcomes": [
        "Apply 迷雾信徒 effect as a storyteller-verified draft result.",
        "May create one or more death-related candidates for confirmation."
      ],
      "stateChanges": [
        "Death-related outcomes should be confirmed before changing authoritative state."
      ],
      "identityChanges": [
        "May change character or public-facing identity."
      ],
      "teamChanges": [
        "May affect effective alignment behavior or win/loss interpretation."
      ],
      "playerMessageTemplates": [
        "You may say: you are now 迷雾信徒"
      ],
      "highRiskNotes": [
        "Do not auto-commit death state. Storyteller confirms the real target and cause.",
        "Identity changes should be confirmed with current board context before update.",
        "Alignment effects are candidate reminders only until storyteller confirms."
      ],
      "sourceUrls": [
        "https://oss.gstonegames.com/data_file/clocktower/upload/1689611944_197011_8300.png",
        "https://clocktower.gstonegames.com/ct/grimoireRoleJson/"
      ],
      "reviewedAt": "2026-07-23"
    }
  },
  {
    "id": "20774_8382",
    "name": "征服者",
    "officialName": "征服者",
    "team": "minion",
    "abilityText": "在你的首个夜晚，你会得知一个在场的外来者角色以及与他邻近的镇民角色。每局游戏限一次，在白天时，你可以公开宣布“贱民，滚出这片土地”并选择一名玩家：如果他是你得知的角色，他被处决。［+1外来者］",
    "iconPath": "/assets/characters/20774_8382.webp",
    "inputKinds": [
      "player",
      "role"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "gstone",
      "setupImpact": [
        "征服者 is a setup role; use template or ST confirmation for setup variations."
      ],
      "possibleOutcomes": [
        "Apply 征服者 effect as a storyteller-verified draft result."
      ],
      "stateChanges": [],
      "identityChanges": [],
      "teamChanges": [],
      "playerMessageTemplates": [
        "You may say: you are now 征服者"
      ],
      "highRiskNotes": [],
      "sourceUrls": [
        "https://oss.gstonegames.com/data_file/clocktower/upload/1689611944_197011_8300.png",
        "https://clocktower.gstonegames.com/ct/grimoireRoleJson/"
      ],
      "reviewedAt": "2026-07-23"
    }
  },
  {
    "id": "20774_8383",
    "name": "黑市商人",
    "officialName": "黑市商人",
    "team": "minion",
    "abilityText": "每个夜晚*，如果大于等于六名玩家存活，你可以花费一枚金币，选择一名玩家和一个角色：他变成该角色，但每局游戏仅能成功转化一次恶魔。如果下个黄昏或你失去能力时他存活，他变成之前的角色。",
    "iconPath": "/assets/characters/20774_8383.webp",
    "inputKinds": [
      "player",
      "role"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "gstone",
      "setupImpact": [],
      "possibleOutcomes": [
        "Apply 黑市商人 effect as a storyteller-verified draft result."
      ],
      "stateChanges": [],
      "identityChanges": [
        "May change character or public-facing identity."
      ],
      "teamChanges": [
        "May affect effective alignment behavior or win/loss interpretation."
      ],
      "playerMessageTemplates": [
        "You may say: you are now 黑市商人"
      ],
      "highRiskNotes": [
        "Identity changes should be confirmed with current board context before update.",
        "Alignment effects are candidate reminders only until storyteller confirms."
      ],
      "sourceUrls": [
        "https://oss.gstonegames.com/data_file/clocktower/upload/1689611944_197011_8300.png",
        "https://clocktower.gstonegames.com/ct/grimoireRoleJson/"
      ],
      "reviewedAt": "2026-07-23"
    }
  },
  {
    "id": "20774_8384",
    "name": "旧贵族",
    "officialName": "旧贵族",
    "team": "minion",
    "abilityText": "每个夜晚，你要选择一个恶魔角色：你会被当作该角色且获得该角色的能力直到下个黄昏。［-1恶魔，+1爪牙］",
    "iconPath": "/assets/characters/20774_8384.webp",
    "inputKinds": [
      "player",
      "role"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "gstone",
      "setupImpact": [
        "旧贵族 is a setup role; use template or ST confirmation for setup variations."
      ],
      "possibleOutcomes": [
        "Apply 旧贵族 effect as a storyteller-verified draft result."
      ],
      "stateChanges": [],
      "identityChanges": [],
      "teamChanges": [
        "May affect effective alignment behavior or win/loss interpretation."
      ],
      "playerMessageTemplates": [
        "You may say: you are now 旧贵族"
      ],
      "highRiskNotes": [
        "Alignment effects are candidate reminders only until storyteller confirms."
      ],
      "sourceUrls": [
        "https://oss.gstonegames.com/data_file/clocktower/upload/1689611944_197011_8300.png",
        "https://clocktower.gstonegames.com/ct/grimoireRoleJson/"
      ],
      "reviewedAt": "2026-07-23"
    }
  },
  {
    "id": "20774_8385",
    "name": "陪酒女郎",
    "officialName": "陪酒女郎",
    "team": "minion",
    "abilityText": "每个夜晚，你要选择一名玩家：他醉酒到下个黄昏。如果他持有金币，你偷取一枚。",
    "iconPath": "/assets/characters/20774_8385.webp",
    "inputKinds": [
      "player"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "gstone",
      "setupImpact": [],
      "possibleOutcomes": [
        "Apply 陪酒女郎 effect as a storyteller-verified draft result."
      ],
      "stateChanges": [
        "May add drunk/poisoned state depending on verified outcome."
      ],
      "identityChanges": [],
      "teamChanges": [],
      "playerMessageTemplates": [
        "You may say: you are now 陪酒女郎"
      ],
      "highRiskNotes": [
        "Poison/drunk state is advisory; do not apply automatically."
      ],
      "sourceUrls": [
        "https://oss.gstonegames.com/data_file/clocktower/upload/1689611944_197011_8300.png",
        "https://clocktower.gstonegames.com/ct/grimoireRoleJson/"
      ],
      "reviewedAt": "2026-07-23"
    }
  },
  {
    "id": "20774_8386",
    "name": "波塞冬",
    "officialName": "波塞冬",
    "team": "demon",
    "abilityText": "每个夜晚，你要选择一至三名玩家：你分配给他们合计三枚金币。在夜晚时*，所有被波塞冬分配到三枚及以上的玩家都会死亡。",
    "iconPath": "/assets/characters/20774_8386.webp",
    "inputKinds": [
      "player"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "gstone",
      "setupImpact": [],
      "possibleOutcomes": [
        "Apply 波塞冬 effect as a storyteller-verified draft result.",
        "May create one or more death-related candidates for confirmation."
      ],
      "stateChanges": [
        "Death-related outcomes should be confirmed before changing authoritative state."
      ],
      "identityChanges": [],
      "teamChanges": [],
      "playerMessageTemplates": [
        "You may say: you are now 波塞冬"
      ],
      "highRiskNotes": [
        "Do not auto-commit death state. Storyteller confirms the real target and cause."
      ],
      "sourceUrls": [
        "https://oss.gstonegames.com/data_file/clocktower/upload/1689611944_197011_8300.png",
        "https://clocktower.gstonegames.com/ct/grimoireRoleJson/"
      ],
      "reviewedAt": "2026-07-23"
    }
  },
  {
    "id": "20774_8387",
    "name": "塞壬",
    "officialName": "塞壬",
    "team": "demon",
    "abilityText": "每个夜晚*，你会得知所有拥有船的玩家，然后你要选择一名玩家（或选择任意名拥有船的玩家）：他们死亡。拥有船的玩家的能力会产生错误信息。[+航海家]",
    "iconPath": "/assets/characters/20774_8387.webp",
    "inputKinds": [
      "player"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "gstone",
      "setupImpact": [
        "塞壬 is a setup role; use template or ST confirmation for setup variations."
      ],
      "possibleOutcomes": [
        "Apply 塞壬 effect as a storyteller-verified draft result.",
        "May create one or more death-related candidates for confirmation."
      ],
      "stateChanges": [
        "Death-related outcomes should be confirmed before changing authoritative state."
      ],
      "identityChanges": [],
      "teamChanges": [],
      "playerMessageTemplates": [
        "You may say: you are now 塞壬"
      ],
      "highRiskNotes": [
        "Do not auto-commit death state. Storyteller confirms the real target and cause."
      ],
      "sourceUrls": [
        "https://oss.gstonegames.com/data_file/clocktower/upload/1689611944_197011_8300.png",
        "https://clocktower.gstonegames.com/ct/grimoireRoleJson/"
      ],
      "reviewedAt": "2026-07-23"
    }
  },
  {
    "id": "20774_8388",
    "name": "斯库拉",
    "officialName": "斯库拉",
    "team": "demon",
    "abilityText": "每个夜晚*，你要选择一名玩家:他死亡。每个角色类型首次扬帆的玩家和你都会在当晚得知斯库拉在场。如果这些玩家存活，即使你已死亡但保留能力。如果雾海解除时你已死亡，改为邪恶阵营获胜。",
    "iconPath": "/assets/characters/20774_8388.webp",
    "inputKinds": [
      "player",
      "role"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "gstone",
      "setupImpact": [],
      "possibleOutcomes": [
        "Apply 斯库拉 effect as a storyteller-verified draft result.",
        "May create one or more death-related candidates for confirmation."
      ],
      "stateChanges": [
        "Death-related outcomes should be confirmed before changing authoritative state."
      ],
      "identityChanges": [],
      "teamChanges": [
        "May affect effective alignment behavior or win/loss interpretation."
      ],
      "playerMessageTemplates": [
        "You may say: you are now 斯库拉"
      ],
      "highRiskNotes": [
        "Do not auto-commit death state. Storyteller confirms the real target and cause.",
        "Alignment effects are candidate reminders only until storyteller confirms."
      ],
      "sourceUrls": [
        "https://oss.gstonegames.com/data_file/clocktower/upload/1689611944_197011_8300.png",
        "https://clocktower.gstonegames.com/ct/grimoireRoleJson/"
      ],
      "reviewedAt": "2026-07-23"
    }
  },
  {
    "id": "20774_8389",
    "name": "海德拉",
    "officialName": "海德拉",
    "team": "demon",
    "abilityText": "每个夜晚*，你要选择一名玩家：他死亡。如果大于等于五名玩家存活时你死亡，且没有存活的恶魔，会有一名爪牙变成海德拉。",
    "iconPath": "/assets/characters/20774_8389.webp",
    "inputKinds": [
      "player"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "gstone",
      "setupImpact": [],
      "possibleOutcomes": [
        "Apply 海德拉 effect as a storyteller-verified draft result.",
        "May create one or more death-related candidates for confirmation."
      ],
      "stateChanges": [
        "Death-related outcomes should be confirmed before changing authoritative state."
      ],
      "identityChanges": [
        "May change character or public-facing identity."
      ],
      "teamChanges": [
        "May affect effective alignment behavior or win/loss interpretation."
      ],
      "playerMessageTemplates": [
        "You may say: you are now 海德拉"
      ],
      "highRiskNotes": [
        "Do not auto-commit death state. Storyteller confirms the real target and cause.",
        "Identity changes should be confirmed with current board context before update.",
        "Alignment effects are candidate reminders only until storyteller confirms."
      ],
      "sourceUrls": [
        "https://oss.gstonegames.com/data_file/clocktower/upload/1689611944_197011_8300.png",
        "https://clocktower.gstonegames.com/ct/grimoireRoleJson/"
      ],
      "reviewedAt": "2026-07-23"
    }
  },
  {
    "id": "20774_8390",
    "name": "金币",
    "officialName": "金币",
    "team": "fabled",
    "abilityText": "钱财与这个世界息息相关，多则富有，少则贫穷。",
    "iconPath": "/assets/characters/20774_8390.webp",
    "inputKinds": [
      "none"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "gstone",
      "setupImpact": [],
      "possibleOutcomes": [
        "Apply 金币 effect as a storyteller-verified draft result."
      ],
      "stateChanges": [],
      "identityChanges": [],
      "teamChanges": [],
      "playerMessageTemplates": [
        "You may say: you are now 金币"
      ],
      "highRiskNotes": [],
      "sourceUrls": [
        "https://oss.gstonegames.com/data_file/clocktower/upload/1689611944_197011_8300.png",
        "https://clocktower.gstonegames.com/ct/grimoireRoleJson/"
      ],
      "reviewedAt": "2026-07-23"
    }
  },
  {
    "id": "20774_8391",
    "name": "私有制",
    "officialName": "私有制",
    "team": "fabled",
    "abilityText": "每名玩家都持有自己的金币。在第二个白天及之后，每名存活的玩家都可以拜访说书人以得知自己持有多少枚金币。醉酒的玩家可能会得知错误的金币数量。",
    "iconPath": "/assets/characters/20774_8391.webp",
    "inputKinds": [
      "none"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "gstone",
      "setupImpact": [],
      "possibleOutcomes": [
        "Apply 私有制 effect as a storyteller-verified draft result."
      ],
      "stateChanges": [
        "May add drunk/poisoned state depending on verified outcome."
      ],
      "identityChanges": [],
      "teamChanges": [],
      "playerMessageTemplates": [
        "You may say: you are now 私有制"
      ],
      "highRiskNotes": [
        "Poison/drunk state is advisory; do not apply automatically."
      ],
      "sourceUrls": [
        "https://oss.gstonegames.com/data_file/clocktower/upload/1689611944_197011_8300.png",
        "https://clocktower.gstonegames.com/ct/grimoireRoleJson/"
      ],
      "reviewedAt": "2026-07-23"
    }
  },
  {
    "id": "20774_8392",
    "name": "雾魇恐惧",
    "officialName": "雾魇恐惧",
    "team": "fabled",
    "abilityText": "每个白天限两次，如果一次提名计票之后该玩家即将被处决，提名玩家获得一枚金币，所有投票玩家各获得一枚金币。",
    "iconPath": "/assets/characters/20774_8392.webp",
    "inputKinds": [
      "none"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "gstone",
      "setupImpact": [],
      "possibleOutcomes": [
        "Apply 雾魇恐惧 effect as a storyteller-verified draft result."
      ],
      "stateChanges": [],
      "identityChanges": [],
      "teamChanges": [],
      "playerMessageTemplates": [
        "You may say: you are now 雾魇恐惧"
      ],
      "highRiskNotes": [],
      "sourceUrls": [
        "https://oss.gstonegames.com/data_file/clocktower/upload/1689611944_197011_8300.png",
        "https://clocktower.gstonegames.com/ct/grimoireRoleJson/"
      ],
      "reviewedAt": "2026-07-23"
    }
  },
  {
    "id": "20774_8393",
    "name": "船坞",
    "officialName": "船坞",
    "team": "fabled",
    "abilityText": "在白天时，除旅行者以外的存活的玩家可以购买船，持有三枚金币可以购买小船，持有五枚金币可以购买大船。所有玩家都会得知谁拥有大船。",
    "iconPath": "/assets/characters/20774_8393.webp",
    "inputKinds": [
      "none"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "gstone",
      "setupImpact": [],
      "possibleOutcomes": [
        "Apply 船坞 effect as a storyteller-verified draft result."
      ],
      "stateChanges": [],
      "identityChanges": [],
      "teamChanges": [],
      "playerMessageTemplates": [
        "You may say: you are now 船坞"
      ],
      "highRiskNotes": [],
      "sourceUrls": [
        "https://oss.gstonegames.com/data_file/clocktower/upload/1689611944_197011_8300.png",
        "https://clocktower.gstonegames.com/ct/grimoireRoleJson/"
      ],
      "reviewedAt": "2026-07-23"
    }
  },
  {
    "id": "20774_8394",
    "name": "扬帆",
    "officialName": "扬帆",
    "team": "fabled",
    "abilityText": "在白天时，拥有船的存活的玩家可以拜访说书人并花费一枚金币。如果一名玩家连续扬帆两天，他可以选择另一名玩家：他会得知该玩家的阵营。醉酒的玩家会得知错误信息。",
    "iconPath": "/assets/characters/20774_8394.webp",
    "inputKinds": [
      "player"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "gstone",
      "setupImpact": [],
      "possibleOutcomes": [
        "Apply 扬帆 effect as a storyteller-verified draft result."
      ],
      "stateChanges": [
        "May add drunk/poisoned state depending on verified outcome."
      ],
      "identityChanges": [],
      "teamChanges": [],
      "playerMessageTemplates": [
        "You may say: you are now 扬帆"
      ],
      "highRiskNotes": [
        "Poison/drunk state is advisory; do not apply automatically."
      ],
      "sourceUrls": [
        "https://oss.gstonegames.com/data_file/clocktower/upload/1689611944_197011_8300.png",
        "https://clocktower.gstonegames.com/ct/grimoireRoleJson/"
      ],
      "reviewedAt": "2026-07-23"
    }
  },
  {
    "id": "20774_8395",
    "name": "远洋",
    "officialName": "远洋",
    "team": "fabled",
    "abilityText": "在白天时，拥有大船的三名存活的玩家可以提议远洋，所有玩家要对这个提议投票。如果远洋提议的投票超过半数玩家，则提议通过。远洋中的三名玩家：一名会得知他们之中有多少名邪恶玩家，一名会得知错误信息，一名会死亡。",
    "iconPath": "/assets/characters/20774_8395.webp",
    "inputKinds": [
      "none"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "gstone",
      "setupImpact": [],
      "possibleOutcomes": [
        "Apply 远洋 effect as a storyteller-verified draft result.",
        "May create one or more death-related candidates for confirmation."
      ],
      "stateChanges": [
        "Death-related outcomes should be confirmed before changing authoritative state."
      ],
      "identityChanges": [],
      "teamChanges": [
        "May affect effective alignment behavior or win/loss interpretation."
      ],
      "playerMessageTemplates": [
        "You may say: you are now 远洋"
      ],
      "highRiskNotes": [
        "Do not auto-commit death state. Storyteller confirms the real target and cause.",
        "Alignment effects are candidate reminders only until storyteller confirms."
      ],
      "sourceUrls": [
        "https://oss.gstonegames.com/data_file/clocktower/upload/1689611944_197011_8300.png",
        "https://clocktower.gstonegames.com/ct/grimoireRoleJson/"
      ],
      "reviewedAt": "2026-07-23"
    }
  },
  {
    "id": "20774_8396",
    "name": "雾海",
    "officialName": "雾海",
    "team": "fabled",
    "abilityText": "在游戏开始时，所有玩家都被困在雾海之中。在远洋之前雾海不会解除。雾海之中，只有邪恶阵营全部死亡，邪恶阵营才会落败。",
    "iconPath": "/assets/characters/20774_8396.webp",
    "inputKinds": [
      "none"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "gstone",
      "setupImpact": [],
      "possibleOutcomes": [
        "Apply 雾海 effect as a storyteller-verified draft result.",
        "May create one or more death-related candidates for confirmation."
      ],
      "stateChanges": [
        "Death-related outcomes should be confirmed before changing authoritative state."
      ],
      "identityChanges": [],
      "teamChanges": [
        "May affect effective alignment behavior or win/loss interpretation."
      ],
      "playerMessageTemplates": [
        "You may say: you are now 雾海"
      ],
      "highRiskNotes": [
        "Do not auto-commit death state. Storyteller confirms the real target and cause.",
        "Alignment effects are candidate reminders only until storyteller confirms."
      ],
      "sourceUrls": [
        "https://oss.gstonegames.com/data_file/clocktower/upload/1689611944_197011_8300.png",
        "https://clocktower.gstonegames.com/ct/grimoireRoleJson/"
      ],
      "reviewedAt": "2026-07-23"
    }
  },
  {
    "id": "20774_8397",
    "name": "巨浪",
    "officialName": "巨浪",
    "team": "traveler",
    "abilityText": "每个白天，你可以公开宣布“神秘之物掀起海浪”，然后选择一名玩家：你向他索取两枚金币。当你得知你死亡时，你可以转交你索取的金币。",
    "iconPath": "/assets/characters/20774_8397.webp",
    "inputKinds": [
      "player"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "gstone",
      "setupImpact": [],
      "possibleOutcomes": [
        "Apply 巨浪 effect as a storyteller-verified draft result.",
        "May create one or more death-related candidates for confirmation."
      ],
      "stateChanges": [
        "Death-related outcomes should be confirmed before changing authoritative state."
      ],
      "identityChanges": [],
      "teamChanges": [],
      "playerMessageTemplates": [
        "You may say: you are now 巨浪"
      ],
      "highRiskNotes": [
        "Do not auto-commit death state. Storyteller confirms the real target and cause."
      ],
      "sourceUrls": [
        "https://oss.gstonegames.com/data_file/clocktower/upload/1689611944_197011_8300.png",
        "https://clocktower.gstonegames.com/ct/grimoireRoleJson/"
      ],
      "reviewedAt": "2026-07-23"
    }
  },
  {
    "id": "20774_8398",
    "name": "飓风",
    "officialName": "飓风",
    "team": "traveler",
    "abilityText": "每个夜晚*，会有一名玩家获得或失去一枚金币。他会得知自己被风吹。",
    "iconPath": "/assets/characters/20774_8398.webp",
    "inputKinds": [
      "none"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "gstone",
      "setupImpact": [],
      "possibleOutcomes": [
        "Apply 飓风 effect as a storyteller-verified draft result."
      ],
      "stateChanges": [],
      "identityChanges": [],
      "teamChanges": [],
      "playerMessageTemplates": [
        "You may say: you are now 飓风"
      ],
      "highRiskNotes": [],
      "sourceUrls": [
        "https://oss.gstonegames.com/data_file/clocktower/upload/1689611944_197011_8300.png",
        "https://clocktower.gstonegames.com/ct/grimoireRoleJson/"
      ],
      "reviewedAt": "2026-07-23"
    }
  },
  {
    "id": "20774_8399",
    "name": "暴雨",
    "officialName": "暴雨",
    "team": "traveler",
    "abilityText": "每个白天，你可以公开发表一个独特的声明。如果该声明正确，在当晚你转变阵营。在雾海解除后你的阵营不再转变。[无初始信息]",
    "iconPath": "/assets/characters/20774_8399.webp",
    "inputKinds": [
      "none"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "gstone",
      "setupImpact": [],
      "possibleOutcomes": [
        "Apply 暴雨 effect as a storyteller-verified draft result."
      ],
      "stateChanges": [],
      "identityChanges": [
        "May change character or public-facing identity."
      ],
      "teamChanges": [],
      "playerMessageTemplates": [
        "You may say: you are now 暴雨"
      ],
      "highRiskNotes": [
        "Identity changes should be confirmed with current board context before update."
      ],
      "sourceUrls": [
        "https://oss.gstonegames.com/data_file/clocktower/upload/1689611944_197011_8300.png",
        "https://clocktower.gstonegames.com/ct/grimoireRoleJson/"
      ],
      "reviewedAt": "2026-07-23"
    }
  },
  {
    "id": "20774_8400",
    "name": "浓雾",
    "officialName": "浓雾",
    "team": "traveler",
    "abilityText": "每个夜晚*，你要选择除旅行者以外的三名玩家：他们会得知被你选中。如果明天他们相互提名，在处决之后，他们之中提名的玩家各获得一枚金币。",
    "iconPath": "/assets/characters/20774_8400.webp",
    "inputKinds": [
      "player"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "gstone",
      "setupImpact": [],
      "possibleOutcomes": [
        "Apply 浓雾 effect as a storyteller-verified draft result."
      ],
      "stateChanges": [],
      "identityChanges": [],
      "teamChanges": [],
      "playerMessageTemplates": [
        "You may say: you are now 浓雾"
      ],
      "highRiskNotes": [],
      "sourceUrls": [
        "https://oss.gstonegames.com/data_file/clocktower/upload/1689611944_197011_8300.png",
        "https://clocktower.gstonegames.com/ct/grimoireRoleJson/"
      ],
      "reviewedAt": "2026-07-23"
    }
  },
  {
    "id": "20774_8401",
    "name": "低气压",
    "officialName": "低气压",
    "team": "traveler",
    "abilityText": "在雾海之中，你不会被流放。在第三个白天之后，如果当天被处决玩家的金币大于等于五枚或拥有船，被你提名的玩家也一同被处决。",
    "iconPath": "/assets/characters/20774_8401.webp",
    "inputKinds": [
      "player"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "gstone",
      "setupImpact": [],
      "possibleOutcomes": [
        "Apply 低气压 effect as a storyteller-verified draft result."
      ],
      "stateChanges": [],
      "identityChanges": [],
      "teamChanges": [],
      "playerMessageTemplates": [
        "You may say: you are now 低气压"
      ],
      "highRiskNotes": [],
      "sourceUrls": [
        "https://oss.gstonegames.com/data_file/clocktower/upload/1689611944_197011_8300.png",
        "https://clocktower.gstonegames.com/ct/grimoireRoleJson/"
      ],
      "reviewedAt": "2026-07-23"
    }
  },
  {
    "id": "20774_8402",
    "name": "暗礁",
    "officialName": "暗礁",
    "team": "traveler",
    "abilityText": "你同时拥有另一个旅行者角色能力，你以为你是那个角色。在夜晚时*，可能会有一名玩家因触礁不会被自身能力唤醒，且你死亡。",
    "iconPath": "/assets/characters/20774_8402.webp",
    "inputKinds": [
      "role"
    ],
    "knowledgeStatus": "confirmed",
    "research": {
      "edition": "gstone",
      "setupImpact": [
        "暗礁 is a setup role; use template or ST confirmation for setup variations."
      ],
      "possibleOutcomes": [
        "Apply 暗礁 effect as a storyteller-verified draft result.",
        "May create one or more death-related candidates for confirmation."
      ],
      "stateChanges": [
        "Death-related outcomes should be confirmed before changing authoritative state."
      ],
      "identityChanges": [],
      "teamChanges": [],
      "playerMessageTemplates": [
        "You may say: you are now 暗礁"
      ],
      "highRiskNotes": [
        "Do not auto-commit death state. Storyteller confirms the real target and cause."
      ],
      "sourceUrls": [
        "https://oss.gstonegames.com/data_file/clocktower/upload/1689611944_197011_8300.png",
        "https://clocktower.gstonegames.com/ct/grimoireRoleJson/"
      ],
      "reviewedAt": "2026-07-23"
    }
  }
] as const satisfies readonly SmartRoleDefinition[]
