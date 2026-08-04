import type { AbilityInputKind, RoleResearchMetadata, RoleTeam, SmartRoleDefinition } from '../../types'

const sourceUrl = "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21091_69606.json"
const rolesSourceUrl = 'https://clocktower.gstonegames.com/ct/grimoireRoleJson/'
const reviewedAt = '2026-07-21'

type RoleInput = {
  id: string
  name: string
  officialName: string
  team: RoleTeam
  abilityText: string
  iconPath?: string
  inputKinds: readonly AbilityInputKind[]
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
    iconPath: input.iconPath ?? `/assets/characters/${input.id}.webp`,
    inputKinds: input.inputKinds,
    knowledgeStatus: 'confirmed',
    research: research(input),
  }
}

function research(input: RoleInput): RoleResearchMetadata {
  return {
    edition: "夜幕降临",
    setupImpact: input.setupImpact ?? [],
    possibleOutcomes: input.possibleOutcomes ?? [],
    stateChanges: input.stateChanges ?? [],
    identityChanges: input.identityChanges ?? [],
    teamChanges: input.teamChanges ?? [],
    playerMessageTemplates: input.playerMessageTemplates ?? [],
    highRiskNotes: input.highRiskNotes ?? [],
    sourceUrls: [sourceUrl, rolesSourceUrl],
    reviewedAt,
  }
}

