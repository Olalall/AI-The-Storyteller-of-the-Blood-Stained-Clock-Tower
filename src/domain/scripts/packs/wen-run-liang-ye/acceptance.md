# 温润良夜：第四批共享角色薄包

状态：来源、当前规则与模板结构已核对；整批验收与发布状态见本批发布记录，不代表所有组合或平衡性均已实测。

- 作者：温谏；用户指定社区资料库索引628，原文件 `温润良夜.json`。
- [原资料库](https://kkovo550.github.io/clocktower-wiki/script_lib/%E5%89%A7%E6%9C%AC%E5%BA%93.html)；build `16ad8f7c270dfc011aeb9fc412950304b68293fc5269c882c32b2e037fc5073e`；原文18542字节，SHA256 `70707cc970d66701a00729b3ac05ccdb420dce5ba3ff6f197b67c6e1750a5644`。本轮重新取得全库资源与缓存哈希一致。
- [当前官方角色](https://release.botc.app/resources/data/roles.json)与[夜表](https://release.botc.app/resources/data/nightsheet.json)本轮重新获取，哈希记录于source-lock；只读取JSON，不执行来源JS。
- 27个角色均复用固定sourceId/sourceVersion和完整定义指纹，不新增角色事实或技能分支。首夜/其他夜显式过滤已核官方表；自制旅行者保持独立资料和人工处理。
- 22套7–15人模板按3/2/2/3/2/3/2/2/3分配，全部角色构成不同；3个不同不在场善良伪装。原模板整套角色加原伪装复用为0，统一私有旧轮换/人数修正配方补22；已通过真实composition/templateRoleSelection及候选/evaluate九档守门。

## 原文与当前规则

- 帽匠固定复用当前英文能力来源wu-he-you-zhi-xiang；原简写死亡文本按今天或当晚死亡、可拒绝、同类型和不重复的当前规则解释。
- thegoerbutton完整原文与li-beng-le-huai的li_beng_wang_sheng_zhe逐字一致，保留自制旅行者而不映射成官方角色，不放入常规席位或伪装。

## 原ID与角色来源

| 原ID | 原显示名 | 稳定ID | 类型 | 固定来源 |
|---|---|---|---|---|
| `shugenjabutton` | 修行者 | `shugenja` | townsfolk | `hua-wai-zhi-min` |
| `noblebutton` | 贵族 | `noble` | townsfolk | `ao-fa-ji-hui` |
| `1_12` | 猎手 | `slayer` | townsfolk | `everyone-can-play` |
| `dreamerbutton` | 筑梦师 | `dreamer` | townsfolk | `hua-wai-zhi-min` |
| `snake_charmerbutton` | 舞蛇人 | `snakecharmer` | townsfolk | `pa-xing-du-shi` |
| `fortune_tellerbutton` | 占卜师 | `fortuneteller` | townsfolk | `ao-fa-ji-hui` |
| `oraclebutton` | 神谕者 | `oracle` | townsfolk | `ao-fa-ji-hui` |
| `town_crierbutton` | 城镇公告员 | `towncrier` | townsfolk | `ao-fa-ji-hui` |
| `philosopherbutton` | 哲学家 | `philosopher` | townsfolk | `bao-zou-ge-bu-lin` |
| `farmerbutton` | 农夫 | `farmer` | townsfolk | `devout-theists` |
| `artistbutton` | 艺术家 | `artist` | townsfolk | `church-of-spies` |
| `savantbutton` | 博学者 | `savant` | townsfolk | `ao-fa-ji-hui` |
| `jugglerbutton` | 杂耍艺人 | `juggler` | townsfolk | `bao-zou-ge-bu-lin` |
| `drunkbutton` | 酒鬼 | `drunk` | outsider | `ao-fa-ji-hui` |
| `mutantbutton` | 畸形秀演员 | `mutant` | outsider | `church-of-spies` |
| `reclusebutton` | 陌客 | `recluse` | outsider | `ao-fa-ji-hui` |
| `marionettebutton` | 提线木偶 | `marionette` | minion | `church-of-spies` |
| `hatterbutton` | 帽匠 | `hatter` | outsider | `wu-he-you-zhi-xiang` |
| `cerenovusbutton` | 洗脑师 | `cerenovus` | minion | `bao-zou-ge-bu-lin` |
| `scarlet_womanbutton` | 红唇女郎 | `scarletwoman` | minion | `church-of-spies` |
| `widowbutton` | 寡妇 | `widow` | minion | `bao-zou-ge-bu-lin` |
| `no_dashiibutton` | 诺-达鲺 | `nodashii` | demon | `church-of-spies` |
| `vortoxbutton` | 涡流 | `vortox` | demon | `bao-zou-ge-bu-lin` |
| `impbutton` | 小恶魔 | `imp` | demon | `ao-fa-ji-hui` |
| `fang_gubutton` | 方古 | `fanggu` | demon | `bao-zou-ge-bu-lin` |
| `djinnbutton` | 灯神 | `djinn` | fabled | `bao-meng-mi-tuan` |
| `thegoerbutton` | 往生者 | `li_beng_wang_sheng_zhe` | traveler | `li-beng-le-huai` |

## 现场必须核对

- 仅生成主持候选；身份、阵营、生死、毒醉、投票和胜负由说书人确认。角色变化、额外能力与死亡触发按本局事实另行记录。 [来源](https://wiki.bloodontheclocktower.com/Abilities)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21234_32853.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20705_14196.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21007_69642.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20705_14196.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21050_74806.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20950_46806.json)
- 每个夜晚*，你会得知有多少名死亡的玩家是邪恶的。 [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20947_46831.json)
- Nomination history and registration are checked by ST. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20001_77217.json)
- May drunk an existing holder of the selected good role. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21007_69642.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21234_32853.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20946_46814.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21007_69642.json)
- Day claims and night number are manual records. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20754_59933.json)
- Drunk: needs a Townsfolk cover identity; the player does not know they are the Drunk. [来源](https://release.botc.app/resources/data/roles.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20705_14196.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20705_14196.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21007_69642.json)
- AI may suggest this result, but ST confirms authority state before saving changes. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20722_51832.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20950_46806.json)
- 每个夜晚*，你要选择一名玩家：他死亡。与你邻近的两名镇民中毒。 [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20947_46831.json)
- Vortox can make evil win if no one is executed during the day; exiling a Traveller does not count as an execution; the tool only reminds. [来源](https://release.botc.app/resources/data/roles.json) [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21087_69602.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20950_46806.json)
- 方古在场增加1外来者并减少1镇民；首次成功转变须分别确认新身份和原方古死亡，仅有候选不算成功。 [来源](https://wiki.bloodontheclocktower.com/Fang_Gu)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20950_46806.json)
- 真实木偶是邪恶爪牙且须邻座恶魔；对外善良身份另由主持私下确认。不能因邪恶互认、告密者、传教士或帽匠通知把木偶真实身份告知本人。若假装气球驾驶员，按公开相克另核开局外来者；普通模板建议使用其他不在场镇民作掩护。 [来源](https://wiki.bloodontheclocktower.com/Marionette)
- 按当前版，今天或当晚有效死亡才触发；原爪牙和恶魔可拒绝或选择本板同类型新角色，不改变阵营且最终不得重复。先死亡后变帽匠不触发；木偶不因茶会被叫醒揭真身份。新能力与当夜时点由主持核对，恶魔已攻击不能换角后重复攻击。 [来源](https://wiki.bloodontheclocktower.com/Hatter) [来源](https://wiki.bloodontheclocktower.com/Marionette)
- 往生者是原文已存在的自制旅行者：能力全文与礼崩乐坏的已入库定义逐字相同，固定复用该来源版本；不套用官方角色或官方自动夜序。其死亡、无初始阵营、每日私下信息与复原魔典的胜方条件由主持按原文记录；不进入7–15常规席位及伪装，不自动执行。 [来源](https://kkovo550.github.io/clocktower-wiki/script_lib/%E5%89%A7%E6%9C%AC%E5%BA%93.html)

首夜：`philosopher, marionette, widow, snakecharmer, cerenovus, fortuneteller, dreamer, noble, shugenja`。

其他夜：`philosopher, snakecharmer, cerenovus, scarletwoman, imp, fanggu, nodashii, vortox, hatter, farmer, fortuneteller, dreamer, towncrier, oracle, juggler`。

## 当前官方相克核对

- [官方相克表](https://release.botc.app/resources/data/jinxes.json)，本轮JSON快照SHA256 `5d3d8d0ac194fb1ea44af79b74f9e4bdc09712aef2123c3a3ef2b6c43efa7df7`。原文与既有角色库不覆盖，以此逐条补主持提醒。
- 红唇女郎与方古同时在场时，若某次结算会出现两名恶魔且其中一名来自红唇女郎，红唇女郎保留原角色。方古转变、原方古死亡与红唇女郎条件须逐条核对并由主持明确确认，不能额外自动生成第二名恶魔。（`scarletwoman-fanggu-jinx`）

本包仅供新开局。现有对局的配板、角色快照、夜序、已确认结果和更正链不迁移或覆盖；死亡、毒醉、身份、阵营、投票与胜负仍须主持确认。未调用付费AI，未改生产或注册表。
