# 身不由己：第四批共享角色薄包

状态：来源、当前规则与模板结构已核对；整批验收与发布状态见本批发布记录，不代表所有组合或平衡性均已实测。

- 作者：Luxray & Sabenite；用户指定社区资料库索引562，原文件 `身不由己.json`。
- [原资料库](https://kkovo550.github.io/clocktower-wiki/script_lib/%E5%89%A7%E6%9C%AC%E5%BA%93.html)；build `16ad8f7c270dfc011aeb9fc412950304b68293fc5269c882c32b2e037fc5073e`；原文15915字节，SHA256 `052a01a8d2a7c6270b45ee7c068da272dfebfc569823d3059ad9ef4b7bea2dc6`。本轮重新取得全库资源与缓存哈希一致。
- [当前官方角色](https://release.botc.app/resources/data/roles.json)与[夜表](https://release.botc.app/resources/data/nightsheet.json)本轮重新获取，哈希记录于source-lock；只读取JSON，不执行来源JS。
- 24个角色均复用固定sourceId/sourceVersion和完整定义指纹，不新增角色事实或技能分支。首夜/其他夜显式过滤已核官方表。
- 22套7–15人模板按3/2/2/3/2/3/2/2/3分配，全部角色构成不同；3个不同不在场善良伪装。原模板整套角色加原伪装复用为0，统一私有旧轮换/人数修正配方补22；已通过真实composition/templateRoleSelection及候选/evaluate九档守门。

## 原文与当前规则

- 原炸弹人一分钟阶段明确适配为当前10到1倒数，固定复用insanity-and-intuition当前英文定义。处决不等于死亡，指认不等于普通投票。

## 原ID与角色来源

| 原ID | 原显示名 | 稳定ID | 类型 | 固定来源 |
|---|---|---|---|---|
| `knightbutton` | 骑士 | `knight` | townsfolk | `insanity-and-intuition` |
| `shugenjabutton` | 修行者 | `shugenja` | townsfolk | `hua-wai-zhi-min` |
| `fortune_tellerbutton` | 占卜师 | `fortuneteller` | townsfolk | `ao-fa-ji-hui` |
| `high_priestessbutton` | 女祭司 | `highpriestess` | townsfolk | `church-of-spies` |
| `mathematicianbutton` | 数学家 | `mathematician` | townsfolk | `sects-and-violets` |
| `monkbutton` | 僧侣 | `monk` | townsfolk | `church-of-spies` |
| `oraclebutton` | 神谕者 | `oracle` | townsfolk | `ao-fa-ji-hui` |
| `savantbutton` | 博学者 | `savant` | townsfolk | `ao-fa-ji-hui` |
| `artistbutton` | 艺术家 | `artist` | townsfolk | `church-of-spies` |
| `seamstressbutton` | 女裁缝 | `seamstress` | townsfolk | `bao-zou-ge-bu-lin` |
| `farmerbutton` | 农夫 | `farmer` | townsfolk | `devout-theists` |
| `mayorbutton` | 镇长 | `mayor` | townsfolk | `da-cheng-xiao-zhen` |
| `barberbutton` | 理发师 | `barber` | outsider | `jiu-ri-shu-shi` |
| `drunkbutton` | 酒鬼 | `drunk` | outsider | `ao-fa-ji-hui` |
| `reclusebutton` | 陌客 | `recluse` | outsider | `ao-fa-ji-hui` |
| `saintbutton` | 圣徒 | `saint` | outsider | `church-of-spies` |
| `scarlet_womanbutton` | 红唇女郎 | `scarletwoman` | minion | `church-of-spies` |
| `spybutton` | 间谍 | `spy` | minion | `church-of-spies` |
| `boomdandybutton` | 炸弹人 | `boomdandy` | minion | `insanity-and-intuition` |
| `evil_twinbutton` | 镜像双子 | `eviltwin` | minion | `sects-and-violets` |
| `fang_gubutton` | 方古 | `fanggu` | demon | `bao-zou-ge-bu-lin` |
| `no_dashiibutton` | 诺-达鲺 | `nodashii` | demon | `church-of-spies` |
| `vortoxbutton` | 涡流 | `vortox` | demon | `bao-zou-ge-bu-lin` |
| `djinnbutton` | 灯神 | `djinn` | fabled | `bao-meng-mi-tuan` |

## 现场必须核对

- 仅生成主持候选；身份、阵营、生死、毒醉、投票和胜负由说书人确认。角色变化、额外能力与死亡触发按本局事实另行记录。 [来源](https://wiki.bloodontheclocktower.com/Abilities)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21234_32853.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21234_32853.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20950_46806.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21007_69642.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21227_64421.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20705_14196.json)
- 每个夜晚*，你会得知有多少名死亡的玩家是邪恶的。 [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20947_46831.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21007_69642.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20946_46814.json)
- 每局游戏限一次，在夜晚时，你可以选择除你以外的两名玩家：你会得知他们是否为同一阵营。 [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20947_46831.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21234_32853.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21229_95005.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21007_69642.json)
- Drunk: needs a Townsfolk cover identity; the player does not know they are the Drunk. [来源](https://release.botc.app/resources/data/roles.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20705_14196.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21234_32853.json)
- AI may suggest this result, but ST confirms authority state before saving changes. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20722_51832.json)
- 每个夜晚，你能查看魔典。你可能会被当作善良阵营、镇民角色或外来者角色，即使你已死亡。 [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21219_64086.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21227_64421.json)
- 方古在场增加1外来者并减少1镇民；首次成功转变须分别确认新身份和原方古死亡，仅有候选不算成功。 [来源](https://wiki.bloodontheclocktower.com/Fang_Gu)
- 每个夜晚*，你要选择一名玩家：他死亡。与你邻近的两名镇民中毒。 [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20947_46831.json)
- Vortox can make evil win if no one is executed during the day; exiling a Traveller does not count as an execution; the tool only reminds. [来源](https://release.botc.app/resources/data/roles.json) [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21087_69602.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20950_46806.json)
- 采用当前10到1倒数，替代原文一分钟。被处决即可触发，不要求处决死亡；其他死因不触发。由主持逐个处理死亡及保护，通常留下含恶魔的3人；全部玩家包括无死亡票者均可指认，平指不杀，不按普通投票消耗死亡票。系统不自动杀人或判胜。 [来源](https://wiki.bloodontheclocktower.com/Boomdandy)

首夜：`eviltwin, fortuneteller, seamstress, knight, shugenja, spy, highpriestess, mathematician`。

其他夜：`monk, scarletwoman, fanggu, nodashii, vortox, barber, farmer, fortuneteller, oracle, seamstress, spy, highpriestess, mathematician`。

## 当前官方相克核对

- [官方相克表](https://release.botc.app/resources/data/jinxes.json)，本轮JSON快照SHA256 `5d3d8d0ac194fb1ea44af79b74f9e4bdc09712aef2123c3a3ef2b6c43efa7df7`。原文与既有角色库不覆盖，以此逐条补主持提醒。
- 数学家须核对酒鬼所认为拥有的镇民能力：若该能力给出错误信息或未正常生效，按相克纳入数学家信息；不能仅因真实身份是酒鬼就固定加一。信息仍由主持按当夜实际情况确认，不泄露给酒鬼本人。（`mathematician-drunk-jinx`）
- 红唇女郎与方古同时在场时，若某次结算会出现两名恶魔且其中一名来自红唇女郎，红唇女郎保留原角色。方古转变、原方古死亡与红唇女郎条件须逐条核对并由主持明确确认，不能额外自动生成第二名恶魔。（`scarletwoman-fanggu-jinx`）

本包仅供新开局。现有对局的配板、角色快照、夜序、已确认结果和更正链不迁移或覆盖；死亡、毒醉、身份、阵营、投票与胜负仍须主持确认。未调用付费AI，未改生产或注册表。
