# 绅士谢幕 验收记录

状态：来源、角色映射、当前官方规则与结构模板已核对；最终集成、浏览器与真实 AI 结果由批次发布记录补充，不能据此称全部组合已实测。

- 来源：[Clocktower Wiki](https://kkovo550.github.io/clocktower-wiki/)，社区剧本，不是官方剧本。
- 库索引：526；原文件：`快速上手与角色主题竞赛剧本\海外快速上手剧本\#绅士谢幕.json`；原元数据名称：`绅士谢幕`。
- 作者：Aggie & Jams。
- 库构建：`16ad8f7c270dfc011aeb9fc412950304b68293fc5269c882c32b2e037fc5073e`。
- 原 JSON UTF-8 字节 SHA-256：`b5e2c3dc70aff5f7c069bee5a52eeb4cf15b4f7b3e1eca74a8a7a9192edbb2b5`。
- 官方资料：[roles.json](https://release.botc.app/resources/data/roles.json)、[nightsheet.json](https://release.botc.app/resources/data/nightsheet.json)，核对日期 2026-10-16。

## 原文 ID 映射与规则版本

原库自制 ID 经原文能力、角色类型和官方英文能力逐条核对后映射，未按中文名直接导入。角色能力及夜序采用当前官方规则；原始字节哈希仍锁定原库原文，二者不是同一规则版本。 炼金术士原库为旧版“不在场爪牙能力”，适配为当前官方允许拥有爪牙能力且主持可要求重新选择的版本。

| 原文 ID | 原文显示名 | 稳定 ID | 类型 |
|---|---|---|---|
| `alchemistbutton` | 炼金术士 | `alchemist` | townsfolk |
| `bounty_hunterbutton` | 赏金猎人 | `bountyhunter` | townsfolk |
| `chefbutton` | 厨师 | `chef` | townsfolk |
| `sailorbutton` | 水手 | `sailor` | townsfolk |
| `empathbutton` | 共情者 | `empath` | townsfolk |
| `fortune_tellerbutton` | 占卜师 | `fortuneteller` | townsfolk |
| `preacherbutton` | 传教士 | `preacher` | townsfolk |
| `innkeeperbutton` | 旅店老板 | `innkeeper` | townsfolk |
| `savantbutton` | 博学者 | `savant` | townsfolk |
| `courtierbutton` | 侍臣 | `courtier` | townsfolk |
| `seamstressbutton` | 女裁缝 | `seamstress` | townsfolk |
| `nightwatchmanbutton` | 守夜人 | `nightwatchman` | townsfolk |
| `ravenkeeperbutton` | 守鸦人 | `ravenkeeper` | townsfolk |
| `sweetheartbutton` | 心上人 | `sweetheart` | outsider |
| `drunkbutton` | 酒鬼 | `drunk` | outsider |
| `reclusebutton` | 陌客 | `recluse` | outsider |
| `hatterbutton` | 帽匠 | `hatter` | outsider |
| `harpybutton` | 鹰身女妖 | `harpy` | minion |
| `assassinbutton` | 刺客 | `assassin` | minion |
| `poisonerbutton` | 投毒者 | `poisoner` | minion |
| `devils_advocatebutton` | 魔鬼代言人 | `devilsadvocate` | minion |
| `ojobutton` | 奥赫 | `ojo` | demon |
| `lleechbutton` | 痢蛭 | `lleech` | demon |
| `vortoxbutton` | 涡流 | `vortox` | demon |
| `pobutton` | 珀 | `po` | demon |
| `sentinelbutton` | 哨兵 | `sentinel` | fabled |

复用项目 `confirmedRoleFactsForScript`；基础事实池缺少的已存在角色跨包复用。角色的输入规则、技能研究与风险资料沿用已确认角色对象，不复制另一套同名角色。

## 夜序与模板

- 首夜：`alchemist, sailor, preacher, lleech, poisoner, courtier, devilsadvocate, harpy, chef, empath, fortuneteller, seamstress, bountyhunter, nightwatchman`。
- 后续夜：`sailor, preacher, poisoner, courtier, innkeeper, devilsadvocate, harpy, po, vortox, ojo, lleech, assassin, hatter, sweetheart, ravenkeeper, empath, fortuneteller, seamstress, bountyhunter, nightwatchman`。
- 均为 2026-10-16 当前官方表过滤，原序号写在条目 note；原库数字顺位不直接混用。条件唤醒、额外能力和新角色能力仍由说书人确认，不能重排已有对局快照。
- 22 套模板：7/8/9/10/11/12/13/14/15 人分别 3/2/2/3/2/3/2/2/3 套。全部角色在本板、不重复；3 伪装为不在场善良角色，排除旅行者和传奇角色。
- 人数修正写入每套模板的 setupAdjustments，不只写备注。模板为结构合法且有主持说明，不代表已验证玩家体验平衡。

## Setup 与高风险提醒

- 酒鬼需要一个不在场镇民作自认身份；其信息和唤醒按该身份模拟，实际没有该能力，不能把自认身份当成实际角色。
- 赏金猎人使一名镇民邪恶但不改变角色类型人数；邪恶镇民身份由主持私下确认。首批常规模板暂不选用赏金猎人，角色保留供手动主持。
- 炼金术士按当前官方版可拥有在场或不在场爪牙的能力，使用时主持可要求重选；仍是善良镇民。授予能力、额外唤醒和任何 setup 修正须在开局确认。
- 哨兵是传奇角色，不占玩家席位；本批常规模板不启用其 ±1 外来者选项。主持另行启用时必须显式更正人数，不能把传奇角色放入伪装。
- 占卜师开局需选一名善良玩家为红鲱鱼；登记、毒醉和保护会影响信息，不能仅凭实际恶魔席位机械作答。
- 痢蛭首夜选存活宿主并使其中毒，后续夜再选击杀目标；宿主存活时痢蛭不能死。宿主醉毒、死亡和痢蛭恢复能力的先后须主持确认。
- 珀明确记录不选、普通单杀或充能后 3 目标；逐个按主持确认顺序处理死亡、保护与源失效，不把 3 次攻击当作同时死亡。
- 涡流只令镇民能力产生错误信息；主持须区分被处决与处决死亡，白天无人被处决会触发邪恶胜利。不能把外来者信息一律翻转。
- 奥赫选择角色而非玩家；角色不在场时死亡目标由主持决定，多名同角色与保护效果须结合本局事实确认。
- 帽匠清醒健康地于今天或当晚死亡才触发；爪牙和恶魔玩家可保留或换同类型新角色，不改变阵营。不能重复角色，新增能力可能须当晚唤醒；恶魔已攻击后换新恶魔不能再攻击。
- 鹰身女妖选两名玩家，第一名需疯狂证明第二名邪恶；不疯狂时一人或两人可能死亡而非必定处决，主持裁量并记录。
- 传教士选中爪牙才通知目标；被布道爪牙在传教士存活且清醒健康时失能，传教士醉毒或死亡时能力可能恢复。一次性能力使用次数不会自动重置。
- 旅店老板保护当晚两名玩家并使其中一人醉酒；先确定实际目标、醉酒者和生效状态，保护源失效后的攻击须重新核对。

## 验证

- 2026-10-16 定向回归：`npx vitest run src/domain/scripts/wikiBatchA.test.ts`，13 项通过（含生产 candidate 及修正选择链，5 板 × 9 人数的 110 套均可见）；定向 oxlint 无警告，`npx tsc -b --pretty false` 通过。
- 集成后由主 Agent 统一运行质量门、人数构成、架构、构建及浏览器检查。
- 本包实现未调用付费 AI，未修改现有对局、共享角色事实、注册表或部署。

## 关键技能真实抽测建议（尚未调用）

- 场景：传教士先于投毒者生效。
- 已知事实：传教士清醒健康，当晚按官方夜序选中实际投毒者并通知他；传教士随后仍清醒健康，其他能力没有改变两人的状态。
- 独立预期：投毒者在轮到自身行动前已经失去能力，不能新增有效中毒目标。不能因为此前夜晚曾有投毒能力而让本晚新中毒照常生效。
- 规则依据：[官方角色说明](https://wiki.bloodontheclocktower.com/Preacher)。
- 这是交给主 Agent 的抽测 oracle，不代表已经执行或已通过真实 AI。
