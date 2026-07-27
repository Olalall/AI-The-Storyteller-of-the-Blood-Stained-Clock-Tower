# 第二批来源锁定记录

状态：**12.28 已锁定并导入 Uncertain Death / 12.30 已锁定并在 12.31 导入 Church of Spies / 12.32 已锁定并在 12.33 导入 Insanity and Intuition**。  
日期：2026-07-21。  
适用阶段：`12.28`、`12.30`、`12.32`。  
来源入口：[The Bakery - TPI Full Scripts](https://sites.google.com/view/bakerybytheclocktower/scripts/tpi-full-scripts) 的 `Featured Scripts` 区域、BotC Scripts 页面和对应 JSON 下载。

## 1. 本轮结论

下一块建议导入：`Uncertain Death`。

理由：

- 它是 Full Script，不是 Teensyville，符合 7-15 人开局主线。
- 来源可固定到 BotC Scripts 的 `1.0.1` JSON 下载。
- 角色全部来自当前已接入的官方基础三板事实源，不需要先新增一批陌生角色事实。
- 复杂点集中在 Lunatic、Marionette、Pukka、No Dashii、Godfather、Scarlet Woman、Sweetheart 等，当前复杂角色摘要已有覆盖或可用已有角色事实提醒。

## 2. 来源和 hash

content hash 计算方式：直接下载 BotC Scripts 的 JSON 文本，对该 JSON 文本做 `sha256`。

| 顺序 | scriptId | 展示名 | 作者 | 来源等级 | JSON sha256 | 角色构成 |
|---:|---|---|---|---|---|---|
| 2 | `uncertain-death` | Uncertain Death | Ekin | Bakery Featured / BotC Scripts | `05d854f75fb7ea6821b111368ad2c9d55ee5b736cc44578eea1bb84e8b0d6e2c` | 镇民13 / 外来者4 / 爪牙4 / 恶魔2 |

JSON 下载：

```text
https://www.botcscripts.com/script/68/1.0.1/download
```

角色 ID：

```text
clockmaker, grandmother, librarian, empath, fortuneteller, exorcist, flowergirl, oracle, undertaker, artist, slayer, seamstress, monk, lunatic, mutant, sweetheart, recluse, godfather, assassin, scarletwoman, marionette, nodashii, pukka
```

## 3. 官方夜序过滤结果

来源：`https://release.botc.app/resources/data/nightsheet.json`

首夜：

```text
lunatic, marionette, godfather, pukka, librarian, empath, fortuneteller, grandmother, clockmaker, seamstress
```

其他夜：

```text
monk, scarletwoman, lunatic, exorcist, pukka, nodashii, assassin, godfather, sweetheart, grandmother, empath, fortuneteller, undertaker, flowergirl, oracle, seamstress
```

## 4. 导入风险

- `lunatic`：需要给假恶魔信息和可能的假爪牙信息；工具只能提醒，不自动生成完整假局面。
- `marionette`：身份/阵营信息需要隐蔽处理；不能在普通身份展示里暴露给错误玩家。
- `pukka`：中毒与死亡有延迟链路，不能由工具自动杀人或自动标中毒。
- `nodashii`：相邻镇民中毒只做 setup/状态提醒，不自动给玩家状态。
- `godfather`：外来者数量修正和外来者死亡后的额外击杀都必须由说书人确认。
- `scarletwoman`：恶魔传递只做风险提醒，不自动改身份或阵营。
- `sweetheart`：死亡后的醉酒选择由说书人处理，不自动指定。
- `recluse`：阵营/身份误导属于规则裁量，AI 只能提示可能性。

## 5. 12.29 导入门槛

进入代码导入前必须满足：

- 使用 `confirmedRoleFactsForScript()` 复用已有角色事实，不能复制第二份角色技能。
- 建立独立目录 `src/domain/scripts/packs/uncertain-death/`。
- 写入来源、版本、hash、作者和 `knowledgeStatus: 'needs-review'`。
- 建立 7-15 人 verified 模板，恶魔伪装必须来自本板未在场角色。
- 高风险角色只写提醒和草稿边界，不写自动结算分支。
- 通过单板测试、统一质量门、composition 测试和 `npm run check`。

## 6. 停止条件

必须停止的情况：

- JSON 内容与 hash 不一致。
- 发现 BotC Scripts 页面版本变化，无法锁定 `1.0.1`。
- 需要为 Pukka、No Dashii、Marionette、Lunatic 写页面级自动结算。
- 需要真实 AI、VPS 写入、玩家端或官方魔典同步授权。

---

## 7. 12.30 Church of Spies 来源锁定

下一块建议导入：`Church of Spies`。

理由：

- 它是 Full Script，不是 Teensyville，符合 7-15 人开局主线。
- 来源可固定到 BotC Scripts 的 `1.0.0` JSON 下载。
- 24 个角色里只有 `cultleader` 需要在导入时补充或复用角色事实；其余角色可复用当前已接入 pack 的角色事实。
- 复杂点集中在 Pixie、Cult Leader、High Priestess、Exorcist、Marionette、Spy、No Dashii、Po、Pukka 等，适合继续验证“提醒和草稿，不自动结算”的架构边界。

来源和 hash：

| 顺序 | scriptId | 展示名 | 作者 | 来源等级 | JSON sha256 | 角色构成 |
|---:|---|---|---|---|---|---|
| 3 | `church-of-spies` | Church of Spies | Andrew Nathenson | Bakery Featured / BotC Scripts | `dd5fea53947a5818eacc406e2fc09b3595815b3588567d7cc1b4d541acbe837d` | 镇民13 / 外来者4 / 爪牙4 / 恶魔3 |

JSON 下载：

```text
https://www.botcscripts.com/script/2378/1.0.0/download
```

角色 ID：

```text
librarian, steward, pixie, cultleader, fortuneteller, highpriestess, exorcist, monk, undertaker, juggler, nightwatchman, artist, ravenkeeper, klutz, saint, mutant, drunk, baron, marionette, scarletwoman, spy, nodashii, po, pukka
```

官方夜序过滤结果：

来源：`https://release.botc.app/resources/data/nightsheet.json`

首夜：

```text
marionette, pukka, pixie, librarian, fortuneteller, steward, nightwatchman, cultleader, spy, highpriestess
```

其他夜：

```text
monk, scarletwoman, exorcist, pukka, po, nodashii, ravenkeeper, fortuneteller, undertaker, juggler, nightwatchman, cultleader, spy, highpriestess
```

导入风险：

- `cultleader`：当前未在已有 pack 角色事实中发现，需要 12.31 导入时补齐官方能力、中文名和阵营变化提醒；不能自动改阵营或判定邪教胜利。
- `pixie`：疯狂与获得能力只做提示；不能自动给能力，也不能暴露被指认的在场镇民给错误玩家。
- `highpriestess`：说书人自由裁量信息，AI 只能给“适合交流对象”的草稿建议，不能替说书人决定唯一正确答案。
- `exorcist`：若命中恶魔，恶魔今晚不发动且不知道谁选中自己；工具只记录和提醒，不自动跳过恶魔行动。
- `marionette`：身份/阵营信息需要隐蔽处理；身份展示和复盘不能泄露错误玩家不该知道的信息。
- `spy`：可看魔典且可能登记为善良/镇民/外来者；工具不能把登记结果定死。
- `nodashii`：相邻镇民中毒只做 setup/状态提醒，不自动给玩家状态。
- `po`：蓄力与三杀必须由说书人确认，不自动杀人。
- `pukka`：中毒与延迟死亡链路复杂，不自动标中毒或死亡。

12.31 导入门槛：

- 建立独立目录 `src/domain/scripts/packs/church-of-spies/`。
- 复用已有角色事实；只补齐 `cultleader`，不能复制第二份基础角色技能库。
- 写入来源、版本、hash、作者和 `knowledgeStatus: 'needs-review'`。
- 建立 7-15 人 verified 模板，恶魔伪装必须来自本板未在场角色。
- 高风险角色只写提醒和草稿边界，不写自动结算分支。
- 通过单板测试、统一质量门、composition 测试和 `npm run check`。

12.31 完成情况：

- 已建立 `src/domain/scripts/packs/church-of-spies/`。
- 已补齐 `cultleader` 单一角色事实，其他角色复用已接入事实源。
- 已建立官方夜序、10 条 setup/高风险规则和 22 套 7-15 人 verified 模板。
- 已接入 `smartScriptPacks` registry、composition 测试和统一质量门。
- Pack 保持 `needs-review`。

---

## 8. 12.32 Insanity and Intuition 来源锁定

下一块建议导入：`Insanity and Intuition`。

理由：

- 它是 Full Script，不是 Teensyville，符合 7-15 人开局主线。
- 来源可固定到 BotC Scripts 的 `1.2.0` JSON 下载。
- 25 个角色全部来自官方角色库，没有自定义角色或 fabled 角色进入开局模板。
- 只有 `poppygrower`、`plaguedoctor`、`boomdandy` 需要补齐本 pack 本地角色事实；其余角色可复用已接入 pack 的角色事实。
- 复杂点集中在罂粟种植者、瘟疫医生、爆炸花花公子、方古、维格莫提斯、诺达鲺、疯子、解谜大师等，适合继续验证“提醒和草稿，不自动结算”的边界。

来源和 hash：

| 顺序 | scriptId | 展示名 | 作者 | 来源等级 | JSON sha256 | 角色构成 |
|---:|---|---|---|---|---|---|
| 4 | `insanity-and-intuition` | Insanity and Intuition | Sam | BotC Scripts JSON | `227279b78329fb27c3b2690503a0dc929f3db34073b8db8bb5b2b0005b63f399` | 镇民13 / 外来者4 / 爪牙4 / 恶魔4 |

JSON 下载：

```text
https://www.botcscripts.com/script/2128/1.2.0/download
```

角色 ID：

```text
knight, pixie, shugenja, highpriestess, general, preacher, fortuneteller, towncrier, oracle, amnesiac, ravenkeeper, poppygrower, mayor, puzzlemaster, plaguedoctor, mutant, lunatic, poisoner, harpy, cerenovus, boomdandy, nodashii, imp, vigormortis, fanggu
```

官方夜序过滤结果：

来源：`https://release.botc.app/resources/data/nightsheet.json`

首夜：

```text
poppygrower, lunatic, preacher, poisoner, cerenovus, harpy, pixie, amnesiac, fortuneteller, knight, shugenja, highpriestess, general
```

其他夜：

```text
poppygrower, preacher, poisoner, cerenovus, harpy, lunatic, imp, fanggu, nodashii, vigormortis, plaguedoctor, amnesiac, ravenkeeper, fortuneteller, towncrier, oracle, highpriestess, general
```

导入风险：

- `poppygrower`：隐藏邪恶方互认，死亡当晚才告知邪恶方彼此；工具不能自动发送或公开互认信息。
- `plaguedoctor`：死亡后说书人获得一个爪牙能力；能力选择和使用只做记录与提醒。
- `boomdandy`：被处决时造成大量死亡和倒计时指认；不能自动清空玩家状态或判胜。
- `fanggu`：开局 +1 外来者，首次杀死外来者时产生新邪恶方古并让旧方古死亡；必须人工确认。
- `vigormortis`：开局 -1 外来者，杀死爪牙后的保留能力和邻座中毒只做提醒。
- `nodashii`：相邻镇民中毒只做核对，不自动写入状态。
- `lunatic`：假恶魔信息和假选择不能写成真实击杀。

12.33 导入门槛：

- 建立独立目录 `src/domain/scripts/packs/insanity-and-intuition/`。
- 使用 `confirmedRoleFactsForScript()` 复用已有角色事实；只为 `poppygrower`、`plaguedoctor`、`boomdandy` 补齐本 pack 本地事实。
- 建立 7-15 人 verified 模板，方古和维格莫提斯人数修正必须显式写入 `setupAdjustments`。
- 高风险角色只写提醒和草稿边界，不写自动结算分支。
- 通过单板测试、统一质量门、composition 测试和 `npm run check`。

12.33 完成情况：

- 已建立 `src/domain/scripts/packs/insanity-and-intuition/`。
- 已补齐 `poppygrower`、`plaguedoctor`、`boomdandy` 本地角色事实，其他角色复用已接入事实源。
- 已建立官方夜序、10 条 setup/高风险规则和 22 套 7-15 人 verified 模板。
- 已接入 `smartScriptPacks` registry、composition 测试和统一质量门。
- Pack 保持 `needs-review`。

停止条件：

- JSON 内容与 hash 不一致。
- 发现 BotC Scripts 页面版本变化，无法锁定 `1.0.0`。
- 需要为 Cult Leader、Pixie、Exorcist、Marionette、No Dashii、Po、Pukka 写页面级自动结算。
- 需要真实 AI、VPS 写入、玩家端或官方魔典同步授权。
