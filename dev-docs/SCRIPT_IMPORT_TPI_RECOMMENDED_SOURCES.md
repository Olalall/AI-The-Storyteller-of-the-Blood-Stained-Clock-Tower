# 12.5 TPI Recommended 四板来源细化

状态：**已完成来源细化 / TPI Recommended 四板均已导入 pack / 待浏览器验收**。  
日期：2026-07-20。  
适用阶段：`12.5`。  
来源入口：[TPI Custom Scripts](https://bloodontheclocktower.com/pages/custom-scripts) 页面中的 `Recommended by TPI` 区域，以及每张卡片的官方 Script Tool 链接。

## 1. 本轮结论

这四个板子可以进入第一批导入队列，但不能一次性硬塞进代码。

原因：

- 它们不是官方基础三板，而是 TPI 推荐的社区脚本，必须保留作者、来源、hash 和知识状态。
- 四个板子都包含当前项目还没有完整角色事实的角色，需要逐个补角色能力、夜序、setup 规则和高风险提醒。
- `ONE IN ONE OUT`、`A GRIMM CHORUS`、`LUNAR ECLIPSE` 都涉及身份变化、阵营变化、旅行者/传奇角色或复杂恶魔机制，不能直接标成 `confirmed`。

## 2. 来源和 hash

content hash 的计算方式：从官方 Custom Scripts 页面提取 Script Tool 的 `script` 参数，解压得到 JSON 文本，再对该 JSON 文本做 `sha256`。

| 顺序 | scriptId | 展示名 | 作者 | 来源等级 | JSON sha256 | 角色构成 |
|---:|---|---|---|---|---|---|
| 4 | `one-in-one-out` | One in one out | Baron von Klutz | TPI Recommended | `87e2d275030590b6420a48da7426e56d5d3e7e5628b957ded192c89eeb46308a` | 镇民13 / 外来者4 / 爪牙4 / 恶魔4 / 传奇1 |
| 5 | `a-grimm-chorus` | A Grimm Chorus | Zets（Script Tool）；TPI 页面当前列 Lachlan | TPI Recommended | `1700a2c15bba5d993f429b6f5d9e5715aeb0dd2cfb0fc2d495078ec9d3dfb22d` | 镇民13 / 外来者4 / 爪牙4 / 恶魔4 / 旅行者5 |
| 6 | `hide-and-seek` | Hide and Seek | Narninian and Zaba | TPI Recommended | `d50e711952349f51adc87356c2a3a1e29991bc131b906a5c49a795fd50f9c823` | 镇民13 / 外来者4 / 爪牙4 / 恶魔4 |
| 7 | `lunar-eclipse` | Lunar Eclipse | Ekin | TPI Recommended | `070cb29f3835ee8b19312a6a7d19fe163cb1db3661d679c50f1d6296cbfcbe95` | 镇民13 / 外来者4 / 爪牙5 / 恶魔3 / 旅行者5 / 传奇1 |

## 3. 每板角色清单

### 3.1 One in one out

Script Tool 链接：

```text
https://script.bloodontheclocktower.com/?script=H4sIAAAAAAAACpWSQU7EMAxFr1J53RN0CSvEggMghEzrJqaJHTnOoBnE3RFiBEvMMtLzj/N+Ht+BN1jguZIjzIDDsxoscIOmMp1Upvsy/AIzCFaCBR6EJpZJhSYdDjO8FNWtO9pdxUS3akarswosoPIdqV3NYdmxdJrBz+0raB+lwMd8XaA7vaFtMEPK2n/hxiK0XY8/9CGcsgfhzCk3Y+pOvQdnTlwKJuKNNXpNFzxozWiVLDiyq/kQciolPKOGa6EgXFWOIIpVqDOu0dW5Z7KKErVDWLtbvIH9PyJXFOEXLFGHyaIGk2r0iUZrGT0avNkId9OUu0rYRkZr52gvYbLShVqmQtEGD7xg4SDMtUXLe9XwF5KURlgEG7vufFL7S8nTJ74mOs83BQAA
```

角色 ID：

```text
steward, knight, highpriestess, villageidiot, snakecharmer, fortuneteller, oracle, monk, amnesiac, fisherman, seamstress, farmer, cannibal, ogre, goon, recluse, drunk, poisoner, harpy, spy, mezepheles, kazali, imp, ojo, fanggu, spiritofivory
```

12.6 前缺少、现已补齐的角色事实：

```text
steward, knight, highpriestess, villageidiot, amnesiac, fisherman, farmer, cannibal, ogre, harpy, mezepheles, kazali, ojo, spiritofivory
```

导入风险：

- `snakecharmer`、`ogre`、`mezepheles`、`kazali` 涉及身份或阵营变化，必须只给建议，不自动改权威状态。
- `kazali` 会影响开局爪牙选择；模板需要明确记录被替换或指定的爪牙。
- `fanggu`、`imp`、`ojo` 都会影响恶魔死亡、恶魔传递或死亡目标判断。
- `spiritofivory` 是传奇角色，不能当作普通角色发身份。

12.6 导入门槛（已完成）：

- 先补缺失角色的中文能力摘要、setupImpact、night order 和高风险提醒。
- `spiritofivory` 只作为板子规则约束显示，不进入玩家座位身份池。
- 至少先完成 7、10、12、15 人 verified 模板，再进入 UI 开局列表。

### 3.2 A Grimm Chorus

Script Tool 链接：

```text
https://script.bloodontheclocktower.com/?script=H4sIAAAAAAAACpWUQU4DMQxFr4K8nhPMDnWBuAIIIU/iSdwm9sjOUCrE3VFFBUvMMtbzj/X95ecP4AwzvHYaCBPgPqoazPBEw2ECwU4ww/3dg3Hvd4eqtl/rS1PNPtAeOxY6qBmlwSowg8q3jrragHnF5jTBuGxXoXVvDT6n26+FhAwbTFCq+i+8sQjl2/OHfuPWsBBn1hFsGXqWZEwW5FnkRLSF+YJ9aWGa3tUSe3R47ELOmIK4cKnjjCPVjhLs8YaX8PgreyX7h7i2HLe+s/gwioYhoQgv4exk7B7WzrbLKZoAbdSD7KaNBycOO1g0rzhq2EPfe1cJ4+iO7hzeZ0JrNM4aj8AFS8EFl6VR1KP9dMIgq0cNOx89GJVpDbIVrYUv0XHPJerBQqVgeOcJNyqKfw3y8gXT+fIa6wUAAA==
```

角色 ID：

```text
general, villageidiot, towncrier, innkeeper, gambler, exorcist, amnesiac, nightwatchman, slayer, fisherman, soldier, minstrel, cannibal, damsel, drunk, golem, politician, godfather, summoner, assassin, scarletwoman, yaggababble, pukka, ojo, po, thief, harlot, judge, beggar, scapegoat
```

12.7 前缺少、现已补齐的角色事实：

```text
general, villageidiot, amnesiac, nightwatchman, fisherman, cannibal, damsel, golem, politician, summoner, yaggababble, ojo
```

导入风险：

- `summoner`、`scarletwoman`、`ojo`、`po` 会影响恶魔出现、恶魔传递或夜晚死亡数量。
- `yaggababble` 依赖当天公开说出的暗号次数，不能由工具自动判定。
- `damsel`、`golem`、`politician` 会影响社交压力、提名和阵营目标。
- 该脚本含 5 个旅行者；当前 7-15 人常规开局模板不应把旅行者计入固定人数模板，除非后续明确支持旅行者开局。

12.7 导入门槛：

- 常规模板先排除旅行者，只把旅行者作为可选扩展信息。
- `yaggababble` 只提供记录入口和提醒，不自动根据聊天判断杀人。
- `summoner` 的恶魔创建时机必须在角色验收中单独标注。

### 3.3 Hide and Seek

Script Tool 链接：

```text
https://script.bloodontheclocktower.com/?script=H4sIAAAAAAAACo2Tu07FMAxAf+XKc7+gKwssLGwghNzGbU0TO3Kc8hL/ji5cwYjHJMdHfuXhAzjBCE+FHGEA7L6pwQi3aMLCKCeUdLrH6fwqWAhGuOZE39d3RDsMMGXV1BztpuBKV2pGs7MKjKDyI9Wm5jAumBsN4G/17Fl6zvA5XFIQnTLBAOum7Q+tLELpcvxlM0+GxihBvvIrR93VCOeNLIi7vshsHObVcA7X2SWROe5hezLCEqYbYWlu1FowAM25eRDeungr4RkZHiQ7UQ2nf7CtHNUnLI1yuI1d9iBbuqNEe7KqRhNeNS3o8UUs9E51o0zRYVblphL2z2QkevSwvu87hie5qhU9b1cwgkuNfrhn/Yd8/AKDMcBoBgUAAA==
```

角色 ID：

```text
noble, librarian, pixie, preacher, towncrier, oracle, undertaker, dreamer, seamstress, artist, huntsman, ravenkeeper, virgin, damsel, drunk, mutant, goon, godfather, mezepheles, poisoner, cerenovus, pukka, vigormortis, imp, ojo
```

12.8 前缺少、现已补齐的角色事实：

```text
noble, pixie, preacher, huntsman, damsel, mezepheles, ojo
```

导入风险：

- `pixie`、`damsel`、`huntsman` 之间有隐藏身份和救援链路，身份信息不能前端随便暴露。
- `preacher` 会让被选中的爪牙失去能力并得知信息，玩家私密提示模板要单独核对。
- `mezepheles` 会改变阵营，必须走更正/状态追加，不覆盖旧记录。
- `vigormortis`、`pukka`、`ojo` 会造成复杂死亡或中毒影响。

12.8 导入门槛：

- 这是四个推荐板里常规角色数量最干净的一个，可作为 TPI 推荐板的低风险实现样板。
- 仍不能跳过 `pixie`、`damsel`、`huntsman` 和 `mezepheles` 的角色级验收。
- 模板必须避免把 `damsel` 信息泄漏给非相关角色。

### 3.4 Lunar Eclipse

Script Tool 链接：

```text
https://script.bloodontheclocktower.com/?script=H4sIAAAAAAAACpWUTU7EMAyFr4K87gm6RbNA4gYIIbdxU2sSO3Lcig7i7mhgBEs8y0jPv+9zXj6AE4zwVskRBsDNVzUY4XRmgQEEK8EIz5ugPZzmwq0TDDAV1dQd7alipkc1o9lZBUZQ+UmjXc1hXLB0GsCPds2zbKXA53Armg0lVfWVDAbIq/a/gMYilG7P34jG70xBbUcuGk08r1gnsoqcghEVfaWKzjOjBGNY5EzUwuOWY0bx1bTFh95RPChGc+5RsRMWTEd4O/mexVQ84lahCE9YgvKsGu1iQpvi3mxyNT8K7na5FKrYPVwga1rwjttItHPpmHad0cO8tKij2Dv2znFHjVXIw52IJuwrc1B+0TptWxSCnbNa1SvvcRa4f3+JEfWKVjR8dq0ZifMcXc1EOWMUg123FCa+NzZ2XXhX+w+E1y+QsqpnLAYAAA==
```

角色 ID：

```text
grandmother, pixie, sailor, chambermaid, mathematician, innkeeper, lycanthrope, savant, artist, tealady, magician, mayor, cannibal, goon, barber, lunatic, puzzlemaster, godfather, devilsadvocate, spy, assassin, marionette, nodashii, zombuul, vigormortis, barista, harlot, apprentice, beggar, voudon, spiritofivory
```

当前项目缺少角色事实：

```text
pixie, lycanthrope, magician, cannibal, puzzlemaster, marionette, spiritofivory
```

导入风险：

- `lunatic`、`marionette`、`magician` 都会影响恶魔/爪牙知道的信息，配板解释必须提醒说书人。
- `lycanthrope`、`zombuul`、`vigormortis`、`nodashii` 会影响夜晚死亡、中毒和登记。
- `barber` 涉及恶魔换角色，必须只生成操作提醒，不能自动交换权威身份。
- 该脚本含旅行者和 `spiritofivory`；常规模板先排除旅行者和传奇角色。

12.9 导入门槛：

- 先把 `lunatic`、`marionette`、`magician` 的开局信息流写入验收清单。
- 夜晚工作台只做记录和建议，不根据 `lycanthrope` 或 `zombuul` 自动杀人/复活。
- `spiritofivory` 必须作为全局约束提示，而不是座位角色。

## 4. 导入顺序和停止点

推荐仍按批次原顺序导入：

1. `12.6 one-in-one-out`
2. `12.7 a-grimm-chorus`
3. `12.8 hide-and-seek`
4. `12.9 lunar-eclipse`

如果某个板子角色事实不足，可以先把该板保持 `needs-review`，但不能跳过 acceptance。

必须停止的情况：

- 官方页面或 Script Tool 链接和本文 hash 不一致，且无法判断是否是新版。
- 某个角色的中文名、技能、夜序或 setup 规则无法从可信来源确认。
- 为了支持某个角色，开始写自动结算 `if roleId === ...` 并直接改状态。
- 需要真实 AI live 调用、VPS 写入、数据库/ORM 或官方魔典同步。

## 5. 12.6 完成情况

- 已补齐 One in one out 缺失角色事实。
- 已确认 `spiritofivory` 使用 `fabled` 表达，不进入座位池、模板或恶魔伪装。
- 已建立官方 night sheet 过滤夜序、setup 规则和 7-15 人 verified 模板。
- 已在 `src/domain/scripts/packs/one-in-one-out/acceptance.md` 写入来源、hash、风险和验收命令。

## 6. 12.7 完成情况

- 已从官方角色数据补齐 `general`、`villageidiot`、`amnesiac`、`nightwatchman`、`fisherman`、`cannibal`、`damsel`、`golem`、`politician`、`summoner`、`yaggababble`、`ojo` 等角色事实。
- 常规模板已排除旅行者：`thief`、`harlot`、`judge`、`beggar`、`scapegoat` 只作为角色事实和夜序扩展信息，不进入 7-15 人普通座位模板。
- 已单独标注 `summoner` 第 3 夜造魔、`yaggababble` 暗号计数、`damsel` 猜测链路和 `ojo` 不在场目标死亡逻辑。
- 角色能力中文摘要仍走 `domain/scripts` 统一事实源，未复制到 UI 页面。
- 已在 `src/domain/scripts/packs/a-grimm-chorus/acceptance.md` 写入来源、hash、作者来源差异、风险和验收命令。

## 7. 12.8 完成情况

- 已补齐 `noble`、`pixie`、`preacher`、`huntsman`、`damsel`、`mezepheles`、`ojo` 等关键角色事实和中文能力摘要。
- 已把 `pixie`、`damsel`、`huntsman` 的隐藏身份/救援链路写入高风险提醒，强调不能泄漏给非相关玩家。
- 已把 `mezepheles` 的阵营变化限制为说书人确认后的更正记录，不自动写权威状态。
- 已把 `pukka`、`vigormortis`、`ojo` 的死亡/中毒目标限制为记录和建议，不自动结算。
- 已建立官方 night sheet 过滤夜序、setup 规则和 7-15 人 verified 模板。
- 已在 `src/domain/scripts/packs/hide-and-seek/acceptance.md` 写入来源、hash、风险和验收命令。

## 8. 12.9 之前必须做的检查

- 先补齐 `lycanthrope`、`magician`、`puzzlemaster`、`marionette`、`spiritofivory` 等缺失角色事实。
- `lunatic`、`marionette`、`magician` 的恶魔/爪牙信息流必须只做说书人提醒。
- `lycanthrope`、`zombuul`、`vigormortis`、`nodashii` 的死亡、中毒和登记逻辑不能自动改权威状态。
- `spiritofivory` 必须作为全局约束提示，不进入座位角色、模板或恶魔伪装。

## 9. 12.9 完成情况

- 已补齐 `lycanthrope`、`magician`、`puzzlemaster`、`marionette`、`spiritofivory` 等缺失角色事实。
- 已确认 Lunar Eclipse 当前 Script Tool hash：`070cb29f3835ee8b19312a6a7d19fe163cb1db3661d679c50f1d6296cbfcbe95`。
- 已确认角色构成：13 镇民、4 外来者、5 爪牙、3 恶魔、5 旅行者、1 传奇。
- 旅行者和 `spiritofivory` 已排除出常规 7-15 人模板和恶魔伪装。
- 已把 `lunatic`、`marionette`、`magician` 的开局信息流和 `lycanthrope`、`zombuul`、`vigormortis` 的死亡/中毒链路写成提醒，不做自动结算。
- 已在 `src/domain/scripts/packs/lunar-eclipse/acceptance.md` 写入来源、hash、风险和验收命令。


