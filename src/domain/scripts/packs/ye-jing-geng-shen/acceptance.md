# 夜静更深 验收记录

状态：来源、角色映射、当前官方规则与结构模板已核对；最终集成、浏览器与真实 AI 结果由批次发布记录补充，不能据此称全部组合已实测。

- 来源：[Clocktower Wiki](https://kkovo550.github.io/clocktower-wiki/)，社区剧本，不是官方剧本。
- 库索引：515；原文件：`快速上手与角色主题竞赛剧本\海外快速上手剧本\#夜静更深.json`；原元数据名称：`夜静更深`。
- 作者：The Good Couch。
- 库构建：`16ad8f7c270dfc011aeb9fc412950304b68293fc5269c882c32b2e037fc5073e`。
- 原 JSON UTF-8 字节 SHA-256：`a8ffa845e13d613c7fc63e6a29ce415ab8861cc08939214e901118465ca72161`。
- 官方资料：[roles.json](https://release.botc.app/resources/data/roles.json)、[nightsheet.json](https://release.botc.app/resources/data/nightsheet.json)，核对日期 2026-10-16。

## 原文 ID 映射与规则版本

原库自制 ID 经原文能力、角色类型和官方英文能力逐条核对后映射，未按中文名直接导入。角色能力及夜序采用当前官方规则；原始字节哈希仍锁定原库原文，二者不是同一规则版本。

| 原文 ID | 原文显示名 | 稳定 ID | 类型 |
|---|---|---|---|
| `librarianbutton` | 图书管理员 | `librarian` | townsfolk |
| `noblebutton` | 贵族 | `noble` | townsfolk |
| `pixiebutton` | 小精灵 | `pixie` | townsfolk |
| `empathbutton` | 共情者 | `empath` | townsfolk |
| `undertakerbutton` | 送葬者 | `undertaker` | townsfolk |
| `innkeeperbutton` | 旅店老板 | `innkeeper` | townsfolk |
| `monkbutton` | 僧侣 | `monk` | townsfolk |
| `gossipbutton` | 造谣者 | `gossip` | townsfolk |
| `savantbutton` | 博学者 | `savant` | townsfolk |
| `artistbutton` | 艺术家 | `artist` | townsfolk |
| `mayorbutton` | 镇长 | `mayor` | townsfolk |
| `soldierbutton` | 士兵 | `soldier` | townsfolk |
| `farmerbutton` | 农夫 | `farmer` | townsfolk |
| `reclusebutton` | 陌客 | `recluse` | outsider |
| `tinkerbutton` | 修补匠 | `tinker` | outsider |
| `saintbutton` | 圣徒 | `saint` | outsider |
| `drunkbutton` | 酒鬼 | `drunk` | outsider |
| `poisonerbutton` | 投毒者 | `poisoner` | minion |
| `summonerbutton` | 召唤师 | `summoner` | minion |
| `spybutton` | 间谍 | `spy` | minion |
| `assassinbutton` | 刺客 | `assassin` | minion |
| `vortoxbutton` | 涡流 | `vortox` | demon |
| `impbutton` | 小恶魔 | `imp` | demon |
| `no_dashiibutton` | 诺-达鲺 | `nodashii` | demon |
| `pukkabutton` | 普卡 | `pukka` | demon |

复用项目 `confirmedRoleFactsForScript`；基础事实池缺少的已存在角色跨包复用。角色的输入规则、技能研究与风险资料沿用已确认角色对象，不复制另一套同名角色。

## 夜序与模板

- 首夜：`summoner, poisoner, pukka, pixie, librarian, empath, noble, spy`。
- 后续夜：`poisoner, innkeeper, monk, summoner, imp, pukka, nodashii, vortox, assassin, gossip, farmer, tinker, empath, undertaker, spy`。
- 均为 2026-10-16 当前官方表过滤，原序号写在条目 note；原库数字顺位不直接混用。条件唤醒、额外能力和新角色能力仍由说书人确认，不能重排已有对局快照。
- 22 套模板：7/8/9/10/11/12/13/14/15 人分别 3/2/2/3/2/3/2/2/3 套。全部角色在本板、不重复；3 伪装为不在场善良角色，排除旅行者和传奇角色。
- 人数修正写入每套模板的 setupAdjustments，不只写备注。模板为结构合法且有主持说明，不代表已验证玩家体验平衡。

## Setup 与高风险提醒

- 召唤师开局移除恶魔并增加 1 镇民，爪牙数量不变；首夜给 3 伪装，第 3 夜创造邪恶恶魔且新恶魔当晚行动。与普卡相克时可在第 2 夜召唤普卡。
- 酒鬼需要一个不在场镇民作自认身份；其信息和唤醒按该身份模拟，实际没有该能力，不能把自认身份当成实际角色。
- 普卡先处理新目标中毒，再核对上一目标的死亡与恢复健康；保护、醉毒、普卡失能或死亡时不得机械延续旧链。
- 涡流只令镇民能力产生错误信息；主持须区分被处决与处决死亡，白天无人被处决会触发邪恶胜利。不能把外来者信息一律翻转。
- 旅店老板保护当晚两名玩家并使其中一人醉酒；先确定实际目标、醉酒者和生效状态，保护源失效后的攻击须重新核对。
- 诺-达鲺使其两侧最近镇民中毒，不能按最近玩家或最近存活玩家代替角色类型判断；身份或座位变化后重新核对。

## 验证

- 2026-10-16 定向回归：`npx vitest run src/domain/scripts/wikiBatchA.test.ts`，13 项通过（含生产 candidate 及修正选择链，5 板 × 9 人数的 110 套均可见）；定向 oxlint 无警告，`npx tsc -b --pretty false` 通过。
- 集成后由主 Agent 统一运行质量门、人数构成、架构、构建及浏览器检查。
- 本包实现未调用付费 AI，未修改现有对局、共享角色事实、注册表或部署。

## 关键技能真实抽测建议（尚未调用）

- 场景：召唤师与普卡第二夜相克。
- 已知事实：当前第 2 夜，清醒健康的召唤师已选择合法存活玩家与普卡角色，所有目标事实已由主持确认；本局此前没有普卡造成的中毒目标。
- 独立预期：官方相克允许在第 2 夜召唤普卡；新普卡当晚可行动并使首个目标中毒，不能凭空杀死不存在的上夜中毒目标。
- 规则依据：[官方角色说明](https://wiki.bloodontheclocktower.com/Summoner)。
- 这是交给主 Agent 的抽测 oracle，不代表已经执行或已通过真实 AI。
