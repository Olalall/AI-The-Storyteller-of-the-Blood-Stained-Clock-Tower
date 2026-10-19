# 伊戈学步 验收记录

状态：来源、角色映射、当前官方规则与结构模板已核对；最终集成、浏览器与真实 AI 结果由批次发布记录补充，不能据此称全部组合已实测。

- 来源：[Clocktower Wiki](https://kkovo550.github.io/clocktower-wiki/)，社区剧本，不是官方剧本。
- 库索引：510；原文件：`快速上手与角色主题竞赛剧本\海外快速上手剧本\#伊戈学步-The Panda Money Couch.json`；原元数据名称：`伊戈学步`。
- 作者：The Panda Money Couch。
- 库构建：`16ad8f7c270dfc011aeb9fc412950304b68293fc5269c882c32b2e037fc5073e`。
- 原 JSON UTF-8 字节 SHA-256：`d724d38959cb17486da1bb128d4ffcb9d815231d1f5bf3858691da405fdccb58`。
- 官方资料：[roles.json](https://release.botc.app/resources/data/roles.json)、[nightsheet.json](https://release.botc.app/resources/data/nightsheet.json)，核对日期 2026-10-16。

## 原文 ID 映射与规则版本

原库自制 ID 经原文能力、角色类型和官方英文能力逐条核对后映射，未按中文名直接导入。角色能力及夜序采用当前官方规则；原始字节哈希仍锁定原库原文，二者不是同一规则版本。 原 JSON 的灯神能力栏直接写了科学怪人—莽夫相克；本包使用标准灯神角色事实，该条相克另保留在 setup-rules。

| 原文 ID | 原文显示名 | 稳定 ID | 类型 |
|---|---|---|---|
| `djinn_GStone` | 灯神 | `djinn` | fabled |
| `grandmother_button` | 祖母 | `grandmother` | townsfolk |
| `sailor_button` | 水手 | `sailor` | townsfolk |
| `chambermaid_button` | 侍女 | `chambermaid` | townsfolk |
| `exorcist_button` | 驱魔人 | `exorcist` | townsfolk |
| `innkeeper_button` | 旅店老板 | `innkeeper` | townsfolk |
| `gambler_button` | 赌徒 | `gambler` | townsfolk |
| `gossip_button` | 造谣者 | `gossip` | townsfolk |
| `courtier_button` | 侍臣 | `courtier` | townsfolk |
| `professor_button` | 教授 | `professor` | townsfolk |
| `minstrel_button` | 吟游诗人 | `minstrel` | townsfolk |
| `tea_lady_button` | 茶艺师 | `tealady` | townsfolk |
| `pacifist_button` | 和平主义者 | `pacifist` | townsfolk |
| `fool_button` | 弄臣 | `fool` | townsfolk |
| `lunatic_button` | 疯子 | `lunatic` | outsider |
| `goon_button` | 莽夫 | `goon` | outsider |
| `tinker_button` | 修补匠 | `tinker` | outsider |
| `moonchild_button` | 月之子 | `moonchild` | outsider |
| `Boffin_button` | 科学怪人 | `boffin` | minion |
| `godfather_button` | 教父 | `godfather` | minion |
| `assassin_button` | 刺客 | `assassin` | minion |
| `devils_advocate_button` | 魔鬼代言人 | `devilsadvocate` | minion |
| `zombuul_button` | 僵怖 | `zombuul` | demon |
| `pukka_button` | 普卡 | `pukka` | demon |
| `shabaloth_button` | 沙巴洛斯 | `shabaloth` | demon |
| `po_button` | 珀 | `po` | demon |

复用项目 `confirmedRoleFactsForScript`；基础事实池缺少的已存在角色跨包复用。角色的输入规则、技能研究与风险资料沿用已确认角色对象，不复制另一套同名角色。

## 夜序与模板

- 首夜：`boffin, lunatic, sailor, courtier, godfather, devilsadvocate, pukka, grandmother, chambermaid`。
- 后续夜：`sailor, courtier, innkeeper, gambler, devilsadvocate, lunatic, exorcist, zombuul, pukka, shabaloth, po, assassin, godfather, gossip, professor, tinker, moonchild, grandmother, chambermaid`。
- 均为 2026-10-16 当前官方表过滤，原序号写在条目 note；原库数字顺位不直接混用。条件唤醒、额外能力和新角色能力仍由说书人确认，不能重排已有对局快照。
- 22 套模板：7/8/9/10/11/12/13/14/15 人分别 3/2/2/3/2/3/2/2/3 套。全部角色在本板、不重复；3 伪装为不在场善良角色，排除旅行者和传奇角色。
- 人数修正写入每套模板的 setupAdjustments，不只写备注。模板为结构合法且有主持说明，不代表已验证玩家体验平衡。

## Setup 与高风险提醒

- 教父开局必须增加或减少 1 外来者，替换对应镇民；白天有外来者死亡才可能追加夜杀。
- 科学怪人为恶魔提供不在场善良角色能力；授予能力及其可能的 setup 修正由主持另行确认。科学怪人失能时额外能力失效。与莽夫同场时恶魔不能因此转善；额外唤醒须按授予能力处理。
- 灯神是公开相克提醒而非席位；本板科学怪人赋予恶魔莽夫能力时，恶魔不能通过此能力变成善良。相克内容须公开说明。
- 珀明确记录不选、普通单杀或充能后 3 目标；逐个按主持确认顺序处理死亡、保护与源失效，不把 3 次攻击当作同时死亡。
- 沙巴洛斯后续夜选择 2 玩家；前一夜目标中的死亡玩家可能反刍复活。是否复活与时机由主持确认，不能当作必定复活。
- 普卡先处理新目标中毒，再核对上一目标的死亡与恢复健康；保护、醉毒、普卡失能或死亡时不得机械延续旧链。
- 旅店老板保护当晚两名玩家并使其中一人醉酒；先确定实际目标、醉酒者和生效状态，保护源失效后的攻击须重新核对。

## 验证

- 2026-10-16 定向回归：`npx vitest run src/domain/scripts/wikiBatchA.test.ts`，13 项通过（含生产 candidate 及修正选择链，5 板 × 9 人数的 110 套均可见）；定向 oxlint 无警告，`npx tsc -b --pretty false` 通过。
- 集成后由主 Agent 统一运行质量门、人数构成、架构、构建及浏览器检查。
- 本包实现未调用付费 AI，未修改现有对局、共享角色事实、注册表或部署。

## 关键技能真实抽测建议（尚未调用）

- 场景：珀三杀与保护源死亡。
- 已知事实：夜间开始时旅店老板清醒健康，保护 2、3 号且令他们其中一人醉酒；1 号旅店老板自己没有任何免死保护。已充能的珀按 1→2→3 顺序攻击，其他能力均不干扰。
- 独立预期：1 号先死亡后旅店老板能力失效，2、3 号失去保护，随后两次攻击也会使他们死亡。不能合并成同时攻击，也不能把保护保留到整夜结束。
- 规则依据：[官方角色说明](https://wiki.bloodontheclocktower.com/Innkeeper)。
- 这是交给主 Agent 的抽测 oracle，不代表已经执行或已通过真实 AI。
