# 魅语连珠v1.2.0 首批验收

核对日期：2026-10-16。社区板子，作者 `Luxray,Justin & sabenite`；不是官方发行剧本。

- 来源：[剧本库](https://kkovo550.github.io/clocktower-wiki/script_lib/%E5%89%A7%E6%9C%AC%E5%BA%93.html)，build `16ad8f7c270dfc011aeb9fc412950304b68293fc5269c882c32b2e037fc5073e`，索引 `566`，文件 `快速上手与角色主题竞赛剧本\角色竞赛优胜剧本\#魅语连珠v1.2.0.json`。
- 版本：v1.2.0；未标版本时不猜作者最新版本。实际来源是该站 `scripts-full.js` 的内嵌原始 JSON，独立 `library/json/…` URL 返回 404，不冒充直接下载成功。
- 原始 JSON 字节数 `15763`，SHA256 `b684e45ffcb9df260e7bafd4a6a520350e49dac7ed83230d7702408a025075dd`，原字节保存在 `source.json`，逐角色别名/阵营/能力摘要和官方快照 SHA 保存在 `source-lock.json`。
- 当前官方角色和夜表已逐项对照；角色复用现有已确认事实，不按中文名覆盖全局角色。

角色（25 个）：

```text
highpriestess, librarian, noble, chef, pixie, dreamer, empath, oracle, monk, savant, artist, juggler, cannibal, recluse, drunk, mutant, klutz, spy, cerenovus, marionette, mezepheles, vortox, legion, vigormortis, nodashii
```

首夜：`marionette, cerenovus, mezepheles, pixie, librarian, chef, empath, dreamer, noble, spy, highpriestess`。

其他夜：`monk, cerenovus, mezepheles, legion, nodashii, vortox, vigormortis, empath, dreamer, oracle, juggler, spy, highpriestess`。

夜序是当前官方夜表过滤，保留其原始顺位；不信任来源旧 JSON 的夜序整数。不覆盖既有对局的夜序/配板快照。

设置、相克和风险：

- 来源原始 ID 按稳定英文别名、能力和阵营逐项核对；本包只用于新对局，既有对局的配板和夜序快照不迁移。普通恶魔伪装为三枚不在场善良角色。
- 亡骨魔 -1 外来者并增加一名镇民；本批只在基础外来者大于零时提供其模板。被它杀死的爪牙保留能力和邻近镇民中毒分别记录。
- 军团模板多数玩家为军团，重复身份与零实际爪牙显式记录人数修正。只有邪恶投票时处决失败；不能因为人数过半就自动宣布邪恶胜利。 本批选用官方允许的三枚伪装方案，不支持在这些模板中临时改成零枚；零伪装由主持在后续专门支持后再选。
- 涡流要求镇民能力信息为假；不是所有阵营或所有角色的信息都强制为假。白天无人被处决时邪恶获胜，处决发生但没有死亡不能误判成没有处决。
- 诺-达鲺的两名邻近镇民按镇民类型寻找，跳过其他类型；中毒来源和真实身份/登记须由说书人确认。
- 洗脑师指定玩家和一个善良角色；小精灵在符合疯狂要求且被告知的镇民死亡时获得能力。疯狂是否满足与处决后果保留说书人裁量。
- 灵言师首夜得到暗号，首个说出暗号的善良玩家在当晚变邪恶；须记录当日首个符合者，不能立即变阵营或每次重复触发。
- 酒鬼与提线木偶使用假身份；提线木偶相邻恶魔。呆瓜得知死亡后的公开选择及其阵营失败要单独确认。
- 本包锁定作者 JSON 的 v1.2.0。来源目录的配图名称写 v1.3，未据此合并另一版本角色表或夜表。

共22套 verified 模板：7/8/9/10/11/12/13/14/15人分别3/2/2/3/2/3/2/2/3套。模板角色/伪装在本板内、伪装不在场、重复军团单独声明且构成修正可核算。酒鬼/木偶的假身份与配座由主持确认；配板不自动生成权威状态。

真实 AI 抽测题：**涡流处决不死**。前提：10 人，清醒健康涡流在场。白天一名已经死亡的玩家被提名、达到票数并被正式处决。没有其他胜负条件触发。 规则基准：白天已经发生处决，不触发涡流“无人被处决”邪恶胜利；处决与死亡分开记录。仍核对镇民信息应为假。 [依据](https://wiki.bloodontheclocktower.com/Vortox)。机器可读题在 `ai-regression-oracle.json`。本文件未声称已完成真实 AI；统一集成后由根任务登记实际结果。

定向测试：`npx vitest run src/domain/scripts/wikiBatchB.test.ts`。尚未由本子任务注册、全仓库检查、浏览器验收或部署，交由集成任务统一完成。

非标准来源 ID `jingcaisanxuanyi111` 依据首夜三名玩家恰一邪恶的技能和 townsfolk 阵营映射 `noble`。该索引图片名 v1.3 与 JSON v1.2.0 不一致，本包只导入 JSON v1.2.0，不合并配图另一版本。

子任务定向结果：`wikiBatchB.test.ts` 33 项通过，包含 88 套模板的生产规则包/evaluator、真实候选生成（标准与混合经验）、圆桌邻座/军团多数/显式人数修正。与 King、调查员及原角色文案投影联合 43 项通过；`tsc -b` 与本批 lint 通过。浏览器/总检查/部署结果由本批总验收统一登记，不把上述结构核对当作全组合技能穷举。
