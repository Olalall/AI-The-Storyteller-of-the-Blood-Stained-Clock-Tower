# 通宵达旦 首批验收

核对日期：2026-10-16。社区板子，作者 `clocktower Con US`；不是官方发行剧本。

- 来源：[剧本库](https://kkovo550.github.io/clocktower-wiki/script_lib/%E5%89%A7%E6%9C%AC%E5%BA%93.html)，build `16ad8f7c270dfc011aeb9fc412950304b68293fc5269c882c32b2e037fc5073e`，索引 `528`，文件 `快速上手与角色主题竞赛剧本\海外快速上手剧本\#通宵达旦-clocktower Con US.json`。
- 版本：来源未标版本；未标版本时不猜作者最新版本。实际来源是该站 `scripts-full.js` 的内嵌原始 JSON，独立 `library/json/…` URL 返回 404，不冒充直接下载成功。
- 原始 JSON 字节数 `21233`，SHA256 `fee2ffdb6f3d8d6b403038c3de9deee923570bde3c9dc4207136cecbb86bcdf9`，原字节保存在 `source.json`，逐角色别名/阵营/能力摘要和官方快照 SHA 保存在 `source-lock.json`。
- 当前官方角色和夜表已逐项对照；角色复用现有已确认事实，不按中文名覆盖全局角色。

角色（26 个）：

```text
djinn, steward, knight, king, dreamer, fortuneteller, mathematician, monk, artist, slayer, seamstress, sage, cannibal, magician, butler, sweetheart, recluse, lunatic, baron, scarletwoman, widow, marionette, imp, nodashii, legion, vortox
```

首夜：`magician, lunatic, king, marionette, widow, fortuneteller, butler, dreamer, seamstress, steward, knight, mathematician`。

其他夜：`monk, scarletwoman, lunatic, legion, imp, nodashii, vortox, sweetheart, sage, fortuneteller, dreamer, seamstress, king, butler, mathematician`。

夜序是当前官方夜表过滤，保留其原始顺位；不信任来源旧 JSON 的夜序整数。不覆盖既有对局的夜序/配板快照。

设置、相克和风险：

- 来源原始 ID 按稳定英文别名、能力和阵营逐项核对；本包只用于新对局，既有对局的配板和夜序快照不迁移。普通恶魔伪装为三枚不在场善良角色。
- 男爵 +2 外来者，替换两名镇民；所有相关模板显式记录该修正。
- 军团模板多数玩家为军团，重复身份与零实际爪牙显式记录人数修正；只由邪恶投票时处决失败。 本批选用官方允许的三枚伪装方案，不支持在这些模板中临时改成零枚；零伪装由主持在后续专门支持后再选。
- 国王按当前官方规则：死者人数等于或超过活者时，夜晚得知一个存活角色；首夜恶魔知道国王是谁。原 JSON 的“严格大于”是旧文，不用于本包新局。
- 魔术师在场的军团局，恶魔互认分组唤醒：各组获知善良玩家，但不包含魔术师；不是把完整军团同伴表直接告知所有人。
- 魔术师存活时，恶魔不会知道哪位邻座是提线木偶；木偶仍邻座恶魔。
- 寡妇查看魔典时，移除恶魔与魔术师身份标记，避免据此识别魔术师；中毒选择和善良方寡妇提醒另行确认。
- 食人族获得管家能力时，应被告知获得的是管家能力；投票仍受所选主人是否投票约束。
- 数学家须核对疯子是否与真实恶魔攻击不同目标，并核对酒鬼、木偶自认为拥有的能力是否给错信息或未正常运作；不能仅因这些角色在场就固定计数。
- 陌客可以对贤者登记为恶魔；贤者仍须先满足被恶魔杀死的触发条件，不能因任何死亡都唤醒。
- 诺-达鲺邻近镇民中毒、涡流镇民假信息/白天处决要求分别核对。醉毒能让信息为假，不意味着可以随意改变真实阵营或死亡。
- 疯子假恶魔信息、酒鬼假镇民、木偶假善良身份单独记录。魔术师影响邪恶互认，恶魔的三枚未在场善良伪装仍是私密信息。
- 灯神是传奇角色，不进座位和伪装；原 JSON 把两条相克写进灯神能力，本包复用通用灯神对象，将完整已核实相克保留为公开设置提醒。

共22套 verified 模板：7/8/9/10/11/12/13/14/15人分别3/2/2/3/2/3/2/2/3套。模板角色/伪装在本板内、伪装不在场、重复军团单独声明且构成修正可核算。酒鬼/木偶的假身份与配座由主持确认；配板不自动生成权威状态。

真实 AI 抽测题：**国王人数等号边界**。前提：8 人局，夜间到国王顺位时4人已死、4人存活，国王存活且清醒健康，没有涡流或其他改信息效果。 规则基准：达到死者等于活者，国王应得知1个存活角色；不可沿用旧JSON“必须严格大于”的条件而跳过。 [依据](https://wiki.bloodontheclocktower.com/King)。机器可读题在 `ai-regression-oracle.json`。本文件未声称已完成真实 AI；统一集成后由根任务登记实际结果。

定向测试：`npx vitest run src/domain/scripts/wikiBatchB.test.ts`。尚未由本子任务注册、全仓库检查、浏览器验收或部署，交由集成任务统一完成。

当前规则差异：原文国王要求死者严格大于活者，当前官方改为大于或等于；复用已存在的当前 King 对象。`djinn_GStone` 不是新自制角色，保留为传奇灯神并把原文两条相克移到完整设置提醒中。

子任务定向结果：`wikiBatchB.test.ts` 33 项通过，包含 88 套模板的生产规则包/evaluator、真实候选生成（标准与混合经验）、圆桌邻座/军团多数/显式人数修正。与 King、调查员及原角色文案投影联合 43 项通过；`tsc -b` 与本批 lint 通过。浏览器/总检查/部署结果由本批总验收统一登记，不把上述结构核对当作全组合技能穷举。

国王新增首夜只向恶魔告知身份的确认表单：不要求选择存活角色；后续夜仍保留角色输入。真实已注册模板→夜序→确认→备份回归验证旧队列和已确认快照不迁移。