export const yeMuJiangLinRoles = [
  role({
    id: "alchemist",
    name: "炼金术士",
    officialName: "alchemist",
    team: "townsfolk",
    abilityText: "你拥有一个爪牙角色的能力。当你使用能力时，说书人可能会要求你更换选择。",
    iconPath: "https://oss.gstonegames.com/data_file/clocktower/role_icon/alchemist.png",
    inputKinds: ["none"],
    setupImpact: ["If the gained Minion ability adds or removes characters during setup (e.g. Godfather), that effect also applies during setup."],
    highRiskNotes: ["First-night source reminder: 向炼金术士展示一个不在场爪牙的角色标记。"],
  }),
  role({
    id: "washerwoman",
    name: "洗衣妇",
    officialName: "washerwoman",
    team: "townsfolk",
    abilityText: "在你的首个夜晚，你会得知两名玩家和一个镇民角色：这两名玩家之一是该角色。",
    iconPath: "https://oss.gstonegames.com/data_file/clocktower/role_icon/washerwoman.png",
    inputKinds: ["none"],
    highRiskNotes: ["First-night source reminder: 展示那个镇民角色标记。指向被你标记“镇民”和“错误”的两名玩家。"],
  }),
  role({
    id: "chef",
    name: "厨师",
    officialName: "chef",
    team: "townsfolk",
    abilityText: "在你的首个夜晚，你会得知场上邻座的邪恶玩家有多少对。",
    iconPath: "https://oss.gstonegames.com/data_file/clocktower/role_icon/chef.png",
    inputKinds: ["none"],
    highRiskNotes: ["First-night source reminder: 给他展示数字手势来告诉他场上邻座邪恶玩家有多少对。"],
  }),
  role({
    id: "fortuneteller",
    name: "占卜师",
    officialName: "fortune_teller",
    team: "townsfolk",
    abilityText: "每个夜晚，你要选择两名玩家：你会得知他们之中是否有恶魔。会有一名善良玩家始终被你的能力当作恶魔。",
    iconPath: "https://oss.gstonegames.com/data_file/clocktower/role_icon/fortune_teller.png",
    inputKinds: ["none"],
    highRiskNotes: ["First-night source reminder: 让占卜师选择两名玩家。如果其中有恶魔或“干扰项”，点头示意，否则摇头。", "Other-night source reminder: 让占卜师选择两名玩家。如果其中有恶魔或“干扰项”，点头示意，否则摇头。"],
  }),
  role({
    id: "monk",
    name: "僧侣",
    officialName: "monk",
    team: "townsfolk",
    abilityText: "每个夜晚*，你要选择除你以外的一名玩家：当晚恶魔的负面能力对他无效。",
    iconPath: "https://oss.gstonegames.com/data_file/clocktower/role_icon/monk.png",
    inputKinds: ["none"],
    highRiskNotes: ["Other-night source reminder: 让僧侣选择除自己外的一名玩家。标记那名玩家被保护。"],
  }),
  role({
    id: "gambler",
    name: "赌徒",
    officialName: "gambler",
    team: "townsfolk",
    abilityText: "每个夜晚*，你要选择一名玩家并猜测他的角色：如果你猜错了，你会死亡。",
    iconPath: "https://oss.gstonegames.com/data_file/clocktower/role_icon/gambler.png",
    inputKinds: ["none"],
    highRiskNotes: ["Other-night source reminder: 让赌徒选择一名玩家和一个角色。如果赌徒猜错了，标记赌徒死亡。"],
  }),
  role({
    id: "towncrier",
    name: "城镇公告员",
    officialName: "town_crier",
    team: "townsfolk",
    abilityText: "每个夜晚*，你会得知在今天白天时是否有爪牙发起过提名。",
    iconPath: "https://oss.gstonegames.com/data_file/clocktower/role_icon/town_crier.png",
    inputKinds: ["none"],
    highRiskNotes: ["Other-night source reminder: 对他点头或摇头示意今天白天是否有爪牙发起过提名。"],
  }),
  role({
    id: "seamstress",
    name: "女裁缝",
    officialName: "seamstress",
    team: "townsfolk",
    abilityText: "每局游戏限一次，在夜晚时，你可以选择除你以外的两名玩家：你会得知他们是否为同一阵营。",
    iconPath: "https://oss.gstonegames.com/data_file/clocktower/role_icon/seamstress.png",
    inputKinds: ["none"],
    highRiskNotes: ["First-night source reminder: 女裁缝可以选择除自己以外的两名玩家。如果她这么做了，对她点头或摇头示意这两名玩家是否为同一阵营，随后标记女裁缝失去能力。之后的夜晚无需再唤醒女裁缝。", "Other-night source reminder: 女裁缝可以选择除自己以外的两名玩家。如果她这么做了，对她点头或摇头示意这两名玩家是否为同一阵营，随后标记女裁缝失去能力。之后的夜晚无需再唤醒女裁缝。"],
  }),
  role({
    id: "fisherman",
    name: "渔夫",
    officialName: "fisherman",
    team: "townsfolk",
    abilityText: "每局游戏限一次，在白天时，你可以让说书人给你一些能帮助你的阵营获胜的建议。",
    iconPath: "https://oss.gstonegames.com/data_file/clocktower/role_icon/fisherman.png",
    inputKinds: ["none"],
    possibleOutcomes: ["Record the information or choice; storyteller confirms the final result."],
  }),
  role({
    id: "slayer",
    name: "猎手",
    officialName: "slayer",
    team: "townsfolk",
    abilityText: "每局游戏限一次，你可以在白天时公开选择一名玩家：如果他是恶魔，他死亡。",
    iconPath: "https://oss.gstonegames.com/data_file/clocktower/role_icon/slayer.png",
    inputKinds: ["none"],
    possibleOutcomes: ["Record the information or choice; storyteller confirms the final result."],
  }),
  role({
    id: "undertaker",
    name: "送葬者",
    officialName: "undertaker",
    team: "townsfolk",
    abilityText: "每个夜晚*，你会得知今天白天死于处决的玩家的角色。",
    iconPath: "https://oss.gstonegames.com/data_file/clocktower/role_icon/undertaker.png",
    inputKinds: ["none"],
    highRiskNotes: ["Other-night source reminder: 如果有玩家今天白天死于处决，唤醒送葬者并对他展示那名玩家的角色标记。"],
  }),
  role({
    id: "ravenkeeper",
    name: "守鸦人",
    officialName: "ravenkeeper",
    team: "townsfolk",
    abilityText: "如果你在夜晚死亡，你会被唤醒，然后你要选择一名玩家：你会得知他的角色。",
    iconPath: "https://oss.gstonegames.com/data_file/clocktower/role_icon/ravenkeeper.png",
    inputKinds: ["none"],
    highRiskNotes: ["Other-night source reminder: 如果守鸦人今晚死亡，唤醒他并让他选择一名玩家。对他展示那名玩家的角色标记。"],
  }),
  role({
    id: "soldier",
    name: "士兵",
    officialName: "soldier",
    team: "townsfolk",
    abilityText: "恶魔的负面能力对你无效。",
    iconPath: "https://oss.gstonegames.com/data_file/clocktower/role_icon/soldier.png",
    inputKinds: ["none"],
    possibleOutcomes: ["Record the information or choice; storyteller confirms the final result."],
  }),
  role({
    id: "saint",
    name: "圣徒",
    officialName: "saint",
    team: "outsider",
    abilityText: "如果你死于处决，你的阵营落败。",
    iconPath: "https://oss.gstonegames.com/data_file/clocktower/role_icon/saint.png",
    inputKinds: ["none"],
    possibleOutcomes: ["Record the information or choice; storyteller confirms the final result."],
  }),
  role({
    id: "mutant",
    name: "畸形秀演员",
    officialName: "mutant",
    team: "outsider",
    abilityText: "如果你“疯狂”地证明自己是外来者，你可能被处决。",
    iconPath: "https://oss.gstonegames.com/data_file/clocktower/role_icon/mutant.png",
    inputKinds: ["none"],
    possibleOutcomes: ["Record the information or choice; storyteller confirms the final result."],
  }),
  role({
    id: "klutz",
    name: "呆瓜",
    officialName: "klutz",
    team: "outsider",
    abilityText: "当你得知你死亡时，你要公开选择一名存活的玩家：如果他是邪恶的，你的阵营落败。",
    iconPath: "https://oss.gstonegames.com/data_file/clocktower/role_icon/klutz.png",
    inputKinds: ["none"],
    possibleOutcomes: ["Record the information or choice; storyteller confirms the final result."],
  }),
  role({
    id: "moonchild",
    name: "月之子",
    officialName: "moonchild",
    team: "outsider",
    abilityText: "当你得知你死亡时，你要公开选择一名存活的玩家。如果他是善良的，在当晚他会死亡。",
    iconPath: "https://oss.gstonegames.com/data_file/clocktower/role_icon/moonchild.png",
    inputKinds: ["none"],
    highRiskNotes: ["Other-night source reminder: 如果月之子在白天触发了死亡能力并选择了一名善良玩家，该玩家死亡。标记那名玩家死亡。"],
  }),
  role({
    id: "assassin",
    name: "刺客",
    officialName: "assassin",
    team: "minion",
    abilityText: "每局游戏限一次，在夜晚时*，你可以选择一名玩家：他死亡，即使因为任何原因让他不会死亡。",
    iconPath: "https://oss.gstonegames.com/data_file/clocktower/role_icon/assassin.png",
    inputKinds: ["none"],
    highRiskNotes: ["Other-night source reminder: 刺客可以选择一名玩家。如果他这么做了，标记那名玩家死亡，且刺客失去能力，之后的夜晚无需再唤醒刺客。"],
  }),
  role({
    id: "scarletwoman",
    name: "红唇女郎",
    officialName: "scarlet_woman",
    team: "minion",
    abilityText: "如果大于等于五名玩家存活时（旅行者不计算在内）恶魔死亡，你变成那个恶魔。",
    iconPath: "https://oss.gstonegames.com/data_file/clocktower/role_icon/scarlet_woman.png",
    inputKinds: ["none"],
    highRiskNotes: ["Other-night source reminder: 如果红唇女郎今天变成了小恶魔，对她展示“你是”信息标记，和小恶魔角色标记。"],
  }),
  role({
    id: "devilsadvocate",
    name: "魔鬼代言人",
    officialName: "devils_advocate",
    team: "minion",
    abilityText: "每个夜晚，你要选择一名存活的玩家（与上个夜晚不同）：如果明天白天他被处决，他不会死亡。",
    iconPath: "https://oss.gstonegames.com/data_file/clocktower/role_icon/devils_advocate.png",
    inputKinds: ["none"],
    highRiskNotes: ["First-night source reminder: 让魔鬼代言人选择一名存活玩家。标记那名玩家处决不死。", "Other-night source reminder: 让魔鬼代言人选择一名存活玩家，不能是上一夜他选择过的玩家。标记那名玩家处决不死。"],
  }),
  role({
    id: "godfather",
    name: "教父",
    officialName: "godfather",
    team: "minion",
    abilityText: "在你的首个夜晚，你会得知有哪些外来者角色在场。如果有外来者在白天死亡，你会在当晚被唤醒并且你要选择一名玩家：他死亡。[-1或+1外来者]",
    iconPath: "https://oss.gstonegames.com/data_file/clocktower/role_icon/godfather.png",
    inputKinds: ["none"],
    setupImpact: ["Setup bracket text applies; storyteller confirms composition before play."],
    highRiskNotes: ["First-night source reminder: 对他展示所有在场的外来者标记。", "Other-night source reminder: 如果有外来者在今天白天死亡，让教父选择一名玩家。标记那名玩家死亡。"],
  }),
  role({
    id: "psychopath",
    name: "精神病患者",
    officialName: "psychopath",
    team: "minion",
    abilityText: "每个白天，在提名开始前，你可以公开选择一名玩家：他死亡。如果你被处决，提名你的玩家需要和你猜拳，只有你输了你才会死亡。",
    iconPath: "https://oss.gstonegames.com/data_file/clocktower/role_icon/psychopath.png",
    inputKinds: ["none"],
    possibleOutcomes: ["Record the information or choice; storyteller confirms the final result."],
  }),
  role({
    id: "imp",
    name: "小恶魔",
    officialName: "imp",
    team: "demon",
    abilityText: "每个夜晚*，你要选择一名玩家：他死亡。如果你以这种方式自杀，一名爪牙会变成小恶魔。",
    iconPath: "https://oss.gstonegames.com/data_file/clocktower/role_icon/imp.png",
    inputKinds: ["none"],
    highRiskNotes: ["Other-night source reminder: 让小恶魔选择一名玩家。标记那名玩家死亡。如果小恶魔选择了自己：用一个备用的小恶魔标记替换一个存活的爪牙角色标记。让原来的小恶魔重新入睡。唤醒新的小恶魔。对他展示“你是”信息标记，和小恶魔角色标记。"],
  }),
  role({
    id: "vortox",
    name: "涡流",
    officialName: "vortox",
    team: "demon",
    abilityText: "每个夜晚*，你要选择一名玩家：他死亡。镇民玩家的能力都会产生错误信息。如果白天没人被处决，邪恶阵营获胜。",
    iconPath: "https://oss.gstonegames.com/data_file/clocktower/role_icon/vortox.png",
    inputKinds: ["none"],
    highRiskNotes: ["Other-night source reminder: 让涡流选择一名玩家。标记那名玩家死亡。"],
  }),
] as const satisfies readonly SmartRoleDefinition[]
