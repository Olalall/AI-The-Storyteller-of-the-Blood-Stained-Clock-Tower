# 全球惊悚：第四批共享角色薄包

状态：来源、当前规则与模板结构已核对；整批验收与发布状态见本批发布记录，不代表所有组合或平衡性均已实测。

- 作者：Ben Burns；用户指定社区资料库索引511，原文件 `全球惊悚.json`。
- [原资料库](https://kkovo550.github.io/clocktower-wiki/script_lib/%E5%89%A7%E6%9C%AC%E5%BA%93.html)；build `16ad8f7c270dfc011aeb9fc412950304b68293fc5269c882c32b2e037fc5073e`；原文16453字节，SHA256 `6d4630e148f22ae7da8c05abb12433acb6201615b310d30957e04499c435435f`。本轮重新取得全库资源与缓存哈希一致。
- [当前官方角色](https://release.botc.app/resources/data/roles.json)与[夜表](https://release.botc.app/resources/data/nightsheet.json)本轮重新获取，哈希记录于source-lock；只读取JSON，不执行来源JS。
- 25个角色均复用固定sourceId/sourceVersion和完整定义指纹，不新增角色事实或技能分支。首夜/其他夜显式过滤已核官方表。
- 22套7–15人模板按3/2/2/3/2/3/2/2/3分配，全部角色构成不同；3个不同不在场善良伪装。原模板整套角色加原伪装复用为0，统一私有旧轮换/人数修正配方补22；已通过真实composition/templateRoleSelection及候选/evaluate九档守门。

## 原文与当前规则

- 原暴乱为所有爪牙开局即暴乱的旧版；明确采用当前第3天爪牙才变暴乱和强制提名链，普通模板保留标准爪牙构成。
- 原气球驾驶员为四类型轮询且固定+1外来者；采用当前仅比较上一夜且+0或+1的版本。
- 利维坦固定引用guo-jie-xin-yang的同义中文定义；以当前官方第2名善良玩家被处决及第5天结束为条件，不生成常规夜杀。

## 原ID与角色来源

| 原ID | 原显示名 | 稳定ID | 类型 | 固定来源 |
|---|---|---|---|---|
| `village_idiotbutton` | 村夫 | `villageidiot` | townsfolk | `a-grimm-chorus` |
| `chefbutton` | 厨师 | `chef` | townsfolk | `feng-mao-zhi-yan` |
| `shugenjabutton` | 修行者 | `shugenja` | townsfolk | `hua-wai-zhi-min` |
| `high_priestessbutton` | 女祭司 | `highpriestess` | townsfolk | `church-of-spies` |
| `generalbutton` | 将军 | `general` | townsfolk | `da-cheng-xiao-zhen` |
| `preacherbutton` | 传教士 | `preacher` | townsfolk | `hide-and-seek` |
| `balloonistbutton` | 气球驾驶员 | `balloonist` | townsfolk | `bao-zou-ge-bu-lin` |
| `philosopherbutton` | 哲学家 | `philosopher` | townsfolk | `bao-zou-ge-bu-lin` |
| `nightwatchmanbutton` | 守夜人 | `nightwatchman` | townsfolk | `church-of-spies` |
| `fishermanbutton` | 渔夫 | `fisherman` | townsfolk | `ao-fa-ji-hui` |
| `savantbutton` | 博学者 | `savant` | townsfolk | `ao-fa-ji-hui` |
| `jugglerbutton` | 杂耍艺人 | `juggler` | townsfolk | `bao-zou-ge-bu-lin` |
| `amnesiacbutton` | 失忆者 | `amnesiac` | townsfolk | `devout-theists` |
| `politicianbutton` | 政客 | `politician` | outsider | `da-cheng-xiao-zhen` |
| `snitchbutton` | 告密者 | `snitch` | outsider | `devout-theists` |
| `klutzbutton` | 呆瓜 | `klutz` | outsider | `church-of-spies` |
| `puzzlemasterbutton` | 解谜大师 | `puzzlemaster` | outsider | `devout-theists` |
| `widowbutton` | 寡妇 | `widow` | minion | `bao-zou-ge-bu-lin` |
| `godfatherbutton` | 教父 | `godfather` | minion | `ao-fa-ji-hui` |
| `harpybutton` | 鹰身女妖 | `harpy` | minion | `feng-mao-zhi-yan` |
| `marionettebutton` | 提线木偶 | `marionette` | minion | `church-of-spies` |
| `poisonerbutton` | 投毒者 | `poisoner` | minion | `ao-fa-ji-hui` |
| `riotbutton` | 暴乱 | `riot` | demon | `quick-maths` |
| `leviathanbutton` | 利维坦 | `leviathan` | demon | `guo-jie-xin-yang` |
| `djinnbutton` | 灯神 | `djinn` | fabled | `bao-meng-mi-tuan` |

## 现场必须核对

- 仅生成主持候选；身份、阵营、生死、毒醉、投票和胜负由说书人确认。角色变化、额外能力与死亡触发按本局事实另行记录。 [来源](https://wiki.bloodontheclocktower.com/Abilities)
- 在你的首个夜晚，你会得知场上邻座的邪恶玩家有多少对。 [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20947_46831.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21234_32853.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21007_69642.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20950_46806.json)
- 传教士命中爪牙时，该爪牙得知自己失去能力；工具不自动禁用角色。 [来源](https://release.botc.app/resources/data/roles.json) [来源](https://www.botcscripts.com/script/2128/1.2.0/download)
- 按当前官方版，气球驾驶员可选择增加0或1外来者；每夜信息与上一夜角色类型比较，不使用旧四类型版本。 [来源](https://wiki.bloodontheclocktower.com/Balloonist)
- May drunk an existing holder of the selected good role. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21007_69642.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21229_95005.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21050_74806.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21007_69642.json)
- Day claims and night number are manual records. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20754_59933.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21007_69642.json)
- AI may suggest this result, but ST confirms authority state before saving changes. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20722_51832.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20705_14196.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20705_14196.json)
- 一名玩家醉酒，即使你已死亡。每局游戏限一次，你可以猜测谁是那个醉酒的玩家，如果猜对了，你会得知谁是恶魔，但如果猜错了，你会得知错误的“谁是恶魔”信息。 [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21219_64086.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20950_46806.json)
- 教父开局明确选择增加或减少1外来者，对应替换镇民；白天外来者死亡后的夜杀仍由主持核对。 [来源](https://wiki.bloodontheclocktower.com/Godfather)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21007_69642.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20950_46806.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20950_46806.json)
- 可以用额外村夫替换0至2名镇民；仅1名村夫时不因自身设置醉酒，多名时由主持标记1名额外村夫醉酒。本批普通模板仅用单实例，不自动复制或加醉。 [来源](https://wiki.bloodontheclocktower.com/Village_Idiot)
- 真实木偶是邪恶爪牙且须邻座恶魔；对外善良身份另由主持私下确认。不能因邪恶互认、告密者、传教士或帽匠通知把木偶真实身份告知本人。若假装气球驾驶员，按公开相克另核开局外来者；普通模板建议使用其他不在场镇民作掩护。 [来源](https://wiki.bloodontheclocktower.com/Marionette)
- 采用当前暴乱：普通人数和爪牙开局，第3天由主持确认爪牙变成暴乱与连续提名死亡，不沿用原文所有爪牙开局即暴乱。第3天被提名后须立刻提名存活者，未提名由主持接续；全部暴乱死与仅2人生还的先后另核，普通投票/处决不得代替提名死亡。 [来源](https://wiki.bloodontheclocktower.com/Riot)
- 利维坦在场须公开告知；自身没有常规夜杀。第2名善良玩家被处决即可触发，即使处决未死亡也计；以处决当时阵营核对。第5天结束仍存活时核对邪恶胜利，不能按普通恶魔夜杀或第5天开始处理；胜负由主持明确确认。 [来源](https://wiki.bloodontheclocktower.com/Leviathan)

首夜：`philosopher, snitch, marionette, preacher, poisoner, widow, godfather, harpy, amnesiac, chef, balloonist, shugenja, villageidiot, nightwatchman, highpriestess, general, leviathan`。

其他夜：`philosopher, preacher, poisoner, harpy, godfather, amnesiac, juggler, balloonist, villageidiot, nightwatchman, highpriestess, general, riot, leviathan`。

## 当前官方相克核对

- [官方相克表](https://release.botc.app/resources/data/jinxes.json)，本轮JSON快照SHA256 `5d3d8d0ac194fb1ea44af79b74f9e4bdc09712aef2123c3a3ef2b6c43efa7df7`。原文与既有角色库不覆盖，以此逐条补主持提醒。
- 若木偶以为自己是气球驾驶员，开局可能额外加入一名外来者。此项需主持明确核对实际开局和假身份，不因木偶与气球角色同时在板上就自动加人；本批普通模板不预设此假身份，新增或更换掩护身份时另核，保持木偶身份私密。（`marionette-balloonist-jinx`）

本包仅供新开局。现有对局的配板、角色快照、夜序、已确认结果和更正链不迁移或覆盖；死亡、毒醉、身份、阵营、投票与胜负仍须主持确认。未调用付费AI，未改生产或注册表。
