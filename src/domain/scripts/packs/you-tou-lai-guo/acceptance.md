# 由头来过：第四批共享角色薄包

状态：来源、当前规则与模板结构已核对；整批验收与发布状态见本批发布记录，不代表所有组合或平衡性均已实测。

- 作者：荷西；用户指定社区资料库索引396，原文件 `由头来过.json`。
- [原资料库](https://kkovo550.github.io/clocktower-wiki/script_lib/%E5%89%A7%E6%9C%AC%E5%BA%93.html)；build `16ad8f7c270dfc011aeb9fc412950304b68293fc5269c882c32b2e037fc5073e`；原文15625字节，SHA256 `3f1f9b3ba84318c973ad39ffe92d83475b886843f0fae41bb62bf0d114a4d8e1`。本轮重新取得全库资源与缓存哈希一致。
- [当前官方角色](https://release.botc.app/resources/data/roles.json)与[夜表](https://release.botc.app/resources/data/nightsheet.json)本轮重新获取，哈希记录于source-lock；只读取JSON，不执行来源JS。
- 25个角色均复用固定sourceId/sourceVersion和完整定义指纹，不新增角色事实或技能分支。首夜/其他夜显式过滤已核官方表。
- 22套7–15人模板按3/2/2/3/2/3/2/2/3分配，全部角色构成不同；3个不同不在场善良伪装。原模板整套角色加原伪装复用为0，统一私有旧轮换/人数修正配方补22；已通过真实composition/templateRoleSelection及候选/evaluate九档守门。

## 原文与当前规则

- 作者1_youtoulaiguo至25_youtoulaiguo均为原文自造ID；已逐条按类型与完整能力映射到既有官方角色，不增建同名技能。
- 原气球文本已为只比较上一夜及+0至1外来者；继续当前版。村夫额外实例属于替换镇民，本批普通模板不启用额外村夫。

## 原ID与角色来源

| 原ID | 原显示名 | 稳定ID | 类型 | 固定来源 |
|---|---|---|---|---|
| `1_youtoulaiguo` | 钟表匠 | `clockmaker` | townsfolk | `bao-zou-ge-bu-lin` |
| `2_youtoulaiguo` | 贵族 | `noble` | townsfolk | `ao-fa-ji-hui` |
| `3_youtoulaiguo` | 占卜师 | `fortuneteller` | townsfolk | `ao-fa-ji-hui` |
| `4_youtoulaiguo` | 侍女 | `chambermaid` | townsfolk | `bad-moon-rising` |
| `5_youtoulaiguo` | 气球驾驶员 | `balloonist` | townsfolk | `bao-zou-ge-bu-lin` |
| `6_youtoulaiguo` | 村夫 | `villageidiot` | townsfolk | `a-grimm-chorus` |
| `7_youtoulaiguo` | 送葬者 | `undertaker` | townsfolk | `church-of-spies` |
| `8_youtoulaiguo` | 赌徒 | `gambler` | townsfolk | `bad-moon-rising` |
| `9_youtoulaiguo` | 女裁缝 | `seamstress` | townsfolk | `bao-zou-ge-bu-lin` |
| `10_youtoulaiguo` | 守夜人 | `nightwatchman` | townsfolk | `church-of-spies` |
| `11_youtoulaiguo` | 公主 | `princess` | townsfolk | `punchy` |
| `12_youtoulaiguo` | 茶艺师 | `tealady` | townsfolk | `ao-fa-ji-hui` |
| `13_youtoulaiguo` | 贤者 | `sage` | townsfolk | `sects-and-violets` |
| `14_youtoulaiguo` | 酒鬼 | `drunk` | outsider | `ao-fa-ji-hui` |
| `15_youtoulaiguo` | 月之子 | `moonchild` | outsider | `bad-moon-rising` |
| `16_youtoulaiguo` | 食人魔 | `ogre` | outsider | `bao-zou-ge-bu-lin` |
| `17_youtoulaiguo` | 呆瓜 | `klutz` | outsider | `church-of-spies` |
| `18_youtoulaiguo` | 红唇女郎 | `scarletwoman` | minion | `church-of-spies` |
| `19_youtoulaiguo` | 魔鬼代言人 | `devilsadvocate` | minion | `ao-fa-ji-hui` |
| `20_youtoulaiguo` | 投毒者 | `poisoner` | minion | `ao-fa-ji-hui` |
| `21_youtoulaiguo` | 教父 | `godfather` | minion | `ao-fa-ji-hui` |
| `22_youtoulaiguo` | 珀 | `po` | demon | `ao-fa-ji-hui` |
| `23_youtoulaiguo` | 小恶魔 | `imp` | demon | `ao-fa-ji-hui` |
| `24_youtoulaiguo` | 涡流 | `vortox` | demon | `bao-zou-ge-bu-lin` |
| `25_youtoulaiguo` | 诺·达鲺 | `nodashii` | demon | `church-of-spies` |

## 现场必须核对

- 仅生成主持候选；身份、阵营、生死、毒醉、投票和胜负由说书人确认。角色变化、额外能力与死亡触发按本局事实另行记录。 [来源](https://wiki.bloodontheclocktower.com/Abilities)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20705_14196.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20705_14196.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20950_46806.json)
- 每个夜晚，你要选择除你以外的两名存活的玩家：你会得知他们中有几人在当晚因其自身能力而被唤醒。 [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21219_64086.json)
- 按当前官方版，气球驾驶员可选择增加0或1外来者；每夜信息与上一夜角色类型比较，不使用旧四类型版本。 [来源](https://wiki.bloodontheclocktower.com/Balloonist)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20950_46806.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20705_14196.json)
- 每局游戏限一次，在夜晚时，你可以选择除你以外的两名玩家：你会得知他们是否为同一阵营。 [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20947_46831.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21229_95005.json)
- 茶艺师: 如果与你邻近的两名存活的玩家是善良的，他们不会死亡。... Storyteller confirms any authority-state impact. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20730_52285.json)
- Sage killed by Demon learns two players one of whom is Demon; answer remains ST-confirmed. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20746_59942.json)
- Drunk: needs a Townsfolk cover identity; the player does not know they are the Drunk. [来源](https://release.botc.app/resources/data/roles.json)
- AI may suggest this result, but ST confirms authority state before saving changes. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20723_51891.json)
- 食人魔：首夜选择后变成目标阵营，即使醉酒或中毒也会发生；玩家不知道结果。 [来源](https://release.botc.app/resources/data/roles.json) [来源](https://script.bloodontheclocktower.com/?script=H4sIAAAAAAAACpWSQU7EMAxFr1J53RN0CSvEggMghEzrJqaJHTnOoBnE3RFiBEvMMtLzj/N%2BHt%2BBN1jguZIjzIDDsxoscIOmMp1Upvsy%2FAIzCFaCBR6EJpZJhSYdDjO8FNWtO9pdxUS3akarswosoPIdqV3NYdmxdJrBz%2B0raB%2BlwMd8XaA7vaFtMEPK2n%2FhxiK0XY8%2F9CGcsgfhzCk3Y%2BpOvQdnTlwKJuKNNXpNFzxozWiVLDiyq%2FkQciolPKOGa6EgXFWOIIpVqDOu0dW5Z7KKErVDWLtbvIH9PyJXFOEXLFGHyaIGk2r0iUZrGT0avNkId9OUu0rYRkZr52gvYbLShVqmQtEGD7xg4SDMtUXLe9XwF5KURlgEG7vufFL7S8nTJ74mOs83BQAA)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20705_14196.json)
- AI may suggest this result, but ST confirms authority state before saving changes. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20722_51832.json)
- AI may suggest this result, but ST confirms authority state before saving changes. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20723_51891.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20950_46806.json)
- 教父开局明确选择增加或减少1外来者，对应替换镇民；白天外来者死亡后的夜杀仍由主持核对。 [来源](https://wiki.bloodontheclocktower.com/Godfather)
- 每个夜晚*，你可以选择一名玩家：他死亡。如果你上次选择时没有选择任何玩家，当晚你要选择三名玩家：他们死亡。 [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21219_64086.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20950_46806.json)
- Vortox can make evil win if no one is executed during the day; exiling a Traveller does not count as an execution; the tool only reminds. [来源](https://release.botc.app/resources/data/roles.json) [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21087_69602.json)
- 每个夜晚*，你要选择一名玩家：他死亡。与你邻近的两名镇民中毒。 [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20947_46831.json)
- 可以用额外村夫替换0至2名镇民；仅1名村夫时不因自身设置醉酒，多名时由主持标记1名额外村夫醉酒。本批普通模板仅用单实例，不自动复制或加醉。 [来源](https://wiki.bloodontheclocktower.com/Village_Idiot)
- 公主首个白天提名的玩家须实际被处决，不要求处决死亡；核对公主当夜是否清醒健康。恶魔仍按原夜序选择目标，但当晚不造成死亡；其他恶魔效果及教父等非恶魔死亡不因此停止。只作主持确认提醒。 [来源](https://wiki.bloodontheclocktower.com/Princess)

首夜：`poisoner, godfather, devilsadvocate, fortuneteller, clockmaker, seamstress, noble, balloonist, villageidiot, nightwatchman, ogre, chambermaid`。

其他夜：`poisoner, gambler, devilsadvocate, scarletwoman, princess, imp, po, nodashii, vortox, godfather, sage, moonchild, fortuneteller, undertaker, seamstress, balloonist, villageidiot, nightwatchman, chambermaid`。

## 当前官方相克核对

- [官方相克表](https://release.botc.app/resources/data/jinxes.json)，本轮JSON快照SHA256 `5d3d8d0ac194fb1ea44af79b74f9e4bdc09712aef2123c3a3ef2b6c43efa7df7`。原文与既有角色库不覆盖，以此逐条补主持提醒。
- 此板全部角色交集没有当前官方相克表条目；普通角色组合、触发时点和开局修正仍须按各角色规则核对。

本包仅供新开局。现有对局的配板、角色快照、夜序、已确认结果和更正链不迁移或覆盖；死亡、毒醉、身份、阵营、投票与胜负仍须主持确认。未调用付费AI，未改生产或注册表。
