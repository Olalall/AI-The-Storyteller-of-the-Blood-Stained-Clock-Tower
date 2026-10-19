# 追峰逐日 第二批草稿验收

状态：材料草稿，未注册、未上线；root 统一复核集成。日期：2026-10-16。

- 作者：贾卡jaques；社区板子，不是官方发行剧本。
- [来源库](https://kkovo550.github.io/clocktower-wiki/script_lib/%E5%89%A7%E6%9C%AC%E5%BA%93.html)：索引 324，build `16ad8f7c270dfc011aeb9fc412950304b68293fc5269c882c32b2e037fc5073e`；来源文件 `追峰逐日.json`。
- 作者原文未标版本，不猜最新版本。原字节保存在 `source.json`，17073 字节，SHA-256 `a6e65b08c24c8b8c43bd5bf5f8bed1d515a34d3f6d735c6f8a66713811ef030c`。
- 原库版本和当前官方规则适配分开记录；`source-lock.json` 锁定原文/逐角色能力哈希、稳定别名、官方快照哈希及差异。
- [当前官方角色](https://release.botc.app/resources/data/roles.json)与[官方夜表](https://release.botc.app/resources/data/nightsheet.json)核对日期 2026-10-16。相克与特别判定参考 setup-rules 的官方 Wiki primary 链接。

## 版本差异

- 原文标准角色与当前官方语义核对后适配；灯神为公开相克提醒，既不占席位也不作恶魔伪装。
- 方古、教父的人数修正分别记录并相加，不凭固定外来者人数猜恶魔。

## 角色映射

没有新增自制角色ID，没有覆盖共享事实。大部分复用 `confirmedRoleFactsForScript`，额外角色按 roles.ts 引用现有已核包对象，输入规则和AI研究摘要保持同一来源。

| 原文ID | 原文名 | 稳定ID | 类型 |
|---|---|---|---|
| `grandmotherbutton` | 祖母 | `grandmother` | townsfolk |
| `chefbutton` | 厨师 | `chef` | townsfolk |
| `fortune_tellerbutton` | 占卜师 | `fortuneteller` | townsfolk |
| `chambermaidbutton` | 侍女 | `chambermaid` | townsfolk |
| `flowergirlbutton` | 卖花女孩 | `flowergirl` | townsfolk |
| `oraclebutton` | 神谕者 | `oracle` | townsfolk |
| `gamblerbutton` | 赌徒 | `gambler` | townsfolk |
| `slayerbutton` | 猎手 | `slayer` | townsfolk |
| `seamstressbutton` | 女裁缝 | `seamstress` | townsfolk |
| `tea_ladybutton` | 茶艺师 | `tealady` | townsfolk |
| `jugglerbutton` | 杂耍艺人 | `juggler` | townsfolk |
| `ravenkeeperbutton` | 守鸦人 | `ravenkeeper` | townsfolk |
| `foolbutton` | 弄臣 | `fool` | townsfolk |
| `barberbutton` | 理发师 | `barber` | outsider |
| `saintbutton` | 圣徒 | `saint` | outsider |
| `drunkbutton` | 酒鬼 | `drunk` | outsider |
| `klutzbutton` | 呆瓜 | `klutz` | outsider |
| `scarlet_womanbutton` | 红唇女郎 | `scarletwoman` | minion |
| `godfatherbutton` | 教父 | `godfather` | minion |
| `devils_advocatebutton` | 魔鬼代言人 | `devilsadvocate` | minion |
| `assassinbutton` | 刺客 | `assassin` | minion |
| `vortoxbutton` | 涡流 | `vortox` | demon |
| `pobutton` | 珀 | `po` | demon |
| `pukkabutton` | 普卡 | `pukka` | demon |
| `fang_gubutton` | 方古 | `fanggu` | demon |
| `djinnbutton` | 灯神 | `djinn` | fabled |

## 夜序与设置

- 首夜：`godfather, devilsadvocate, pukka, chef, fortuneteller, grandmother, seamstress, chambermaid`。
- 其他夜：`gambler, devilsadvocate, scarletwoman, pukka, po, fanggu, vortox, assassin, godfather, barber, grandmother, ravenkeeper, fortuneteller, flowergirl, oracle, seamstress, juggler, chambermaid`。
- 均从当前官方夜表过滤，原序号保存在 note；不混用原库旧整数。额外能力或角色变化由主持核对，不自动重排旧对局。
- 22套：7/8/9/10/11/12/13/14/15人分别3/2/2/3/2/3/2/2/3。所有人数修正带 choiceId，伪装是本板3个不在场善良角色，传奇不占席位。

- 所有开局、技能、毒醉、生死、角色、阵营和胜负均由说书人确认；仅新对局读取本包，已有快照不迁移。
- 教父开局+1或-1外来者，等量替换镇民；本批每个含教父模板都显式选择。白天至少一名外来者实际死亡才追加一次夜杀，多个外来者死亡不叠加次数。
- 方古开局+1外来者并减少1镇民；首次成功杀死外来者才由其变邪恶方古且旧方古死，保护阻止实际死亡时不跳；整局最多成功一次。
- 方古成功跳外来者造成旧方古死亡时，红唇女郎不再额外成为方古；若会有两个恶魔且其中一个来自红唇女郎，她仍是红唇女郎。
- 酒鬼自认不在场镇民，实际没有该能力；身份与玩家稿由主持私下确认，不能公开其真实外来者身份。
- 占卜师开局私下指定善良红鲱鱼；按当前登记、毒醉及保护核对，不自动泄露信息来源。
- 珀分清0/1/3目标与蓄力历史，多刀按已确认顺序逐个核对当前保护源，先前已被有效保护挡下的攻击不追溯重结算。
- 普卡新目标中毒、原目标死亡/恢复健康以及自身失能按时点分别核对，不延续已失效毒源，不从当前目标捏造旧毒历史。
- 涡流令镇民能力信息为假，外来者等不一律翻转；白天无人被处决才触发邪恶胜利，处决不死不是无人被处决。
- 灯神只作公开相克提醒，不占席位，不参与普通人数或恶魔伪装；逐条按当前官方相克说明执行。

## 关键行为抽测建议（尚未调用真实AI）

- 教父杀人仍受茶艺师保护。
- 已知事实：紧邻本夜的白天已有一名真实外来者实际死亡。此刻存活且清醒健康的教父使用自己的能力选择茶艺师的一名存活邻座。结算这一刀时，茶艺师仍存活、清醒健康且有能力，其两侧最近存活邻座都为善良，目标正是其中之一；没有其他攻击、能力或相克干扰。
- 独立预期：教父可以发动，但目标受茶艺师免死而存活；不能把刺客的越过保护能力借给教父。
- [官方依据](https://wiki.bloodontheclocktower.com/Tea_Lady)；机器可读题见 `ai-regression-oracle.json`。

## 验证与边界

- 同组离线预集成验证见组级 `offline-validation.json`；该验证在内存注册草稿并调用真实候选链，不写生产目录或已有对局。
- 测试草稿位于组级 `wikiBatch02A.test.ts`，root复制到 `src/domain/scripts/` 后运行；manifest、全check、浏览器与真实AI由集成任务另行登记。
- 本材料没有注册、部署或付费AI调用，不能称为已上线或全技能组合已验证。
