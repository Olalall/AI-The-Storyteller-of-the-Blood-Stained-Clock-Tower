# 事与愿违 / Train 验收记录

状态：来源、角色映射、当前官方规则与结构模板已核对；最终集成、浏览器与真实 AI 结果由批次发布记录补充，不能据此称全部组合已实测。

- 来源：[Clocktower Wiki](https://kkovo550.github.io/clocktower-wiki/)，社区剧本，不是官方剧本。
- 库索引：536；原文件：`快速上手与角色主题竞赛剧本\角色竞赛优胜剧本\#事与愿违-Train.json`；原元数据名称：`事与愿违-Train`。
- 作者：Train。
- 库构建：`16ad8f7c270dfc011aeb9fc412950304b68293fc5269c882c32b2e037fc5073e`。
- 原 JSON UTF-8 字节 SHA-256：`924f2b54859c84e2fa5bf704162067f12ed683a347ca1da7efe98dd25bc2e5c9`。
- 官方资料：[roles.json](https://release.botc.app/resources/data/roles.json)、[nightsheet.json](https://release.botc.app/resources/data/nightsheet.json)，核对日期 2026-10-16。

## 原文 ID 映射与规则版本

原库自制 ID 经原文能力、角色类型和官方英文能力逐条核对后映射，未按中文名直接导入。角色能力及夜序采用当前官方规则；原始字节哈希仍锁定原库原文，二者不是同一规则版本。 原文部分 ID 为作者自造字符串；鹰身女妖两版本中文措辞按当前官方“一人或两人可能死亡”解释。

| 原文 ID | 原文显示名 | 稳定 ID | 类型 |
|---|---|---|---|
| `mangshengnifaxianlehuadian111` | 调查员 | `investigator` | townsfolk |
| `wocaishichushen111` | 厨师 | `chef` | townsfolk |
| `ainiii11111` | 共情者 | `empath` | townsfolk |
| `wuxingshangjiang111` | 将军 | `general` | townsfolk |
| `mofashuijingqiu111` | 占卜师 | `fortuneteller` | townsfolk |
| `zhengdanideyanjing111` | 神谕者 | `oracle` | townsfolk |
| `weishenmesenglvjiaomoke111` | 僧侣 | `monk` | townsfolk |
| `xitele111` | 艺术家 | `artist` | townsfolk |
| `biubiubiu111` | 猎手 | `slayer` | townsfolk |
| `haogaodeshan111` | 巡山人 | `huntsman` | townsfolk |
| `tiepigu111` | 贞洁者 | `virgin` | townsfolk |
| `shiyizhezhezhezhe` | 失忆者 | `amnesiac` | townsfolk |
| `xiaolazhu111` | 贤者 | `sage` | townsfolk |
| `zhegeshimonk111` | 陌客 | `recluse` | outsider |
| `bushiwo111` | 落难少女 | `damsel` | outsider |
| `woheduolema111` | 酒鬼 | `drunk` | outsider |
| `biezaizhelifadian111` | 理发师 | `barber` | outsider |
| `chukouchengzhang` | 灵言师 | `mezepheles` | minion |
| `touduzheeeeeeee111` | 投毒者 | `poisoner` | minion |
| `yingyingying111` | 鹰身女妖 | `harpy` | minion |
| `nanjueeeee111` | 男爵 | `baron` | minion |
| `xiaoshabi111111` | 小怪宝 | `lilmonsta` | demon |
| `xiaoemo1111111eee111eee111` | 小恶魔 | `imp` | demon |
| `wangguuuuuuuu111111` | 亡骨魔 | `vigormortis` | demon |
| `woliuliuliu111` | 涡流 | `vortox` | demon |

复用项目 `confirmedRoleFactsForScript`；基础事实池缺少的已存在角色跨包复用。角色的输入规则、技能研究与风险资料沿用已确认角色对象，不复制另一套同名角色。

## 夜序与模板

- 首夜：`lilmonsta, poisoner, harpy, mezepheles, huntsman, damsel, amnesiac, investigator, chef, empath, fortuneteller, general`。
- 后续夜：`poisoner, monk, harpy, mezepheles, imp, vortox, vigormortis, lilmonsta, barber, sage, huntsman, damsel, amnesiac, empath, fortuneteller, oracle, general`。
- 均为 2026-10-16 当前官方表过滤，原序号写在条目 note；原库数字顺位不直接混用。条件唤醒、额外能力和新角色能力仍由说书人确认，不能重排已有对局快照。
- 22 套模板：7/8/9/10/11/12/13/14/15 人分别 3/2/2/3/2/3/2/2/3 套。全部角色在本板、不重复；3 伪装为不在场善良角色，排除旅行者和传奇角色。
- 人数修正写入每套模板的 setupAdjustments，不只写备注。模板为结构合法且有主持说明，不代表已验证玩家体验平衡。

## Setup 与高风险提醒

- 男爵在场增加 2 外来者并减少 2 镇民，须与亡骨魔等修正相加。
- 亡骨魔开局减少 1 外来者并增加 1 镇民；被其杀死的爪牙保留能力且使其邻近镇民中毒，不能把普通夜死一概当成失能。
- 酒鬼需要一个不在场镇民作自认身份；其信息和唤醒按该身份模拟，实际没有该能力，不能把自认身份当成实际角色。
- 小怪宝是被照看的恶魔标记，不是额外玩家；开局用额外 1 爪牙替代恶魔，且无恶魔伪装。首批模板排除小怪宝，照看者、夜死和投票登记由主持手动确认。
- 巡山人在场必须有落难少女；已有落难少女时不重复增加，否则用一镇民替换为落难少女。本批只选用已有落难少女的模板。救援后由主持选择不在场镇民并及时按新能力唤醒。
- 爪牙共同只有一次公开猜落难少女机会；不能按每个爪牙各给一次。救援与猜测先后、醉毒和胜负均须主持核对。
- 失忆者能力必须由主持另行设计和记录，不能由 AI 发明；首批常规模板暂不选用，仍保留角色供手动主持。
- 占卜师开局需选一名善良玩家为红鲱鱼；登记、毒醉和保护会影响信息，不能仅凭实际恶魔席位机械作答。
- 涡流只令镇民能力产生错误信息；主持须区分被处决与处决死亡，白天无人被处决会触发邪恶胜利。不能把外来者信息一律翻转。
- 鹰身女妖选两名玩家，第一名需疯狂证明第二名邪恶；不疯狂时一人或两人可能死亡而非必定处决，主持裁量并记录。
- 灵言师暗号及第一名公开说出的善良玩家须主持记录；阵营转变在当晚处理，不能只因聊天提到关键词即自动变阵营。

## 验证

- 2026-10-16 定向回归：`npx vitest run src/domain/scripts/wikiBatchA.test.ts`，13 项通过（含生产 candidate 及修正选择链，5 板 × 9 人数的 110 套均可见）；定向 oxlint 无警告，`npx tsc -b --pretty false` 通过。
- 集成后由主 Agent 统一运行质量门、人数构成、架构、构建及浏览器检查。
- 本包实现未调用付费 AI，未修改现有对局、共享角色事实、注册表或部署。

## 关键技能真实抽测建议（尚未调用）

- 场景：巡山人救中毒落难少女。
- 已知事实：巡山人清醒健康、尚未用过能力，夜间选择存活但中毒的实际落难少女；主持已确定一个不在场镇民作为新角色。
- 独立预期：巡山人能力仍可使落难少女立即变成该镇民，因为发挥能力的是清醒健康的巡山人；不能因目标中毒而拒绝救援，也不能擅自清除由其他角色造成且仍有效的中毒。
- 规则依据：[官方角色说明](https://wiki.bloodontheclocktower.com/Huntsman)。
- 这是交给主 Agent 的抽测 oracle，不代表已经执行或已通过真实 AI。
