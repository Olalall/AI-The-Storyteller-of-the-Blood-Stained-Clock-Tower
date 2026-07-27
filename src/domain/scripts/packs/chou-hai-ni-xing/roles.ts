import type { AbilityInputKind, RoleResearchMetadata, RoleTeam, SmartRoleDefinition } from '../../types'

const sourceUrl = "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21086_69601.json"
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
    edition: "仇海溺行",
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

export const chouHaiNiXingRoles = [
  role({
    id: "librarian",
    name: "图书管理员",
    officialName: "librarian",
    team: "townsfolk",
    abilityText: "在你的首个夜晚，你会得知两名玩家和一个外来者角色：这两名玩家之一是该角色（或者你会得知没有外来者在场）。",
    iconPath: "https://oss.gstonegames.com/data_file/clocktower/role_icon/librarian.png",
    inputKinds: ["none"],
    highRiskNotes: ["First-night source reminder: 展示那个外来者角色标记。指向被你标记“外来者”和“错误”的两名玩家。"],
  }),
  role({
    id: "investigator",
    name: "调查员",
    officialName: "investigator",
    team: "townsfolk",
    abilityText: "在你的首个夜晚，你会得知两名玩家和一个爪牙角色：这两名玩家之一是该角色（或者你会得知没有爪牙在场）。",
    iconPath: "https://oss.gstonegames.com/data_file/clocktower/role_icon/investigator.png",
    inputKinds: ["none"],
    highRiskNotes: ["First-night source reminder: 展示那个爪牙角色标记。指向被你标记“爪牙”和“错误”的两名玩家。"],
  }),
  role({
    id: "empath",
    name: "共情者",
    officialName: "empath",
    team: "townsfolk",
    abilityText: "每个夜晚，你会得知与你邻近的两名存活的玩家中邪恶玩家的数量。",
    iconPath: "https://oss.gstonegames.com/data_file/clocktower/role_icon/empath.png",
    inputKinds: ["none"],
    highRiskNotes: ["First-night source reminder: 给他展示数字手势来告诉他与他邻近的存活玩家有几人是邪恶的。", "Other-night source reminder: 给他展示数字手势来告诉他与他邻近的存活玩家有几人是邪恶的。"],
  }),
  role({
    id: "balloonist",
    name: "气球驾驶员",
    officialName: "balloonist",
    team: "townsfolk",
    abilityText: "每个夜晚，你会得知一名与上个夜晚得知的玩家角色类型不同的玩家。[+0~1外来者]",
    iconPath: "https://oss.gstonegames.com/data_file/clocktower/upload/202410/c_7787277188271_9eba6446.jpg",
    inputKinds: ["none"],
    setupImpact: ["Setup bracket text applies; storyteller confirms composition, adjacency or no-evil setup before play."],
    highRiskNotes: ["First-night source reminder: 选择一种角色类型，并告知其一个符合该类型的玩家。在该玩家旁边标记已被知晓。", "Other-night source reminder: 选择一种尚未被气球驾驶员知晓的角色类型，并告知其一个符合该类型的玩家。在该玩家旁边标记已被知晓。如果所有类型均已被知晓或无该种类型，气球驾驶员不会醒来。"],
  }),
  role({
    id: "dreamer",
    name: "筑梦师",
    officialName: "dreamer",
    team: "townsfolk",
    abilityText: "每个夜晚，你要选择除你及旅行者以外的一名玩家：你会得知一个善良角色和一个邪恶角色，该玩家是其中一个角色。",
    iconPath: "https://oss.gstonegames.com/data_file/clocktower/role_icon/dreamer.png",
    inputKinds: ["none"],
    highRiskNotes: ["First-night source reminder: 让筑梦师指向一名玩家。对他展示善良和邪恶的角色标记各一个，其中一个是属于该玩家的角色。", "Other-night source reminder: 让筑梦师指向一名玩家。对他展示善良和邪恶的角色标记各一个，其中一个是属于该玩家的角色。"],
  }),
  role({
    id: "snakecharmer",
    name: "舞蛇人",
    officialName: "snake_charmer",
    team: "townsfolk",
    abilityText: "每个夜晚，你要选择一名存活的玩家：如果你选中了恶魔，你和他交换角色和阵营，然后他中毒。",
    iconPath: "https://oss.gstonegames.com/data_file/clocktower/role_icon/snake_charmer.png",
    inputKinds: ["none"],
    highRiskNotes: ["Snake Charmer demon hit swaps role and alignment, then new Snake Charmer is poisoned; manual correction only.", "First-night source reminder: 让舞蛇人选择一名玩家。如果舞蛇人选中了恶魔：展示“你是”信息标记和恶魔角色标记。用拇指向下代表他阵营变为邪恶。在魔典中交换舞蛇人和恶魔的角色标记。让原来的舞蛇人重新入睡。唤醒原来的恶魔。对老恶魔展示“你是”信息标记和舞蛇人角色标记，并用拇指向上代表他阵营变为善良。", "Other-night source reminder: 让舞蛇人选择一名玩家。如果舞蛇人选中了恶魔：展示“你是”信息标记和恶魔角色标记。用拇指向下代表他阵营变为邪恶。在魔典中交换舞蛇人和恶魔的角色标记。让原来的舞蛇人重新入睡。唤醒原来的恶魔。对老恶魔展示“你是”信息标记和舞蛇人角色标记，并用拇指向上代表他阵营变为善良。"],
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
    id: "savant",
    name: "博学者",
    officialName: "savant",
    team: "townsfolk",
    abilityText: "每个白天，你可以私下询问说书人以得知两条信息：一个是正确的，一个是错误的。",
    iconPath: "https://oss.gstonegames.com/data_file/clocktower/role_icon/savant.png",
    inputKinds: ["none"],
    possibleOutcomes: ["Record the information or choice; storyteller confirms the final result."],
  }),
  role({
    id: "courtier",
    name: "侍臣",
    officialName: "courtier",
    team: "townsfolk",
    abilityText: "每局游戏限一次，在夜晚时，你可以选择一个角色：如果该角色在场，该角色之一从当晚开始醉酒三天三夜。",
    iconPath: "https://oss.gstonegames.com/data_file/clocktower/role_icon/courtier.png",
    inputKinds: ["none"],
    highRiskNotes: ["First-night source reminder: 侍臣可以选择一个角色。如果他这么做了，标记侍臣失去能力，标记被选择的角色所对应的玩家醉酒。之后的夜晚无需再唤醒侍臣。", "Other-night source reminder: 侍臣可以选择一个角色。如果他这么做了，标记侍臣失去能力，标记被选择的角色所对应的玩家醉酒。之后的夜晚无需再唤醒侍臣。"],
  }),
  role({
    id: "amnesiac",
    name: "失忆者",
    officialName: "amnesiac",
    team: "townsfolk",
    abilityText: "你不知道你的能力是什么。每个白天你可以找说书人猜测一次，你会得知你的猜测有多准确。",
    iconPath: "https://oss.gstonegames.com/data_file/clocktower/role_icon/amnesiac.png",
    inputKinds: ["none"],
    highRiskNotes: ["First-night source reminder: 决定失忆者的能力。如果失忆者的能力会让他在今晚醒来：唤醒他并执行其能力。", "Other-night source reminder: 如果失忆者的能力会让他在今晚醒来：唤醒他并执行其能力。"],
  }),
  role({
    id: "magician",
    name: "魔术师",
    officialName: "magician",
    team: "townsfolk",
    abilityText: "恶魔会以为你是爪牙。爪牙会以为你是恶魔。",
    iconPath: "https://oss.gstonegames.com/data_file/clocktower/role_icon/magician.png",
    inputKinds: ["none"],
    possibleOutcomes: ["Record the information or choice; storyteller confirms the final result."],
  }),
  role({
    id: "atheist",
    name: "无神论者",
    officialName: "atheist",
    team: "townsfolk",
    abilityText: "说书人可以打破游戏规则，如果说书人被处决，善良阵营获胜，即使你已死亡。[无邪恶角色在场]",
    iconPath: "https://oss.gstonegames.com/data_file/clocktower/role_icon/atheist.png",
    inputKinds: ["none"],
    setupImpact: ["Setup bracket text applies; storyteller confirms composition, adjacency or no-evil setup before play."],
  }),
  role({
    id: "lunatic",
    name: "疯子",
    officialName: "lunatic",
    team: "outsider",
    abilityText: "你以为你是一个恶魔，但其实你不是。恶魔知道你是疯子以及你在每个夜晚选择了哪些玩家。",
    iconPath: "https://oss.gstonegames.com/data_file/clocktower/role_icon/lunatic.png",
    inputKinds: ["none"],
    highRiskNotes: ["First-night source reminder: 如果有七名或更多玩家，唤醒疯子：展示“他们是你的爪牙”信息标记。指向任意对应数量的玩家。展示“这些角色不在场”信息标记。展示三个善良角色。让疯子重新入睡。唤醒恶魔。展示“你是”信息标记和恶魔角色标记。展示“这名玩家是”信息标记和疯子角色标记，然后指向疯子玩家。"],
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
    id: "politician",
    name: "政客",
    officialName: "politician",
    team: "outsider",
    abilityText: "如果你是对你的阵营落败负最大责任的人，你转变阵营并获胜，即使你已死亡。",
    iconPath: "https://oss.gstonegames.com/data_file/clocktower/role_icon/politician.png",
    inputKinds: ["none"],
    possibleOutcomes: ["Record the information or choice; storyteller confirms the final result."],
  }),
  role({
    id: "damsel",
    name: "落难少女",
    officialName: "damsel",
    team: "outsider",
    abilityText: "所有爪牙都知道落难少女在场。每局游戏限一次，任意爪牙可以公开猜测你是落难少女，如果猜对，你的阵营落败。",
    iconPath: "https://oss.gstonegames.com/data_file/clocktower/role_icon/damsel.png",
    inputKinds: ["none"],
    highRiskNotes: ["First-night source reminder: 唤醒所有爪牙，并告知他们场中有落难少女。"],
  }),
  role({
    id: "cerenovus",
    name: "洗脑师",
    officialName: "cerenovus",
    team: "minion",
    abilityText: "每个夜晚，你要选择一名玩家和一个善良角色。他明天白天和夜晚需要“疯狂”地证明自己是这个角色，不然他可能被处决。",
    iconPath: "https://oss.gstonegames.com/data_file/clocktower/role_icon/cerenovus.png",
    inputKinds: ["none"],
    highRiskNotes: ["First-night source reminder:  让洗脑师选择一名玩家和一个善良角色。标记那名玩家疯狂。让洗脑师重新入睡。唤醒洗脑师的目标。对这名玩家展示“该角色的能力对你生效”信息标记，洗脑师角色标记，该玩家需要疯狂证明的角色标记。", "Other-night source reminder: 让洗脑师选择一名玩家和一个善良角色。标记那名玩家疯狂。让洗脑师重新入睡。唤醒洗脑师的目标。对这名玩家展示“该角色的能力对你生效”信息标记，洗脑师角色标记，该玩家需要疯狂证明的角色标记。"],
  }),
  role({
    id: "goblin",
    name: "哥布林",
    officialName: "goblin",
    team: "minion",
    abilityText: "如果你在被提名后公开声明自己是哥布林且在那个白天被处决，你的阵营获胜。",
    iconPath: "https://oss.gstonegames.com/data_file/clocktower/role_icon/goblin.png",
    inputKinds: ["none"],
    possibleOutcomes: ["Record the information or choice; storyteller confirms the final result."],
  }),
  role({
    id: "baron",
    name: "男爵",
    officialName: "baron",
    team: "minion",
    abilityText: "会有额外的外来者在场。[+2 外来者]",
    iconPath: "https://oss.gstonegames.com/data_file/clocktower/role_icon/baron.png",
    inputKinds: ["none"],
    setupImpact: ["Setup bracket text applies; storyteller confirms composition, adjacency or no-evil setup before play."],
  }),
  role({
    id: "pithag",
    name: "麻脸巫婆",
    officialName: "pit-hag",
    team: "minion",
    abilityText: "每个夜晚*，你要选择一名玩家和一个角色，如果该角色不在场，他变成该角色。如果因此创造了一个恶魔，当晚的死亡由说书人决定。",
    iconPath: "https://oss.gstonegames.com/data_file/clocktower/role_icon/pit-hag.png",
    inputKinds: ["none"],
    highRiskNotes: ["Other-night source reminder: 让麻脸巫婆选择一名玩家和一个角色。如果她选择的角色不在场：让麻脸巫婆重新入睡。唤醒她的目标玩家。对该玩家展示“你是”信息标记和他的新角色标记。"],
  }),
  role({
    id: "marionette",
    name: "提线木偶",
    officialName: "marionette",
    team: "minion",
    abilityText: "你以为你是一个善良角色，但其实你不是。恶魔会知道你是提线木偶。[提线木偶会与恶魔邻座]",
    iconPath: "https://oss.gstonegames.com/data_file/clocktower/role_icon/marionette.png",
    inputKinds: ["none"],
    setupImpact: ["Setup bracket text applies; storyteller confirms composition, adjacency or no-evil setup before play."],
    highRiskNotes: ["First-night source reminder: 选择一名邻近恶魔的善良玩家放置提线木偶标记。唤醒恶魔并告知他谁是提线木偶。"],
  }),
  role({
    id: "leviathan",
    name: "利维坦",
    officialName: "leviathan",
    team: "demon",
    abilityText: "如果多于一名善良玩家被处决，邪恶阵营获胜。所有玩家都知道利维坦在场。在第五个白天结束时，邪恶阵营获胜。",
    iconPath: "https://oss.gstonegames.com/data_file/clocktower/role_icon/leviathan.png",
    inputKinds: ["none"],
    highRiskNotes: ["Leviathan is public and changes execution/victory pressure; never auto-declare win/loss.", "First-night source reminder: 放置利维坦的第一天标记，宣告利维坦在场，现在是第一天。", "Other-night source reminder: 将利维坦的标记转换到下一天。"],
  }),
] as const satisfies readonly SmartRoleDefinition[]
