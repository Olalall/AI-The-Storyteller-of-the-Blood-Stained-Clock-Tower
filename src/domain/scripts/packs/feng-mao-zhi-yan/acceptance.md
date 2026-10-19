# 疯帽之宴：第三批草稿

状态：仅待root复核，未注册或部署。调研日期：2026-10-18。

- 作者：Sui染钟楼；社区剧本，不是官方发行剧本。
- [资料库](https://kkovo550.github.io/clocktower-wiki/script_lib/%E5%89%A7%E6%9C%AC%E5%BA%93.html)索引480；build `16ad8f7c270dfc011aeb9fc412950304b68293fc5269c882c32b2e037fc5073e`；原文件 `疯帽之宴.json`。
- 来源版本：原文未标版本。原JSON 18841字节，SHA256 `66abd567cdb4622ba5ece7aef64d70ccc324a2f3537eefda92457d5cbdb2f1ab`；重新获取后与旧缓存逐字节相同。
- [当前官方角色](https://release.botc.app/resources/data/roles.json)及[夜表](https://release.botc.app/resources/data/nightsheet.json)已重新读取并锁哈希；原版与当前规则适配分开，不执行远端JS。

## 明确适配

- 原炼金术士仅“不在场爪牙能力”；明确适配当前可复制在场能力、主持可要求重选的官方版本。
- 原气球驾驶员是四类型轮询/+1；明确适配当前只比较上一夜/+0或+1。
- 帽匠保留同类型、不重复、可拒绝的人工茶会；不新增自动多人换角或能力执行。痢蛭按当前you start宿主规则，不能把中途获得能力排除。

## 角色与夜序

| 原ID | 中文名 | 稳定ID | 类型 |
|---|---|---|---|
| `alchemistbutton` | 炼金术士 | `alchemist` | townsfolk |
| `hatterbutton` | 帽匠 | `hatter` | outsider |
| `noblebutton` | 贵族 | `noble` | townsfolk |
| `chefbutton` | 厨师 | `chef` | townsfolk |
| `balloonistbutton` | 气球驾驶员 | `balloonist` | townsfolk |
| `innkeeperbutton` | 旅店老板 | `innkeeper` | townsfolk |
| `flowergirlbutton` | 卖花女孩 | `flowergirl` | townsfolk |
| `jugglerbutton` | 杂耍艺人 | `juggler` | townsfolk |
| `courtierbutton` | 侍臣 | `courtier` | townsfolk |
| `seamstressbutton` | 女裁缝 | `seamstress` | townsfolk |
| `philosopherbutton` | 哲学家 | `philosopher` | townsfolk |
| `cannibalbutton` | 食人族 | `cannibal` | townsfolk |
| `farmerbutton` | 农夫 | `farmer` | townsfolk |
| `poppy_growerbutton` | 罂粟种植者 | `poppygrower` | townsfolk |
| `sweetheartbutton` | 心上人 | `sweetheart` | outsider |
| `drunkbutton` | 酒鬼 | `drunk` | outsider |
| `moonchildbutton` | 月之子 | `moonchild` | outsider |
| `mutantbutton` | 畸形秀演员 | `mutant` | outsider |
| `harpybutton` | 鹰身女妖 | `harpy` | minion |
| `godfatherbutton` | 教父 | `godfather` | minion |
| `assassinbutton` | 刺客 | `assassin` | minion |
| `goblinbutton` | 哥布林 | `goblin` | minion |
| `ojobutton` | 奥赫 | `ojo` | demon |
| `lleechbutton` | 痢蛭 | `lleech` | demon |
| `vortoxbutton` | 涡流 | `vortox` | demon |
| `fang_gubutton` | 方古 | `fanggu` | demon |

- 首夜：`philosopher, alchemist, poppygrower, lleech, courtier, godfather, harpy, chef, seamstress, noble, balloonist`。
- 其他夜：`philosopher, poppygrower, courtier, innkeeper, harpy, fanggu, vortox, ojo, lleech, assassin, godfather, hatter, sweetheart, farmer, moonchild, flowergirl, seamstress, juggler, balloonist`。
- 夜序只过滤当前官方表，保存官方原顺位；不混用源JSON旧整数。
- 22套7–15人模板；每个人数分别3/2/2/3/2/3/2/2/3套。所有人数修正有choiceId；3个不同不在场善良角色伪装。
- 无新自制角色，复用项目已核对象。包代码只写调研目录，由root统一复制注册；回归/浏览器/真实AI状态以组级验收为准。

## 现场核对

- 技能、毒醉、生死、角色、阵营和胜负均由主持确认；新包只供新局，既有快照不迁移。 [官方](https://wiki.bloodontheclocktower.com/Abilities)
- 方古开局+1外来者、-1镇民；整局首次有效外来者跳转才新方古活、旧方古死。新方古只私下得知新角色和邪恶阵营，不补首夜同伴信息。 [官方](https://wiki.bloodontheclocktower.com/Fang_Gu)
- 开局明确+1或-1外来者，等量替换镇民；白天至少一名外来者实际死亡才有一次独立夜杀，多个死亡不叠次数。 [官方](https://wiki.bloodontheclocktower.com/Godfather)
- 采用当前气球驾驶员：每夜只比较上一夜类型；开局+0或+1外来者均留明确选择，不用原四类型轮询。 [官方](https://wiki.bloodontheclocktower.com/Balloonist)
- 真实酒鬼仍为外来者，无对外镇民能力；对外身份私下确认，不直接展示真实酒鬼身份或毒醉。 [官方](https://wiki.bloodontheclocktower.com/Drunk)
- 当前炼金可复制已在场爪牙能力，但仍是善良镇民、不参加邪恶互认。模板建议刺客能力；授予与借用能力由主持手动记录，不自动新增权威效果。 [官方](https://wiki.bloodontheclocktower.com/Alchemist)
- 有效死亡后当晚逐人可拒绝或改为本板同类型角色，最终不可重复；旧能力结束，新能力由主持核对当夜唤醒。先死亡、后成为帽匠不会触发。 [官方](https://wiki.bloodontheclocktower.com/Hatter)
- 每局一次选择角色，清醒健康时使其一名实际玩家醉酒三夜三日；能力源失能与持续期由主持核对，不能公开毒醉原因。 [官方](https://wiki.bloodontheclocktower.com/Courtier)
- 痢蛭开始拥有能力时选存活宿主；宿主关联、中毒源和死亡由主持确认，后夜攻击不是更换宿主。 [官方](https://wiki.bloodontheclocktower.com/Lleech)
- 涡流镇民信息为假；白天无人被处决触发与处决未死亡不同，不能一律翻转外来者信息。 [官方](https://wiki.bloodontheclocktower.com/Vortox)
- 被提名后投票前有效公开声明，再于当天被处决才核对其能力胜利；醉毒不能发动该能力，处决与死亡不是一件事。 [官方](https://wiki.bloodontheclocktower.com/Goblin)

尚未运行真实AI或部署；结构验证不是全部技能或平衡性的保证。已有对局、数据和来源版本不会被覆盖。
