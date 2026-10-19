# 奥法集会 / Ember 验收记录

状态：来源、角色映射、当前官方规则与结构模板已核对；最终集成、浏览器与真实 AI 结果由批次发布记录补充，不能据此称全部组合已实测。

- 来源：[Clocktower Wiki](https://kkovo550.github.io/clocktower-wiki/)，社区剧本，不是官方剧本。
- 库索引：548；原文件：`快速上手与角色主题竞赛剧本\角色竞赛优胜剧本\#奥法集会-Ember.json`；原元数据名称：`奥法集会-Ember`。
- 作者：Ember。
- 库构建：`16ad8f7c270dfc011aeb9fc412950304b68293fc5269c882c32b2e037fc5073e`。
- 原 JSON UTF-8 字节 SHA-256：`f0dec4f76dcdfc9064d0ce2ce38eee58535688bd1ecb689f67bfc52ab64958ca`。
- 官方资料：[roles.json](https://release.botc.app/resources/data/roles.json)、[nightsheet.json](https://release.botc.app/resources/data/nightsheet.json)，核对日期 2026-10-16。

## 原文 ID 映射与规则版本

原库自制 ID 经原文能力、角色类型和官方英文能力逐条核对后映射，未按中文名直接导入。角色能力及夜序采用当前官方规则；原始字节哈希仍锁定原库原文，二者不是同一规则版本。

| 原文 ID | 原文显示名 | 稳定 ID | 类型 |
|---|---|---|---|
| `jingcaisanxuanyi111` | 贵族 | `noble` | townsfolk |
| `woshininainai111` | 祖母 | `grandmother` | townsfolk |
| `tashuofengyuzhongzhediantongsuanshenme111` | 水手 | `sailor` | townsfolk |
| `mofashuijingqiu111` | 占卜师 | `fortuneteller` | townsfolk |
| `qiaozhong111` | 城镇公告员 | `towncrier` | townsfolk |
| `zhengdanideyanjing111` | 神谕者 | `oracle` | townsfolk |
| `lushichuanshuodelaoban111` | 旅店老板 | `innkeeper` | townsfolk |
| `chunzaoyaoa` | 造谣者 | `gossip` | townsfolk |
| `huojin111` | 博学者 | `savant` | townsfolk |
| `diaoshangyizhengtiandeyu111` | 渔夫 | `fisherman` | townsfolk |
| `chichichichichichichi111` | 食人族 | `cannibal` | townsfolk |
| `shanliangdeniaoer111` | 守鸦人 | `ravenkeeper` | townsfolk |
| `buhaohe111` | 茶艺师 | `tealady` | townsfolk |
| `woheduolema111` | 酒鬼 | `drunk` | outsider |
| `dabanshou111` | 修补匠 | `tinker` | outsider |
| `zhegeshimonk111` | 陌客 | `recluse` | outsider |
| `fengmaoziyuailisi111` | 帽匠 | `hatter` | outsider |
| `zhijiagedaziji111` | 教父 | `godfather` | minion |
| `touduzheeeeeeee111` | 投毒者 | `poisoner` | minion |
| `jiushigelvshi111` | 魔鬼代言人 | `devilsadvocate` | minion |
| `weishenmebushilianjinshushi111` | 科学怪人 | `boffin` | minion |
| `xiaoemo1111111eee111eee111` | 小恶魔 | `imp` | demon |
| `oeeroeeerooooeeeeee1111111` | 奥赫 | `ojo` | demon |
| `opppppppppp1111` | 珀 | `po` | demon |
| `wangguuuuuuuu111111` | 亡骨魔 | `vigormortis` | demon |

复用项目 `confirmedRoleFactsForScript`；基础事实池缺少的已存在角色跨包复用。角色的输入规则、技能研究与风险资料沿用已确认角色对象，不复制另一套同名角色。

## 夜序与模板

- 首夜：`boffin, sailor, poisoner, godfather, devilsadvocate, fortuneteller, grandmother, noble`。
- 后续夜：`sailor, poisoner, innkeeper, devilsadvocate, imp, po, vigormortis, ojo, godfather, gossip, hatter, tinker, grandmother, ravenkeeper, fortuneteller, towncrier, oracle`。
- 均为 2026-10-16 当前官方表过滤，原序号写在条目 note；原库数字顺位不直接混用。条件唤醒、额外能力和新角色能力仍由说书人确认，不能重排已有对局快照。
- 22 套模板：7/8/9/10/11/12/13/14/15 人分别 3/2/2/3/2/3/2/2/3 套。全部角色在本板、不重复；3 伪装为不在场善良角色，排除旅行者和传奇角色。
- 人数修正写入每套模板的 setupAdjustments，不只写备注。模板为结构合法且有主持说明，不代表已验证玩家体验平衡。

## Setup 与高风险提醒

- 教父开局必须增加或减少 1 外来者，替换对应镇民；白天有外来者死亡才可能追加夜杀。
- 亡骨魔开局减少 1 外来者并增加 1 镇民；被其杀死的爪牙保留能力且使其邻近镇民中毒，不能把普通夜死一概当成失能。
- 酒鬼需要一个不在场镇民作自认身份；其信息和唤醒按该身份模拟，实际没有该能力，不能把自认身份当成实际角色。
- 科学怪人为恶魔提供不在场善良角色能力；授予能力及其可能的 setup 修正由主持另行确认。科学怪人失能时额外能力失效。与莽夫同场时恶魔不能因此转善；额外唤醒须按授予能力处理。
- 占卜师开局需选一名善良玩家为红鲱鱼；登记、毒醉和保护会影响信息，不能仅凭实际恶魔席位机械作答。
- 珀明确记录不选、普通单杀或充能后 3 目标；逐个按主持确认顺序处理死亡、保护与源失效，不把 3 次攻击当作同时死亡。
- 奥赫选择角色而非玩家；角色不在场时死亡目标由主持决定，多名同角色与保护效果须结合本局事实确认。
- 帽匠清醒健康地于今天或当晚死亡才触发；爪牙和恶魔玩家可保留或换同类型新角色，不改变阵营。不能重复角色，新增能力可能须当晚唤醒；恶魔已攻击后换新恶魔不能再攻击。
- 旅店老板保护当晚两名玩家并使其中一人醉酒；先确定实际目标、醉酒者和生效状态，保护源失效后的攻击须重新核对。

## 验证

- 2026-10-16 定向回归：`npx vitest run src/domain/scripts/wikiBatchA.test.ts`，13 项通过（含生产 candidate 及修正选择链，5 板 × 9 人数的 110 套均可见）；定向 oxlint 无警告，`npx tsc -b --pretty false` 通过。
- 集成后由主 Agent 统一运行质量门、人数构成、架构、构建及浏览器检查。
- 本包实现未调用付费 AI，未修改现有对局、共享角色事实、注册表或部署。

## 关键技能真实抽测建议（尚未调用）

- 场景：教父追加夜杀仍受茶艺师保护。
- 已知事实：白天有实际外来者死亡，清醒健康的教父本晚有击杀机会；他选择茶艺师的一名存活邻座。茶艺师清醒健康且其两名存活邻座均为善良，其他能力没有干扰。
- 独立预期：教父可发动但其击杀不能越过茶艺师免死保护，目标存活。刺客式无视免死的例外不能借给教父。
- 规则依据：[官方角色说明](https://wiki.bloodontheclocktower.com/Tea_Lady)。
- 这是交给主 Agent 的抽测 oracle，不代表已经执行或已通过真实 AI。
