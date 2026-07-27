import type { SmartRoleDefinition } from './types'

interface LocalizedRoleCopy {
  ability: string
  prompt?: string
}

const localizedRoleCopyById: Readonly<Record<string, LocalizedRoleCopy>> = {
  chef: { ability: '首夜得知有多少对邪恶玩家相邻。' },
  investigator: { ability: '首夜得知两名玩家中有一名是某个爪牙，也可能被误导。' },
  washerwoman: { ability: '首夜得知两名玩家中有一名是某个镇民。' },
  librarian: { ability: '首夜得知两名玩家中有一名是某个外来者；若无外来者，可得知没有外来者。' },
  empath: { ability: '每晚得知自己两侧最近存活邻座中有几名邪恶玩家。' },
  fortuneteller: { ability: '每晚选择两名玩家，得知其中是否至少一名登记为恶魔；有一名红鲱鱼会干扰结果。' },
  undertaker: { ability: '每晚得知今天被处决玩家的角色。' },
  monk: { ability: '每晚选择除自己外一名玩家，保护其今晚不受恶魔影响。' },
  slayer: { ability: '白天可公开选择一名玩家；若目标是恶魔，目标死亡。每局一次。' },
  soldier: { ability: '你不受恶魔影响。' },
  ravenkeeper: { ability: '若你在夜晚死亡，当晚选择一名玩家并得知其角色。' },
  mayor: { ability: '若只剩 3 人且白天无人处决，善良胜利；若夜晚你将被杀，可能改为杀死别人。' },
  magician: {
    ability: '恶魔以为你是爪牙；爪牙以为你是恶魔。',
    prompt: '只影响开局互认信息，不改变真实身份或阵营。',
  },
  virgin: { ability: '首次被镇民提名时，提名者立刻被处决。' },
  butler: { ability: '每晚选择一名主人；白天投票时，只有主人投票时你才能投票。' },
  drunk: { ability: '你以为自己是某个镇民，但其实是酒鬼，技能不会生效。' },
  recluse: { ability: '你可能被登记为邪恶和爪牙或恶魔，即使死亡也可能如此。' },
  saint: { ability: '若你被处决，邪恶胜利。' },
  poisoner: { ability: '每晚选择一名玩家，该玩家今晚和明天白天中毒。' },
  spy: { ability: '每晚可查看魔典；你可能被登记为善良和镇民。' },
  scarletwoman: { ability: '若场上至少 5 名存活玩家且恶魔死亡，你变成恶魔。' },
  baron: { ability: '开局多加入 2 名外来者。' },
  imp: { ability: '每晚选择一名玩家死亡；若自杀，一名爪牙会变成小恶魔。' },
  thief: { ability: '每晚选择除自己外一名玩家；明天该玩家若投票，少算一票。' },
  bureaucrat: { ability: '每晚选择除自己外一名玩家；明天该玩家若投票，多算三票。' },
  gunslinger: { ability: '每天首次投票后，你可以选择是否杀死一名刚投票的玩家。' },
  beggar: { ability: '你必须公开索要投票标记；没有标记时，你的票不算。' },
  scapegoat: { ability: '若你阵营的玩家被处决，你可能代替其被处决。' },

  grandmother: { ability: '首夜得知一名善良玩家及其角色；若恶魔杀死该玩家，你也死亡。' },
  sailor: { ability: '每晚选择一名存活玩家；你和目标之一醉酒到黄昏。你不会死亡。' },
  chambermaid: { ability: '每晚选择除自己外两名存活玩家，得知其中几人因自身能力醒来。' },
  innkeeper: { ability: '每晚选择两名玩家，他们今晚不受恶魔影响，但其中一人醉酒到黄昏。' },
  gambler: {
    ability: '每晚选择一名玩家并猜测其角色；猜错则你死亡。',
    prompt: '记录目标和猜测角色；由说书人核对是否猜错，确认后再处理死亡。',
  },
  exorcist: { ability: '每晚选择一名玩家；若选中恶魔，恶魔不知道你且今晚不能行动。' },
  gossip: { ability: '每天可发表公开流言；若流言为真，夜晚有一名玩家死亡。' },
  courtier: { ability: '每局一次，夜晚选择一个角色，该角色醉酒 3 晚 3 天。' },
  professor: { ability: '每局一次，夜晚选择一名死亡玩家；若其是镇民，目标复活。' },
  minstrel: { ability: '爪牙被处决后，所有其他玩家醉酒到明天黄昏。' },
  tealady: { ability: '你的两侧存活邻座若是善良，他们不能死亡。' },
  fool: { ability: '首次将死亡时，你不会死亡。' },
  pacifist: { ability: '被处决的善良玩家可能不会死亡。' },
  goon: { ability: '首个夜晚选择你的玩家醉酒到黄昏；你变成其阵营。' },
  lycanthrope: {
    ability: '每晚选择一名存活玩家；若目标善良，目标死亡且恶魔今晚不杀人。有一名善良玩家会登记为邪恶。',
    prompt: '记录目标；是否善良、是否死亡和恶魔是否停刀都由说书人确认。',
  },
  lunatic: { ability: '你以为自己是恶魔，但其实不是；真正恶魔知道你是谁以及你选择了谁。' },
  puzzlemaster: {
    ability: '有 1 名玩家醉酒，即使你死亡也持续；你可每局一次猜谁醉酒，猜对得知恶魔，猜错得假信息。',
    prompt: '记录醉酒目标和猜测；是否猜对、给出恶魔或假信息由说书人确认。',
  },
  snitch: {
    ability: '每个爪牙都会得到 3 个恶魔伪装。',
    prompt: '伪装要按爪牙分别记录，不等同于普通恶魔 3 个伪装。',
  },
  widow: {
    ability: '首夜查看魔典并选择一名玩家中毒；一名善良玩家会得知寡妇在场。',
    prompt: '记录中毒目标和被告知的善良玩家；不自动选择目标或隐藏改状态。',
  },
  goblin: {
    ability: '被提名时若公开声明自己是哥布林，并在当天被处决，邪恶胜利。',
    prompt: '记录声明和处决结果；胜负必须由说书人确认。',
  },
  tinker: { ability: '你可能随时死亡。' },
  moonchild: { ability: '死亡后当晚选择一名存活玩家；若其善良，目标死亡。' },
  godfather: { ability: '你知道有哪些外来者在场；若外来者白天死亡，今晚多杀一人；开局可能增减外来者。' },
  devilsadvocate: { ability: '每晚选择一名存活玩家；若其明天被处决，不会死亡。' },
  assassin: { ability: '每局一次，夜晚选择一名玩家死亡，即使目标通常不会死亡。' },
  marionette: {
    ability: '你以为自己是善良角色，但其实不是；恶魔知道你是谁，且你与恶魔相邻。',
    prompt: '配板时核对座位相邻；身份错认只做提醒，不自动重排座位。',
  },
  xaan: {
    ability: '外来者数量为 X；第 X 夜所有镇民中毒到黄昏。',
    prompt: 'X 按当前外来者数量核对；中毒范围只做提醒，不批量自动改状态。',
  },
  boffin: {
    ability: '恶魔拥有一个不在场善良角色的能力；恶魔和博芬都知道该能力。',
    prompt: '记录恶魔获得的能力；不自动执行该善良角色的结算逻辑。',
  },
  mastermind: { ability: '若恶魔因处决死亡且剩余至少 5 名玩家，游戏继续一天；若善良再次处决，邪恶胜利。' },
  pukka: { ability: '每晚选择一名玩家中毒；前一名被你中毒的玩家死亡后恢复健康。' },
  shabaloth: { ability: '每晚选择两名玩家死亡；你可能复活被你杀死的玩家。' },
  po: { ability: '每晚可选择不杀；若上一晚不杀，今晚选择三名玩家死亡。' },
  zombuul: { ability: '每晚若当天无人死亡，选择一名玩家死亡；首次死亡后仍存活但登记为死亡。' },
  matron: { ability: '每天可让两名玩家换座；除非你允许，玩家不能离开座位。' },
  judge: { ability: '每局一次，玩家被提名时可决定该次提名是否直接通过处决。' },
  apprentice: { ability: '首夜获得一名不在场镇民或爪牙的能力，阵营由说书人决定。' },
  bishop: { ability: '只有说书人能提名，且每天至少提名一名自己阵营的玩家。' },
  voudon: { ability: '只有死亡玩家可投票；善良玩家不知道自己阵营。' },

  clockmaker: { ability: '首夜得知恶魔到最近爪牙之间相隔几步。' },
  noble: {
    ability: '首夜得知 3 名玩家，其中有且只有 1 名邪恶玩家。',
    prompt: '记录 3 名玩家；可包含误导来源，但不要自动判断真实邪恶。',
  },
  shugenja: {
    ability: '首夜得知最近的邪恶玩家在顺时针或逆时针方向；若距离相等，信息由说书人裁量。',
    prompt: '记录给出的方向；等距时不要让工具自动判断。',
  },
  pixie: {
    ability: '首夜得知一个在场镇民；若你疯狂证明自己是该角色，且该角色死亡，你获得其能力。',
    prompt: '记录得知的在场镇民；是否保持疯狂和是否获得能力由说书人确认。',
  },
  preacher: {
    ability: '每夜选择一名玩家；若目标是爪牙，目标得知此事，且所有被选中过的爪牙失去能力。',
    prompt: '只在目标实际是爪牙时告知；失去能力只写成待确认状态。',
  },
  snakecharmer: {
    ability: '每晚选择一名存活玩家；若选中恶魔，与其交换角色和阵营，新舞蛇人中毒。',
    prompt: '若发生交换，记录双方新身份、新阵营和新舞蛇人中毒；当晚新身份立即生效，但新技能通常下个夜晚才使用。',
  },
  mathematician: { ability: '每晚得知上个白天以来有多少玩家的能力异常生效。' },
  dreamer: { ability: '每晚选择除自己外一名玩家，得知其可能是一个善良角色或一个邪恶角色。' },
  flowergirl: { ability: '每晚得知今天恶魔是否投票。' },
  towncrier: { ability: '每晚得知今天爪牙是否提名。' },
  oracle: { ability: '每晚得知有多少名死亡玩家是邪恶。' },
  savant: { ability: '每天私下得知两条信息：一真一假。' },
  alsaahir: {
    ability: '每天可公开猜测哪些玩家是爪牙、哪些玩家是恶魔；若完整猜中，善良胜利。',
    prompt: '记录公开猜测名单；是否完整命中和是否胜利都由说书人确认。',
  },
  seamstress: { ability: '每局一次，夜晚选择两名玩家，得知他们是否同阵营。' },
  philosopher: { ability: '每局一次，夜晚选择一个善良角色并获得其能力；若该角色在场，其醉酒。' },
  princess: {
    ability: '首日如果你提名并处决一名玩家，恶魔今晚不杀人。',
    prompt: '核对首日提名人和处决结果；是否停刀由说书人确认。',
  },
  alchemist: {
    ability: '你拥有一个爪牙能力；使用时说书人可以要求你重新选择。',
    prompt: '记录开局获得的爪牙能力；只提示对应能力，不自动执行爪牙结算。',
  },
  artist: { ability: '每局一次，白天私下问说书人一个是/否问题并得到答案。' },
  huntsman: {
    ability: '每局一次，夜晚选择一名存活玩家；若选中落难少女，目标变成一个不在场镇民。开局加入落难少女。',
    prompt: '记录目标和新镇民身份；救援成功后由说书人确认并追加身份更正。',
  },
  juggler: { ability: '首日白天公开猜若干玩家的角色；当晚得知猜对数量。' },
  sage: { ability: '若恶魔杀死你，当晚得知两名玩家中有一名是恶魔。' },
  sweetheart: { ability: '你死亡后，一名玩家醉酒。' },
  klutz: { ability: '当你得知自己死亡时，公开选择一名存活玩家；若其邪恶，善良失败。' },
  barber: { ability: '你死亡后，恶魔可选择两名玩家交换角色。' },
  mutant: { ability: '若你疯狂地表现出自己是外来者，可能被处决。' },
  witch: { ability: '每晚选择一名玩家；若其明天提名，立即死亡。剩 5 人时能力失效。' },
  cerenovus: {
    ability: '每晚选择一名玩家和一个善良角色；其明天必须疯狂证明自己是该角色，否则可能被处决。',
    prompt: '记录目标和疯狂角色；告知时强调“你被洗脑成了该角色，需要疯狂证明自己”。',
  },
  pithag: { ability: '每晚选择一名玩家和一个角色；若该角色不在场，目标变成该角色。' },
  eviltwin: { ability: '你和一名善良玩家互相知道对方；若善良双子被处决，邪恶胜利。' },
  nodashii: { ability: '两侧最近的镇民中毒。' },
  vigormortis: { ability: '每晚选择一名玩家死亡；你杀死的爪牙保留能力，且相邻两名镇民中毒。' },
  vortox: { ability: '镇民能力得到的信息全为假；若白天无人处决，邪恶胜利。' },
  riot: {
    ability: '第 3 天爪牙变成暴乱；被提名者死亡，并必须立即提名一名存活玩家。',
    prompt: '白天投票链和胜负都由说书人确认；工具只记录和提醒。',
  },
  fanggu: { ability: '每晚选择一名玩家死亡；第一次杀死外来者时，该外来者变成方古而你死亡；开局多一名外来者。' },
  lleech: {
    ability: '每晚选择一名玩家死亡；开局选择一名玩家中毒。只有宿主死亡时，你才会死亡。',
    prompt: '记录宿主、中毒和死亡判定；不要自动处理宿主保护或恶魔死亡。',
  },
  legion: {
    ability: '每晚可能有玩家死亡；若只有邪恶玩家投票，处决失败。你也登记为爪牙；多数玩家是军团。',
    prompt: '当前只做提醒，不自动生成多名军团、不自动判定处决失败或胜负。',
  },
  steward: { ability: '首夜得知一名善良玩家。' },
  balloonist: {
    ability: '每晚得知一名与上一晚不同角色类型的玩家；开局可增加 0 或 1 名外来者。',
    prompt: '记录每晚告知的玩家和其角色类型；是否增加外来者由模板和说书人确认。',
  },
  knight: { ability: '首夜得知两名不是恶魔的玩家。' },
  highpriestess: {
    ability: '每晚得知说书人认为你最应该交流的一名玩家。',
    prompt: '由说书人选择最值得交流的玩家；这是建议型信息，不自动推导。',
  },
  villageidiot: {
    ability: '每晚选择一名玩家并得知其阵营；可能有额外村夫，其中一名额外村夫醉酒。',
    prompt: '记录目标和阵营信息；多个村夫逐个处理，醉酒村夫只由说书人确认。',
  },
  amnesiac: {
    ability: '你不知道自己的能力；每天私下猜测能力，并得知猜测有多接近。',
    prompt: '先记录说书人设定的能力和玩家猜测；AI 只能整理提示，不能发明权威能力。',
  },
  fisherman: {
    ability: '每局一次，白天私下向说书人获取一条帮助己方获胜的建议。',
    prompt: '记录建议文案；不要直接泄露完整魔典或把 AI 文案当权威。',
  },
  farmer: {
    ability: '若你在夜晚死亡，一名存活善良玩家变成农夫。',
    prompt: '确认夜晚死亡后，由说书人选择新农夫并追加身份更正。',
  },
  cannibal: {
    ability: '你拥有最近被处决者的能力；若该被处决者邪恶，你中毒直到善良玩家被处决死亡。',
    prompt: '先核对最近被处决者和阵营；借用能力只做提醒，不自动结算。',
  },
  ogre: {
    ability: '首夜选择除自己外一名玩家；你变成其阵营且自己不知道，即使醉酒或中毒也会发生。',
    prompt: '记录选择目标；阵营变化由说书人确认后追加，不告知玩家结果。',
  },
  harpy: {
    ability: '每晚选择两名玩家；明天第一名玩家必须疯狂证明第二名玩家邪恶，否则一方或双方可能死亡。',
    prompt: '记录两名目标和疯狂要求；死亡后果由说书人确认。',
  },
  mezepheles: {
    ability: '首夜得知一个暗号；首个说出暗号的善良玩家会在当晚变邪恶。',
    prompt: '记录暗号和触发玩家；额外邪恶受象牙之灵限制，变阵营需说书人确认。',
  },
  kazali: {
    ability: '首夜指定哪些玩家成为哪些爪牙，并可修正外来者；之后每晚选择一名玩家死亡。',
    prompt: '首夜爪牙指定和外来者修正必须人工确认；不要自动改身份或杀人。',
  },
  ojo: {
    ability: '每晚选择一个角色；若该角色在场，该角色玩家死亡，否则由说书人选择谁死亡。',
    prompt: '记录选择角色；是否在场和死亡目标都由说书人确认。',
  },

  general: {
    ability: '每夜得知说书人认为当前哪一方领先：善良、邪恶或无优势。',
    prompt: '这是说书人判断信息；先记录给出的阵营，不要由工具根据局面自动计算。',
  },
  nightwatchman: {
    ability: '每局一次，夜晚选择一名玩家；该玩家得知你是守夜人。',
    prompt: '记录目标，并只向该目标展示守夜人信息。',
  },
  damsel: {
    ability: '所有爪牙知道落难少女在场；若爪牙公开猜中你一次，善良阵营失败。',
    prompt: '记录爪牙是否公开猜测；猜中与胜负必须由说书人确认。',
  },
  golem: {
    ability: '每局只能提名一次；提名时若被提名者不是恶魔，被提名者死亡。',
    prompt: '记录唯一一次提名；是否死亡由说书人确认。',
  },
  psychopath: {
    ability: '每天提名前可公开选择一名玩家死亡；被处决时只有猜拳输掉才死亡。',
    prompt: '记录公开选择和猜拳结果；死亡必须由说书人确认。',
  },
  vizier: {
    ability: '全场知道你是维齐尔；你白天不会死亡；若善良投票，你可选择立即处决。',
    prompt: '公开身份、立即处决和白天不死亡都只做提醒，不自动执行。',
  },
  politician: {
    ability: '如果你是最应为本阵营失败负责的玩家，你改变阵营并获胜，即使已死亡。',
    prompt: '这是赛后裁量；不要在对局中自动改变阵营。',
  },
  summoner: {
    ability: '开局无恶魔，你得到 3 个伪装；第 3 夜选择一名玩家，使其成为你指定的邪恶恶魔。',
    prompt: '第 3 夜只生成待确认身份/阵营更正；说书人确认后再写入。',
  },
  yaggababble: {
    ability: '开局得知一个暗号；当天每公开说出一次暗号，可能有一名玩家死亡。',
    prompt: '记录暗号和公开次数；死亡目标由说书人确认，不能自动根据聊天判断。',
  },
  spiritofivory: {
    ability: '全局限制：额外邪恶玩家不能超过一名。',
    prompt: '这是传奇角色约束，不进入座位身份，也不作为恶魔伪装。',
  },
  barista: { ability: '每晚选择一名玩家；其能力明天可能重复触发，或变得清醒健康并获得真实信息。' },
  harlot: { ability: '每晚选择一名存活玩家；若其同意，你得知其角色；若其邪恶，你们都可能死亡。' },
  butcher: { ability: '每天一次，处决后你可允许再次提名。' },
  bonecollector: { ability: '每局一次，夜晚选择一名死亡玩家；其今晚重新获得能力。' },
  deviant: { ability: '如果你很有趣，可能随时被处决。' },
}

export function localizedRoleAbility(role: SmartRoleDefinition) {
  return localizedRoleCopyById[role.id]?.ability ?? role.abilityText
}

export function localizedRolePrompt(role: SmartRoleDefinition) {
  return localizedRoleCopyById[role.id]?.prompt ?? promptFromRole(role)
}

function promptFromRole(role: SmartRoleDefinition) {
  if (role.inputKinds.includes('players') && role.inputKinds.includes('role')) {
    return '记录多个目标和角色判断；说书人核对后再确认结果。'
  }
  if (role.inputKinds.includes('player') && role.inputKinds.includes('role')) {
    return '记录目标和角色；说书人核对后再确认结果。'
  }
  if (role.inputKinds.includes('players')) return '记录多个目标；先核对毒醉、死亡和保护，再确认结果。'
  if (role.inputKinds.includes('player')) return '记录目标选择；先核对当前状态，再确认结果。'
  if (role.inputKinds.includes('role')) return '记录角色选择；先核对是否在场和是否需要改身份，再确认。'
  if (role.inputKinds.includes('number')) return '记录说书人给出的数字信息；必要时可在日志里补充更正。'
  return role.research?.highRiskNotes[0] ?? '核对该角色是否需要本晚处理；只记录，不自动结算。'
}
