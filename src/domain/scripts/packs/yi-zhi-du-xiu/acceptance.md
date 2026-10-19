# 一枝独秀 首批验收

核对日期：2026-10-16。社区板子，作者 `Jams&Ben`；不是官方发行剧本。

- 来源：[剧本库](https://kkovo550.github.io/clocktower-wiki/script_lib/%E5%89%A7%E6%9C%AC%E5%BA%93.html)，build `16ad8f7c270dfc011aeb9fc412950304b68293fc5269c882c32b2e037fc5073e`，索引 `507`，文件 `快速上手与角色主题竞赛剧本\海外快速上手剧本\#一枝独秀-Jams&Ben.json`。
- 版本：来源未标版本；未标版本时不猜作者最新版本。实际来源是该站 `scripts-full.js` 的内嵌原始 JSON，独立 `library/json/…` URL 返回 404，不冒充直接下载成功。
- 原始 JSON 字节数 `20751`，SHA256 `1bf0a20cfcc8800bc41edb1bb36f6899795ec5d610528df9e115aa6d222316c2`，原字节保存在 `source.json`，逐角色别名/阵营/能力摘要和官方快照 SHA 保存在 `source-lock.json`。
- 当前官方角色和夜表已逐项对照；角色复用现有已确认事实，不按中文名覆盖全局角色。

角色（25 个）：

```text
pixie, shugenja, chef, balloonist, general, mathematician, innkeeper, flowergirl, savant, fisherman, amnesiac, cannibal, ravenkeeper, recluse, drunk, butler, mutant, spy, poisoner, scarletwoman, harpy, marionette, vigormortis, legion, lordoftyphon
```

首夜：`lordoftyphon, marionette, poisoner, harpy, pixie, amnesiac, chef, butler, balloonist, shugenja, spy, general, mathematician`。

其他夜：`poisoner, innkeeper, harpy, scarletwoman, legion, lordoftyphon, vigormortis, amnesiac, ravenkeeper, flowergirl, balloonist, butler, spy, general, mathematician`。

夜序是当前官方夜表过滤，保留其原始顺位；不信任来源旧 JSON 的夜序整数。不覆盖既有对局的夜序/配板快照。

设置、相克和风险：

- 来源原始 ID 按稳定英文别名、能力和阵营逐项核对；本包只用于新对局，既有对局的配板和夜序快照不迁移。普通恶魔伪装为三枚不在场善良角色。
- 气球驾驶员可 +0 或 +1 外来者；模板中的 +1 必须替换一名镇民。其假身份是提线木偶时，仍可能在初始设置加一名外来者。
- 亡骨魔 -1 外来者并增加一名镇民；零基础外来者模板若使用亡骨魔，须另由气球驾驶员 +1 抵消，不能出现负人数。亡骨魔杀死的爪牙可保留能力并令邻近一名镇民中毒。
- 堤丰之首 +1 爪牙，外来者数量可自由修正；本批模板选择不额外改外来者。全部邪恶角色连续相邻，恶魔两侧都必须是邪恶角色，不能在连续段端点；不要求几何中位。提线木偶需紧邻恶魔。首夜分发爪牙信息，不是攻击选择。
- 军团局多数玩家实际为军团，军团也登记为爪牙；模板显式记录多恶魔、零实际爪牙及善良人数。只有邪恶玩家投票时处决失败；不是自动禁止记录那一轮投票。 本批选用官方允许的三枚伪装方案，不支持在这些模板中临时改成零枚；零伪装由主持在后续专门支持后再选。
- 食人族获得管家能力时，食人族会被告知自己获得了管家能力。
- 数学家还要核对酒鬼与提线木偶：其自认为拥有的能力是否给错信息或未正常运作；不是仅因隐藏身份就固定加一。
- 旅店老板选择两名玩家，其中一人醉酒；鹰身女妖选两名玩家并保留先后次序。保护、醉酒以及疯狂破坏后的死亡都须逐项确认。
- 酒鬼与提线木偶的假身份由说书人手动记录，恶魔伪装为本板不在场善良角色，不泄露隐藏爪牙。

共22套 verified 模板：7/8/9/10/11/12/13/14/15人分别3/2/2/3/2/3/2/2/3套。模板角色/伪装在本板内、伪装不在场、重复军团单独声明且构成修正可核算。酒鬼/木偶的假身份与配座由主持确认；配板不自动生成权威状态。

真实 AI 抽测题：**堤丰之首设置/单目标**。前提：10 人、基础零外来者，选择堤丰之首且不额外修正外来者。邪恶角色为投毒者、间谍、鹰身女妖、堤丰之首。 规则基准：应为6镇民0外来者3爪牙1恶魔。四个邪恶角色连续，堤丰之首两侧皆邪恶且不在连续段端点。首夜分发爪牙信息，不攻击；第二夜只选1名攻击目标。 [依据](https://wiki.bloodontheclocktower.com/Lord_of_Typhon)。机器可读题在 `ai-regression-oracle.json`。本文件未声称已完成真实 AI；统一集成后由根任务登记实际结果。

定向测试：`npx vitest run src/domain/scripts/wikiBatchB.test.ts`。尚未由本子任务注册、全仓库检查、浏览器验收或部署，交由集成任务统一完成。

子任务定向结果：`wikiBatchB.test.ts` 33 项通过，包含 88 套模板的生产规则包/evaluator、真实候选生成（标准与混合经验）、圆桌邻座/军团多数/显式人数修正。与 King、调查员及原角色文案投影联合 43 项通过；`tsc -b` 与本批 lint 通过。浏览器/总检查/部署结果由本批总验收统一登记，不把上述结构核对当作全组合技能穷举。
