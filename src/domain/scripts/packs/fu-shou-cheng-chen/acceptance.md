# 俯首称臣-Ben Jammin：第四批共享角色薄包

状态：来源、当前规则与模板结构已核对；整批验收与发布状态见本批发布记录，不代表所有组合或平衡性均已实测。

- 作者：Ben Jammin；用户指定社区资料库索引540，原文件 `俯首称臣-Ben Jammin.json`。
- [原资料库](https://kkovo550.github.io/clocktower-wiki/script_lib/%E5%89%A7%E6%9C%AC%E5%BA%93.html)；build `16ad8f7c270dfc011aeb9fc412950304b68293fc5269c882c32b2e037fc5073e`；原文18768字节，SHA256 `5db5191d519df7ad436f14d0b1c18b959d779e8bef543f0655360eb9dbc00e00`。本轮重新取得全库资源与缓存哈希一致。
- [当前官方角色](https://release.botc.app/resources/data/roles.json)与[夜表](https://release.botc.app/resources/data/nightsheet.json)本轮重新获取，哈希记录于source-lock；只读取JSON，不执行来源JS。
- 25个角色均复用固定sourceId/sourceVersion和完整定义指纹，不新增角色事实或技能分支。首夜/其他夜显式过滤已核官方表。
- 22套7–15人模板按3/2/2/3/2/3/2/2/3分配，全部角色构成不同；3个不同不在场善良伪装。原模板整套角色加原伪装复用为0，统一私有旧轮换/人数修正配方补22；已通过真实composition/templateRoleSelection及候选/evaluate九档守门。

## 原文与当前规则

- 原文大量作者自造ID已按原能力和类型逐条映射，保留全部原ID对应关系。
- 痢蛭采用当前you start宿主规则：中途新获得能力也须由主持确认存活宿主，宿主生死与自身能否死亡双向核对；不能把后夜击杀当作更换宿主。

## 原ID与角色来源

| 原ID | 原显示名 | 稳定ID | 类型 | 固定来源 |
|---|---|---|---|---|
| `meishenmeyongdejuese111` | 事务官 | `steward` | townsfolk | `church-of-spies` |
| `arknights111` | 骑士 | `knight` | townsfolk | `insanity-and-intuition` |
| `jingcaisanxuanyi111` | 贵族 | `noble` | townsfolk | `ao-fa-ji-hui` |
| `wocaishichushen111` | 厨师 | `chef` | townsfolk | `feng-mao-zhi-yan` |
| `tashuofengyuzhongzhediantongsuanshenme111` | 水手 | `sailor` | townsfolk | `ao-fa-ji-hui` |
| `mofasaozhou111` | 侍女 | `chambermaid` | townsfolk | `bad-moon-rising` |
| `lushichuanshuodelaoban111` | 旅店老板 | `innkeeper` | townsfolk | `ao-fa-ji-hui` |
| `chunzaoyaoa` | 造谣者 | `gossip` | townsfolk | `ao-fa-ji-hui` |
| `diaoshangyizhengtiandeyu111` | 渔夫 | `fisherman` | townsfolk | `ao-fa-ji-hui` |
| `lingluowawa111` | 女裁缝 | `seamstress` | townsfolk | `bao-zou-ge-bu-lin` |
| `buhaohe111` | 茶艺师 | `tealady` | townsfolk | `ao-fa-ji-hui` |
| `wangzherongyao111` | 农夫 | `farmer` | townsfolk | `devout-theists` |
| `zz111` | 镇长 | `mayor` | townsfolk | `da-cheng-xiao-zhen` |
| `xunzhaonidezhuren111` | 管家 | `butler` | outsider | `mu-hou-cao-kong` |
| `dabanshou111` | 修补匠 | `tinker` | outsider | `ao-fa-ji-hui` |
| `tougexiangxian111` | 政客 | `politician` | outsider | `da-cheng-xiao-zhen` |
| `biezaizhelifadian111` | 理发师 | `barber` | outsider | `jiu-ri-shu-shi` |
| `zhijiagedaziji111` | 教父 | `godfather` | minion | `ao-fa-ji-hui` |
| `touduzheeeeeeee111` | 投毒者 | `poisoner` | minion | `ao-fa-ji-hui` |
| `jiushigelvshi111` | 魔鬼代言人 | `devilsadvocate` | minion | `ao-fa-ji-hui` |
| `baonijuhua111` | 刺客 | `assassin` | minion | `bad-moon-rising` |
| `xiaoweibaxiliuxiliu111` | 普卡 | `pukka` | demon | `bad-moon-rising` |
| `lizhiiiiii111111111` | 痢蛭 | `lleech` | demon | `devout-theists` |
| `xiaoemo1111111eee111eee111` | 小恶魔 | `imp` | demon | `ao-fa-ji-hui` |
| `fangguuuuuuuuuuuuuu111` | 方古 | `fanggu` | demon | `bao-zou-ge-bu-lin` |

## 现场必须核对

- 仅生成主持候选；身份、阵营、生死、毒醉、投票和胜负由说书人确认。角色变化、额外能力与死亡触发按本局事实另行记录。 [来源](https://wiki.bloodontheclocktower.com/Abilities)
- 在你的首个夜晚，你会得知一名善良玩家。 [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20947_46831.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21234_32853.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20705_14196.json)
- 在你的首个夜晚，你会得知场上邻座的邪恶玩家有多少对。 [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20947_46831.json)
- Drunken target and death prevention are ST-confirmed. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20754_59933.json)
- 每个夜晚，你要选择除你以外的两名存活的玩家：你会得知他们中有几人在当晚因其自身能力而被唤醒。 [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21219_64086.json)
- 每个夜晚*，你要选择两名玩家：他们当晚不会死亡，但其中一人会醉酒到下个黄昏。 [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21219_64086.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21007_69642.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21050_74806.json)
- 每局游戏限一次，在夜晚时，你可以选择除你以外的两名玩家：你会得知他们是否为同一阵营。 [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20947_46831.json)
- 茶艺师: 如果与你邻近的两名存活的玩家是善良的，他们不会死亡。... Storyteller confirms any authority-state impact. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20730_52285.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21234_32853.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21229_95005.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21234_32853.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20705_14196.json)
- AI may suggest this result, but ST confirms authority state before saving changes. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20722_51832.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21007_69642.json)
- 教父开局明确选择增加或减少1外来者，对应替换镇民；白天外来者死亡后的夜杀仍由主持核对。 [来源](https://wiki.bloodontheclocktower.com/Godfather)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20950_46806.json)
- AI may suggest this result, but ST confirms authority state before saving changes. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20723_51891.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21007_69642.json)
- AI only drafts reminders; storyteller confirms before changing authority state. [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20950_46806.json)
- 方古在场增加1外来者并减少1镇民；首次成功转变须分别确认新身份和原方古死亡，仅有候选不算成功。 [来源](https://wiki.bloodontheclocktower.com/Fang_Gu)
- 普卡首夜即选新毒目标；后夜先处理新毒，再核对上一有效毒目标的死亡与恢复健康。旅店保护可阻止死亡但不能凭空保留已结束的毒；毒醉、失能与历史链缺项由主持核对，不自动续杀。 [来源](https://wiki.bloodontheclocktower.com/Pukka) [来源](https://wiki.bloodontheclocktower.com/Innkeeper)
- 开始拥有痢蛭能力时确认一名存活宿主并登记中毒，含中途新痢蛭；宿主活时不能死、宿主死时随之死须核对能力是否有效。后夜攻击独立于宿主，不能重复选宿主。 [来源](https://wiki.bloodontheclocktower.com/Lleech)

首夜：`sailor, lleech, poisoner, godfather, devilsadvocate, pukka, chef, butler, seamstress, steward, knight, noble, chambermaid`。

其他夜：`sailor, poisoner, innkeeper, devilsadvocate, imp, pukka, fanggu, lleech, assassin, godfather, gossip, barber, farmer, tinker, seamstress, butler, chambermaid`。

## 当前官方相克核对

- [官方相克表](https://release.botc.app/resources/data/jinxes.json)，本轮JSON快照SHA256 `5d3d8d0ac194fb1ea44af79b74f9e4bdc09712aef2123c3a3ef2b6c43efa7df7`。原文与既有角色库不覆盖，以此逐条补主持提醒。
- 此板全部角色交集没有当前官方相克表条目；普通角色组合、触发时点和开局修正仍须按各角色规则核对。

本包仅供新开局。现有对局的配板、角色快照、夜序、已确认结果和更正链不迁移或覆盖；死亡、毒醉、身份、阵营、投票与胜负仍须主持确认。未调用付费AI，未改生产或注册表。
