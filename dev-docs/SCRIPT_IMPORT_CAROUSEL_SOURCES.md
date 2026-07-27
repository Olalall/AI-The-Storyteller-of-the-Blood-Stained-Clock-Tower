# 12.11 Carousel 三板来源细化

状态：**Carousel 三板已完成 / 等待第一批总验收**。  
日期：2026-07-20。  
适用阶段：`12.11`、`12.12`、`12.13`、`12.14`。  
来源入口：[TPI Custom Scripts](https://bloodontheclocktower.com/pages/custom-scripts) 页面中的 `THE CAROUSEL SCRIPT COLLECTION`，以及每个脚本页面提供的 JSON 与官方 Script Tool 链接。

## 1. 本轮结论

`Punchy`、`Quick Maths`、`Devout Theists` 可以进入第一批后半段导入队列，但必须逐个闭环。

原因：

- 三板属于 Carousel Collection 社区脚本，不是官方基础三板。
- 三板都包含当前项目较少使用或高风险的角色，不能直接标成官方基础版。
- `Quick Maths` 是 `Riot` 核心板，白天提名和投票压力更高，不能按普通恶魔板自动处理。
- `Devout Theists` 同时包含 `Lleech`、`Fang Gu`、`Kazali`、`Legion`，恶魔机制复杂，只能做提醒和草稿，不自动改死亡、阵营或胜负。

## 2. 来源和 hash

content hash 计算方式：直接读取每个脚本页面提供的 JSON 文本，对该 JSON 文本做 `sha256`。

| 顺序 | scriptId | 展示名 | 作者 | 来源等级 | JSON sha256 | 角色构成 |
|---:|---|---|---|---|---|---|
| 8 | `punchy` | Punchy v3.8 | Zets | TPI Carousel Collection | `2db376682e56699246b43b787ae0f3ddef03ab3c28f678e0373fc35b08b0036c` | 镇民13 / 外来者4 / 爪牙4 / 恶魔4 / 传奇1 |
| 9 | `quick-maths` | Quick Maths | Fran | TPI Carousel Collection | `2960bb5ebba764e8cc812500a4cba1c759ef6817859e836db7121f4b89e4ae03` | 镇民13 / 外来者4 / 爪牙4 / 恶魔1 |
| 10 | `devout-theists` | Devout Theists v6 | Emerald | TPI Carousel Collection | `fbf82db75ccfdcf0c211c0aa9318faacb29fbe3a5e967a45dc162c624b465683` | 镇民13 / 外来者4 / 爪牙4 / 恶魔4 |

## 3. 每板角色清单

### 3.1 Punchy

来源页面：

```text
https://botc-script-viewer.sthom.kiwi/carousel/punchy/
https://botc-script-viewer.sthom.kiwi/carousel/punchy/punchy.json
```

角色 ID：

```text
steward, pixie, balloonist, general, monk, savant, philosopher, huntsman, slayer, princess, alchemist, cannibal, amnesiac, ogre, drunk, mutant, damsel, harpy, cerenovus, psychopath, vizier, pukka, ojo, kazali, vigormortis, spirit_of_ivory
```

导入风险：

- `spirit_of_ivory` 必须归一为项目稳定 ID `spiritofivory`。
- `balloonist` 可增加外来者；setup 修正规则必须写进板子包。
- `alchemist` 获得爪牙能力，只做提示，不自动执行对应爪牙结算。
- `kazali` 会改变开局爪牙结构；必须由说书人确认并记录。
- `pukka`、`ojo`、`vigormortis` 都会影响死亡或中毒链路，不自动杀人。

12.12 完成情况：

- 已建立 `src/domain/scripts/packs/punchy/`。
- 已接入 26 个角色事实、官方夜序、6 条 setup/高风险规则、22 套 7-15 人 verified 模板。
- Pack 保持 `needs-review`，供说书人实战 spot-check。

### 3.2 Quick Maths

来源页面：

```text
https://botc-script-viewer.sthom.kiwi/carousel/quick-maths/
https://botc-script-viewer.sthom.kiwi/carousel/quick-maths/quick-maths.json
```

角色 ID：

```text
noble, shugenja, pixie, highpriestess, general, dreamer, savant, alsaahir, nightwatchman, seamstress, philosopher, fisherman, juggler, ogre, politician, snitch, puzzlemaster, spy, xaan, marionette, boffin, riot
```

导入风险：

- 原 JSON 使用 `highpriestess`，需保持项目稳定 ID，不新增 `high_priestess`。
- `riot` 第 3 天提名链、死亡和胜负都不能自动执行。
- `boffin` 给恶魔不在场善良能力，只做 setup 提醒，不自动执行能力。
- `snitch` 让每个爪牙各得 3 个伪装，不等同于普通恶魔 3 个伪装。
- `xaan` 的 X 与外来者数量绑定；0 外来者模板不能放 `xaan`。
- `alsaahir` 的胜利条件必须由说书人确认。

12.13 完成情况：

- 已建立 `src/domain/scripts/packs/quick-maths/`。
- 已接入 22 个角色事实、官方夜序、6 条 setup/高风险规则、22 套 7-15 人 verified 模板。
- 已补中文能力摘要和高风险提示。
- Pack 保持 `needs-review`，供说书人实战 spot-check。

### 3.3 Devout Theists

来源页面：

```text
https://botc-script-viewer.sthom.kiwi/carousel/devout-theists/
https://botc-script-viewer.sthom.kiwi/carousel/devout-theists/devout-theists.json
```

角色 ID：

```text
noble, chef, pixie, high_priestess, mathematician, flowergirl, savant, amnesiac, juggler, fisherman, farmer, magician, cannibal, puzzlemaster, klutz, golem, snitch, widow, goblin, psychopath, marionette, lleech, fang_gu, kazali, legion
```

导入风险：

- `high_priestess` 需归一为项目稳定 ID `highpriestess`。
- `fang_gu` 需归一为项目稳定 ID `fanggu`。
- `lleech` 的宿主保护和恶魔死亡判定不能自动结算。
- `legion` 会改变恶魔/爪牙结构和胜负判断，只能做高风险提醒。
- `kazali`、`marionette`、`magician` 都影响开局信息流。
- `widow` 会产生额外中毒目标，不能由工具自动选择或隐藏修改状态。

12.14 导入结果：

- 已统一 `high_priestess` 为 `highpriestess`，`fang_gu` 为 `fanggu`。
- 已为 `legion`、`lleech`、`kazali`、`fanggu`、`widow`、`marionette`、`magician` 写入独立高风险提醒。
- 已接入 25 个角色事实、官方 night sheet 过滤夜序、10 条 setup/高风险规则和 22 套 7-15 人 verified 模板。
- `legion` 暂不进入 verified 配板模板，因为当前模板结构不支持同一角色多份；角色事实、夜序和风险提醒已保留。

## 4. 导入顺序和停止点

继续按第一批原顺序：

1. `12.12 punchy`：已完成。
2. `12.13 quick-maths`：已完成。
3. `12.14 devout-theists`：已完成。

下一项：`12.15 第一批 10 板总验收`。

必须停止的情况：

- JSON hash 与本文不一致，且无法判断是否是新版。
- 角色 ID 归一会影响已有板子，但没有测试覆盖。
- 为支持 `riot`、`lleech`、`legion` 或 `alchemist`，开始写自动改状态、自动判胜或角色专属状态机。
- 需要真实 AI live 调用、VPS 写入、数据库/ORM、玩家端或官方魔典同步。
