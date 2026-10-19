# 言不由衷：第三批草稿

状态：仅待root复核，未注册或部署。调研日期：2026-10-18。

- 作者：上海7221俱乐部；社区剧本，不是官方发行剧本。
- [资料库](https://kkovo550.github.io/clocktower-wiki/script_lib/%E5%89%A7%E6%9C%AC%E5%BA%93.html)索引604；build `16ad8f7c270dfc011aeb9fc412950304b68293fc5269c882c32b2e037fc5073e`；原文件 `言不由衷.json`。
- 来源版本：原文未标版本。原JSON 23694字节，SHA256 `f90e3927c1b9aac332d37b29fe5119e82a0bd808d73d8a6dba0ed62ee57fce48`；重新获取后与旧缓存逐字节相同。
- [当前官方角色](https://release.botc.app/resources/data/roles.json)及[夜表](https://release.botc.app/resources/data/nightsheet.json)已重新读取并锁哈希；原版与当前规则适配分开，不执行远端JS。

## 明确适配

- 此前因Kazali首夜多组录入缺口暂缓；现复用已上线的有序配对→单独应用→当夜夜序流程，所有Kazali模板均零预配爪牙。
- 原气球驾驶员四类型轮询/+1，适配当前相邻两夜/+0或+1。
- 原meta中寡妇/魔术师、洗脑师/哥布林相克均仍在当前官方对应页面，保留。灯神是提醒，不占座位或伪装。

## 角色与夜序

| 原ID | 中文名 | 稳定ID | 类型 |
|---|---|---|---|
| `djinn_GStone` | 灯神 | `djinn` | fabled |
| `shugenja_button` | 修行者 | `shugenja` | townsfolk |
| `pixie_button` | 小精灵 | `pixie` | townsfolk |
| `chambermaid_button` | 侍女 | `chambermaid` | townsfolk |
| `balloonist_button` | 气球驾驶员 | `balloonist` | townsfolk |
| `high_priestess_button` | 女祭司 | `highpriestess` | townsfolk |
| `town_crier_button` | 城镇公告员 | `towncrier` | townsfolk |
| `cannibal_button` | 食人族 | `cannibal` | townsfolk |
| `fisherman_button` | 渔夫 | `fisherman` | townsfolk |
| `nightwatchman_button` | 守夜人 | `nightwatchman` | townsfolk |
| `seamstress_button` | 女裁缝 | `seamstress` | townsfolk |
| `magician_button` | 魔术师 | `magician` | townsfolk |
| `mayor_button` | 镇长 | `mayor` | townsfolk |
| `amnesiac_button` | 失忆者 | `amnesiac` | townsfolk |
| `klutz_button` | 呆瓜 | `klutz` | outsider |
| `lunatic_button` | 疯子 | `lunatic` | outsider |
| `drunk_button` | 酒鬼 | `drunk` | outsider |
| `moonchild_button` | 月之子 | `moonchild` | outsider |
| `widow_button` | 寡妇 | `widow` | minion |
| `goblin_button` | 哥布林 | `goblin` | minion |
| `cerenovus_button` | 洗脑师 | `cerenovus` | minion |
| `scarlet_woman_button` | 红唇女郎 | `scarletwoman` | minion |
| `po_button` | 珀 | `po` | demon |
| `yaggababble_button` | 牙噶巴卜 | `yaggababble` | demon |
| `imp_button` | 小恶魔 | `imp` | demon |
| `kazali_button` | 卡扎力 | `kazali` | demon |

- 首夜：`kazali, yaggababble, magician, lunatic, widow, cerenovus, pixie, amnesiac, seamstress, balloonist, shugenja, nightwatchman, highpriestess, chambermaid`。
- 其他夜：`cerenovus, scarletwoman, lunatic, imp, po, yaggababble, kazali, amnesiac, moonchild, towncrier, seamstress, balloonist, nightwatchman, highpriestess, chambermaid`。
- 夜序只过滤当前官方表，保存官方原顺位；不混用源JSON旧整数。
- 22套7–15人模板；每个人数分别3/2/2/3/2/3/2/2/3套。所有人数修正有choiceId；3个不同不在场善良角色伪装。
- 无新自制角色，复用项目已核对象。包代码只写调研目录，由root统一复制注册；回归/浏览器/真实AI状态以组级验收为准。

## 现场核对

- 技能、毒醉、生死、角色、阵营和胜负均由主持确认；新包只供新局，既有快照不迁移。 [官方](https://wiki.bloodontheclocktower.com/Abilities)
- 采用当前气球驾驶员：每夜只比较上一夜类型；开局+0或+1外来者均留明确选择，不用原四类型轮询。 [官方](https://wiki.bloodontheclocktower.com/Balloonist)
- 卡扎力初始袋子仅恶魔与善良，零爪牙；首夜按原7–9/10–12/13–15人数录入1/2/3组不同玩家→不同本板爪牙，再由主持单独应用身份与当夜夜序。Goon不阻止此设置，中途新卡扎力不重配。 [官方](https://wiki.bloodontheclocktower.com/Kazali)
- 真实酒鬼仍为外来者，无对外镇民能力；对外身份私下确认，不直接展示真实酒鬼身份或毒醉。 [官方](https://wiki.bloodontheclocktower.com/Drunk)
- 按上次有效选择记录核对0/1/3目标与顺序，多刀逐个处理当前保护；不把被跳过唤醒等同于主动蓄力。 [官方](https://wiki.bloodontheclocktower.com/Po)
- 被提名后投票前有效公开声明，再于当天被处决才核对其能力胜利；醉毒不能发动该能力，处决与死亡不是一件事。 [官方](https://wiki.bloodontheclocktower.com/Goblin)
- 若本板有哥布林，洗脑师除善良角色外可以使玩家疯狂声称是哥布林；该相克仍在当前官方页。 [官方](https://wiki.bloodontheclocktower.com/Cerenovus)
- 若寡妇与魔术师在场，寡妇看魔典前移除恶魔和魔术师标记；不把整张真实身份表展示给普通玩家。 [官方](https://wiki.bloodontheclocktower.com/Widow)
- 失忆者能力由主持设计和记录，AI不得发明权威能力；静态模板暂不主动配失忆者，仍保留脚本角色。 [官方](https://wiki.bloodontheclocktower.com/Amnesiac)
- 灯神是公开相克提醒；不进入座位、人数或恶魔伪装；原旧相克与当前适配区别见source-lock。 [官方](https://wiki.bloodontheclocktower.com/Djinn)

尚未运行真实AI或部署；结构验证不是全部技能或平衡性的保证。已有对局、数据和来源版本不会被覆盖。
