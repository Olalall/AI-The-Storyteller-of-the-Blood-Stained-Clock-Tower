# 幕后操控 首批验收

核对日期：2026-10-16。社区板子，作者 `Ben Burns`；不是官方发行剧本。

- 来源：[剧本库](https://kkovo550.github.io/clocktower-wiki/script_lib/%E5%89%A7%E6%9C%AC%E5%BA%93.html)，build `16ad8f7c270dfc011aeb9fc412950304b68293fc5269c882c32b2e037fc5073e`，索引 `823`，文件 `海外社区推荐剧本\#幕后操控-Ben Burns.json`。
- 版本：来源未标版本；未标版本时不猜作者最新版本。实际来源是该站 `scripts-full.js` 的内嵌原始 JSON，独立 `library/json/…` URL 返回 404，不冒充直接下载成功。
- 原始 JSON 字节数 `15032`，SHA256 `b77d9ce8594bfccaf5faaec7e935aa05d633d60f0fe0919af9ea37d3460428da`，原字节保存在 `source.json`，逐角色别名/阵营/能力摘要和官方快照 SHA 保存在 `source-lock.json`。
- 当前官方角色和夜表已逐项对照；角色复用现有已确认事实，不按中文名覆盖全局角色。

角色（23 个）：

```text
washerwoman, librarian, investigator, chef, empath, fortuneteller, undertaker, monk, ravenkeeper, virgin, slayer, soldier, mayor, butler, drunk, recluse, saint, marionette, poisoner, spy, scarletwoman, baron, imp
```

首夜：`marionette, poisoner, washerwoman, librarian, investigator, chef, empath, fortuneteller, butler, spy`。

其他夜：`poisoner, monk, scarletwoman, imp, ravenkeeper, empath, fortuneteller, undertaker, butler, spy`。

夜序是当前官方夜表过滤，保留其原始顺位；不信任来源旧 JSON 的夜序整数。不覆盖既有对局的夜序/配板快照。

设置、相克和风险：

- 来源原始 ID 按稳定英文别名、能力和阵营逐项核对；本包只用于新对局，既有对局的配板和夜序快照不迁移。普通恶魔伪装为三枚不在场善良角色。
- 男爵在场时 +2 外来者，替换两名镇民；每套相关模板显式记录该修正。
- 酒鬼和提线木偶需要不在场的善良假身份；提线木偶必须与小恶魔邻座且由恶魔知道。假身份不改变其真实外来者/爪牙类型。
- 开局由说书人指定一名善良玩家作为占卜师红鲱鱼；不能从登记结果反推真实恶魔。
- 小恶魔能力自杀与红唇女郎成为恶魔要核对当刻至少五名存活者、能力是否有效及传递对象；身份变化追加记录。
- 贞洁者首次被镇民提名可立即处决；圣徒处决死亡、镇长三人无处决等胜负条件由说书人分别确认。处决与死亡不是同一件事。
- 采用当前官方调查员能力：两名玩家中一名是指定爪牙。原库附带的“或者没有爪牙”中文扩写不作为额外授权。

共22套 verified 模板：7/8/9/10/11/12/13/14/15人分别3/2/2/3/2/3/2/2/3套。模板角色/伪装在本板内、伪装不在场、重复军团单独声明且构成修正可核算。酒鬼/木偶的假身份与配座由主持确认；配板不自动生成权威状态。

真实 AI 抽测题：**小恶魔自杀传位**。前提：10 人，6 人存活，清醒健康小恶魔用自己的能力选择自己；清醒健康红唇女郎及另一爪牙均存活。此死亡前有6人存活。 规则基准：小恶魔死亡，清醒健康红唇女郎成为小恶魔，游戏继续；不能因为小恶魔死亡立刻判善良赢。确认原恶魔死亡与新恶魔身份两条记录。 [依据](https://wiki.bloodontheclocktower.com/Scarlet_Woman)。机器可读题在 `ai-regression-oracle.json`。本文件未声称已完成真实 AI；统一集成后由根任务登记实际结果。

定向测试：`npx vitest run src/domain/scripts/wikiBatchB.test.ts`。尚未由本子任务注册、全仓库检查、浏览器验收或部署，交由集成任务统一完成。

非标准来源 ID `zheyeshigejiugui111` 经提线木偶技能和 minion 阵营核对映射到 `marionette`；不是把其 ID 字面误认成酒鬼。调查员采用当前官方没有额外“无爪牙”分支的能力。

子任务定向结果：`wikiBatchB.test.ts` 33 项通过，包含 88 套模板的生产规则包/evaluator、真实候选生成（标准与混合经验）、圆桌邻座/军团多数/显式人数修正。与 King、调查员及原角色文案投影联合 43 项通过；`tsc -b` 与本批 lint 通过。浏览器/总检查/部署结果由本批总验收统一登记，不把上述结构核对当作全组合技能穷举。

当前调查员中文投影移除了来源旧文的“没有爪牙”附加分支；图书管理员的零外来者提示仍保留。真实幕后操控/原暗流涌动身份交接、夜序和 AI 请求投影通过，旧队列文字与已确认记录保持原样。
