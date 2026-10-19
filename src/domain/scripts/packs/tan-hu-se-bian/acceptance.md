# 谈虎色变 / v5：第三批草稿

状态：仅待root复核，未注册或部署。调研日期：2026-10-18。

- 作者：Brockwell；社区剧本，不是官方发行剧本。
- [资料库](https://kkovo550.github.io/clocktower-wiki/script_lib/%E5%89%A7%E6%9C%AC%E5%BA%93.html)索引560；build `16ad8f7c270dfc011aeb9fc412950304b68293fc5269c882c32b2e037fc5073e`；原文件 `谈虎色变.json`。
- 来源版本：目录标v5，JSON元信息未标版号。原JSON 18072字节，SHA256 `aff3eded23c576fe55149a470f643b5d2b57d30218b5222106474cea7059e005`；重新获取后与旧缓存逐字节相同。
- [当前官方角色](https://release.botc.app/resources/data/roles.json)及[夜表](https://release.botc.app/resources/data/nightsheet.json)已重新读取并锁哈希；原版与当前规则适配分开，不执行远端JS。

## 明确适配

- 原meta及灯神文本载有旧Kazali/Goon相克，要求后续转化改由说书人决定；当前官方Kazali明确不受Goon等原能力阻止，适配时移除该旧相克的执行含义，原文完整保留。
- 帽匠的死亡触发与逐人选择复用现有手动记录，不把原文“如果死亡”扩张为死亡后才变帽匠也触发。
- 目录标v5而原JSON元信息未标版本，双重事实分别记录，不称最新作者版。

## 角色与夜序

| 原ID | 中文名 | 稳定ID | 类型 |
|---|---|---|---|
| `20003_107` | 灯神 | `djinn` | fabled |
| `noblebutton` | 贵族 | `noble` | townsfolk |
| `shugenjabutton` | 修行者 | `shugenja` | townsfolk |
| `pixiebutton` | 小精灵 | `pixie` | townsfolk |
| `high_priestessbutton` | 女祭司 | `highpriestess` | townsfolk |
| `dreamerbutton` | 筑梦师 | `dreamer` | townsfolk |
| `fortune_tellerbutton` | 占卜师 | `fortuneteller` | townsfolk |
| `monkbutton` | 僧侣 | `monk` | townsfolk |
| `savantbutton` | 博学者 | `savant` | townsfolk |
| `amnesiacbutton` | 失忆者 | `amnesiac` | townsfolk |
| `slayerbutton` | 猎手 | `slayer` | townsfolk |
| `seamstressbutton` | 女裁缝 | `seamstress` | townsfolk |
| `ravenkeeperbutton` | 守鸦人 | `ravenkeeper` | townsfolk |
| `cannibalbutton` | 食人族 | `cannibal` | townsfolk |
| `goonbutton` | 莽夫 | `goon` | outsider |
| `mutantbutton` | 畸形秀演员 | `mutant` | outsider |
| `drunkbutton` | 酒鬼 | `drunk` | outsider |
| `hatterbutton` | 帽匠 | `hatter` | outsider |
| `widowbutton` | 寡妇 | `widow` | minion |
| `witchbutton` | 女巫 | `witch` | minion |
| `cerenovusbutton` | 洗脑师 | `cerenovus` | minion |
| `scarlet_womanbutton` | 红唇女郎 | `scarletwoman` | minion |
| `boomdandybutton` | 炸弹人 | `boomdandy` | minion |
| `no_dashiibutton` | 诺-达鲺 | `nodashii` | demon |
| `vortoxbutton` | 涡流 | `vortox` | demon |
| `kazali` | 卡扎力 | `kazali` | demon |

- 首夜：`kazali, widow, witch, cerenovus, pixie, amnesiac, fortuneteller, dreamer, seamstress, noble, shugenja, highpriestess`。
- 其他夜：`monk, witch, cerenovus, scarletwoman, nodashii, vortox, kazali, hatter, amnesiac, ravenkeeper, fortuneteller, dreamer, seamstress, highpriestess`。
- 夜序只过滤当前官方表，保存官方原顺位；不混用源JSON旧整数。
- 22套7–15人模板；每个人数分别3/2/2/3/2/3/2/2/3套。所有人数修正有choiceId；3个不同不在场善良角色伪装。
- 无新自制角色，复用项目已核对象。包代码只写调研目录，由root统一复制注册；回归/浏览器/真实AI状态以组级验收为准。

## 现场核对

- 技能、毒醉、生死、角色、阵营和胜负均由主持确认；新包只供新局，既有快照不迁移。 [官方](https://wiki.bloodontheclocktower.com/Abilities)
- 卡扎力初始袋子仅恶魔与善良，零爪牙；首夜按原7–9/10–12/13–15人数录入1/2/3组不同玩家→不同本板爪牙，再由主持单独应用身份与当夜夜序。Goon不阻止此设置，中途新卡扎力不重配。 [官方](https://wiki.bloodontheclocktower.com/Kazali)
- 真实酒鬼仍为外来者，无对外镇民能力；对外身份私下确认，不直接展示真实酒鬼身份或毒醉。 [官方](https://wiki.bloodontheclocktower.com/Drunk)
- 开局私下确认善良红鲱鱼，真假信息与登记由主持核对，不公开来源。 [官方](https://wiki.bloodontheclocktower.com/Fortune_Teller)
- 有效死亡后当晚逐人可拒绝或改为本板同类型角色，最终不可重复；旧能力结束，新能力由主持核对当夜唤醒。先死亡、后成为帽匠不会触发。 [官方](https://wiki.bloodontheclocktower.com/Hatter)
- 涡流镇民信息为假；白天无人被处决触发与处决未死亡不同，不能一律翻转外来者信息。 [官方](https://wiki.bloodontheclocktower.com/Vortox)
- 失忆者能力由主持设计和记录，AI不得发明权威能力；静态模板暂不主动配失忆者，仍保留脚本角色。 [官方](https://wiki.bloodontheclocktower.com/Amnesiac)
- 灯神是公开相克提醒；不进入座位、人数或恶魔伪装；原旧相克与当前适配区别见source-lock。 [官方](https://wiki.bloodontheclocktower.com/Djinn)

尚未运行真实AI或部署；结构验证不是全部技能或平衡性的保证。已有对局、数据和来源版本不会被覆盖。
