# Uncertain Death 验收记录

状态：**12.29 已接入 / needs-review**。  
日期：2026-07-21。  
来源：[BotC Scripts 1.0.1 JSON](https://www.botcscripts.com/script/68/1.0.1/download)。

## 1. 来源

- 展示名：`Uncertain Death`
- 作者：`Ekin`
- 版本：`1.0.1`
- JSON sha256：`05d854f75fb7ea6821b111368ad2c9d55ee5b736cc44578eea1bb84e8b0d6e2c`
- 来源等级：Bakery Featured / BotC Scripts 社区脚本
- 知识状态：`needs-review`

## 2. 角色清单

```text
clockmaker, grandmother, librarian, empath, fortuneteller, exorcist, flowergirl, oracle, undertaker, artist, slayer, seamstress, monk, lunatic, mutant, sweetheart, recluse, godfather, assassin, scarletwoman, marionette, nodashii, pukka
```

构成：镇民13 / 外来者4 / 爪牙4 / 恶魔2。

本板全部角色复用官方基础三板已确认角色事实，没有复制第二套角色技能库。

## 3. 夜序

首夜来自官方 `nightsheet.json` 过滤：

```text
lunatic, marionette, godfather, pukka, librarian, empath, fortuneteller, grandmother, clockmaker, seamstress
```

其他夜来自官方 `nightsheet.json` 过滤：

```text
monk, scarletwoman, lunatic, exorcist, pukka, nodashii, assassin, godfather, sweetheart, grandmother, empath, fortuneteller, undertaker, flowergirl, oracle, seamstress
```

## 4. Setup 与高风险规则

已记录：

- 教父外来者 +1 / -1 人数修正。
- 疯子假恶魔信息边界。
- 提线木偶隐藏邪恶身份边界。
- 普卡中毒与延迟死亡链路。
- 诺达鲺相邻镇民中毒提醒。
- 红唇女郎恶魔传递提醒。
- 心上人死亡后醉酒选择。
- 陌客误判提醒。

这些都只做说书人提醒或草稿，不自动改身份、阵营、死亡、中毒、醉酒或胜负。

## 5. 模板

已建立 22 套 7-15 人 verified 模板：

```text
7人3套 / 8人2套 / 9人2套 / 10人3套 / 11人2套 / 12人3套 / 13人2套 / 14人2套 / 15人3套
```

所有包含 `godfather` 的模板都显式记录 `godfather-outsider-adjustment`，恶魔伪装都来自本板未在场角色。

## 6. 未做

- 未做自动技能结算。
- 未做玩家端或官方魔典同步。
- 未做真实 AI 无人调用。
- 未把 `needs-review` 升级为 `confirmed`。

## 7. 验收命令

```powershell
npx vitest run src/domain/scripts/packs/uncertain-death/index.test.ts src/domain/scripts/smartScriptPackQuality.test.ts src/domain/setup-templates/composition.test.ts
npm run check
```
